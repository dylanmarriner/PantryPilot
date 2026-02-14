const { DataTypes } = require('sequelize');

/**
 * Store model - represents a physical or online store where items can be purchased
 * Stores must be unique by name and location combination
 */
module.exports = (sequelize) => {
  const Store = sequelize.define('Store', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200],
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 500],
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_online: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    website_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'stores',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name', 'location'],
        name: 'stores_name_location_unique',
      },
      {
        fields: ['is_active'],
      },
    ],
  });

  Store.associate = (models) => {
    // Store has many SKUs
    Store.hasMany(models.SKU, {
      foreignKey: 'store_id',
      as: 'skus',
    });
    
    // Store has many PriceSnapshots through SKUs
    Store.hasMany(models.PriceSnapshot, {
      foreignKey: 'store_id',
      as: 'priceSnapshots',
    });
  };

  return Store;
};
