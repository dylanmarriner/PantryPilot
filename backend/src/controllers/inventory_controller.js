const { validationResult } = require('express-validator');
const { Item, StockEntry } = require('../models');
const InventoryService = require('../services/inventory');

class InventoryController {
  constructor() {
    this.inventoryService = new InventoryService();
  }

  /**
   * Get all inventory items for user
   */
  async getInventory(req, res) {
    try {
      const userId = req.user.id;
      
      const items = await Item.findAll({
        attributes: ['id', 'name', 'category', 'preferred_unit', 'minimum_quantity']
      });

      // Get current stock for each item
      const inventory = await Promise.all(items.map(async (item) => {
        const currentStock = await this.inventoryService.getCurrentStock(item.id);
        
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: currentStock,
          unit: item.preferred_unit,
          price: item.price_cents || 0,
          isLowStock: currentStock <= (item.minimum_quantity || 0)
        };
      }));

      res.json({
        success: true,
        data: inventory
      });
    } catch (error) {
      console.error('Failed to get inventory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get inventory',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get a single inventory item
   */
  async getItem(req, res) {
    try {
      const { itemId } = req.params;

      const item = await Item.findByPk(itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      const currentStock = await this.inventoryService.getCurrentStock(itemId);

      res.json({
        success: true,
        data: {
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: currentStock,
          unit: item.preferred_unit,
          price: item.price_cents || 0
        }
      });
    } catch (error) {
      console.error('Failed to get item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get item'
      });
    }
  }

  /**
   * Add new item to inventory
   */
  async addItem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const { name, quantity = 0, unit = 'unit', price = 0, category = 'Other' } = req.body;

      // Create item
      const item = await Item.create({
        name,
        category: category || 'Other',
        preferred_unit: unit,
        household_id: userId, // Using userId as placeholder for household
        minimum_quantity: 0
      });

      // Add initial stock if quantity provided
      if (quantity > 0) {
        await this.inventoryService.addStock({
          item_id: item.id,
          user_id: userId,
          quantity: parseInt(quantity),
          unit,
          reason: 'Initial stock'
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: quantity || 0,
          unit,
          price: price || 0
        }
      });
    } catch (error) {
      console.error('Failed to add item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add item',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Update inventory item quantity
   */
  async updateItem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { itemId } = req.params;
      const { quantity, name, unit, price } = req.body;

      const item = await Item.findByPk(itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Update item fields if provided
      if (name) item.name = name;
      if (unit) item.preferred_unit = unit;
      if (price !== undefined) item.price_cents = Math.round(parseFloat(price) * 100);
      await item.save();

      // Update quantity if provided
      if (quantity !== undefined) {
        const currentStock = await this.inventoryService.getCurrentStock(itemId);
        const adjustment = parseInt(quantity) - currentStock;

        if (adjustment !== 0) {
          await this.inventoryService.adjustStock({
            item_id: itemId,
            user_id: userId,
            new_quantity: parseInt(quantity),
            unit: item.preferred_unit,
            reason: 'Manual adjustment'
          });
        }
      }

      const currentStock = await this.inventoryService.getCurrentStock(itemId);

      res.json({
        success: true,
        data: {
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: currentStock,
          unit: item.preferred_unit,
          price: item.price_cents || 0
        }
      });
    } catch (error) {
      console.error('Failed to update item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update item',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Delete inventory item
   */
  async deleteItem(req, res) {
    try {
      const { itemId } = req.params;

      const item = await Item.findByPk(itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      await item.destroy();

      res.json({
        success: true,
        message: 'Item deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete item',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new InventoryController();
