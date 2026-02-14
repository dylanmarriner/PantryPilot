const { Sequelize, DataTypes } = require('sequelize');
const NightlySyncJob = require('../src/jobs/nightly_sync');
const { v4: uuidv4 } = require('uuid');

// Create a separate in-memory database for worker tests
const sequelize = new Sequelize('sqlite::memory:', {
  logging: false,
});

// Define minimal models for testing
const Household = sequelize.define('Household', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  household_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  minimum_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

const SKU = sequelize.define('SKU', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  item_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  store_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  package_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  package_unit: {
    type: DataTypes.ENUM('g', 'kg', 'ml', 'L', 'count'),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_price_update: {
    type: DataTypes.DATE,
  },
});

const PriceSnapshot = sequelize.define('PriceSnapshot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sku_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  store_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  price_cents: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sale_price_cents: {
    type: DataTypes.INTEGER,
  },
  is_on_sale: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  captured_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

const StockEntry = sequelize.define('StockEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  item_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  household_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiry_date: {
    type: DataTypes.DATE,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

// Set up associations
Household.hasMany(Item);
Item.belongsTo(Household);
Household.hasMany(StockEntry, { as: 'stockEntries', foreignKey: 'household_id' });
StockEntry.belongsTo(Household, { foreignKey: 'household_id' });
Item.hasMany(StockEntry, { as: 'stockEntries', foreignKey: 'item_id' });
StockEntry.belongsTo(Item, { foreignKey: 'item_id' });
Item.hasMany(SKU);
SKU.belongsTo(Item);
Store.hasMany(SKU);
SKU.belongsTo(Store);
SKU.hasMany(PriceSnapshot, { as: 'priceSnapshots', foreignKey: 'sku_id' });
PriceSnapshot.belongsTo(SKU, { foreignKey: 'sku_id' });
Store.hasMany(PriceSnapshot);
PriceSnapshot.belongsTo(Store);

const models = {
  Household,
  Item,
  Store,
  SKU,
  PriceSnapshot,
  StockEntry,
};

describe('NightlySyncJob', () => {
  let nightlySync;
  let household, item, store, sku;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    nightlySync = new NightlySyncJob(models);
  });

  beforeEach(async () => {
    // Clean up database - SQLite doesn't support truncate with cascade
    await PriceSnapshot.destroy({ where: {} });
    await StockEntry.destroy({ where: {} });
    await SKU.destroy({ where: {} });
    await Item.destroy({ where: {} });
    await Store.destroy({ where: {} });
    await Household.destroy({ where: {} });

    // Create test data
    household = await models.Household.create({
      name: 'Test Household',
    });

    item = await models.Item.create({
      id: uuidv4(),
      household_id: household.id,
      name: 'Test Item',
      minimum_quantity: 10,
    });

    store = await models.Store.create({
      name: 'Test Store',
      location: 'Test Location',
    });

    sku = await models.SKU.create({
      id: uuidv4(),
      item_id: item.id,
      store_id: store.id,
      product_name: 'Test Product',
      package_size: 500,
      package_unit: 'g',
    });
  });

  describe('execute', () => {
    it('should execute all tasks successfully', async () => {
      // Create some test price snapshots
      await models.PriceSnapshot.create({
        sku_id: sku.id,
        store_id: store.id,
        price_cents: 500,
        captured_at: new Date(),
      });

      const results = await nightlySync.execute();

      expect(results.success).toBe(true);
      expect(results.tasks).toHaveProperty('cleanupOldPrices');
      expect(results.tasks).toHaveProperty('updateSKUTimestamps');
      expect(results.tasks).toHaveProperty('lowStockReport');
      expect(results.tasks).toHaveProperty('consistencyCheck');
      expect(results.errors).toHaveLength(0);
      expect(results.duration).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      // Create a mock that throws an error
      const originalCleanup = nightlySync.cleanupOldPriceSnapshots;
      nightlySync.cleanupOldPriceSnapshots = jest.fn().mockRejectedValue(new Error('Test error'));

      const results = await nightlySync.execute();

      expect(results.success).toBe(false);
      expect(results.errors).toContain('Test error');

      // Restore original method
      nightlySync.cleanupOldPriceSnapshots = originalCleanup;
    });
  });

  describe('cleanupOldPriceSnapshots', () => {
    it('should delete old price snapshots', async () => {
      // Create old price snapshots
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);

      await models.PriceSnapshot.create({
        sku_id: sku.id,
        store_id: store.id,
        price_cents: 500,
        captured_at: oldDate,
      });

      // Create recent price snapshot
      await models.PriceSnapshot.create({
        sku_id: sku.id,
        store_id: store.id,
        price_cents: 600,
        captured_at: new Date(),
      });

      const result = await nightlySync.cleanupOldPriceSnapshots(90);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(1);

      // Verify only the recent snapshot remains
      const remainingSnapshots = await models.PriceSnapshot.findAll();
      expect(remainingSnapshots).toHaveLength(1);
      expect(remainingSnapshots[0].price_cents).toBe(600);
    });

    it('should handle database errors', async () => {
      // Mock the PriceSnapshot model to throw an error
      const originalDestroy = models.PriceSnapshot.destroy;
      models.PriceSnapshot.destroy = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const result = await nightlySync.cleanupOldPriceSnapshots(90);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Restore original method
      models.PriceSnapshot.destroy = originalDestroy;
    });
  });

  describe('updateSKUPriceTimestamps', () => {
    it('should update SKU timestamps based on latest price', async () => {
      const priceDate = new Date('2024-01-01');
      
      // Ensure SKU has no last_price_update
      await sku.update({ last_price_update: null });
      
      await models.PriceSnapshot.create({
        sku_id: sku.id,
        store_id: store.id,
        price_cents: 500,
        captured_at: priceDate,
      });

      const result = await nightlySync.updateSKUPriceTimestamps();

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(1);

      // Verify the update
      const updatedSKU = await models.SKU.findByPk(sku.id);
      expect(updatedSKU.last_price_update).toEqual(priceDate);
    });

    it('should not update if timestamp is newer', async () => {
      // Set SKU timestamp to a future date
      const futureDate = new Date('2024-12-31');
      await sku.update({ last_price_update: futureDate });

      // Create an older price snapshot
      const oldDate = new Date('2024-01-01');
      await models.PriceSnapshot.create({
        sku_id: sku.id,
        store_id: store.id,
        price_cents: 500,
        captured_at: oldDate,
      });

      const result = await nightlySync.updateSKUPriceTimestamps();

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(0);

      // Verify the timestamp wasn't updated
      const unchangedSKU = await models.SKU.findByPk(sku.id);
      expect(unchangedSKU.last_price_update).toEqual(futureDate);
    });

    it('should handle SKUs without price snapshots', async () => {
      // Create SKU without price snapshots
      const skuWithoutPrice = await models.SKU.create({
        id: uuidv4(),
        item_id: item.id,
        store_id: store.id,
        product_name: 'Product without price',
        package_size: 250,
        package_unit: 'g',
      });

      const result = await nightlySync.updateSKUPriceTimestamps();

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(0);
    });
  });

  describe('generateLowStockReport', () => {
    beforeEach(async () => {
      // Clean up stock entries before each test
      await models.StockEntry.destroy({ where: {} });
    });

    it('should identify items below minimum quantity', async () => {
      // Create stock entries with quantity below minimum
      await models.StockEntry.create({
        item_id: item.id,
        household_id: household.id,
        quantity: 5, // Below minimum of 10
        unit: 'count',
        expiry_date: new Date('2024-12-31'),
      });

      const result = await nightlySync.generateLowStockReport();

      expect(result.success).toBe(true);
      expect(result.report.items).toHaveLength(1);
      expect(result.report.items[0].item_name).toBe('Test Item');
      expect(result.report.items[0].current_quantity).toBe(5);
      expect(result.report.items[0].deficit).toBe(5);
      expect(result.report.summary.itemsBelowMinimum).toBe(1);
    });

    it('should not report items with sufficient stock', async () => {
      // Create stock entries with quantity above minimum
      await models.StockEntry.create({
        item_id: item.id,
        household_id: household.id,
        quantity: 15, // Above minimum of 10
        unit: 'count',
        expiry_date: new Date('2024-12-31'),
      });

      const result = await nightlySync.generateLowStockReport();

      expect(result.success).toBe(true);
      expect(result.report.items).toHaveLength(0);
      expect(result.report.summary.itemsBelowMinimum).toBe(0);
    });

    it('should ignore expired stock entries', async () => {
      // Create expired stock entry
      await models.StockEntry.create({
        item_id: item.id,
        household_id: household.id,
        quantity: 5,
        unit: 'count',
        expiry_date: new Date('2020-01-01'), // Expired
      });

      const result = await nightlySync.generateLowStockReport();

      expect(result.success).toBe(true);
      expect(result.report.items).toHaveLength(0);
      expect(result.report.summary.itemsBelowMinimum).toBe(0);
    });
  });

  describe('performConsistencyChecks', () => {
    beforeEach(async () => {
      // Clean up data before each test
      await models.PriceSnapshot.destroy({ where: {} });
      await models.SKU.destroy({ where: {} });
    });

    it('should pass when all data is consistent', async () => {
      // Create a SKU with price snapshot
      const testSKU = await models.SKU.create({
        id: uuidv4(),
        item_id: item.id,
        store_id: store.id,
        product_name: 'Test Product',
        package_size: 500,
        package_unit: 'g',
      });

      await models.PriceSnapshot.create({
        sku_id: testSKU.id,
        store_id: store.id,
        price_cents: 500,
        captured_at: new Date(),
      });

      const result = await nightlySync.performConsistencyChecks();

      expect(result.success).toBe(true);
      expect(result.status).toBe('warning'); // Still warning because item from beforeEach has no SKU
      expect(result.checks.skusWithoutPrices.count).toBe(0);
      expect(result.checks.itemsWithoutSKUs.count).toBe(1);
      expect(result.checks.invalidPrices.count).toBe(0);
    });

    it('should detect SKUs without price snapshots', async () => {
      // Create SKU without price snapshot
      await models.SKU.create({
        id: uuidv4(),
        item_id: item.id,
        store_id: store.id,
        product_name: 'Test Product',
        package_size: 500,
        package_unit: 'g',
      });

      const result = await nightlySync.performConsistencyChecks();

      expect(result.success).toBe(true);
      expect(result.status).toBe('warning');
      expect(result.checks.skusWithoutPrices.count).toBe(1);
      expect(result.checks.skusWithoutPrices.status).toBe('warning');
    });

    it('should detect items without SKUs', async () => {
      // Create another item without SKUs
      const itemWithoutSKU = await models.Item.create({
        id: uuidv4(),
        household_id: household.id,
        name: 'Item Without SKU',
        minimum_quantity: 5,
      });

      const result = await nightlySync.performConsistencyChecks();

      expect(result.success).toBe(true);
      expect(result.status).toBe('warning');
      expect(result.checks.itemsWithoutSKUs.count).toBe(2); // One from beforeEach, one new
      expect(result.checks.itemsWithoutSKUs.status).toBe('warning');
    });

    it('should detect invalid prices', async () => {
      // Create price snapshot with invalid price
      const testSKU = await models.SKU.create({
        id: uuidv4(),
        item_id: item.id,
        store_id: store.id,
        product_name: 'Test Product',
        package_size: 500,
        package_unit: 'g',
      });

      await models.PriceSnapshot.create({
        sku_id: testSKU.id,
        store_id: store.id,
        price_cents: -100, // Invalid negative price
        captured_at: new Date(),
      });

      const result = await nightlySync.performConsistencyChecks();

      expect(result.success).toBe(true);
      expect(result.status).toBe('error');
      expect(result.checks.invalidPrices.count).toBe(1);
      expect(result.checks.invalidPrices.status).toBe('error');
    });
  });

  describe('archiveOldStockEntries', () => {
    it('should identify old stock entries for archiving', async () => {
      // Create old stock entry
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 400);

      await models.StockEntry.create({
        item_id: item.id,
        household_id: household.id,
        quantity: 0, // Empty entry
        unit: 'count',
        created_at: oldDate,
      });

      // Create recent stock entry
      await models.StockEntry.create({
        item_id: item.id,
        household_id: household.id,
        quantity: 10,
        unit: 'count',
        expiry_date: new Date('2024-12-31'),
      });

      const result = await nightlySync.archiveOldStockEntries(365);

      expect(result.success).toBe(true);
      expect(result.eligibleCount).toBe(1);
      expect(result.archived).toBe(false); // Not actually archiving in test
    });

    it('should not archive non-empty entries', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 400);

      await models.StockEntry.create({
        item_id: item.id,
        household_id: household.id,
        quantity: 5, // Non-zero quantity
        unit: 'count',
        created_at: oldDate,
      });

      const result = await nightlySync.archiveOldStockEntries(365);

      expect(result.success).toBe(true);
      expect(result.eligibleCount).toBe(0);
    });
  });
});
