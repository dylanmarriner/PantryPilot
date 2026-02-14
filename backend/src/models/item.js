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
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    location_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'locations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
        fields: ['category_id'],
      },
      {
        fields: ['location_id'],
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
    
    // Item belongs to a category
    Item.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category',
    });
    
    // Item belongs to a location
    Item.belongsTo(models.Location, {
      foreignKey: 'location_id',
      as: 'location',
    });
    
    // Item has many stock entries
    Item.hasMany(models.StockEntry, {
      foreignKey: 'item_id',
      as: 'stockEntries',
    });
    
    // Item has many SKUs
    Item.hasMany(models.SKU, {
      foreignKey: 'item_id',
      as: 'skus',
    });
  };

  return Item;
};

/**
 * Category model - for organizing items
 */
module.exports.Category = (sequelize) => {
  const Category = sequelize.define('Category', {
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
        len: [1, 100],
      },
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#007bff',
      validate: {
        is: /^#[0-9A-F]{6}$/i, // Hex color code
      },
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['household_id', 'name'],
        unique: true,
      },
      {
        fields: ['parent_id'],
      },
    ],
  });

  Category.associate = (models) => {
    // Category belongs to a household
    Category.belongsTo(models.Household, {
      foreignKey: 'household_id',
      as: 'household',
    });
    
    // Category has many items
    Category.hasMany(models.Item, {
      foreignKey: 'category_id',
      as: 'items',
    });
    
    // Self-referential for nested categories
    Category.belongsTo(Category, {
      foreignKey: 'parent_id',
      as: 'parent',
    });
    
    Category.hasMany(Category, {
      foreignKey: 'parent_id',
      as: 'children',
    });
  };

  return Category;
};

/**
 * Location model - physical storage locations
 */
module.exports.Location = (sequelize) => {
  const Location = sequelize.define('Location', {
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
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'locations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    tableName: 'locations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['household_id', 'name'],
        unique: true,
      },
      {
        fields: ['parent_id'],
      },
    ],
  });

  Location.associate = (models) => {
    // Location belongs to a household
    Location.belongsTo(models.Household, {
      foreignKey: 'household_id',
      as: 'household',
    });
    
    // Location has many items
    Location.hasMany(models.Item, {
      foreignKey: 'location_id',
      as: 'items',
    });
    
    // Self-referential for nested locations
    Location.belongsTo(Location, {
      foreignKey: 'parent_id',
      as: 'parent',
    });
    
    Location.hasMany(Location, {
      foreignKey: 'parent_id',
      as: 'children',
    });
  };

  return Location;
};
