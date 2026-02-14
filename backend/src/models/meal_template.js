const { DataTypes } = require('sequelize');

/**
 * MealTemplate model - represents a meal recipe template
 * Meal templates contain ingredients and can be used to generate meal logs
 */
module.exports = (sequelize) => {
  const MealTemplate = sequelize.define('MealTemplate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    baseServings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 100
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
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
    tableName: 'meal_templates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['createdById']
      }
    ]
  });

  MealTemplate.associate = (models) => {
    MealTemplate.belongsTo(models.User, {
      foreignKey: 'createdById',
      as: 'creator'
    });
    MealTemplate.hasMany(models.MealIngredient, {
      foreignKey: 'mealTemplateId',
      as: 'ingredients',
      cascade: 'delete'
    });
    MealTemplate.hasMany(models.MealLog, {
      foreignKey: 'mealTemplateId',
      as: 'mealLogs'
    });
  };

  return MealTemplate;
};
