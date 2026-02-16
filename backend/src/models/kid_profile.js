const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const KidProfile = sequelize.define(
  "KidProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    household_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dietaryPreferences: {
      type: DataTypes.JSON, // e.g., ["vegetarian", "no-sugar"]
      defaultValue: [],
    },
    dislikes: {
      type: DataTypes.JSON, // e.g., ["mushrooms", "broccoli"]
      defaultValue: [],
    },
    allergies: {
      type: DataTypes.JSON, // e.g., ["peanuts"]
      defaultValue: [],
    },
    lunchBoredomThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 3, // Max times served in 2 weeks before flagging
    },
  },
  {
    tableName: "kid_profiles",
    timestamps: true,
  },
);

module.exports = KidProfile;
