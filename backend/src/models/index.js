const { Sequelize } = require('sequelize');
const config = require('../../config/database')[process.env.NODE_ENV || 'development'];

// Initialize Sequelize
const sequelize = new Sequelize(config);

// Import models
const Household = require('./household')(sequelize);
const User = require('./user')(sequelize);
const Item = require('./item')(sequelize);
const StockEntry = require('./stock_entry')(sequelize);
const Store = require('./store')(sequelize);
const SKU = require('./sku')(sequelize);
const PriceSnapshot = require('./price_snapshot')(sequelize);
const MealTemplate = require('./meal_template')(sequelize);
const MealIngredient = require('./meal_ingredient')(sequelize);
const MealLog = require('./meal_log')(sequelize);

// Extract Category and Location from Item module
const Category = require('./item').Category(sequelize);
const Location = require('./item').Location(sequelize);

// Define associations
Household.associate({ User, Item, StockEntry });
User.associate({ Household, StockEntry });
Item.associate({ Household, StockEntry, SKU, Category, Location });
StockEntry.associate({ Household, Item, User });
Store.associate({ SKU, PriceSnapshot });
SKU.associate({ Item, Store, PriceSnapshot });
PriceSnapshot.associate({ SKU, Store });
Category.associate({ Household, Item });
Location.associate({ Household, Item });
MealTemplate.associate({ User, MealIngredient, MealLog });
MealIngredient.associate({ MealTemplate, Item });
MealLog.associate({ MealTemplate, User });

module.exports = {
  sequelize,
  Sequelize,
  Household,
  User,
  Item,
  StockEntry,
  Store,
  SKU,
  PriceSnapshot,
  Category,
  Location,
  MealTemplate,
  MealIngredient,
  MealLog,
};
