import SyncQueue from '../src/utils/sync_queue';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies FIRST before importing syncService
jest.mock('../src/utils/sync_queue');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../src/services/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}));

import syncService from '../src/services/sync_service';
import { api } from '../src/services/api';

describe('syncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear listeners from previous tests
    syncService.listeners.clear();
    syncService.isOnline = true;
    syncService.syncInProgress = false;
  });

  describe('queueOperation', () => {
    it('should queue operation and attempt sync if online', async () => {
      const mockOperation = {
        type: 'INVENTORY_ADJUSTMENT',
        data: {
          itemId: 'item-1',
          adjustment: -5,
          reason: 'Used in recipe'
        }
      };

      const mockQueuedOperation = {
        ...mockOperation,
        id: 'op-123',
        timestamp: '2023-01-01T12:00:00Z',
        clientId: 'client-456'
      };

      // Mock getClientId
      AsyncStorage.getItem.mockResolvedValue('client-456');

      // Mock queue add
      syncService.syncQueue.add = jest.fn().mockResolvedValue();

      // Mock syncPendingOperations
      syncService.syncPendingOperations = jest.fn().mockResolvedValue();

      const result = await syncService.queueOperation(mockOperation);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('client_id');
      expect(syncService.syncQueue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'INVENTORY_ADJUSTMENT',
          data: mockOperation.data,
          clientId: 'client-456'
        })
      );
      expect(result).toMatch(/op_\d+_[a-z0-9]+/);
    });

    it('should generate new client ID if none exists', async () => {
      const mockOperation = {
        type: 'ITEM_CREATE',
        data: {
          name: 'New Item',
          category: 'produce'
        }
      };

      // Mock no existing client ID
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue();

      syncService.syncQueue.add = jest.fn().mockResolvedValue();
      syncService.syncPendingOperations = jest.fn().mockResolvedValue();

      await syncService.queueOperation(mockOperation);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('client_id');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'client_id',
        expect.stringMatching(/client_\d+_[a-z0-9]+/)
      );
    });
  });

  describe('syncPendingOperations', () => {
    beforeEach(() => {
      syncService.isOnline = true;
      syncService.syncInProgress = false;
    });

    it('should sync pending operations successfully', async () => {
      const mockPendingOperations = [
        {
          id: 'op-1',
          type: 'INVENTORY_ADJUSTMENT',
          data: { itemId: 'item-1', adjustment: -5 }
        }
      ];

      const mockResponse = {
        success: true,
        data: {
          syncId: 'sync-123',
          serverChanges: [
            {
              type: 'INVENTORY_ADJUSTMENT',
              data: { itemId: 'item-2', newQuantity: 10 },
              version: 2
            }
          ],
          clientResults: [
            {
              operationId: 'op-1',
              status: 'SUCCESS',
              result: { itemId: 'item-1', newQuantity: 15 }
            }
          ],
          conflicts: [],
          timestamp: '2023-01-01T12:05:00Z'
        }
      };

      // Mock dependencies - use jest.spyOn to ensure mocks are applied
      syncService.syncQueue.getAll = jest.fn().mockResolvedValue(mockPendingOperations);
      const mockClientId = 'client-123';
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'client_id') return Promise.resolve(mockClientId);
        if (key === 'last_sync_timestamp') return Promise.resolve('2023-01-01T10:00:00Z');
        return Promise.resolve(null);
      });
      
      // Setup api.post mock (it's already a jest.fn)
      api.post.mockResolvedValue(mockResponse);
      
      syncService.syncQueue.remove = jest.fn().mockResolvedValue();
      AsyncStorage.setItem.mockResolvedValue();

      // Mock listener
      const mockListener = jest.fn();
      syncService.addListener(mockListener);

      await syncService.syncPendingOperations();

      expect(api.post).toHaveBeenCalledWith('/sync/initiate', {
        clientId: expect.any(String),
        lastSyncTimestamp: '2023-01-01T10:00:00Z',
        operations: mockPendingOperations
      });

      expect(syncService.syncQueue.remove).toHaveBeenCalledWith(['op-1']);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'last_sync_timestamp',
        '2023-01-01T12:05:00Z'
      );

      expect(mockListener).toHaveBeenCalledWith({
        type: 'SYNC_STARTED'
      });

      expect(mockListener).toHaveBeenCalledWith({
        type: 'SYNC_COMPLETED',
        operations: mockPendingOperations,
        serverChanges: mockResponse.data.serverChanges,
        conflicts: []
      });
    });

    it('should handle sync failure', async () => {
      const mockPendingOperations = [
        {
          id: 'op-1',
          type: 'INVENTORY_ADJUSTMENT',
          data: { itemId: 'item-1', adjustment: -5 }
        }
      ];
      syncService.syncQueue.getAll = jest.fn().mockResolvedValue(mockPendingOperations);
      const mockClientId = 'client-123';
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'client_id') return Promise.resolve(mockClientId);
        return Promise.resolve(null);
      });
      api.post.mockRejectedValue(new Error('Network error'));

      const mockListener = jest.fn();
      syncService.addListener(mockListener);

      await syncService.syncPendingOperations();

      expect(mockListener).toHaveBeenCalledWith({
        type: 'SYNC_FAILED',
        error: 'Network error'
      });
    });

    it('should not sync if already in progress', async () => {
      syncService.syncInProgress = true;
      syncService.syncQueue.getAll = jest.fn();

      await syncService.syncPendingOperations();

      expect(syncService.syncQueue.getAll).not.toHaveBeenCalled();
    });

    it('should not sync if offline', async () => {
      syncService.isOnline = false;
      syncService.syncQueue.getAll = jest.fn();

      await syncService.syncPendingOperations();

      expect(syncService.syncQueue.getAll).not.toHaveBeenCalled();
    });
  });

  describe('processServerChanges', () => {
    it('should apply inventory adjustment from server', async () => {
      const serverChanges = [
        {
          type: 'INVENTORY_ADJUSTMENT',
          data: {
            itemId: 'item-1',
            newQuantity: 15,
            timestamp: '2023-01-01T12:00:00Z'
          },
          version: 2
        }
      ];

      const mockCurrentInventory = {
        quantity: 20,
        version: 1
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockCurrentInventory));
      AsyncStorage.setItem.mockResolvedValue();

      await syncService.processServerChanges(serverChanges);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('inventory_item-1');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'inventory_item-1',
        JSON.stringify({
          quantity: 15,
          version: 2,
          lastModified: '2023-01-01T12:00:00Z'
        })
      );
    });

    it('should not apply server change if client version is newer', async () => {
      const serverChanges = [
        {
          type: 'INVENTORY_ADJUSTMENT',
          data: {
            itemId: 'item-1',
            newQuantity: 15,
            timestamp: '2023-01-01T12:00:00Z'
          },
          version: 1
        }
      ];

      const mockCurrentInventory = {
        quantity: 20,
        version: 2 // Client version is newer
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockCurrentInventory));

      await syncService.processServerChanges(serverChanges);

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('handleConflicts', () => {
    it('should resolve conflicts by removing failed operations and applying server changes', async () => {
      const conflicts = [
        {
          type: 'VERSION_CONFLICT',
          clientOperation: {
            operationId: 'op-1',
            status: 'FAILED'
          },
          serverChange: {
            type: 'INVENTORY_ADJUSTMENT',
            data: { itemId: 'item-1', newQuantity: 10 },
            version: 2
          },
          resolution: 'SERVER_WINS'
        }
      ];

      syncService.syncQueue.remove = jest.fn().mockResolvedValue();
      syncService.applyServerChange = jest.fn().mockResolvedValue();

      const mockListener = jest.fn();
      syncService.addListener(mockListener);

      await syncService.handleConflicts(conflicts);

      expect(syncService.syncQueue.remove).toHaveBeenCalledWith(['op-1']);
      expect(syncService.applyServerChange).toHaveBeenCalledWith(conflicts[0].serverChange);
      expect(mockListener).toHaveBeenCalledWith({
        type: 'CONFLICT_RESOLVED',
        conflict: conflicts[0],
        resolution: 'SERVER_WINS'
      });
    });
  });

  describe('getSyncStatus', () => {
    it('should return current sync status', async () => {
      syncService.isOnline = true;
      syncService.syncInProgress = false;
      syncService.syncQueue.getCount = jest.fn().mockResolvedValue(3);
      AsyncStorage.getItem.mockResolvedValue('2023-01-01T10:00:00Z');

      const status = await syncService.getSyncStatus();

      expect(status).toEqual({
        isOnline: true,
        syncInProgress: false,
        pendingOperations: 3,
        lastSyncTimestamp: '2023-01-01T10:00:00Z'
      });
    });
  });

  describe('forceSync', () => {
    it('should trigger sync when online', async () => {
      syncService.isOnline = true;
      syncService.syncPendingOperations = jest.fn().mockResolvedValue();

      await syncService.forceSync();

      expect(syncService.syncPendingOperations).toHaveBeenCalled();
    });

    it('should throw error when offline', async () => {
      syncService.isOnline = false;

      await expect(syncService.forceSync()).rejects.toThrow('Device is offline');
    });
  });

  describe('network status', () => {
    it('should notify listeners when network status changes', async () => {
      const mockListener = jest.fn();
      syncService.addListener(mockListener);

      // Change to offline
      syncService.setOnlineStatus(false);

      expect(mockListener).toHaveBeenCalledWith({
        type: 'NETWORK_STATUS_CHANGED',
        isOnline: false
      });

      // Change back to online
      syncService.syncPendingOperations = jest.fn().mockResolvedValue();
      syncService.setOnlineStatus(true);

      expect(mockListener).toHaveBeenCalledWith({
        type: 'NETWORK_STATUS_CHANGED',
        isOnline: true
      });

      // Should trigger sync after delay
      setTimeout(() => {
        expect(syncService.syncPendingOperations).toHaveBeenCalled();
      }, 1100);
    });
  });

  describe('event listeners', () => {
    it('should add and remove listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      syncService.addListener(listener1);
      syncService.addListener(listener2);

      expect(syncService.listeners.size).toBe(2);

      syncService.removeListener(listener1);
      expect(syncService.listeners.size).toBe(1);
      expect(syncService.listeners.has(listener2)).toBe(true);
    });

    it('should handle listener errors gracefully', () => {
      const faultyListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      const workingListener = jest.fn();

      syncService.addListener(faultyListener);
      syncService.addListener(workingListener);

      // Should not throw and should call working listener
      expect(() => {
        syncService.notifyListeners({ type: 'TEST_EVENT' });
      }).not.toThrow();

      expect(workingListener).toHaveBeenCalled();
    });
  });
});
