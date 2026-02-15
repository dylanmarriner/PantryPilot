'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.UserHousehold, {
        foreignKey: 'roleId',
        as: 'userHouseholds'
      });
    }

    static async getByName(name) {
      return await this.findOne({
        where: { name }
      });
    }

    static async getDefaultRole() {
      return await this.getByName('member');
    }
  }

  Role.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
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
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  return Role;
};
