'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Household, {
        through: models.UserHousehold,
        foreignKey: 'userId',
        otherKey: 'householdId',
        as: 'households'
      });

      User.hasMany(models.UserHousehold, {
        foreignKey: 'userId',
        as: 'userHouseholds'
      });
    }

    async hasHouseholdAccess(householdId) {
      const userHousehold = await sequelize.models.UserHousehold.findOne({
        where: {
          userId: this.id,
          householdId: householdId
        }
      });
      return !!userHousehold;
    }

    async getRoleInHousehold(householdId) {
      const userHousehold = await sequelize.models.UserHousehold.findOne({
        where: {
          userId: this.id,
          householdId: householdId
        },
        include: [{
          model: sequelize.models.Role,
          as: 'role'
        }]
      });
      return userHousehold?.role;
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastLoginAt: {
      type: DataTypes.DATE
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  return User;
};
