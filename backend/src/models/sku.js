const { DataTypes } = require('sequelize');

/**
 * SKU (Stock Keeping Unit) model - represents a specific product variant at a specific store
 * Links Items to Stores with product-specific information
 */
module.exports = (sequelize) => {
  const SKU = sequelize.define('SKU', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'items',
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
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: [0, 50],
      },
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 200],
      },
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 300],
      },
    },
    package_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Size of the package in base units (e.g., grams for weight, ml for volume)',
    },
    package_unit: {
      type: DataTypes.ENUM('g', 'kg', 'ml', 'L', 'count'),
      allowNull: false,
      defaultValue: 'count',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_price_update: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'skus',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['store_id', 'barcode'],
        name: 'skus_store_barcode_unique',
        where: {
          barcode: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      },
      {
        fields: ['item_id'],
      },
      {
        fields: ['store_id'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['barcode'],
      },
    ],
  });

  SKU.associate = (models) => {
    // SKU belongs to an Item
    SKU.belongsTo(models.Item, {
      foreignKey: 'item_id',
      as: 'item',
    });
    
    // SKU belongs to a Store
    SKU.belongsTo(models.Store, {
      foreignKey: 'store_id',
      as: 'store',
    });
    
    // SKU has many PriceSnapshots
    SKU.hasMany(models.PriceSnapshot, {
      foreignKey: 'sku_id',
      as: 'priceSnapshots',
    });
    
    // Get the latest price for this SKU
    SKU.prototype.getLatestPrice = async function() {
      const latestSnapshot = await models.PriceSnapshot.findOne({
        where: {
          sku_id: this.id,
        },
        order: [['captured_at', 'DESC']],
      });
      return latestSnapshot;
    };
  };

  return SKU;
};
