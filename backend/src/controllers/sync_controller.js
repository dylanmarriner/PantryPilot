const syncExecutor = require('../services/sync_executor');
const { validationResult } = require('express-validator');

class SyncController {
  async initiateSync(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { clientId, lastSyncTimestamp } = req.body;
      const userId = req.user.id;

      const syncResult = await syncExecutor.executeSync({
        userId,
        clientId,
        lastSyncTimestamp,
        operations: req.body.operations || []
      });

      res.json({
        success: true,
        data: syncResult
      });
    } catch (error) {
      console.error('Sync initiation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Sync failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async getSyncStatus(req, res) {
    try {
      const { syncId } = req.params;
      const userId = req.user.id;

      const status = await syncExecutor.getSyncStatus(syncId, userId);

      if (!status) {
        return res.status(404).json({
          success: false,
          message: 'Sync not found'
        });
      }

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Failed to get sync status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve sync status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async getPendingOperations(req, res) {
    try {
      const { clientId } = req.query;
      const userId = req.user.id;

      const pendingOperations = await syncExecutor.getPendingOperations(userId, clientId);

      res.json({
        success: true,
        data: pendingOperations
      });
    } catch (error) {
      console.error('Failed to get pending operations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending operations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new SyncController();
