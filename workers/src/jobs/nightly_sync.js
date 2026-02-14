const { Sequelize, Op } = require('sequelize');

/**
 * Nightly Sync Job - Performs nightly data synchronization tasks
 * This job runs once per night to maintain data consistency and perform cleanup
 */
class NightlySyncJob {
  constructor(models, logger = console) {
    this.models = models;
    this.logger = logger;
  }

  /**
   * Execute the nightly sync job
   * @param {Object} options - Job execution options
   * @returns {Object} Job execution results
   */
  async execute(options = {}) {
    const startTime = new Date();
    const results = {
      startTime,
      tasks: {},
      errors: [],
      success: true,
    };

    this.logger.info('Starting nightly sync job...');

    try {
      // Task 1: Clean up old price snapshots
      results.tasks.cleanupOldPrices = await this.cleanupOldPriceSnapshots(options.retentionDays || 90);

      // Task 2: Update SKU last_price_update timestamps
      results.tasks.updateSKUTimestamps = await this.updateSKUPriceTimestamps();

      // Task 3: Identify items with low stock
      results.tasks.lowStockReport = await this.generateLowStockReport();

      // Task 4: Data consistency checks
      results.tasks.consistencyCheck = await this.performConsistencyChecks();

      // Task 5: Archive old stock entries (optional)
      if (options.archiveStockEntries) {
        results.tasks.archiveStock = await this.archiveOldStockEntries(options.archiveDays || 365);
      }

    } catch (error) {
      this.logger.error('Nightly sync job failed:', error);
      results.errors.push(error.message);
      results.success = false;
    }

    const endTime = new Date();
    results.endTime = endTime;
    results.duration = endTime - startTime;

    this.logger.info(`Nightly sync job completed in ${results.duration}ms. Success: ${results.success}`);

    // Log any errors
    if (results.errors.length > 0) {
      this.logger.error('Job errors:', results.errors);
    }

    return results;
  }

