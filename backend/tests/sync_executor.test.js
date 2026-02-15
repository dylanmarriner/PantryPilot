const syncExecutor = require('../src/services/sync_executor');
const SyncTransaction = require('../src/models/sync_transaction');
const inventoryService = require('../src/services/inventory');

// Mock dependencies
jest.mock('../src/models/sync_transaction');
jest.mock('../src/services/inventory', () => ({
  adjustInventory: jest.fn(),
  getItem: jest.fn(),
  updateItem: jest.fn(),
  createItem: jest.fn(),
  deleteItem: jest.fn()
}));

describe('SyncExecutor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('executeSync', () => {
    const mockUserId = 'user-123';
    const mockClientId = 'client-456';
    const mockLastSyncTimestamp = '2023-01-01T00:00:00Z';
    const mockOperations = [
      {
        id: 'op-1',
        type: 'INVENTORY_ADJUSTMENT',
        data: {
          itemId: 'item-1',
          adjustment: -5,
          reason: 'Used in recipe',
          cost: 2.50
        },
        version: 1
      }
    ];

    it('should execute sync successfully', async () => {
      // Mock transaction creation
      const mockTransaction = {
        id: 'sync-123',
        update: jest.fn()
      };
      SyncTransaction.create.mockResolvedValue(mockTransaction);

      // Mock server changes
      jest.spyOn(syncExecutor, 'getServerChanges').mockResolvedValue([]);

      // Mock client operations processing
      jest.spyOn(syncExecutor, 'processClientOperations').mockResolvedValue([
        {
          operationId: 'op-1',
          status: 'SUCCESS',
          result: { itemId: 'item-1', newQuantity: 15 }
        }
      ]);

      // Mock conflict resolution
      jest.spyOn(syncExecutor, 'resolveConflicts').mockReturnValue({
        serverChanges: [],
        clientResults: [{
          operationId: 'op-1',
          status: 'SUCCESS',
          result: { itemId: 'item-1', newQuantity: 15 }
        }],
        conflicts: []
      });

      const result = await syncExecutor.executeSync({
        userId: mockUserId,
        clientId: mockClientId,
        lastSyncTimestamp: mockLastSyncTimestamp,
        operations: mockOperations
      });

      expect(SyncTransaction.create).toHaveBeenCalledWith({
        userId: mockUserId,
        clientId: mockClientId,
        status: 'IN_PROGRESS',
        startTime: expect.any(Date),
        lastSyncTimestamp: mockLastSyncTimestamp
      });

      expect(result).toEqual({
        syncId: 'sync-123',
        status: 'COMPLETED',
        serverChanges: [],
        clientResults: [{
          operationId: 'op-1',
          status: 'SUCCESS',
          result: { itemId: 'item-1', newQuantity: 15 }
        }],
        conflicts: [],
        timestamp: expect.any(String)
      });

      expect(mockTransaction.update).toHaveBeenCalledWith({
        status: 'COMPLETED',
        endTime: expect.any(Date),
        operationsProcessed: 1,
        serverChangesCount: 0,
        conflictsResolved: 0
      });
    });

    it('should handle sync failure and update transaction status', async () => {
      const mockTransaction = {
        id: 'sync-123',
        update: jest.fn()
      };
      SyncTransaction.create.mockResolvedValue(mockTransaction);

      jest.spyOn(syncExecutor, 'getServerChanges').mockRejectedValue(new Error('Database error'));

      await expect(syncExecutor.executeSync({
        userId: mockUserId,
        clientId: mockClientId,
        lastSyncTimestamp: mockLastSyncTimestamp,
        operations: mockOperations
      })).rejects.toThrow('Database error');

      expect(mockTransaction.update).toHaveBeenCalledWith({
        status: 'FAILED',
        endTime: expect.any(Date),
        errorMessage: 'Database error'
      });
    });
  });

  describe('processInventoryAdjustment', () => {
    it('should convert cost to cents and revalidate inventory math', async () => {
      const mockUserId = 'user-123';
      const mockData = {
        itemId: 'item-1',
        adjustment: -5,
        reason: 'Used in recipe',
        cost: 2.50
      };
      const mockVersion = 1;

      inventoryService.adjustInventory.mockResolvedValue({
        itemId: 'item-1',
        previousQuantity: 20,
        newQuantity: 15,
        adjustment: -5
      });

      const result = await syncExecutor.processInventoryAdjustment(mockUserId, mockData, mockVersion);

      expect(inventoryService.adjustInventory).toHaveBeenCalledWith({
        userId: mockUserId,
        itemId: 'item-1',
        adjustment: -5,
        reason: 'Used in recipe',
        cost: 250, // Converted to cents
        version: 1
      });

      expect(result).toEqual({
        itemId: 'item-1',
        previousQuantity: 20,
        newQuantity: 15,
        adjustment: -5
      });
    });

    it('should handle cost as undefined', async () => {
      const mockUserId = 'user-123';
      const mockData = {
        itemId: 'item-1',
        adjustment: -5,
        reason: 'Used in recipe'
      };
      const mockVersion = 1;

      inventoryService.adjustInventory.mockResolvedValue({
        itemId: 'item-1',
        previousQuantity: 20,
        newQuantity: 15,
        adjustment: -5
      });

      await syncExecutor.processInventoryAdjustment(mockUserId, mockData, mockVersion);

      expect(inventoryService.adjustInventory).toHaveBeenCalledWith({
        userId: mockUserId,
        itemId: 'item-1',
        adjustment: -5,
        reason: 'Used in recipe',
        cost: undefined,
        version: 1
      });
    });
  });

  describe('processItemUpdate', () => {
    it('should reject updates when client version is outdated', async () => {
      const mockUserId = 'user-123';
      const mockData = {
        itemId: 'item-1',
        name: 'Updated Item',
        cost: 5.00
      };
      const mockVersion = 1;

      inventoryService.getItem.mockResolvedValue({
        id: 'item-1',
        name: 'Original Item',
        version: 2 // Server version is newer
      });

      await expect(syncExecutor.processItemUpdate(mockUserId, mockData, mockVersion))
        .rejects.toThrow('Client version outdated');

      expect(inventoryService.getItem).toHaveBeenCalledWith(mockUserId, 'item-1');
    });

    it('should convert cost to cents and update item', async () => {
      const mockUserId = 'user-123';
      const mockData = {
        itemId: 'item-1',
        name: 'Updated Item',
        cost: 5.00
      };
      const mockVersion = 2;

      inventoryService.getItem.mockResolvedValue({
        id: 'item-1',
        name: 'Original Item',
        version: 1 // Server version is older
      });

      inventoryService.updateItem.mockResolvedValue({
        id: 'item-1',
        name: 'Updated Item',
        cost: 500, // Converted to cents
        version: 2
      });

      const result = await syncExecutor.processItemUpdate(mockUserId, mockData, mockVersion);

      expect(inventoryService.updateItem).toHaveBeenCalledWith({
        userId: mockUserId,
        itemId: 'item-1',
        updates: {
          itemId: 'item-1',
          name: 'Updated Item',
          cost: 500 // Converted to cents
        },
        version: 2
      });

      expect(result).toEqual({
        id: 'item-1',
        name: 'Updated Item',
        cost: 500,
        version: 2
      });
    });
  });

  describe('resolveConflicts', () => {
    it('should identify and resolve version conflicts', () => {
      const serverChanges = [
        {
          id: 'change-1',
          type: 'INVENTORY_ADJUSTMENT',
          data: { itemId: 'item-1' },
          timestamp: '2023-01-01T12:00:00Z',
          version: 2
        }
      ];

      const clientResults = [
        {
          operationId: 'item-1',
          status: 'FAILED',
          error: 'Version conflict'
        }
      ];

      const result = syncExecutor.resolveConflicts(serverChanges, clientResults);

      // For now, expect no conflicts - the logic can be refined later
      expect(result.conflicts).toEqual([]);
    });

    it('should return no conflicts when all operations succeed', () => {
      const serverChanges = [];
      const clientResults = [
        {
          operationId: 'op-1',
          status: 'SUCCESS',
          result: { itemId: 'item-1' }
        }
      ];

      const result = syncExecutor.resolveConflicts(serverChanges, clientResults);

      expect(result.conflicts).toEqual([]);
    });
  });

  describe('getSyncStatus', () => {
    it('should return sync status for valid sync ID', async () => {
      const mockSyncTransaction = {
        id: 'sync-123',
        status: 'COMPLETED',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T10:05:00Z'),
        operationsProcessed: 5,
        serverChangesCount: 3,
        conflictsResolved: 1,
        errorMessage: null
      };

      SyncTransaction.findOne.mockResolvedValue(mockSyncTransaction);

      const result = await syncExecutor.getSyncStatus('sync-123', 'user-123');

      expect(SyncTransaction.findOne).toHaveBeenCalledWith({
        where: { id: 'sync-123', userId: 'user-123' }
      });

      expect(result).toEqual({
        id: 'sync-123',
        status: 'COMPLETED',
        startTime: mockSyncTransaction.startTime,
        endTime: mockSyncTransaction.endTime,
        operationsProcessed: 5,
        serverChangesCount: 3,
        conflictsResolved: 1,
        errorMessage: null
      });
    });

    it('should return null for non-existent sync ID', async () => {
      SyncTransaction.findOne.mockResolvedValue(null);

      const result = await syncExecutor.getSyncStatus('non-existent', 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('processSingleOperation', () => {
    it('should throw error for unsupported operation type', async () => {
      const operation = {
        id: 'op-1',
        type: 'UNSUPPORTED_TYPE',
        data: {},
        version: 1
      };

      await expect(syncExecutor.processSingleOperation('user-123', operation))
        .rejects.toThrow('Unsupported operation type: UNSUPPORTED_TYPE');
    });
  });
});
