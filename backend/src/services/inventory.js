const { sequelize } = require('../models');
const { StockEntry, Item } = require('../models');
const UnitConverter = require('./unit_converter');

/**
 * Inventory Service - handles all stock operations
 * Ensures deterministic math and proper audit trail
 */
class InventoryService {
  constructor() {
    this.unitConverter = new UnitConverter();
  }

  /**
   * Add stock to an item
   * @param {Object} params - Stock addition parameters
   * @returns {Promise<Object>} Created stock entry
   */
  async addStock(params) {
    const {
      item_id,
      user_id,
      quantity,
      unit,
      reason = null,
      expiry_date = null,
      batch_number = null,
      purchase_date = null,
      purchase_price_cents = null,
    } = params;

    const transaction = await sequelize.transaction();

    try {
      // Validate item exists
      const item = await Item.findByPk(item_id, { transaction });
      if (!item) {
        throw new Error('Item not found');
      }

      // Convert quantity to base units
      const { quantityBase, unitType, baseUnit } = this.unitConverter.toBaseUnit(
        quantity,
        unit,
        item.preferred_unit
      );

      // Create stock entry
      const stockEntry = await StockEntry.create({
        item_id,
        user_id,
        quantity_base: quantityBase,
        unit_type: unitType,
        base_unit: baseUnit,
        operation_type: 'add',
        reason,
        expiry_date,
        batch_number,
        purchase_date,
        purchase_price_cents,
      }, { transaction });

      await transaction.commit();

      // Return the entry with current stock calculated
      const currentStock = await this.getCurrentStock(item_id);
      return {
        ...stockEntry.toJSON(),
        current_stock: currentStock,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Deduct stock from an item
   * @param {Object} params - Stock deduction parameters
   * @returns {Promise<Object>} Created stock entry
   */
  async deductStock(params) {
    const {
      item_id,
      user_id,
      quantity,
      unit,
      reason = null,
    } = params;

    const transaction = await sequelize.transaction();

    try {
      // Validate item exists
      const item = await Item.findByPk(item_id, { transaction });
      if (!item) {
        throw new Error('Item not found');
      }

      // Get current stock
      const currentStock = await this.getCurrentStock(item_id, { transaction });

      // Convert quantity to base units
      const { quantityBase, unitType, baseUnit } = this.unitConverter.toBaseUnit(
        quantity,
        unit,
        item.preferred_unit
      );

      // Check if enough stock available
      if (currentStock < quantityBase) {
        throw new Error(`Insufficient stock. Current: ${currentStock} ${baseUnit}, Attempted to deduct: ${quantityBase} ${baseUnit}`);
      }

      // Create stock entry
      const stockEntry = await StockEntry.create({
        item_id,
        user_id,
        quantity_base: quantityBase,
        unit_type: unitType,
        base_unit: baseUnit,
        operation_type: 'deduct',
        reason,
      }, { transaction });

      await transaction.commit();

      // Return the entry with updated current stock
      const newStock = await this.getCurrentStock(item_id);
      return {
        ...stockEntry.toJSON(),
        current_stock: newStock,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Adjust stock to a specific quantity
   * Creates an add or deduct entry based on the difference
   * @param {Object} params - Stock adjustment parameters
   * @returns {Promise<Object>} Created stock entry
   */
  async adjustStock(params) {
    const {
      item_id,
      user_id,
      new_quantity,
      unit,
      reason = null,
    } = params;

    const transaction = await sequelize.transaction();

    try {
      // Validate item exists
      const item = await Item.findByPk(item_id, { transaction });
      if (!item) {
        throw new Error('Item not found');
      }

      // Get current stock
      const currentStock = await this.getCurrentStock(item_id, { transaction });

      // Convert new quantity to base units
      const { quantityBase: newQuantityBase, unitType, baseUnit } = this.unitConverter.toBaseUnit(
        new_quantity,
        unit,
        item.preferred_unit
      );

      // Calculate difference
      const difference = newQuantityBase - currentStock;

      if (difference === 0) {
        throw new Error('No adjustment needed - quantity is already correct');
      }

      // Determine operation type
      const operationType = difference > 0 ? 'add' : 'deduct';
      const adjustmentQuantity = Math.abs(difference);

      // Create stock entry
      const stockEntry = await StockEntry.create({
        item_id,
        user_id,
        quantity_base: adjustmentQuantity,
        unit_type: unitType,
        base_unit: baseUnit,
        operation_type: 'adjust',
        reason: reason || `Stock adjustment: ${operationType} ${adjustmentQuantity} ${baseUnit}`,
      }, { transaction });

      await transaction.commit();

      // Return the entry with updated current stock
      const finalStock = await this.getCurrentStock(item_id);
      return {
        ...stockEntry.toJSON(),
        current_stock: finalStock,
        adjustment_type: operationType,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get current stock for an item
   * @param {string} itemId - Item ID
   * @param {Object} options - Query options
   * @returns {Promise<number>} Current stock in base units
   */
  async getCurrentStock(itemId, options = {}) {
    const { transaction = null } = options;

    const result = await StockEntry.findOne({
      attributes: [
        [
          sequelize.literal(`
            SUM(CASE WHEN operation_type = 'add' THEN quantity_base ELSE 0 END) -
            SUM(CASE WHEN operation_type IN ('deduct', 'adjust') THEN quantity_base ELSE 0 END)
          `),
          'current_stock'
        ]
      ],
      where: { item_id: itemId },
      transaction,
      raw: true,
    });

    return parseInt(result.current_stock) || 0;
  }

  /**
   * Get stock history for an item
   * @param {string} itemId - Item ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Stock entries
   */
  async getStockHistory(itemId, options = {}) {
    const {
      limit = 100,
      offset = 0,
      operation_type = null,
      start_date = null,
      end_date = null,
    } = options;

    const whereClause = { item_id: itemId };

    if (operation_type) {
      whereClause.operation_type = operation_type;
    }

    if (start_date || end_date) {
      whereClause.created_at = {};
      if (start_date) whereClause.created_at[sequelize.Op.gte] = start_date;
      if (end_date) whereClause.created_at[sequelize.Op.lte] = end_date;
    }

    const entries = await StockEntry.findAll({
      where: whereClause,
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'name', 'preferred_unit'],
        },
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return entries;
  }

  /**
   * Adjust inventory for an item (add or deduct)
   * @param {Object} params - Adjustment parameters
   * @returns {Promise<Object>} Adjustment result
   */
  async adjustInventory(params) {
    const {
      userId,
      itemId,
      adjustment,
      reason = null,
      cost = null,
      version = null
    } = params;

    const transaction = await sequelize.transaction();

    try {
      const item = await Item.findByPk(itemId, { transaction });
      if (!item) {
        throw new Error('Item not found');
      }

      // Determine operation type based on adjustment value
      const operationType = adjustment > 0 ? 'add' : 'deduct';
      const quantity = Math.abs(adjustment);

      const stockEntry = await StockEntry.create({
        item_id: itemId,
        user_id: userId,
        quantity_base: quantity,
        unit_type: item.preferred_unit,
        base_unit: item.preferred_unit,
        operation_type: operationType,
        reason,
        purchase_price_cents: cost,
      }, { transaction });

      await transaction.commit();

      const currentStock = await this.getCurrentStock(itemId);
      return {
        success: true,
        stockEntry: stockEntry.toJSON(),
        current_stock: currentStock,
        version: version || 1
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Create a new item
   * @param {Object} params - Item creation parameters
   * @returns {Promise<Object>} Created item
   */
  async createItem(params) {
    const {
      userId,
      name,
      category,
      initialQuantity = 0,
      cost = null,
      version = 1
    } = params;

    try {
      const item = await Item.create({
        name,
        category: category || 'Other',
        household_id: userId
      });

      if (initialQuantity > 0) {
        await this.addStock({
          item_id: item.id,
          user_id: userId,
          quantity: initialQuantity,
          unit: 'unit',
          reason: 'Initial stock',
          purchase_price_cents: cost
        });
      }

      return {
        success: true,
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: initialQuantity,
        version
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get an item by ID
   * @param {string} userId - User ID
   * @param {string} itemId - Item ID
   * @returns {Promise<Object>} Item with version
   */
  async getItem(userId, itemId) {
    try {
      const item = await Item.findByPk(itemId);
      if (!item) {
        return null;
      }

      const currentStock = await this.getCurrentStock(itemId);

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: currentStock,
        version: 1
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an item
   * @param {Object} params - Update parameters
   * @returns {Promise<Object>} Updated item
   */
  async updateItem(params) {
    const {
      userId,
      itemId,
      updates,
      version = 1
    } = params;

    try {
      const item = await Item.findByPk(itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      const allowedUpdates = ['name', 'category', 'preferred_unit'];
      const updateData = {};

      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          updateData[key] = updates[key];
        }
      }

      await item.update(updateData);

      const currentStock = await this.getCurrentStock(itemId);

      return {
        success: true,
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: currentStock,
        version
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete an item
   * @param {Object} params - Delete parameters
   * @returns {Promise<Object>} Deletion result
   */
  async deleteItem(params) {
    const {
      userId,
      itemId,
      version = 1
    } = params;

    try {
      const item = await Item.findByPk(itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      await item.destroy();

      return {
        success: true,
        deleted: true,
        itemId,
        version
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check for items that need reordering
   * @param {string} householdId - Household ID
   * @returns {Promise<Array>} Items below minimum quantity
   */
  async checkReorderThresholds(householdId) {
    const items = await Item.findAll({
      where: {
        household_id: householdId,
        is_active: true,
      },
      attributes: ['id', 'name', 'minimum_quantity', 'preferred_unit'],
    });

    const reorderItems = [];

    for (const item of items) {
      const currentStock = await this.getCurrentStock(item.id);
      
      // Convert minimum quantity to base units if needed
      const { quantityBase: minQuantityBase } = this.unitConverter.toBaseUnit(
        item.minimum_quantity,
        item.preferred_unit,
        item.preferred_unit
      );

      if (currentStock <= minQuantityBase) {
        reorderItems.push({
          item_id: item.id,
          item_name: item.name,
          current_stock: this.unitConverter.fromBaseUnit(
            currentStock,
            item.preferred_unit,
            item.preferred_unit
          ),
          minimum_quantity: item.minimum_quantity,
          unit: item.preferred_unit,
        });
      }
    }

    return reorderItems;
  }
}

module.exports = InventoryService;
