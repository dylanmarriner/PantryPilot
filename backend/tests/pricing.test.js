const { sequelize, Sequelize } = require('../src/models');
const PricingService = require('../src/services/pricing');
const { v4: uuidv4 } = require('uuid');

describe('PricingService', () => {
  let pricingService;
  let models;
  let household, item, store1, store2, sku1, sku2, sku3;

  beforeAll(async () => {
    // Initialize all models
    models = require('../src/models');
    await sequelize.sync({ force: true });
    pricingService = new PricingService(models);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up database
    await sequelize.truncate({ cascade: true });

    // Create test data
    household = await models.Household.create({
      name: 'Test Household',
    });

    item = await models.Item.create({
      id: uuidv4(),
      household_id: household.id,
      name: 'Test Item',
    });

    store1 = await models.Store.create({
      name: 'Store A',
      location: 'Location A',
    });

    store2 = await models.Store.create({
      name: 'Store B',
      location: 'Location B',
    });

    // Create SKUs with different package sizes
    sku1 = await models.SKU.create({
      id: uuidv4(),
      item_id: item.id,
      store_id: store1.id,
      product_name: 'Test Product 500g',
      package_size: 500,
      package_unit: 'g',
    });

    sku2 = await models.SKU.create({
      id: uuidv4(),
      item_id: item.id,
      store_id: store1.id,
      product_name: 'Test Product 1kg',
      package_size: 1,
      package_unit: 'kg',
    });

    sku3 = await models.SKU.create({
      id: uuidv4(),
      item_id: item.id,
      store_id: store2.id,
      product_name: 'Test Product 750g',
      package_size: 750,
      package_unit: 'g',
    });
  });

  describe('calculatePricePerUnit', () => {
    it('should calculate price per gram correctly', async () => {
      // Create price snapshot
      await models.PriceSnapshot.create({
        sku_id: sku1.id,
        store_id: store1.id,
        price_cents: 500, // $5.00 for 500g = $1.00 per 100g
        captured_at: new Date(),
      });

      const result = await pricingService.calculatePricePerUnit(sku1.id);

      expect(result.price_per_base_unit_cents).toBe(100); // $1.00 per 100g
      expect(result.base_units).toBe(500);
      expect(result.price_cents).toBe(500);
    });

    it('should handle sale prices when enabled', async () => {
      await models.PriceSnapshot.create({
        sku_id: sku1.id,
        store_id: store1.id,
        price_cents: 500,
        sale_price_cents: 400,
        is_on_sale: true,
        captured_at: new Date(),
      });

      const result = await pricingService.calculatePricePerUnit(sku1.id, { useSalePrice: true });

      expect(result.price_cents).toBe(400); // Should use sale price
    });

    it('should ignore sale prices when disabled', async () => {
      await models.PriceSnapshot.create({
        sku_id: sku1.id,
        store_id: store1.id,
        price_cents: 500,
        sale_price_cents: 400,
        is_on_sale: true,
        captured_at: new Date(),
      });

      const result = await pricingService.calculatePricePerUnit(sku1.id, { useSalePrice: false });

      expect(result.price_cents).toBe(500); // Should use regular price
    });

    it('should throw error when no price data exists', async () => {
      await expect(pricingService.calculatePricePerUnit(sku1.id))
        .rejects.toThrow('No price data available');
    });

    it('should convert kg to grams correctly', async () => {
      await models.PriceSnapshot.create({
        sku_id: sku2.id,
        store_id: store1.id,
        price_cents: 1000, // $10.00 for 1kg
        captured_at: new Date(),
      });

      const result = await pricingService.calculatePricePerUnit(sku2.id);

      expect(result.base_units).toBe(1000); // 1kg = 1000g
      expect(result.price_per_base_unit_cents).toBe(100); // $1.00 per 100g
    });
  });

  describe('findCheapestForItem', () => {
    beforeEach(async () => {
      // Create price snapshots for all SKUs
      await models.PriceSnapshot.create({
        sku_id: sku1.id,
        store_id: store1.id,
        price_cents: 500, // $1.00 per 100g
        captured_at: new Date(),
      });

      await models.PriceSnapshot.create({
        sku_id: sku2.id,
        store_id: store1.id,
        price_cents: 900, // $0.90 per 100g (cheaper)
        captured_at: new Date(),
      });

      await models.PriceSnapshot.create({
        sku_id: sku3.id,
        store_id: store2.id,
        price_cents: 825, // $1.10 per 100g
        captured_at: new Date(),
      });
    });

    it('should return SKUs sorted by price per unit', async () => {
      const results = await pricingService.findCheapestForItem(item.id);

      expect(results).toHaveLength(3);
      expect(results[0].sku_id).toBe(sku2.id); // Cheapest
      expect(results[1].sku_id).toBe(sku1.id); // Middle
      expect(results[2].sku_id).toBe(sku3.id); // Most expensive
    });

    it('should respect limit parameter', async () => {
      const results = await pricingService.findCheapestForItem(item.id, { limit: 2 });

      expect(results).toHaveLength(2);
    });

    it('should filter by store IDs when provided', async () => {
      const results = await pricingService.findCheapestForItem(item.id, { storeIds: [store2.id] });

      expect(results).toHaveLength(1);
      expect(results[0].sku_id).toBe(sku3.id);
    });
  });

  describe('simulateBasket', () => {
    let item2, sku4, sku5;

    beforeEach(async () => {
      // Create second item
      item2 = await models.Item.create({
        id: uuidv4(),
        household_id: household.id,
        name: 'Test Item 2',
      });

      sku4 = await models.SKU.create({
        id: uuidv4(),
        item_id: item2.id,
        store_id: store1.id,
        product_name: 'Test Product 2',
        package_size: 1,
        package_unit: 'count',
      });

      sku5 = await models.SKU.create({
        id: uuidv4(),
        item_id: item2.id,
        store_id: store2.id,
        product_name: 'Test Product 2',
        package_size: 1,
        package_unit: 'count',
      });

      // Create price snapshots
      await models.PriceSnapshot.create({
        sku_id: sku1.id,
        store_id: store1.id,
        price_cents: 500,
        captured_at: new Date(),
      });

      await models.PriceSnapshot.create({
        sku_id: sku3.id,
        store_id: store2.id,
        price_cents: 750,
        captured_at: new Date(),
      });

      await models.PriceSnapshot.create({
        sku_id: sku4.id,
        store_id: store1.id,
        price_cents: 200,
        captured_at: new Date(),
      });

      await models.PriceSnapshot.create({
        sku_id: sku5.id,
        store_id: store2.id,
        price_cents: 150,
        captured_at: new Date(),
      });
    });

    it('should calculate basket totals correctly', async () => {
      const basket = [
        { item_id: item.id, quantity: 100 }, // 100g
        { item_id: item2.id, quantity: 2 }, // 2 count
      ];

      const results = await pricingService.simulateBasket(basket);

      expect(results).toHaveLength(2);
      
      // Store 1: $1.00 per 100g * 1 + $200 * 2 = $500
      const store1Result = results.find(r => r.store_id === store1.id);
      expect(store1Result.total_cents).toBe(500);
      expect(store1Result.all_items_available).toBe(true);

      // Store 2: $1.00 per 100g * 1 + $150 * 2 = $400
      const store2Result = results.find(r => r.store_id === store2.id);
      expect(store2Result.total_cents).toBe(400);
      expect(store2Result.all_items_available).toBe(true);
    });

    it('should handle unavailable items', async () => {
      const basket = [
        { item_id: uuidv4(), quantity: 100 }, // Non-existent item
      ];

      const results = await pricingService.simulateBasket(basket);

      expect(results[0].items[0].available).toBe(false);
      expect(results[0].all_items_available).toBe(false);
    });

    it('should return stores sorted by total price', async () => {
      const basket = [
        { item_id: item.id, quantity: 100 },
        { item_id: item2.id, quantity: 2 },
      ];

      const results = await pricingService.simulateBasket(basket);

      expect(results[0].total_cents).toBeLessThanOrEqual(results[1].total_cents);
    });
  });

  describe('getPriceHistory', () => {
    it('should return price history for a SKU', async () => {
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        new Date('2024-01-03'),
      ];

      for (const date of dates) {
        await models.PriceSnapshot.create({
          sku_id: sku1.id,
          store_id: store1.id,
          price_cents: 500,
          captured_at: date,
        });
      }

      const history = await pricingService.getPriceHistory(sku1.id);

      expect(history).toHaveLength(3);
      expect(history[0].captured_at).toEqual(dates[2]); // Most recent first
    });

    it('should respect days parameter', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);

      const recentDate = new Date();

      await models.PriceSnapshot.create({
        sku_id: sku1.id,
        store_id: store1.id,
        price_cents: 400,
        captured_at: oldDate,
      });

      await models.PriceSnapshot.create({
        sku_id: sku1.id,
        store_id: store1.id,
        price_cents: 500,
        captured_at: recentDate,
      });

      const history = await pricingService.getPriceHistory(sku1.id, { days: 5 });

      expect(history).toHaveLength(1);
      expect(history[0].price_cents).toBe(500);
    });
  });

  describe('comparePricesOverTime', () => {
    it('should compare prices across stores over time', async () => {
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      ];

      // Create price history for both stores
      for (let i = 0; i < dates.length; i++) {
        await models.PriceSnapshot.create({
          sku_id: sku1.id,
          store_id: store1.id,
          price_cents: 500 + i * 10,
          captured_at: dates[i],
        });

        await models.PriceSnapshot.create({
          sku_id: sku3.id,
          store_id: store2.id,
          price_cents: 750 - i * 10,
          captured_at: dates[i],
        });
      }

      const comparison = await pricingService.comparePricesOverTime(item.id);

      expect(Object.keys(comparison)).toHaveLength(2);
      expect(comparison[store1.id].prices).toHaveLength(2);
      expect(comparison[store2.id].prices).toHaveLength(2);
    });
  });

  describe('convertToBaseUnit', () => {
    it('should convert kg to grams', () => {
      const result = pricingService.convertToBaseUnit(2, 'kg');
      expect(result).toBe(2000);
    });

    it('should convert L to milliliters', () => {
      const result = pricingService.convertToBaseUnit(1.5, 'L');
      expect(result).toBe(1500);
    });

    it('should pass through grams unchanged', () => {
      const result = pricingService.convertToBaseUnit(750, 'g');
      expect(result).toBe(750);
    });

    it('should pass through count unchanged', () => {
      const result = pricingService.convertToBaseUnit(5, 'count');
      expect(result).toBe(5);
    });

    it('should throw error for unknown unit', () => {
      expect(() => pricingService.convertToBaseUnit(1, 'unknown'))
        .toThrow('Unknown unit: unknown');
    });
  });
});
