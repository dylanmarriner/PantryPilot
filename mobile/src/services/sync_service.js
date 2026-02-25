import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import SyncQueue from '../utils/sync_queue';

class SyncService {
  constructor() {
    this.isOnline = true;
    this.syncInProgress = false;
    this.syncQueue = new SyncQueue();
    this.listeners = new Set();
  }

  // Initialize sync service
  async initialize() {
    // Check network status
    this.setupNetworkListener();
    
    // Load any pending operations from storage
    await this.syncQueue.loadFromStorage();
    
    // If online, try to sync pending operations
    if (this.isOnline) {
      await this.syncPendingOperations();
    }
  }

  // Setup network status listener
  setupNetworkListener() {
    // Network status initialized as online
    // Real implementation would use react-native-netinfo or similar
    // For now, network status is managed through sync operation failures
    this.isOnline = true;
  }

  // Add operation to sync queue
  async queueOperation(operation) {
    const queuedOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: new Date().toISOString(),
      clientId: await this.getClientId()
    };

    await this.syncQueue.add(queuedOperation);
    
    // If online, try to sync immediately
    if (this.isOnline && !this.syncInProgress) {
      this.syncPendingOperations();
    }

    return queuedOperation.id;
  }

  // Sync pending operations with server
  async syncPendingOperations() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners({ type: 'SYNC_STARTED' });

    try {
      const pendingOperations = await this.syncQueue.getAll();
      
      if (pendingOperations.length === 0) {
        this.notifyListeners({ type: 'SYNC_COMPLETED', operations: [] });
        return;
      }

      const lastSyncTimestamp = await this.getLastSyncTimestamp();
      
      const response = await api.post('/sync/initiate', {
        clientId: await this.getClientId(),
        lastSyncTimestamp,
        operations: pendingOperations
      });

      if (response.success) {
        const { serverChanges, clientResults, conflicts } = response.data;
        
        // Process server changes
        await this.processServerChanges(serverChanges);
        
        // Remove successfully synced operations from queue
        const successfulOperations = clientResults
          .filter(result => result.status === 'SUCCESS')
          .map(result => result.operationId);
        
        await this.syncQueue.remove(successfulOperations);
        
        // Handle conflicts
        if (conflicts && conflicts.length > 0) {
          await this.handleConflicts(conflicts);
        }
        
        // Update last sync timestamp
        await this.updateLastSyncTimestamp(response.data.timestamp);
        
        this.notifyListeners({ 
          type: 'SYNC_COMPLETED', 
          operations: pendingOperations,
          serverChanges,
          conflicts 
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifyListeners({ 
        type: 'SYNC_FAILED', 
        error: error.message 
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  // Process server changes locally
  async processServerChanges(serverChanges) {
    for (const change of serverChanges) {
      try {
        await this.applyServerChange(change);
      } catch (error) {
        console.error('Failed to apply server change:', error);
      }
    }
  }

  // Apply a single server change to local storage
  async applyServerChange(change) {
    const { type, data, version } = change;
    
    switch (type) {
      case 'INVENTORY_ADJUSTMENT':
        await this.applyInventoryAdjustment(data, version);
        break;
      case 'ITEM_CREATE':
        await this.applyItemCreate(data, version);
        break;
      case 'ITEM_UPDATE':
        await this.applyItemUpdate(data, version);
        break;
      case 'ITEM_DELETE':
        await this.applyItemDelete(data, version);
        break;
      default:
        console.warn('Unknown server change type:', type);
    }
  }

  async applyInventoryAdjustment(data, version) {
    // Update local inventory with server adjustment
    const key = `inventory_${data.itemId}`;
    const currentData = await AsyncStorage.getItem(key);
    
    if (currentData) {
      const inventory = JSON.parse(currentData);
      
      // Only apply if server version is newer
      if (!inventory.version || version > inventory.version) {
        inventory.quantity = data.newQuantity;
        inventory.version = version;
        inventory.lastModified = data.timestamp;
        
        await AsyncStorage.setItem(key, JSON.stringify(inventory));
      }
    }
  }

  async applyItemCreate(data, version) {
    // Create new item locally
    const key = `item_${data.id}`;
    const itemData = {
      ...data,
      version,
      lastModified: data.timestamp
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(itemData));
  }

  async applyItemUpdate(data, version) {
    // Update local item if server version is newer
    const key = `item_${data.id}`;
    const currentData = await AsyncStorage.getItem(key);
    
    if (currentData) {
      const item = JSON.parse(currentData);
      
      if (!item.version || version > item.version) {
        const updatedItem = {
          ...item,
          ...data,
          version,
          lastModified: data.timestamp
        };
        
        await AsyncStorage.setItem(key, JSON.stringify(updatedItem));
      }
    }
  }

  async applyItemDelete(data, version) {
    // Delete local item if server version is newer
    const key = `item_${data.id}`;
    const currentData = await AsyncStorage.getItem(key);
    
    if (currentData) {
      const item = JSON.parse(currentData);
      
      if (!item.version || version > item.version) {
        await AsyncStorage.removeItem(key);
      }
    }
  }

  // Handle sync conflicts
  async handleConflicts(conflicts) {
    for (const conflict of conflicts) {
      try {
        await this.resolveConflict(conflict);
      } catch (error) {
        console.error('Failed to resolve conflict:', error);
      }
    }
  }

  async resolveConflict(conflict) {
    const { type, clientOperation, serverChange, resolution } = conflict;
    
    if (resolution === 'SERVER_WINS') {
      // Remove the failed client operation from queue
      await this.syncQueue.remove([clientOperation.operationId]);
      
      // Apply server change
      await this.applyServerChange(serverChange);
      
      this.notifyListeners({ 
        type: 'CONFLICT_RESOLVED', 
        conflict,
        resolution 
      });
    }
  }

  // Get sync status
  async getSyncStatus() {
    const pendingCount = await this.syncQueue.getCount();
    const lastSync = await this.getLastSyncTimestamp();
    
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingOperations: pendingCount,
      lastSyncTimestamp: lastSync
    };
  }

  // Force sync
  async forceSync() {
    if (this.isOnline) {
      await this.syncPendingOperations();
    } else {
      throw new Error('Device is offline');
    }
  }

  // Utility methods
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getClientId() {
    let clientId = await AsyncStorage.getItem('client_id');
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('client_id', clientId);
    }
    return clientId;
  }

  async getLastSyncTimestamp() {
    return await AsyncStorage.getItem('last_sync_timestamp');
  }

  async updateLastSyncTimestamp(timestamp) {
    await AsyncStorage.setItem('last_sync_timestamp', timestamp);
  }

  // Event listeners
  addListener(listener) {
    this.listeners.add(listener);
  }

  removeListener(listener) {
    this.listeners.delete(listener);
  }

  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  // Network status methods
  setOnlineStatus(isOnline) {
    if (this.isOnline !== isOnline) {
      this.isOnline = isOnline;
      this.notifyListeners({ type: 'NETWORK_STATUS_CHANGED', isOnline });
      
      if (isOnline && !this.syncInProgress) {
        // Try to sync when coming back online
        setTimeout(() => this.syncPendingOperations(), 1000);
      }
    }
  }
}

export default new SyncService();
