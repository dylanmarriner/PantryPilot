const { DataTypes } = require('sequelize');

/**
 * Household model - represents a household or family unit
 * Multiple users can belong to one household through UserHousehold junction
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
        is: /^[A-Za-z_/]+$/, // Basic timezone format validation
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
    subscriptionTier: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'free',
      validate: {
        isIn: [['free', 'basic', 'premium', 'enterprise']],
      },
    },
    subscriptionStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive', 'suspended', 'cancelled']],
      },
    },
    maxUsers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
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
      {
        fields: ['subscriptionTier'],
      },
      {
        fields: ['subscriptionStatus'],
      },
    ],
  });

  Household.associate = (models) => {
    // Household belongs to many users through UserHousehold
    Household.belongsToMany(models.User, {
      through: models.UserHousehold,
      foreignKey: 'householdId',
      otherKey: 'userId',
      as: 'users',
    });
    
    // Household has many UserHousehold relationships
    Household.hasMany(models.UserHousehold, {
      foreignKey: 'householdId',
      as: 'userHouseholds',
    });

    // Household has many feature flags
    Household.hasMany(models.FeatureFlag, {
      foreignKey: 'householdId',
      as: 'featureFlags',
    });
    
    // Household has many items
    Household.hasMany(models.Item, {
      foreignKey: 'household_id',
      as: 'items',
    });

    // Household has many stock entries
    Household.hasMany(models.StockEntry, {
      foreignKey: 'householdId',
      as: 'stockEntries',
    });

    // Household has many price snapshots
    Household.hasMany(models.PriceSnapshot, {
      foreignKey: 'householdId',
      as: 'priceSnapshots',
    });

    // Household has many usage analytics
    Household.hasMany(models.UsageAnalytics, {
      foreignKey: 'householdId',
      as: 'usageAnalytics',
    });
  };

  // Instance methods
  Household.prototype.hasFeatureEnabled = async function(featureName) {
    const { FeatureFlag } = require('./index');
    return await FeatureFlag.isEnabled(featureName, this.id);
  };

  Household.prototype.getUserCount = async function() {
    const { UserHousehold } = require('./index');
    const count = await UserHousehold.count({
      where: {
        householdId: this.id,
        isActive: true
      }
    });
    return count;
  };

  Household.prototype.canAddUser = async function() {
    const userCount = await this.getUserCount();
    return userCount < this.maxUsers;
  };

  return Household;
};
