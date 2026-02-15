const SyncTransaction = require('../models/sync_transaction');
const inventoryService = require('./inventory');
const { Op } = require('sequelize');

class SyncExecutor {
  async executeSync({ userId, clientId, lastSyncTimestamp, operations }) {
    const syncTransaction = await SyncTransaction.create({
      userId,
      clientId,
      status: 'IN_PROGRESS',
      startTime: new Date(),
      lastSyncTimestamp
    });

    try {
      // Get server changes since last sync
      const serverChanges = await this.getServerChanges(userId, lastSyncTimestamp);
      
      // Process client operations
      const clientResults = await this.processClientOperations(userId, operations, syncTransaction.id);
      
      // Apply deterministic conflict resolution
      const resolvedChanges = this.resolveConflicts(serverChanges, clientResults);
      
      // Update sync transaction
      await syncTransaction.update({
        status: 'COMPLETED',
        endTime: new Date(),
        operationsProcessed: operations.length,
        serverChangesCount: serverChanges.length,
        conflictsResolved: resolvedChanges.conflicts?.length || 0
      });

      return {
        syncId: syncTransaction.id,
        status: 'COMPLETED',
        serverChanges: resolvedChanges.serverChanges,
        clientResults: resolvedChanges.clientResults,
        conflicts: resolvedChanges.conflicts,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      await syncTransaction.update({
        status: 'FAILED',
        endTime: new Date(),
        errorMessage: error.message
      });
      throw error;
    }
  }

  async getSyncStatus(syncId, userId) {
    const syncTransaction = await SyncTransaction.findOne({
      where: { id: syncId, userId }
    });
    
    if (!syncTransaction) {
      return null;
    }

    return {
      id: syncTransaction.id,
      status: syncTransaction.status,
      startTime: syncTransaction.startTime,
      endTime: syncTransaction.endTime,
      operationsProcessed: syncTransaction.operationsProcessed,
      serverChangesCount: syncTransaction.serverChangesCount,
      conflictsResolved: syncTransaction.conflictsResolved,
      errorMessage: syncTransaction.errorMessage
    };
  }

  async getPendingOperations(userId, clientId) {
    const pendingSyncs = await SyncTransaction.findAll({
      where: {
        userId,
        clientId,
        status: 'PENDING'
      },
      order: [['createdAt', 'ASC']]
    });

    return pendingSyncs.map(sync => ({
      id: sync.id,
      operations: sync.operations,
      createdAt: sync.createdAt
    }));
  }

  async getServerChanges(userId, sinceTimestamp) {
    if (!sinceTimestamp) {
      return [];
    }

    // Get all changes since the last sync timestamp
    const changes = await SyncTransaction.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gt]: sinceTimestamp
        },
        status: 'COMPLETED'
      },
      order: [['createdAt', 'ASC']]
    });

    return changes.map(change => ({
      id: change.id,
      type: change.operationType,
      data: change.operationData,
      timestamp: change.createdAt,
      version: change.version
    }));
  }

  async processClientOperations(userId, operations, _syncTransactionId) {
    const results = [];
    
    for (const operation of operations) {
      try {
        const result = await this.processSingleOperation(userId, operation);
        results.push({
          operationId: operation.id,
          status: 'SUCCESS',
          result
        });
      } catch (error) {
        results.push({
          operationId: operation.id,
          status: 'FAILED',
          error: error.message
        });
      }
    }

    return results;
  }

  async processSingleOperation(userId, operation) {
    const { type, data, version } = operation;
    
    // Revalidate inventory math for inventory operations
    if (type === 'INVENTORY_ADJUSTMENT') {
      return await this.processInventoryAdjustment(userId, data, version);
    }
    
    // Handle other operation types
    switch (type) {
    case 'ITEM_CREATE':
      return await this.processItemCreate(userId, data, version);
    case 'ITEM_UPDATE':
      return await this.processItemUpdate(userId, data, version);
    case 'ITEM_DELETE':
      return await this.processItemDelete(userId, data, version);
    default:
      throw new Error(`Unsupported operation type: ${type}`);
    }
  }

  async processInventoryAdjustment(userId, data, version) {
    // Ensure currency is in integer cents
    if (data.cost !== undefined) {
      data.cost = Math.round(data.cost * 100);
    }

    // Revalidate inventory math
    const result = await inventoryService.adjustInventory({
      userId,
      itemId: data.itemId,
      adjustment: data.adjustment,
      reason: data.reason,
      cost: data.cost,
      version
    });

    return result;
  }

  async processItemCreate(userId, data, version) {
    // Implementation for item creation
    const item = await inventoryService.createItem({
      userId,
      name: data.name,
      category: data.category,
      initialQuantity: data.quantity || 0,
      cost: data.cost ? Math.round(data.cost * 100) : null,
      version
    });

    return item;
  }

  async processItemUpdate(userId, data, version) {
    // Implementation for item updates with version check
    const existingItem = await inventoryService.getItem(userId, data.itemId);
    
    if (!existingItem) {
      throw new Error('Item not found');
    }

    if (existingItem.version > version) {
      throw new Error('Client version outdated');
    }

    // Ensure currency is in integer cents
    if (data.cost !== undefined) {
      data.cost = Math.round(data.cost * 100);
    }

    const updatedItem = await inventoryService.updateItem({
      userId,
      itemId: data.itemId,
      updates: data,
      version
    });

    return updatedItem;
  }

  async processItemDelete(userId, data, version) {
    // Implementation for item deletion with version check
    const existingItem = await inventoryService.getItem(userId, data.itemId);
    
    if (!existingItem) {
      throw new Error('Item not found');
    }

    if (existingItem.version > version) {
      throw new Error('Client version outdated');
    }

    await inventoryService.deleteItem({
      userId,
      itemId: data.itemId,
      version
    });

    return { deleted: true, itemId: data.itemId };
  }

  resolveConflicts(serverChanges, clientResults) {
    const conflicts = [];
    const resolvedServerChanges = [...serverChanges];
    const resolvedClientResults = [...clientResults];

    // Implement Last Write Wins conflict resolution
    // In a production system, this would be more sophisticated
    clientResults.forEach(clientResult => {
      if (clientResult.status === 'FAILED') {
        const conflictingServerChange = serverChanges.find(
          change => change.data.itemId === clientResult.operationId
        );
        
        if (conflictingServerChange) {
          conflicts.push({
            type: 'VERSION_CONFLICT',
            clientOperation: clientResult,
            serverChange: conflictingServerChange,
            resolution: 'SERVER_WINS'
          });
        }
      }
    });

    return {
      serverChanges: resolvedServerChanges,
      clientResults: resolvedClientResults,
      conflicts
    };
  }
}

module.exports = new SyncExecutor();
