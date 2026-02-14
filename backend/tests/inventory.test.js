const InventoryService = require('../src/services/inventory');
const { sequelize, Item, User, Household, StockEntry } = require('../src/models');

// Mock the models
jest.mock('../src/models', () => ({
  sequelize: {
    transaction: jest.fn(),
    literal: jest.fn(),
    Op: {
      gte: jest.fn(),
      lte: jest.fn(),
    },
  },
  Item: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  User: {
    // Mock user model
  },
  StockEntry: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
}));

describe('InventoryService', () => {
  let inventoryService;
  let mockTransaction;

  beforeEach(() => {
    inventoryService = new InventoryService();
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('addStock', () => {
    const mockItem = {
      id: 'item-123',
      name: 'Test Item',
      preferred_unit: 'kg',
    };

    const mockStockEntry = {
      id: 'entry-123',
      item_id: 'item-123',
      user_id: 'user-123',
      quantity_base: 1000,
      unit_type: 'weight',
      base_unit: 'g',
      operation_type: 'add',
      toJSON: jest.fn().mockReturnValue({
        id: 'entry-123',
        item_id: 'item-123',
        quantity_base: 1000,
      }),
    };

    test('should add stock successfully', async () => {
      // Setup mocks
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Item.findByPk.mockResolvedValue(mockItem);
      StockEntry.create.mockResolvedValue(mockStockEntry);
      
      // Mock getCurrentStock
      inventoryService.getCurrentStock = jest.fn().mockResolvedValue(1000);

      const params = {
        item_id: 'item-123',
        user_id: 'user-123',
        quantity: 1,
        unit: 'kg',
        reason: 'Initial stock',
      };

      const result = await inventoryService.addStock(params);

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(Item.findByPk).toHaveBeenCalledWith('item-123', { transaction: mockTransaction });
      expect(StockEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          item_id: 'item-123',
          user_id: 'user-123',
          quantity_base: 1000,
          unit_type: 'weight',
          base_unit: 'g',
          operation_type: 'add',
          reason: 'Initial stock',
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result.current_stock).toBe(1000);
    });

    test('should throw error if item not found', async () => {
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Item.findByPk.mockResolvedValue(null);

      const params = {
        item_id: 'invalid-item',
        user_id: 'user-123',
        quantity: 1,
        unit: 'kg',
      };

      await expect(inventoryService.addStock(params)).rejects.toThrow('Item not found');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('should handle different units correctly', async () => {
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Item.findByPk.mockResolvedValue({ ...mockItem, preferred_unit: 'g' });
      StockEntry.create.mockResolvedValue(mockStockEntry);
      inventoryService.getCurrentStock = jest.fn().mockResolvedValue(500);

      const params = {
        item_id: 'item-123',
        user_id: 'user-123',
        quantity: 500,
        unit: 'g',
      };

      await inventoryService.addStock(params);

      expect(StockEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity_base: 500,
          base_unit: 'g',
        }),
        { transaction: mockTransaction }
      );
    });
  });

  describe('deductStock', () => {
    const mockItem = {
      id: 'item-123',
      name: 'Test Item',
      preferred_unit: 'kg',
    };

    test('should deduct stock successfully', async () => {
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Item.findByPk.mockResolvedValue(mockItem);
      
      // Mock current stock
      inventoryService.getCurrentStock = jest.fn()
        .mockResolvedValueOnce(2000) // Current stock before deduction
        .mockResolvedValueOnce(1000); // Current stock after deduction

      const mockStockEntry = {
        id: 'entry-124',
        item_id: 'item-123',
        quantity_base: 1000,
        toJSON: jest.fn().mockReturnValue({
          id: 'entry-124',
          quantity_base: 1000,
        }),
      };
      StockEntry.create.mockResolvedValue(mockStockEntry);

      const params = {
        item_id: 'item-123',
        user_id: 'user-123',
        quantity: 1,
        unit: 'kg',
        reason: 'Used for cooking',
      };

      const result = await inventoryService.deductStock(params);

      expect(StockEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_type: 'deduct',
          quantity_base: 1000,
          reason: 'Used for cooking',
        }),
        { transaction: mockTransaction }
      );
      expect(result.current_stock).toBe(1000);
    });

    test('should throw error if insufficient stock', async () => {
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Item.findByPk.mockResolvedValue(mockItem);
      inventoryService.getCurrentStock = jest.fn().mockResolvedValue(500); // Only 500g available

      const params = {
        item_id: 'item-123',
        user_id: 'user-123',
        quantity: 1, // Trying to deduct 1kg
        unit: 'kg',
      };

      await expect(inventoryService.deductStock(params)).rejects.toThrow(
        'Insufficient stock. Current: 500 g, Attempted to deduct: 1000 g'
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('adjustStock', () => {
    const mockItem = {
      id: 'item-123',
      name: 'Test Item',
      preferred_unit: 'kg',
    };

    test('should increase stock when new quantity is higher', async () => {
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Item.findByPk.mockResolvedValue(mockItem);
      
      // Mock current stock
      inventoryService.getCurrentStock = jest.fn()
        .mockResolvedValueOnce(500) // Current stock
        .mockResolvedValueOnce(1500); // New stock after adjustment

      const mockStockEntry = {
        id: 'entry-125',
        quantity_base: 1000,
        toJSON: jest.fn().mockReturnValue({
          id: 'entry-125',
          quantity_base: 1000,
        }),
      };
      StockEntry.create.mockResolvedValue(mockStockEntry);

      const params = {
        item_id: 'item-123',
        user_id: 'user-123',
        new_quantity: 1.5,
        unit: 'kg',
        reason: 'Stock count correction',
      };

      const result = await inventoryService.adjustStock(params);

      expect(StockEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_type: 'adjust',
          quantity_base: 1000,
          reason: 'Stock count correction',
        }),
        { transaction: mockTransaction }
      );
      expect(result.adjustment_type).toBe('add');
      expect(result.current_stock).toBe(1500);
    });

    test('should decrease stock when new quantity is lower', async () => {
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Item.findByPk.mockResolvedValue(mockItem);
      
      inventoryService.getCurrentStock = jest.fn()
        .mockResolvedValueOnce(2000) // Current stock
        .mockResolvedValueOnce(500); // New stock after adjustment

      const mockStockEntry = {
        id: 'entry-126',
        quantity_base: 1500,
        toJSON: jest.fn().mockReturnValue({
          id: 'entry-126',
          quantity_base: 1500,
        }),
      };
      StockEntry.create.mockResolvedValue(mockStockEntry);

      const params = {
        item_id: 'item-123',
        user_id: 'user-123',
        new_quantity: 0.5,
        unit: 'kg',
      };

      const result = await inventoryService.adjustStock(params);

      expect(result.adjustment_type).toBe('deduct');
      expect(result.current_stock).toBe(500);
    });

    test('should throw error when no adjustment needed', async () => {
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Item.findByPk.mockResolvedValue(mockItem);
      inventoryService.getCurrentStock = jest.fn().mockResolvedValue(1000);

      const params = {
        item_id: 'item-123',
        user_id: 'user-123',
        new_quantity: 1,
        unit: 'kg',
      };

      await expect(inventoryService.adjustStock(params)).rejects.toThrow(
        'No adjustment needed - quantity is already correct'
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getCurrentStock', () => {
    test('should calculate current stock correctly', async () => {
      const mockResult = {
        current_stock: '1500',
      };
      
      StockEntry.findOne.mockResolvedValue(mockResult);
      sequelize.literal.mockImplementation((str) => str);

      const result = await inventoryService.getCurrentStock('item-123');

      expect(StockEntry.findOne).toHaveBeenCalledWith({
        attributes: [
          [sequelize.literal(`
            SUM(CASE WHEN operation_type = 'add' THEN quantity_base ELSE 0 END) -
            SUM(CASE WHEN operation_type IN ('deduct', 'adjust') THEN quantity_base ELSE 0 END)
          `), 'current_stock']
        ],
        where: { item_id: 'item-123' },
        transaction: null,
        raw: true,
      });
      expect(result).toBe(1500);
    });

    test('should return 0 for no stock entries', async () => {
      StockEntry.findOne.mockResolvedValue({ current_stock: null });

      const result = await inventoryService.getCurrentStock('item-123');

      expect(result).toBe(0);
    });
  });

  describe('checkReorderThresholds', () => {
    const mockItems = [
      {
        id: 'item-1',
        name: 'Flour',
        minimum_quantity: 1000,
        preferred_unit: 'g',
      },
      {
        id: 'item-2',
        name: 'Milk',
        minimum_quantity: 2,
        preferred_unit: 'L',
      },
      {
        id: 'item-3',
        name: 'Eggs',
        minimum_quantity: 12,
        preferred_unit: 'count',
      },
    ];

    test('should identify items below minimum threshold', async () => {
      Item.findAll.mockResolvedValue(mockItems);
      
      // Mock current stock for each item
      inventoryService.getCurrentStock = jest.fn()
        .mockImplementation((itemId) => {
          if (itemId === 'item-1') return Promise.resolve(500);  // Flour: 500g < 1000g minimum
          if (itemId === 'item-2') return Promise.resolve(3000); // Milk: 3000ml > 2000ml minimum
          if (itemId === 'item-3') return Promise.resolve(6);   // Eggs: 6 < 12 minimum
          return Promise.resolve(0);
        });

      const result = await inventoryService.checkReorderThresholds('household-123');

      expect(Item.findAll).toHaveBeenCalledWith({
        where: {
          household_id: 'household-123',
          is_active: true,
        },
        attributes: ['id', 'name', 'minimum_quantity', 'preferred_unit'],
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        item_id: 'item-1',
        item_name: 'Flour',
        current_stock: 500,
        minimum_quantity: 1000,
        unit: 'g',
      });
      expect(result[1]).toMatchObject({
        item_id: 'item-3',
        item_name: 'Eggs',
        current_stock: 6,
        minimum_quantity: 12,
        unit: 'count',
      });
    });

    test('should return empty array when all items above threshold', async () => {
      Item.findAll.mockResolvedValue(mockItems);
      inventoryService.getCurrentStock = jest.fn()
        .mockImplementation((itemId) => {
          if (itemId === 'item-1') return Promise.resolve(2000); // Flour: 2000g > 1000g minimum
          if (itemId === 'item-2') return Promise.resolve(3000); // Milk: 3000ml > 2000ml minimum
          if (itemId === 'item-3') return Promise.resolve(20);   // Eggs: 20 > 12 minimum
          return Promise.resolve(0);
        });

      const result = await inventoryService.checkReorderThresholds('household-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('getStockHistory', () => {
    test('should return stock history with filters', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          operation_type: 'add',
          created_at: new Date('2024-01-01'),
        },
        {
          id: 'entry-2',
          operation_type: 'deduct',
          created_at: new Date('2024-01-02'),
        },
      ];

      StockEntry.findAll.mockResolvedValue(mockEntries);

      const result = await inventoryService.getStockHistory('item-123', {
        limit: 50,
        operation_type: 'add',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });

      expect(StockEntry.findAll).toHaveBeenCalledWith({
        where: {
          item_id: 'item-123',
          operation_type: 'add',
          created_at: {
            [sequelize.Op.gte]: '2024-01-01',
            [sequelize.Op.lte]: '2024-01-31',
          },
        },
        include: [
          { model: Item, as: 'item', attributes: ['id', 'name', 'preferred_unit'] },
          { model: User, as: 'user', attributes: ['id', 'name'] },
        ],
        order: [['created_at', 'DESC']],
        limit: 50,
        offset: 0,
      });

      expect(result).toEqual(mockEntries);
    });
  });
});