  /**
   * Clean up old price snapshots to manage database size
   * @param {Number} retentionDays - Number of days to retain snapshots
   * @returns {Object} Cleanup results
   */
  async cleanupOldPriceSnapshots(retentionDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const deletedCount = await this.models.PriceSnapshot.destroy({
        where: {
          captured_at: {
            [Op.lt]: cutoffDate,
          },
        },
      });

      this.logger.info(`Cleaned up ${deletedCount} old price snapshots older than ${retentionDays} days`);

      return {
        success: true,
        deletedCount,
        cutoffDate,
        retentionDays,
      };
    } catch (error) {
      this.logger.error('Failed to cleanup old price snapshots:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update SKU last_price_update timestamps based on latest price snapshots
   * @returns {Object} Update results
   */
  async updateSKUPriceTimestamps() {
    try {
      // Find all SKUs with price snapshots
      const skus = await this.models.SKU.findAll({
        include: [{
          model: this.models.PriceSnapshot,
          as: 'priceSnapshots',
          limit: 1,
          order: [['captured_at', 'DESC']],
          required: false, // Include SKUs even without price snapshots
        }],
      });

      let updatedCount = 0;

      for (const sku of skus) {
        if (sku.priceSnapshots && sku.priceSnapshots.length > 0) {
          const latestPrice = sku.priceSnapshots[0];
          
          // Only update if the timestamp is different
          if (!sku.last_price_update || sku.last_price_update < latestPrice.captured_at) {
            await sku.update({
              last_price_update: latestPrice.captured_at,
            });
            updatedCount++;
          }
        }
      }

      this.logger.info(`Updated last_price_update for ${updatedCount} SKUs`);

      return {
        success: true,
        updatedCount,
        totalSKUs: skus.length,
      };
    } catch (error) {
      this.logger.error('Failed to update SKU timestamps:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate a report of items with low stock across all households
   * @returns {Object} Low stock report
   */
  async generateLowStockReport() {
    try {
      // Find all items with minimum quantity set
      const items = await this.models.Item.findAll({
        where: {
          minimum_quantity: {
            [Op.gt]: 0,
          },
        },
      });

      // Get all valid stock entries for these items
      const stockEntries = items.length > 0 ? await this.models.StockEntry.findAll({
        where: {
          item_id: items.map(item => item.id),
          quantity: {
            [Op.gt]: 0,
          },
          expiry_date: {
            [Op.gte]: new Date(),
          },
        },
      }) : [];

      // Group stock entries by item_id
      const stockByItem = {};
      stockEntries.forEach(entry => {
        if (!stockByItem[entry.item_id]) {
          stockByItem[entry.item_id] = 0;
        }
        stockByItem[entry.item_id] += entry.quantity;
      });

      const report = {
        items: [],
        summary: {
          totalItemsChecked: items.length,
          itemsBelowMinimum: 0,
        },
      };

      for (const item of items) {
        const totalQuantity = stockByItem[item.id] || 0;
        
        if (totalQuantity < item.minimum_quantity) {
          report.items.push({
            item_id: item.id,
            item_name: item.name,
            household_id: item.household_id,
            current_quantity: totalQuantity,
            minimum_quantity: item.minimum_quantity,
            deficit: item.minimum_quantity - totalQuantity,
          });
          report.summary.itemsBelowMinimum++;
        }
      }

      this.logger.info(`Low stock report generated: ${report.summary.itemsBelowMinimum} items below minimum`);

      return {
        success: true,
        report,
      };
    } catch (error) {
      this.logger.error('Failed to generate low stock report:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Perform data consistency checks
   * @returns {Object} Consistency check results
   */
  async performConsistencyChecks() {
    const checks = {};

    try {
      // Check 1: SKUs without price snapshots
      const skusWithoutPrices = await this.models.SKU.count({
        include: [{
          model: this.models.PriceSnapshot,
          as: 'priceSnapshots',
          required: false,
        }],
        where: {
          '$priceSnapshots.id$': null,
        },
      });

      checks.skusWithoutPrices = {
        count: skusWithoutPrices,
        status: skusWithoutPrices === 0 ? 'pass' : 'warning',
      };

      // Check 2: Items without SKUs
      const itemsWithoutSKUs = await this.models.Item.count({
        include: [{
          model: this.models.SKU,
          required: false,
        }],
        where: {
          '$SKUs.id$': null,
        },
      });

      checks.itemsWithoutSKUs = {
        count: itemsWithoutSKUs,
        status: itemsWithoutSKUs === 0 ? 'pass' : 'warning',
      };

      // Check 3: Price snapshots with invalid prices
      const invalidPrices = await this.models.PriceSnapshot.count({
        where: {
          price_cents: {
            [Op.lt]: 0,
          },
        },
      });

      checks.invalidPrices = {
        count: invalidPrices,
        status: invalidPrices === 0 ? 'pass' : 'error',
      };

      const hasErrors = Object.values(checks).some(check => check.status === 'error');
      const hasWarnings = Object.values(checks).some(check => check.status === 'warning');
      const overallStatus = hasErrors ? 'error' : hasWarnings ? 'warning' : 'pass';

      this.logger.info(`Consistency checks completed. Overall status: ${overallStatus}`);

      return {
        success: true,
        status: overallStatus,
        checks,
      };
    } catch (error) {
      this.logger.error('Failed to perform consistency checks:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Archive old stock entries to maintain performance
   * @param {Number} archiveDays - Number of days after which to archive
   * @returns {Object} Archive results
   */
  async archiveOldStockEntries(archiveDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - archiveDays);

    try {
      // In a real implementation, this might move entries to an archive table
      // For now, we'll just count what would be archived
      const archiveCount = await this.models.StockEntry.count({
        where: {
          created_at: {
            [Op.lt]: cutoffDate,
          },
          quantity: 0, // Only archive empty entries
        },
      });

      this.logger.info(`Found ${archiveCount} old stock entries eligible for archiving`);

      return {
        success: true,
        eligibleCount: archiveCount,
        cutoffDate,
        archived: false, // Not actually archiving in this implementation
      };
    } catch (error) {
      this.logger.error('Failed to archive old stock entries:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = NightlySyncJob;
