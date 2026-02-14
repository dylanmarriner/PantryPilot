const { DataTypes } = require('sequelize');

/**
 * MealLog model - represents actual meal executions
 * Records when meals are made and tracks inventory consumption
 */
module.exports = (sequelize) => {
  const MealLog = sequelize.define('MealLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    mealTemplateId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'meal_templates',
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
    servingsMade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 100
      }
    },
    actualCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    mealDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    satisfactionRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    wouldMakeAgain: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'meal_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['mealTemplateId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['mealDate']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  MealLog.associate = (models) => {
    MealLog.belongsTo(models.MealTemplate, {
      foreignKey: 'mealTemplateId',
      as: 'mealTemplate'
    });
    MealLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return MealLog;
};
