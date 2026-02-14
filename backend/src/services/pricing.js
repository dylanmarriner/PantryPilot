const { Op } = require('sequelize');

/**
 * Pricing Service - handles price calculations, basket simulations, and price comparisons
 * All currency calculations use integers (cents) to avoid floating point precision issues
 */
class PricingService {
  constructor(models) {
    this.models = models;
  }

  /**
   * Calculate price per base unit for a SKU
   * @param {UUID} skuId - The SKU ID
   * @param {Object} options - Options for calculation
   * @returns {Object} Price per unit information
   */
  async calculatePricePerUnit(skuId, options = {}) {
    const { useSalePrice = true, timestamp = null } = options;
    
    const sku = await this.models.SKU.findByPk(skuId, {
      include: [
        {
          model: this.models.PriceSnapshot,
          as: 'priceSnapshots',
          limit: 1,
          order: [['captured_at', 'DESC']],
          where: timestamp ? { captured_at: { [Op.lte]: timestamp } } : undefined,
        },
      ],
    });

    if (!sku || !sku.priceSnapshots || sku.priceSnapshots.length === 0) {
      throw new Error(`No price data available for SKU ${skuId}`);
    }

    const priceSnapshot = sku.priceSnapshots[0];
    const effectivePriceCents = useSalePrice && priceSnapshot.is_on_sale && priceSnapshot.sale_price_cents
      ? priceSnapshot.sale_price_cents
      : priceSnapshot.price_cents;

    // Convert package size to base units for comparison
    const baseUnits = this.convertToBaseUnit(sku.package_size, sku.package_unit);
    
    // Price per base unit in cents (e.g., cents per gram)
    const pricePerBaseUnit = Math.round((effectivePriceCents * 100) / baseUnits);

    return {
      sku_id: skuId,
      price_cents: effectivePriceCents,
      package_size: sku.package_size,
      package_unit: sku.package_unit,
      base_units: baseUnits,
      price_per_base_unit_cents: pricePerBaseUnit,
      price_per_base_unit_dollars: pricePerBaseUnit / 10000, // Convert to dollars per base unit
      captured_at: priceSnapshot.captured_at,
      is_on_sale: priceSnapshot.is_on_sale,
    };
  }

  /**
   * Find the cheapest SKU for a given item across all stores
   * @param {UUID} itemId - The Item ID
   * @param {Object} options - Options for search
   * @returns {Array} Sorted list of SKUs by price per unit
   */
  async findCheapestForItem(itemId, options = {}) {
    const { limit = 10, useSalePrice = true, storeIds = null } = options;

    const whereClause = {
      item_id: itemId,
      is_active: true,
    };

    const skus = await this.models.SKU.findAll({
      where: whereClause,
      include: [
        {
          model: this.models.Store,
          as: 'store',
          where: storeIds ? { id: { [Op.in]: storeIds } } : undefined,
        },
        {
          model: this.models.PriceSnapshot,
          as: 'priceSnapshots',
          limit: 1,
          order: [['captured_at', 'DESC']],
          required: true, // Only include SKUs with price data
        },
      ],
    });

    // Calculate price per unit for each SKU
    const skuPrices = await Promise.all(
      skus.map(sku => this.calculatePricePerUnit(sku.id, { useSalePrice }))
    );

    // Sort by price per base unit (ascending)
    return skuPrices.sort((a, b) => a.price_per_base_unit_cents - b.price_per_base_unit_cents).slice(0, limit);
  }

