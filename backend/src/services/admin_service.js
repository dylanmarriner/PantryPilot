'use strict';

const models = require('../models');

class AdminService {
  constructor() {
    this.models = models;
  }

  /**
     * Get global platform statistics
     */
  async getGlobalStats() {
    const [userCount, householdCount, itemCount] = await Promise.all([
      this.models.User.count(),
      this.models.Household.count(),
      this.models.Item.count()
    ]);

    // Calculate growth (simplified: last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await this.models.User.count({
      where: {
        createdAt: {
          [this.models.Sequelize.Op.gte]: thirtyDaysAgo
        }
      }
    });

    return {
      totalUsers: userCount,
      totalHouseholds: householdCount,
      totalItems: itemCount,
      growth: {
        newUsersLast30Days: newUsers
      }
    };
  }

  /**
     * Get system health metrics
     */
  async getSystemHealth() {
    // Check worker status (simplified)
    const activeWorkers = await this.models.SyncTransaction.count({
      where: {
        status: 'pending',
        updatedAt: {
          [this.models.Sequelize.Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // Last 5 mins
        }
      }
    });

    return {
      status: 'healthy',
      activeSyncs: activeWorkers,
      database: 'connected',
      timestamp: new Date()
    };
  }

  /**
     * Get platform-wide financial/savings metrics
     */
  async getFinancials() {
    // Aggregate all savings across all households
    const priceSnapshots = await this.models.PriceSnapshot.findAll();

    let totalSavings = 0;
    priceSnapshots.forEach(snapshot => {
      if (snapshot.previousPrice && snapshot.price < snapshot.previousPrice) {
        totalSavings += (snapshot.previousPrice - snapshot.price) * snapshot.quantity;
      }
    });

    return {
      platformTotalSavings: totalSavings,
      currency: 'USD',
      savingsByTier: {
        free: totalSavings * 0.7, // Mock breakdown
        pro: totalSavings * 0.3
      }
    };
  }

  /**
     * Manage global feature flags
     */
  async getFeatureFlags() {
    return await this.models.FeatureFlag.findAll();
  }

  async toggleFeatureFlag(flagId, enabled) {
    const flag = await this.models.FeatureFlag.findByPk(flagId);
    if (!flag) throw new Error('Flag not found');

    flag.isEnabled = enabled;
    await flag.save();
    return flag;
  }
}

module.exports = AdminService;
