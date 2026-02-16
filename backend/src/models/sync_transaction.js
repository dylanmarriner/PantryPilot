const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SyncTransaction = sequelize.define('SyncTransaction', {
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
  clientId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'),
    defaultValue: 'PENDING'
  },
  operationType: {
    type: DataTypes.ENUM('INVENTORY_ADJUSTMENT', 'ITEM_CREATE', 'ITEM_UPDATE', 'ITEM_DELETE'),
    allowNull: true
  },
  operationData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  lastSyncTimestamp: {
    type: DataTypes.DATE,
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  operationsProcessed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  serverChangesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  conflictsResolved: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'sync_transactions',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'clientId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['lastSyncTimestamp']
    }
  ]
});

// Associations
SyncTransaction.associate = function (models) {
  SyncTransaction.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = SyncTransaction;
