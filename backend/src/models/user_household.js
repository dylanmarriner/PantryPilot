'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserHousehold extends Model {
    static associate(models) {
      UserHousehold.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      UserHousehold.belongsTo(models.Household, {
        foreignKey: 'householdId',
        as: 'household'
      });
      
      UserHousehold.belongsTo(models.Role, {
        foreignKey: 'roleId',
        as: 'role'
      });
    }

    async hasPermission(permission) {
      if (!this.role) {
        await this.reload({
          include: [{
            model: sequelize.models.Role,
            as: 'role'
          }]
        });
      }
      return this.role?.permissions?.[permission] === true;
    }
  }

  UserHousehold.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    householdId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'households',
        key: 'id'
      }
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    joinedAt: {
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
    modelName: 'UserHousehold',
    tableName: 'user_households',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'householdId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['householdId']
      },
      {
        fields: ['roleId']
      }
    ]
  });

  return UserHousehold;
};
