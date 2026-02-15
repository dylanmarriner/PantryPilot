import syncService from '../src/services/sync_service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');

describe('syncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('queueOperation', () => {
    it('should generate operation ID with correct format', async () => {
      const mockOperation = {
        type: 'INVENTORY_ADJUSTMENT',
        data: {
          itemId: 'item-1',
          adjustment: -5,
          reason: 'Used in recipe'
        }
      };

      // Mock getClientId
      AsyncStorage.getItem.mockResolvedValue('client-456');

      // Mock queue add
      syncService.syncQueue.add = jest.fn().mockResolvedValue();

      const result = await syncService.queueOperation(mockOperation);

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

      await syncService.queueOperation(mockOperation);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'client_id',
        expect.stringMatching(/client_\d+_[a-z0-9]+/)
      );
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
    it('should set online status', () => {
      syncService.setOnlineStatus(false);

      expect(syncService.isOnline).toBe(false);
    });
  });

  describe('event listeners', () => {
    it('should add and remove listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      syncService.addListener(listener1);
      syncService.addListener(listener2);

      expect(syncService.listeners.has(listener1)).toBe(true);
      expect(syncService.listeners.has(listener2)).toBe(true);

      syncService.removeListener(listener1);
      expect(syncService.listeners.has(listener1)).toBe(false);
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
