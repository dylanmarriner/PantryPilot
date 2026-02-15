'use strict';

const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UsageAnalytics extends Model {
    static associate(models) {
      UsageAnalytics.belongsTo(models.Household, {
        foreignKey: 'householdId',
        as: 'household'
      });
      
      UsageAnalytics.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }

    static async trackUsage(householdId, userId, eventType, metadata = {}) {
      return await this.create({
        householdId,
        userId,
        eventType,
        metadata,
        timestamp: new Date()
      });
    }

    static async getUsageByHousehold(householdId, startDate, endDate) {
      return await this.findAll({
        where: {
          householdId,
          timestamp: {
            [Op.between]: [startDate, endDate]
          }
        },
        order: [['timestamp', 'DESC']]
      });
    }

    static async getUsageByUser(userId, startDate, endDate) {
      return await this.findAll({
        where: {
          userId,
          timestamp: {
            [Op.between]: [startDate, endDate]
          }
        },
        order: [['timestamp', 'DESC']]
      });
    }
  }

  UsageAnalytics.init({
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    modelName: 'UsageAnalytics',
    tableName: 'usage_analytics',
    timestamps: true,
    indexes: [
      {
        fields: ['householdId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['eventType']
      },
      {
        fields: ['timestamp']
      }
    ]
  });

  return UsageAnalytics;
};
