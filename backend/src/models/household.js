const { DataTypes } = require('sequelize');

/**
 * Household model - represents a household or family unit
 * Multiple users can belong to one household
 */
module.exports = (sequelize) => {
  const Household = sequelize.define('Household', {
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
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'UTC',
      validate: {
        is: /^[A-Za-z_\/]+$/, // Basic timezone format validation
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
      validate: {
        len: [3, 3],
        isAlpha: true,
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
    tableName: 'households',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['name'],
      },
    ],
  });

  Household.associate = (models) => {
    // Household has many users
    Household.hasMany(models.User, {
      foreignKey: 'household_id',
      as: 'users',
    });
    
    // Household has many items
    Household.hasMany(models.Item, {
      foreignKey: 'household_id',
      as: 'items',
    });
  };

  return Household;
};
