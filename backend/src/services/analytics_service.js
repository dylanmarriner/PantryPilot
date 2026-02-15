'use strict';

const { Op } = require('sequelize');

class AnalyticsService {
  constructor(models) {
    this.models = models;
  }

  async trackEvent(householdId, userId, eventType, metadata = {}) {
    try {
      const event = await this.models.UsageAnalytics.trackUsage(
        householdId,
        userId,
        eventType,
        metadata
      );
      return event;
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      throw error;
    }
  }

  async getHouseholdUsageStats(householdId, startDate, endDate) {
    try {
      const events = await this.models.UsageAnalytics.getUsageByHousehold(
        householdId,
        startDate,
        endDate
      );

      const stats = {
        totalEvents: events.length,
        eventTypes: {},
        userActivity: {},
        dailyActivity: {}
      };

      events.forEach(event => {
        const date = event.timestamp.toISOString().split('T')[0];
        
        stats.eventTypes[event.eventType] = (stats.eventTypes[event.eventType] || 0) + 1;
        stats.userActivity[event.userId] = (stats.userActivity[event.userId] || 0) + 1;
        stats.dailyActivity[date] = (stats.dailyActivity[date] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get household usage stats:', error);
      throw error;
    }
  }

  async getUserUsageStats(userId, startDate, endDate) {
    try {
      const events = await this.models.UsageAnalytics.getUsageByUser(
        userId,
        startDate,
        endDate
      );

      const stats = {
        totalEvents: events.length,
        eventTypes: {},
        householdActivity: {},
        dailyActivity: {}
      };

      events.forEach(event => {
        const date = event.timestamp.toISOString().split('T')[0];
        
        stats.eventTypes[event.eventType] = (stats.eventTypes[event.eventType] || 0) + 1;
        stats.householdActivity[event.householdId] = (stats.householdActivity[event.householdId] || 0) + 1;
        stats.dailyActivity[date] = (stats.dailyActivity[date] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get user usage stats:', error);
      throw error;
    }
  }

  async getCostSavingsAnalysis(householdId, startDate, endDate) {
    try {
      const priceSnapshots = await this.models.PriceSnapshot.findAll({
        where: {
          householdId,
          timestamp: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [{
          model: this.models.SKU,
          as: 'sku'
        }],
        order: [['timestamp', 'DESC']]
      });

      const savings = {
        totalSavings: 0,
        itemsAnalyzed: priceSnapshots.length,
        categoryBreakdown: {},
        topSavingsItems: []
      };

      priceSnapshots.forEach(snapshot => {
        if (snapshot.previousPrice && snapshot.price < snapshot.previousPrice) {
          const itemSavings = (snapshot.previousPrice - snapshot.price) * snapshot.quantity;
          savings.totalSavings += itemSavings;
          
          const category = snapshot.sku?.category || 'unknown';
          savings.categoryBreakdown[category] = (savings.categoryBreakdown[category] || 0) + itemSavings;
        }
      });

      savings.topSavingsItems = priceSnapshots
        .filter(s => s.previousPrice && s.price < s.previousPrice)
        .map(s => ({
          itemName: s.sku?.name || 'Unknown',
          savings: (s.previousPrice - s.price) * s.quantity,
          percentageChange: ((s.previousPrice - s.price) / s.previousPrice * 100).toFixed(2)
        }))
        .sort((a, b) => b.savings - a.savings)
        .slice(0, 10);

      return savings;
    } catch (error) {
      console.error('Failed to get cost savings analysis:', error);
      throw error;
    }
  }

  async generateHouseholdReport(householdId, startDate, endDate) {
    try {
      const [usageStats, costSavings] = await Promise.all([
        this.getHouseholdUsageStats(householdId, startDate, endDate),
        this.getCostSavingsAnalysis(householdId, startDate, endDate)
      ]);

      return {
        householdId,
        reportPeriod: {
          startDate,
          endDate
        },
        usageStats,
        costSavings,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to generate household report:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsService;
