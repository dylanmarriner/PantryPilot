const { DataTypes } = require('sequelize');

/**
 * PriceSnapshot model - immutable records of SKU prices at specific points in time
 * All price records are immutable - updates create new snapshots
 * Prices are stored as integers in cents to avoid floating point issues
 */
module.exports = (sequelize) => {
  const PriceSnapshot = sequelize.define('PriceSnapshot', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sku_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'skus',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    price_cents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 999999, // Max $9,999.99
      },
      comment: 'Price in cents (integer to avoid floating point precision issues)',
    },
    sale_price_cents: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 999999,
      },
      comment: 'Sale price in cents, null if not on sale',
    },
    is_on_sale: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
      validate: {
        len: [3, 3],
      },
    },
    captured_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    source: {
      type: DataTypes.ENUM('manual', 'api', 'scrape', 'sync'),
      allowNull: false,
      defaultValue: 'manual',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional metadata about the price capture',
    },
  }, {
    tableName: 'price_snapshots',
    timestamps: true,
    updatedAt: false, // Price snapshots are immutable, no update timestamp
    indexes: [
      {
        fields: ['sku_id'],
      },
      {
        fields: ['store_id'],
      },
      {
        fields: ['captured_at'],
      },
      {
        fields: ['is_on_sale'],
      },
      {
        fields: ['sku_id', 'captured_at'],
        name: 'price_snapshots_sku_time_idx',
      },
      {
        fields: ['store_id', 'captured_at'],
        name: 'price_snapshots_store_time_idx',
      },
    ],
  });

  PriceSnapshot.associate = (models) => {
    // PriceSnapshot belongs to a SKU
    PriceSnapshot.belongsTo(models.Sku, {
      foreignKey: 'sku_id',
      as: 'sku',
    });
    
    // PriceSnapshot belongs to a Store
    PriceSnapshot.belongsTo(models.Store, {
      foreignKey: 'store_id',
      as: 'store',
    });
  };

  // Instance methods
  PriceSnapshot.prototype.getPriceInDollars = function() {
    return this.price_cents / 100;
  };

  PriceSnapshot.prototype.getSalePriceInDollars = function() {
    return this.sale_price_cents ? this.sale_price_cents / 100 : null;
  };

  PriceSnapshot.prototype.getEffectivePrice = function() {
    return this.is_on_sale && this.sale_price_cents ? this.sale_price_cents : this.price_cents;
  };

  // Class methods
  PriceSnapshot.getLatestForSKU = async function(skuId) {
    return await this.findOne({
      where: { sku_id: skuId },
      order: [['captured_at', 'DESC']],
    });
  };

  PriceSnapshot.getPriceHistory = async function(skuId, limit = 10) {
    return await this.findAll({
      where: { sku_id: skuId },
      order: [['captured_at', 'DESC']],
      limit,
    });
  };

  return PriceSnapshot;
};