  /**
   * Simulate a basket total across different stores
   * @param {Array} basketItems - Array of {item_id, quantity} objects
   * @param {Array} storeIds - Array of store IDs to compare (null for all stores)
   * @returns {Array} Store comparisons with basket totals
   */
  async simulateBasket(basketItems, storeIds = null) {
    // Get all active stores
    const stores = await this.models.Store.findAll({
      where: { 
        is_active: true,
        ...(storeIds && { id: { [Op.in]: storeIds } })
      },
    });

    const storeBaskets = await Promise.all(
      stores.map(async (store) => {
        let totalCents = 0;
        const items = [];

        for (const basketItem of basketItems) {
          // Find cheapest SKU for this item at this store
          const skus = await this.models.SKU.findAll({
            where: {
              item_id: basketItem.item_id,
              store_id: store.id,
              is_active: true,
            },
            include: [{
              model: this.models.PriceSnapshot,
              as: 'priceSnapshots',
              order: [['captured_at', 'DESC']],
              separate: true, // Use separate query to avoid limit/required issues
            }],
          });

          // Filter out SKUs without price snapshots
          const skusWithPrices = skus.filter(sku => sku.priceSnapshots && sku.priceSnapshots.length > 0);
          
          if (skusWithPrices.length === 0) {
            items.push({
              item_id: basketItem.item_id,
              quantity: basketItem.quantity,
              available: false,
              reason: 'No SKU available at this store',
            });
            continue;
          }

          // Find best price per unit
          const skuPrices = await Promise.all(
            skusWithPrices.map(sku => {
              // Use the already loaded price snapshot instead of calling calculatePricePerUnit
              if (!sku.priceSnapshots || sku.priceSnapshots.length === 0) {
                throw new Error(`SKU ${sku.id} has no price snapshots`);
              }
              
              const priceSnapshot = sku.priceSnapshots[0];
              const effectivePriceCents = priceSnapshot.is_on_sale && priceSnapshot.sale_price_cents
                ? priceSnapshot.sale_price_cents
                : priceSnapshot.price_cents;

              // Convert package size to base units for comparison
              const baseUnits = this.convertToBaseUnit(sku.package_size, sku.package_unit);
              
              // Price per base unit in cents (e.g., cents per gram)
              const pricePerBaseUnit = Math.round((effectivePriceCents * 100) / baseUnits);

              return {
                sku_id: sku.id,
                price_per_base_unit_cents: pricePerBaseUnit,
                price_cents: effectivePriceCents,
              };
            })
          );
          
          // Sort by price per base unit and pick the cheapest
          skuPrices.sort((a, b) => a.price_per_base_unit_cents - b.price_per_base_unit_cents);
          const bestSku = skuPrices[0];
          
          // Calculate total cost: price per base unit * quantity / 100
          const itemTotalCents = Math.round((bestSku.price_per_base_unit_cents * basketItem.quantity) / 100);
          totalCents += itemTotalCents;

          items.push({
            item_id: basketItem.item_id,
            quantity: basketItem.quantity,
            available: true,
            sku_id: bestSku.sku_id,
            unit_price_cents: bestSku.price_per_base_unit_cents,
            total_cents: itemTotalCents,
          });
        }

        return {
          store_id: store.id,
          store_name: store.name,
          store_location: store.location,
          total_cents: totalCents,
          total_dollars: totalCents / 100,
          items: items,
          all_items_available: items.every(item => item.available),
        };
      })
    );

    // Sort by total price (ascending)
    return storeBaskets.sort((a, b) => a.total_cents - b.total_cents);
  }

  /**
   * Get price history for a SKU
   * @param {UUID} skuId - The SKU ID
   * @param {Object} options - Options for history
   * @returns {Array} Price history
   */
  async getPriceHistory(skuId, options = {}) {
    const { limit = 30, days = null } = options;
    
    const whereClause = { sku_id: skuId };
    
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      whereClause.captured_at = { [Op.gte]: cutoffDate };
    }

    return await this.models.PriceSnapshot.findAll({
      where: whereClause,
      order: [['captured_at', 'DESC']],
      limit,
    });
  }

  /**
   * Compare prices for an item across stores over time
   * @param {UUID} itemId - The Item ID
   * @param {Object} options - Options for comparison
   * @returns {Object} Price comparison data
   */
  async comparePricesOverTime(itemId, options = {}) {
    const { days = 30, storeIds = null } = options;

    const skus = await this.models.SKU.findAll({
      where: {
        item_id: itemId,
        is_active: true,
        ...(storeIds && { store_id: { [Op.in]: storeIds } })
      },
      include: [
        {
          model: this.models.Store,
          as: 'store',
        },
        {
          model: this.models.PriceSnapshot,
          as: 'priceSnapshots',
          where: options.days ? {
            captured_at: {
              [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            }
          } : undefined,
          order: [['captured_at', 'DESC']],
        },
      ],
    });

    const storePrices = {};
    
    for (const sku of skus) {
      const storeId = sku.store_id;
      if (!storePrices[storeId]) {
        storePrices[storeId] = {
          store_id: storeId,
          store_name: sku.store.name,
          store_location: sku.store.location,
          prices: [],
        };
      }

      for (const snapshot of sku.priceSnapshots) {
        const pricePerUnit = await this.calculatePricePerUnit(sku.id, {
          timestamp: snapshot.captured_at,
        });
        
        storePrices[storeId].prices.push({
          date: snapshot.captured_at,
          price_per_unit_cents: pricePerUnit.price_per_base_unit_cents,
          is_on_sale: snapshot.is_on_sale,
        });
      }
    }

    // Sort prices by date for each store
    Object.values(storePrices).forEach(store => {
      store.prices.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    return storePrices;
  }

  /**
   * Convert package size to base units for comparison
   * @param {Number} size - Package size
   * @param {String} unit - Package unit
   * @returns {Number} Size in base units
   */
  convertToBaseUnit(size, unit) {
    switch (unit) {
      case 'kg':
        return size * 1000; // Convert to grams
      case 'g':
        return size; // Already in grams
      case 'L':
        return size * 1000; // Convert to milliliters
      case 'ml':
        return size; // Already in milliliters
      case 'count':
        return size; // Count units are as-is
      default:
        throw new Error(`Unknown unit: ${unit}`);
    }
  }
}

module.exports = PricingService;
