const { DataTypes } = require('sequelize');

/**
 * MealIngredient model - represents ingredients in a meal template
 * Links meal templates to ingredients with quantities and units
 */
module.exports = (sequelize) => {
  const MealIngredient = sequelize.define('MealIngredient', {
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
    ingredientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['g', 'kg', 'ml', 'l', 'pcs', 'tbsp', 'tsp', 'cup', 'oz', 'lb']]
      }
    },
    isOptional: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    preparationNotes: {
      type: DataTypes.TEXT,
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
    tableName: 'meal_ingredients',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['mealTemplateId']
      },
      {
        fields: ['ingredientId']
      },
      {
        unique: true,
        fields: ['mealTemplateId', 'ingredientId']
      }
    ]
  });

  MealIngredient.associate = (models) => {
    MealIngredient.belongsTo(models.Item, {
      foreignKey: 'ingredientId',
      as: 'ingredient'
    });
  };

  return MealIngredient;
};
