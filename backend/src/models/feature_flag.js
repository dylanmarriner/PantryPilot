'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FeatureFlag extends Model {
    static associate(models) {
      FeatureFlag.belongsTo(models.Household, {
        foreignKey: 'householdId',
        as: 'household'
      });
    }

    static async isEnabled(featureName, householdId) {
      const flag = await this.findOne({
        where: {
          featureName,
          householdId,
          isActive: true
        }
      });
      return flag?.enabled || false;
    }

    static async setFeature(featureName, householdId, enabled) {
      const [flag, created] = await this.findOrCreate({
        where: {
          featureName,
          householdId
        },
        defaults: {
          enabled,
          isActive: true
        }
      });

      if (!created) {
        flag.enabled = enabled;
        flag.isActive = true;
        await flag.save();
      }

      return flag;
    }
  }

  FeatureFlag.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    householdId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'households',
        key: 'id'
      }
    },
    featureName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'FeatureFlag',
    tableName: 'feature_flags',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['householdId', 'featureName']
      },
      {
        fields: ['featureName']
      },
      {
        fields: ['enabled']
      }
    ]
  });

  return FeatureFlag;
};
