'use strict';

const fs = require('fs').promises;
const path = require('path');

class ExportService {
  constructor(models) {
    this.models = models;
  }

  async exportHouseholdData(householdId, format = 'json') {
    try {
      const household = await this.models.Household.findByPk(householdId, {
        include: [
          {
            model: this.models.StockEntry,
            as: 'stockEntries',
            include: [{
              model: this.models.SKU,
              as: 'sku'
            }]
          },
          {
            model: this.models.PriceSnapshot,
            as: 'priceSnapshots',
            include: [{
              model: this.models.SKU,
              as: 'sku'
            }]
          }
        ]
      });

      if (!household) {
        throw new Error('Household not found');
      }

      const exportData = {
        household: {
          id: household.id,
          name: household.name,
          createdAt: household.createdAt
        },
        stockEntries: household.stockEntries.map(entry => ({
          id: entry.id,
          sku: {
            id: entry.sku.id,
            name: entry.sku.name,
            category: entry.sku.category,
            brand: entry.sku.brand
          },
          quantity: entry.quantity,
          unit: entry.unit,
          expiryDate: entry.expiryDate,
          location: entry.location,
          createdAt: entry.createdAt
        })),
        priceSnapshots: household.priceSnapshots.map(snapshot => ({
          id: snapshot.id,
          sku: {
            id: snapshot.sku.id,
            name: snapshot.sku.name,
            category: snapshot.sku.category
          },
          price: snapshot.price,
          previousPrice: snapshot.previousPrice,
          quantity: snapshot.quantity,
          store: snapshot.store,
          timestamp: snapshot.timestamp
        })),
        exportedAt: new Date()
      };

      if (format === 'csv') {
        return this.generateCSV(exportData);
      } else if (format === 'pdf') {
        return this.generatePDF(exportData);
      }

      return exportData;
    } catch (error) {
      console.error('Failed to export household data:', error);
      throw error;
    }
  }

  async exportAnalyticsReport(householdId, startDate, endDate, format = 'json') {
    try {
      const AnalyticsService = require('./analytics_service');
      const analyticsService = new AnalyticsService(this.models);
      
      const report = await analyticsService.generateHouseholdReport(
        householdId,
        startDate,
        endDate
      );

      if (format === 'csv') {
        return this.generateAnalyticsCSV(report);
      } else if (format === 'pdf') {
        return this.generateAnalyticsPDF(report);
      }

      return report;
    } catch (error) {
      console.error('Failed to export analytics report:', error);
      throw error;
    }
  }

  generateCSV(data) {
    const csvRows = [];
    
    csvRows.push('Household Data Export');
    csvRows.push(`Household Name,${data.household.name}`);
    csvRows.push(`Exported At,${data.exportedAt}`);
    csvRows.push('');

    csvRows.push('Stock Entries');
    csvRows.push('Item Name,Category,Brand,Quantity,Unit,Expiry Date,Location');
    
    data.stockEntries.forEach(entry => {
      csvRows.push([
        entry.sku.name,
        entry.sku.category || '',
        entry.sku.brand || '',
        entry.quantity,
        entry.unit || '',
        entry.expiryDate || '',
        entry.location || ''
      ].join(','));
    });

    csvRows.push('');
    csvRows.push('Price Snapshots');
    csvRows.push('Item Name,Category,Price,Previous Price,Quantity,Store,Timestamp');

    data.priceSnapshots.forEach(snapshot => {
      csvRows.push([
        snapshot.sku.name,
        snapshot.sku.category || '',
        snapshot.price,
        snapshot.previousPrice || '',
        snapshot.quantity,
        snapshot.store || '',
        snapshot.timestamp
      ].join(','));
    });

    return csvRows.join('\n');
  }

  generateAnalyticsCSV(report) {
    const csvRows = [];
    
    csvRows.push('Analytics Report');
    csvRows.push(`Household ID,${report.householdId}`);
    csvRows.push(`Report Period,${report.reportPeriod.startDate} to ${report.reportPeriod.endDate}`);
    csvRows.push(`Generated At,${report.generatedAt}`);
    csvRows.push('');

    csvRows.push('Usage Statistics');
    csvRows.push('Total Events,' + report.usageStats.totalEvents);
    csvRows.push('');

    csvRows.push('Event Types');
    csvRows.push('Event Type,Count');
    Object.entries(report.usageStats.eventTypes).forEach(([type, count]) => {
      csvRows.push(`${type},${count}`);
    });

    csvRows.push('');
    csvRows.push('Cost Savings');
    csvRows.push('Total Savings,' + report.costSavings.totalSavings);
    csvRows.push('Items Analyzed,' + report.costSavings.itemsAnalyzed);
    csvRows.push('');

    csvRows.push('Top Savings Items');
    csvRows.push('Item Name,Savings,Percentage Change');
    report.costSavings.topSavingsItems.forEach(item => {
      csvRows.push(`${item.itemName},${item.savings},${item.percentageChange}%`);
    });

    return csvRows.join('\n');
  }

  async generatePDF(_data) {
    throw new Error('PDF export not implemented yet');
  }

  async generateAnalyticsPDF(_report) {
    throw new Error('PDF analytics export not implemented yet');
  }

  async saveExportToFile(data, filename, format = 'json') {
    try {
      const exportDir = path.join(process.cwd(), 'exports');
      await fs.mkdir(exportDir, { recursive: true });

      const filePath = path.join(exportDir, filename);
      let content;

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
      } else if (format === 'csv') {
        content = data;
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }

      await fs.writeFile(filePath, content, 'utf8');
      return filePath;
    } catch (error) {
      console.error('Failed to save export to file:', error);
      throw error;
    }
  }
}

module.exports = ExportService;
