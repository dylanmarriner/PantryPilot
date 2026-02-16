const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const RotationLog = sequelize.define(
  "RotationLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    kid_profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    item_id: {
      // Link to the Inventory Item (e.g., "Muesli Bar" ID)
      type: DataTypes.UUID,
      allowNull: true, // Nullable if it's a generic component not in inventory yet
    },
    itemName: {
      // Fallback name if item_id is null or purely for history display
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateServed: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    slot: {
      // 'Main', 'Snack', etc.
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "rotation_logs",
    timestamps: true,
    indexes: [
      {
        unique: false,
        fields: ["kid_profile_id", "dateServed"],
      },
    ],
  },
);

module.exports = RotationLog;
