const { Item, StockEntry } = require('../models');
const { sequelize } = require('../models');
const InventoryService = require('../services/inventory');

class DashboardController {
  constructor() {
    this.inventoryService = new InventoryService();
  }

  /**
   * Get dashboard summary data
   */
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;

      // Get all items for user
      const items = await Item.findAll({
        where: {
          created_by: userId
        }
      });

      if (items.length === 0) {
        return res.json({
          success: true,
          data: {
            inventorySummary: {
              totalItems: 0,
              lowStockItems: 0,
              totalValue: 0
            },
            recentActivity: [],
            suggestions: []
          }
        });
      }

      // Get stock info for all items
      const inventoryData = await Promise.all(items.map(async (item) => {
        const currentStock = await this.inventoryService.getCurrentStock(item.id);
        return {
          item,
          currentStock
        };
      }));

      // Calculate inventory summary
      const lowStockThreshold = 0.2;
      const lowStockItems = inventoryData.filter(data => {
        const maxQuantity = data.item.preferred_unit === 'unit' ? 10 : 100;
        return (data.currentStock / maxQuantity) <= lowStockThreshold;
      });

      let totalValue = 0;
      inventoryData.forEach(data => {
        totalValue += (data.currentStock * (data.item.price_cents || 0)) / 100;
      });

      // Get recent stock entries
      const recentEntries = await StockEntry.findAll({
        where: {
          user_id: userId
        },
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
          {
            model: Item,
            as: 'item',
            attributes: ['id', 'name']
          }
        ]
      });

      const recentActivity = recentEntries.map(entry => ({
        type: entry.operation_type,
        item: entry.item?.name || 'Unknown',
        quantity: entry.quantity_base,
        unit: entry.base_unit,
        timestamp: entry.createdAt,
        reason: entry.reason
      }));

      // Generate suggestions
      const suggestions = [];

      if (lowStockItems.length > 0) {
        suggestions.push({
          type: 'reorder',
          priority: 'high',
          message: `${lowStockItems.length} item(s) have low stock`,
          items: lowStockItems.map(d => d.item.name)
        });
      }

      // Check for items without usage history
      const itemsWithoutUsage = inventoryData.filter(data => data.currentStock === 0);
      if (itemsWithoutUsage.length > 0 && items.length > 0) {
        suggestions.push({
          type: 'cleanup',
          priority: 'low',
          message: `${itemsWithoutUsage.length} item(s) have no stock`,
          items: itemsWithoutUsage.map(d => d.item.name)
        });
      }

      res.json({
        success: true,
        data: {
          inventorySummary: {
            totalItems: items.length,
            lowStockItems: lowStockItems.length,
            totalValue: Math.round(totalValue * 100) / 100
          },
          recentActivity,
          suggestions
        }
      });
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard data',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new DashboardController();
