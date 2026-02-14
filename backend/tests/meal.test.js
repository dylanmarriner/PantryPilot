const { sequelize, User, Item, StockEntry, Household, Category } = require('../src/models');
const MealService = require('../src/services/meal');

describe('Meal Service Tests', () => {
  let testUser, testItem1, testItem2, testStock1, testStock2, testHousehold, testCategory;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    testHousehold = await Household.create({
      name: 'Test Household'
    });

    testUser = await User.create({
      email: 'test@example.com',
      password_hash: 'password123',
      name: 'Test User',
      household_id: testHousehold.id
    });

    testCategory = await Category.create({
      name: 'Test Category',
      household_id: testHousehold.id
    });

    testItem1 = await Item.create({
      name: 'Test Item 1',
      household_id: testHousehold.id,
      category_id: testCategory.id
    });

    testItem2 = await Item.create({
      name: 'Test Item 2',
      household_id: testHousehold.id,
      category_id: testCategory.id
    });

    testStock1 = await StockEntry.create({
      item_id: testItem1.id,
      quantity_base: 1000,
      unit_type: 'weight',
      base_unit: 'g',
      operation_type: 'add',
      purchase_price_cents: 100,
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      user_id: testUser.id
    });

    testStock2 = await StockEntry.create({
      item_id: testItem2.id,
      quantity_base: 500,
      unit_type: 'volume',
      base_unit: 'ml',
      operation_type: 'add',
      purchase_price_cents: 200,
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      user_id: testUser.id
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('createMealTemplate', () => {
    test('should create meal template with ingredients', async () => {
      const templateData = {
        name: 'Test Recipe',
        description: 'A test recipe',
        baseServings: 4,
        ingredients: [
          {
            ingredientId: testItem1.id,
            quantity: 250,
            unit: 'g'
          },
          {
            ingredientId: testItem2.id,
            quantity: 100,
            unit: 'ml'
          }
        ]
      };

      const template = await MealService.createMealTemplate(templateData, testUser.id);

      expect(template).toBeDefined();
      expect(template.name).toBe('Test Recipe');
      expect(template.baseServings).toBe(4);
      expect(template.createdById).toBe(testUser.id);
    });

    test('should reject invalid serving count', async () => {
      const templateData = {
        name: 'Invalid Recipe',
        baseServings: 0,
        ingredients: []
      };

      await expect(MealService.createMealTemplate(templateData, testUser.id))
        .rejects.toThrow();
    });
  });

  describe('calculateMealCost', () => {
    let testTemplate;

    beforeAll(async () => {
      testTemplate = await MealService.createMealTemplate({
        name: 'Cost Test Recipe',
        baseServings: 2,
        ingredients: [
          {
            ingredientId: testItem1.id,
            quantity: 100,
            unit: 'g'
          },
          {
            ingredientId: testItem2.id,
            quantity: 50,
            unit: 'ml'
          }
        ]
      }, testUser.id);
    });

    test('should calculate correct cost for base servings', async () => {
      const result = await MealService.calculateMealCost(testTemplate.id, 2);

      expect(result.totalCost).toBe('0.30');
      expect(result.canPrepare).toBe(true);
      expect(result.unavailableIngredients).toHaveLength(0);
    });

    test('should calculate correct cost for double servings', async () => {
      const result = await MealService.calculateMealCost(testTemplate.id, 4);

      expect(result.totalCost).toBe('0.60');
      expect(result.canPrepare).toBe(true);
    });

    test('should detect insufficient stock', async () => {
      await StockEntry.update(
        { quantity_base: 50 },
        { where: { id: testStock1.id } }
      );

      const result = await MealService.calculateMealCost(testTemplate.id, 2);

      expect(result.canPrepare).toBe(false);
      expect(result.unavailableIngredients).toContain('Test Item 1');

      await StockEntry.update(
        { quantity_base: 1000 },
        { where: { id: testStock1.id } }
      );
    });
  });

  describe('logMealExecution', () => {
    let testTemplate;

    beforeAll(async () => {
      testTemplate = await MealService.createMealTemplate({
        name: 'Execution Test Recipe',
        baseServings: 1,
        ingredients: [
          {
            ingredientId: testItem1.id,
            quantity: 100,
            unit: 'g'
          }
        ]
      }, testUser.id);
    });

    test('should log meal and deduct inventory', async () => {
      const initialStock = await StockEntry.findByPk(testStock1.id);
      const initialQuantity = initialStock.quantity_base;

      const mealLog = await MealService.logMealExecution({
        mealTemplateId: testTemplate.id,
        userId: testUser.id,
        servingsMade: 2,
        mealDate: new Date()
      });

      expect(mealLog).toBeDefined();
      expect(mealLog.actualCost).toBe('0.20');

      const finalStock = await StockEntry.findByPk(testStock1.id);
      expect(finalStock.quantity_base).toBe(initialQuantity - 200);
    });

    test('should fail with insufficient stock', async () => {
      await StockEntry.update(
        { quantity_base: 50 },
        { where: { id: testStock1.id } }
      );

      await expect(MealService.logMealExecution({
        mealTemplateId: testTemplate.id,
        userId: testUser.id,
        servingsMade: 1,
        mealDate: new Date()
      })).rejects.toThrow('Insufficient ingredients');

      await StockEntry.update(
        { quantity_base: 1000 },
        { where: { id: testStock1.id } }
      );
    });

    test('should be atomic on failure', async () => {
      const initialStock = await StockEntry.findByPk(testStock1.id);
      const initialQuantity = initialStock.quantity_base;

      try {
        await MealService.logMealExecution({
          mealTemplateId: testTemplate.id,
          userId: testUser.id,
          servingsMade: 20,
          mealDate: new Date()
        });
      } catch (error) {
        expect(error).toBeDefined();
      }

      const finalStock = await StockEntry.findByPk(testStock1.id);
      expect(finalStock.quantity_base).toBe(initialQuantity);
    });
  });

  describe('suggestSubstitutions', () => {
    let substituteItem, substituteStock;

    beforeAll(async () => {
      const substituteCategory = await Category.create({
        name: 'Substitute Category',
        household_id: testHousehold.id
      });

      substituteItem = await Item.create({
        name: 'Substitute Item',
        household_id: testHousehold.id,
        category_id: substituteCategory.id
      });

      substituteStock = await StockEntry.create({
        item_id: substituteItem.id,
        quantity_base: 300,
        unit_type: 'weight',
        base_unit: 'g',
        operation_type: 'add',
        purchase_price_cents: 150,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        user_id: testUser.id
      });

      // Update testItem1 to use the same category as substitute for proper testing
      await Item.update(
        { category_id: substituteCategory.id },
        { where: { id: testItem1.id } }
      );
    });

    test('should suggest available substitutes', async () => {
      const substitutes = await MealService.suggestSubstitutions(
        testItem1.id,
        200
      );

      expect(substitutes).toHaveLength(1);
      expect(substitutes[0].ingredient.name).toBe('Substitute Item');
      expect(substitutes[0].availableQuantity).toBe(300);
      expect(substitutes[0].averagePrice).toBe(1.50);
    });

    test('should return empty array when no substitutes available', async () => {
      await StockEntry.update(
        { quantity_base: 50 },
        { where: { id: substituteStock.id } }
      );

      const substitutes = await MealService.suggestSubstitutions(
        testItem1.id,
        200
      );

      expect(substitutes).toHaveLength(0);
    });
  });

  describe('getMealTemplates and getMealLogs', () => {
    test('should retrieve user meal templates', async () => {
      const templates = await MealService.getMealTemplates(testUser.id);

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.createdById === testUser.id)).toBe(true);
    });

    test('should retrieve user meal logs', async () => {
      const logs = await MealService.getMealLogs(testUser.id);

      expect(Array.isArray(logs)).toBe(true);
      if (logs.length > 0) {
        expect(logs.every(l => l.userId === testUser.id)).toBe(true);
      }
    });
  });
});
