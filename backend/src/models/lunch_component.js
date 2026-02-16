const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const LunchComponent = sequelize.define(
  "LunchComponent",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    household_id: {
      type: DataTypes.UUID,
      allowNull: true, // Null means global template
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        "Main",
        "Fruit",
        "Snack",
        "Treat",
        "Drink",
        "Crunch",
      ),
      allowNull: false,
    },
    nutritionalInfo: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    costEstimate: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "lunch_components",
    timestamps: true,
  },
);

module.exports = LunchComponent;
