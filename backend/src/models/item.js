const { DataTypes } = require('sequelize');

/**
 * Item model - represents a type of item that can be stocked
 * Items are shared across the household
 */
module.exports = (sequelize) => {
  const Item = sequelize.define('Item', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    household_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'households',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: [0, 50],
      },
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    minimum_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    preferred_unit: {
      type: DataTypes.ENUM('count', 'g', 'kg', 'ml', 'L'),
      allowNull: false,
      defaultValue: 'count',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['household_id', 'name'],
        unique: true,
      },
      {
        fields: ['barcode'],
      },
    ],
  });

  Item.associate = (models) => {
    // Item belongs to a household
    Item.belongsTo(models.Household, {
      foreignKey: 'household_id',
      as: 'household',
    });
    
    // Item has many stock entries
    Item.hasMany(models.StockEntry, {
      foreignKey: 'item_id',
      as: 'stockEntries',
    });

    // Item has many SKUs
    Item.hasMany(models.Sku, {
      foreignKey: 'item_id',
      as: 'skus',
    });
  };

  return Item;
};
