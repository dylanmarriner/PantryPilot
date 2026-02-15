import AsyncStorage from '@react-native-async-storage/async-storage';

class SyncQueue {
  constructor() {
    this.QUEUE_KEY = 'sync_queue';
    this.queue = [];
  }

  // Load queue from AsyncStorage
  async loadFromStorage() {
    try {
      const stored = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.queue = [];
    }
  }

  // Save queue to AsyncStorage
  async saveToStorage() {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  // Add operation to queue
  async add(operation) {
    this.queue.push(operation);
    await this.saveToStorage();
  }

  // Get all operations in queue
  async getAll() {
    return [...this.queue];
  }

  // Get operations by type
  async getByType(type) {
    return this.queue.filter(op => op.type === type);
  }

  // Get operations by item ID
  async getByItemId(itemId) {
    return this.queue.filter(op => op.data.itemId === itemId);
  }

  // Remove operations by IDs
  async remove(operationIds) {
    this.queue = this.queue.filter(op => !operationIds.includes(op.id));
    await this.saveToStorage();
  }

  // Remove single operation by ID
  async removeById(operationId) {
    this.queue = this.queue.filter(op => op.id !== operationId);
    await this.saveToStorage();
  }

  // Clear entire queue
  async clear() {
    this.queue = [];
    await this.saveToStorage();
  }

  // Get queue size
  async getCount() {
    return this.queue.length;
  }

  // Check if queue is empty
  async isEmpty() {
    return this.queue.length === 0;
  }

  // Get oldest operations (for batch processing)
  async getOldest(limit = 10) {
    return this.queue
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(0, limit);
  }

  // Get operations by status
  async getByStatus(status) {
    return this.queue.filter(op => op.status === status);
  }

  // Update operation status
  async updateStatus(operationId, status, error = null) {
    const operation = this.queue.find(op => op.id === operationId);
    if (operation) {
      operation.status = status;
      if (error) {
        operation.error = error;
      }
      operation.lastUpdated = new Date().toISOString();
      await this.saveToStorage();
    }
  }

  // Mark operations as in progress
  async markInProgress(operationIds) {
    operationIds.forEach(id => {
      const operation = this.queue.find(op => op.id === id);
      if (operation) {
        operation.status = 'IN_PROGRESS';
        operation.lastUpdated = new Date().toISOString();
      }
    });
    await this.saveToStorage();
  }

  // Mark operations as completed
  async markCompleted(operationIds) {
    operationIds.forEach(id => {
      const operation = this.queue.find(op => op.id === id);
      if (operation) {
        operation.status = 'COMPLETED';
        operation.lastUpdated = new Date().toISOString();
      }
    });
    await this.saveToStorage();
  }

  // Mark operations as failed
  async markFailed(operationIds, error) {
    operationIds.forEach(id => {
      const operation = this.queue.find(op => op.id === id);
      if (operation) {
        operation.status = 'FAILED';
        operation.error = error;
        operation.lastUpdated = new Date().toISOString();
      }
    });
    await this.saveToStorage();
  }

  // Retry failed operations
  async retryFailed() {
    const failedOperations = this.queue.filter(op => op.status === 'FAILED');
    
    failedOperations.forEach(operation => {
      operation.status = 'PENDING';
      operation.error = null;
      operation.lastUpdated = new Date().toISOString();
    });
    
    await this.saveToStorage();
    return failedOperations.length;
  }

  // Get queue statistics
  async getStats() {
    const stats = {
      total: this.queue.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      failed: 0,
      byType: {}
    };

    this.queue.forEach(operation => {
      // Count by status
      switch (operation.status) {
        case 'PENDING':
          stats.pending++;
          break;
        case 'IN_PROGRESS':
          stats.inProgress++;
          break;
        case 'COMPLETED':
          stats.completed++;
          break;
        case 'FAILED':
          stats.failed++;
          break;
        default:
          stats.pending++; // Default to pending
      }

      // Count by type
      if (!stats.byType[operation.type]) {
        stats.byType[operation.type] = 0;
      }
      stats.byType[operation.type]++;
    });

    return stats;
  }

  // Clean up old completed operations (older than specified days)
  async cleanupCompleted(daysOld = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const originalLength = this.queue.length;
    this.queue = this.queue.filter(operation => {
      const isCompleted = operation.status === 'COMPLETED';
      const isOld = new Date(operation.lastUpdated || operation.timestamp) < cutoffDate;
      
      return !(isCompleted && isOld);
    });

    if (this.queue.length !== originalLength) {
      await this.saveToStorage();
      return originalLength - this.queue.length;
    }

    return 0;
  }

  // Validate operation structure
  validateOperation(operation) {
    const required = ['id', 'type', 'data', 'timestamp', 'clientId'];
    const missing = required.filter(field => !operation[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Validate operation type
    const validTypes = ['INVENTORY_ADJUSTMENT', 'ITEM_CREATE', 'ITEM_UPDATE', 'ITEM_DELETE'];
    if (!validTypes.includes(operation.type)) {
      throw new Error(`Invalid operation type: ${operation.type}`);
    }

    return true;
  }

  // Add operation with validation
  async addWithValidation(operation) {
    this.validateOperation(operation);
    
    // Set default status if not provided
    if (!operation.status) {
      operation.status = 'PENDING';
    }

    await this.add(operation);
  }

  // Export queue for debugging
  async export() {
    return {
      queue: [...this.queue],
      stats: await this.getStats(),
      timestamp: new Date().toISOString()
    };
  }

  // Import queue (for testing/debugging)
  async import(exportedData) {
    if (exportedData.queue && Array.isArray(exportedData.queue)) {
      this.queue = exportedData.queue;
      await this.saveToStorage();
    }
  }
}

export default SyncQueue;
