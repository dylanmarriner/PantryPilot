const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ShoppingItem = sequelize.define(
  "ShoppingItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    household_id: {
      // Link to household
      type: DataTypes.UUID,
      allowNull: true, // For now, can be null if user doesn't have household set up
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.FLOAT,
      defaultValue: 1,
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: "pc",
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: "GENERAL",
    },
    is_purchased: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
    },
    source: {
      // 'manual', 'meal_plan', 'auto_replenish'
      type: DataTypes.STRING,
      defaultValue: "manual",
    },
  },
  {
    tableName: "shopping_items",
    timestamps: true,
  },
);

module.exports = ShoppingItem;
