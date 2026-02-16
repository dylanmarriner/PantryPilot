'use strict';

const AdminService = require('../services/admin_service');

class AdminController {
  constructor() {
    this.adminService = new AdminService();
  }

  /**
     * Get global platform stats
     */
  async getGlobalStats(req, res) {
    try {
      const stats = await this.adminService.getGlobalStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Failed to get global stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get global stats'
      });
    }
  }

  /**
     * Get system health
     */
  async getSystemHealth(req, res) {
    try {
      const health = await this.adminService.getSystemHealth();
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      console.error('Failed to get system health:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get system health'
      });
    }
  }

  /**
     * Get platform financials
     */
  async getFinancials(req, res) {
    try {
      const financials = await this.adminService.getFinancials();
      res.json({
        success: true,
        data: financials
      });
    } catch (error) {
      console.error('Failed to get financials:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get financials'
      });
    }
  }

  /**
     * Get feature flags
     */
  async getFeatureFlags(req, res) {
    try {
      const flags = await this.adminService.getFeatureFlags();
      res.json({
        success: true,
        data: flags
      });
    } catch (error) {
      console.error('Failed to get feature flags:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get feature flags'
      });
    }
  }

  /**
     * Toggle feature flag
     */
  async toggleFeatureFlag(req, res) {
    try {
      const { flagId } = req.params;
      const { enabled } = req.body;

      const flag = await this.adminService.toggleFeatureFlag(flagId, enabled);
      res.json({
        success: true,
        data: flag
      });
    } catch (error) {
      console.error('Failed to toggle feature flag:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle feature flag'
      });
    }
  }
}

module.exports = new AdminController();
