const { DataTypes } = require('sequelize');

/**
 * StockEntry model - tracks inventory quantities and movements
 * All quantities are stored in base units (grams or milliliters) for consistency
 */
module.exports = (sequelize) => {
  const StockEntry = sequelize.define('StockEntry', {
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    quantity_base: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Quantity in base units (g or ml). For count items, store as is.',
      validate: {
        min: 0,
      },
    },
    unit_type: {
      type: DataTypes.ENUM('count', 'weight', 'volume'),
      allowNull: false,
    },
    base_unit: {
      type: DataTypes.ENUM('count', 'g', 'ml'),
      allowNull: false,
    },
    operation_type: {
      type: DataTypes.ENUM('add', 'deduct', 'adjust'),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    batch_number: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100],
      },
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    purchase_price_cents: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Price in cents for accurate financial tracking',
      validate: {
        min: 0,
      },
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
    tableName: 'stock_entries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['item_id'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['expiry_date'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['operation_type'],
      },
    ],
  });

  StockEntry.associate = (models) => {
    // StockEntry belongs to an item
    StockEntry.belongsTo(models.Item, {
      foreignKey: 'item_id',
      as: 'item',
    });
    
    // StockEntry belongs to a user
    StockEntry.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return StockEntry;
};

/**
 * Unit model - defines conversion factors between units
 */
module.exports.Unit = (sequelize) => {
  const Unit = sequelize.define('Unit', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    type: {
      type: DataTypes.ENUM('count', 'weight', 'volume'),
      allowNull: false,
    },
    base_unit: {
      type: DataTypes.ENUM('count', 'g', 'ml'),
      allowNull: false,
    },
    conversion_factor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Multiplier to convert to base unit. For example: 1000 for kg->g, 1000 for L->ml',
      validate: {
        min: 1,
      },
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
    tableName: 'units',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['type'],
      },
      {
        fields: ['base_unit'],
      },
    ],
  });

  return Unit;
};

/**
 * Expiry model - tracks expiry notifications and settings
 */
module.exports.Expiry = (sequelize) => {
  const Expiry = sequelize.define('Expiry', {
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
    days_before_expiry: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7,
      validate: {
        min: 0,
        max: 365,
      },
    },
    notification_enabled: {
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
    tableName: 'expiry_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['household_id'],
        unique: true,
      },
    ],
  });

  Expiry.associate = (models) => {
    // Expiry belongs to a household
    Expiry.belongsTo(models.Household, {
      foreignKey: 'household_id',
      as: 'household',
    });
  };

  return Expiry;
};
