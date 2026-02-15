const { sequelize } = require('../config/database');
const { Sequelize } = require('sequelize');

// Import all models
const SyncTransaction = require('./sync_transaction');
const Item = require('./item');
const StockEntry = require('./stock_entry');
const Household = require('./household');
const Store = require('./store');
const PriceSnapshot = require('./price_snapshot');
const Sku = require('./sku');
const MealLog = require('./meal_log');
const MealIngredient = require('./meal_ingredient');
const ItemPreference = require('./item_preference');
const AcceptanceScore = require('./acceptance_score');
const FatigueScore = require('./fatigue_score');

// New PHASE_9 models
const User = require('./user');
const Role = require('./role');
const UserHousehold = require('./user_household');
const FeatureFlag = require('./feature_flag');
const UsageAnalytics = require('./usage_analytics');

// Initialize models that need the function pattern (return functions)
const UserInstance = User(sequelize, Sequelize.DataTypes);
const RoleInstance = Role(sequelize, Sequelize.DataTypes);
const UserHouseholdInstance = UserHousehold(sequelize, Sequelize.DataTypes);
const FeatureFlagInstance = FeatureFlag(sequelize, Sequelize.DataTypes);
const UsageAnalyticsInstance = UsageAnalytics(sequelize, Sequelize.DataTypes);

const HouseholdInstance = Household(sequelize);
const ItemInstance = Item(sequelize, Sequelize.DataTypes);
const StockEntryInstance = StockEntry(sequelize, Sequelize.DataTypes);
const StoreInstance = Store(sequelize, Sequelize.DataTypes);
const PriceSnapshotInstance = PriceSnapshot(sequelize, Sequelize.DataTypes);
const SkuInstance = Sku(sequelize, Sequelize.DataTypes);
const MealLogInstance = MealLog(sequelize, Sequelize.DataTypes);
const MealIngredientInstance = MealIngredient(sequelize, Sequelize.DataTypes);

// Models that are already defined (direct exports)
const SyncTransactionInstance = SyncTransaction;
const ItemPreferenceInstance = ItemPreference;
const AcceptanceScoreInstance = AcceptanceScore;
const FatigueScoreInstance = FatigueScore;

// Setup associations
const setupAssociations = () => {
  const models = {
    User: UserInstance,
    Role: RoleInstance,
    UserHousehold: UserHouseholdInstance,
    FeatureFlag: FeatureFlagInstance,
    UsageAnalytics: UsageAnalyticsInstance,
    Household: HouseholdInstance,
    SyncTransaction: SyncTransactionInstance,
    Item: ItemInstance,
    StockEntry: StockEntryInstance,
    Store: StoreInstance,
    PriceSnapshot: PriceSnapshotInstance,
    Sku: SkuInstance,
    MealLog: MealLogInstance,
    MealIngredient: MealIngredientInstance,
    ItemPreference: ItemPreferenceInstance,
    AcceptanceScore: AcceptanceScoreInstance,
    FatigueScore: FatigueScoreInstance
  };

  // Call associate methods for all models
  Object.values(models).forEach(model => {
    if (typeof model.associate === 'function') {
      model.associate(models);
    }
  });

  return models;
};

const models = setupAssociations();

module.exports = {
  sequelize,
  Sequelize,
  ...models
};
