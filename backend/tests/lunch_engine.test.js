/**
 * Lunch Engine Tests
 * Comprehensive test suite for lunch rotation and fatigue management
 */

const assert = require('assert');
const LunchEngine = require('../src/services/lunch_engine');
const LunchSlot = require('../src/models/lunch_slot');
const ItemPreference = require('../src/models/item_preference');
const FatigueScore = require('../src/models/fatigue_score');
const AcceptanceScore = require('../src/models/acceptance_score');

describe('LunchEngine', () => {
  let lunchEngine;

  beforeEach(() => {
    lunchEngine = new LunchEngine({ seed: 12345 });
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with default values', () => {
      const engine = new LunchEngine();
      assert.strictEqual(typeof engine.seed, 'number');
      assert.strictEqual(engine.recommendationCount, 5);
      assert.strictEqual(engine.fatigueThreshold, 75);
      assert.strictEqual(engine.acceptanceThreshold, 0.5);
    });

    it('should initialize with custom values', () => {
      const engine = new LunchEngine({
        seed: 999,
        recommendationCount: 10,
        fatigueThreshold: 80,
        acceptanceThreshold: 0.6
      });
      assert.strictEqual(engine.seed, 999);
      assert.strictEqual(engine.recommendationCount, 10);
      assert.strictEqual(engine.fatigueThreshold, 80);
      assert.strictEqual(engine.acceptanceThreshold, 0.6);
    });
  });

  describe('Deterministic Random Generation', () => {
    it('should generate consistent random values with same seed', () => {
      const engine1 = new LunchEngine({ seed: 123 });
      const engine2 = new LunchEngine({ seed: 123 });
      
      const value1 = engine1.generateDeterministicRandom('test');
      const value2 = engine2.generateDeterministicRandom('test');
      
      assert.strictEqual(value1, value2);
    });

    it('should generate different values with different seeds', () => {
      const engine1 = new LunchEngine({ seed: 123 });
      const engine2 = new LunchEngine({ seed: 456 });
      
      const value1 = engine1.generateDeterministicRandom('test');
      const value2 = engine2.generateDeterministicRandom('test');
      
      assert.notStrictEqual(value1, value2);
    });

    it('should generate values between 0 and 1', () => {
      const value = lunchEngine.generateDeterministicRandom('test');
      assert(value >= 0 && value < 1);
    });
  });

  describe('Model Creation', () => {
    it('should create LunchSlot instances', () => {
      const slot = lunchEngine.createLunchSlot({ date: '2023-01-01' });
      assert(slot instanceof LunchSlot);
      assert.strictEqual(slot.date, '2023-01-01');
    });

    it('should create ItemPreference instances', () => {
      const preference = lunchEngine.createItemPreference({ itemId: 'item1', userId: 'user1' });
      assert(preference instanceof ItemPreference);
      assert.strictEqual(preference.itemId, 'item1');
      assert.strictEqual(preference.userId, 'user1');
    });

    it('should create FatigueScore instances', () => {
      const fatigue = lunchEngine.createFatigueScore({ itemId: 'item1', userId: 'user1' });
      assert(fatigue instanceof FatigueScore);
      assert.strictEqual(fatigue.itemId, 'item1');
      assert.strictEqual(fatigue.userId, 'user1');
    });

    it('should create AcceptanceScore instances', () => {
      const acceptance = lunchEngine.createAcceptanceScore({ itemId: 'item1', userId: 'user1' });
      assert(acceptance instanceof AcceptanceScore);
      assert.strictEqual(acceptance.itemId, 'item1');
      assert.strictEqual(acceptance.userId, 'user1');
    });
  });

  describe('Acceptance Score Calculation', () => {
    it('should calculate acceptance score correctly', () => {
      const score = lunchEngine.calculateAcceptanceScore(
        'item1',
        'user1',
        0.8,
        25,
        5,
        10
      );
      
      assert(typeof score === 'number');
      assert(score >= 0 && score <= 1);
    });

    it('should handle edge cases in acceptance score calculation', () => {
      const score1 = lunchEngine.calculateAcceptanceScore('item1', 'user1', -1, 100, 0, 0);
      const score2 = lunchEngine.calculateAcceptanceScore('item1', 'user1', 1, 0, Infinity, 100);
      
      assert(score1 >= 0 && score1 <= 1);
      assert(score2 >= 0 && score2 <= 1);
      assert(score2 > score1);
    });
  });

  describe('Recommendation Generation', () => {
    const availableItems = [
      { id: 'item1', name: 'Sandwich', category: 'main' },
      { id: 'item2', name: 'Salad', category: 'side' },
      { id: 'item3', name: 'Soup', category: 'main' },
      { id: 'item4', name: 'Fruit', category: 'dessert' }
    ];

    const userPreferences = [
      new ItemPreference({ itemId: 'item1', userId: 'user1', preferenceScore: 0.8 }),
      new ItemPreference({ itemId: 'item2', userId: 'user1', preferenceScore: 0.2 }),
      new ItemPreference({ itemId: 'item3', userId: 'user1', preferenceScore: -0.5 })
    ];

    const userFatigueScores = [
      new FatigueScore({ itemId: 'item1', userId: 'user1', currentFatigue: 10 }),
      new FatigueScore({ itemId: 'item2', userId: 'user1', currentFatigue: 50 })
    ];

    const stockData = [
      { itemId: 'item1', quantity: 5 },
      { itemId: 'item2', quantity: 3 },
      { itemId: 'item3', quantity: 0 },
      { itemId: 'item4', quantity: 10 }
    ];

    it('should generate recommendations', () => {
      const recommendations = lunchEngine.generateRecommendations(
        availableItems,
        userPreferences,
        userFatigueScores,
        stockData
      );

      assert(Array.isArray(recommendations));
      assert(recommendations.length <= lunchEngine.recommendationCount);
      
      recommendations.forEach(rec => {
        assert(rec.item);
        assert(typeof rec.acceptanceScore === 'number');
        assert(rec.acceptanceScore >= lunchEngine.acceptanceThreshold);
        assert(rec.stockAvailability > 0);
      });
    });

    it('should respect stock availability', () => {
      const recommendations = lunchEngine.generateRecommendations(
        availableItems,
        userPreferences,
        userFatigueScores,
        stockData
      );

      const outOfStockItems = recommendations.filter(rec => rec.stockAvailability <= 0);
      assert.strictEqual(outOfStockItems.length, 0);
    });

    it('should be deterministic with same seed', () => {
      const engine1 = new LunchEngine({ seed: 123 });
      const engine2 = new LunchEngine({ seed: 123 });

      const rec1 = engine1.generateRecommendations(
        availableItems,
        userPreferences,
        userFatigueScores,
        stockData
      );

      const rec2 = engine2.generateRecommendations(
        availableItems,
        userPreferences,
        userFatigueScores,
        stockData
      );

      assert.strictEqual(rec1.length, rec2.length);
      rec1.forEach((rec, index) => {
        assert.strictEqual(rec.item.id, rec2[index].item.id);
      });
    });
  });

  describe('Item Selection Recording', () => {
    let userPreferences, userFatigueScores;

    beforeEach(() => {
      userPreferences = [
        new ItemPreference({ itemId: 'item1', userId: 'user1', preferenceScore: 0.5 })
      ];
      userFatigueScores = [
        new FatigueScore({ itemId: 'item1', userId: 'user1', currentFatigue: 20 })
      ];
    });

    it('should record item selection correctly', () => {
      const result = lunchEngine.recordItemSelection('item1', 'user1', userPreferences, userFatigueScores);

      assert(result.preference);
      assert(result.fatigue);
      assert.strictEqual(result.preference.usageCount, 1);
      assert.strictEqual(result.fatigue.currentFatigue, 45);
    });

    it('should create new preference and fatigue if not exist', () => {
      const result = lunchEngine.recordItemSelection('item2', 'user1', userPreferences, userFatigueScores);

      assert(result.preference);
      assert(result.fatigue);
      assert.strictEqual(result.preference.itemId, 'item2');
      assert.strictEqual(result.fatigue.itemId, 'item2');
      
      assert.strictEqual(userPreferences.length, 2);
      assert.strictEqual(userFatigueScores.length, 2);
    });
  });

  describe('Cooldown Application', () => {
    it('should apply cooldown to fatigued items', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      const fatigueScores = [
        new FatigueScore({
          itemId: 'item1',
          userId: 'user1',
          currentFatigue: 50,
          lastSelection: threeDaysAgo.toISOString()
        })
      ];

      const results = lunchEngine.applyCooldownToAll(fatigueScores);

      assert.strictEqual(results.length, 1);
      assert(results[0].cooldownAmount > 0);
      assert(results[0].newFatigue < results[0].previousFatigue);
    });

    it('should not apply cooldown to items without last selection', () => {
      const fatigueScores = [
        new FatigueScore({ itemId: 'item1', userId: 'user1', currentFatigue: 50 })
      ];

      const results = lunchEngine.applyCooldownToAll(fatigueScores);

      assert.strictEqual(results.length, 0);
    });
  });

  describe('Fatigue Management', () => {
    it('should identify fatigued items', () => {
      const fatigueScores = [
        new FatigueScore({ itemId: 'item1', userId: 'user1', currentFatigue: 80 }),
        new FatigueScore({ itemId: 'item2', userId: 'user1', currentFatigue: 30 })
      ];

      const fatiguedItems = lunchEngine.getFatiguedItems(fatigueScores);

      assert.strictEqual(fatiguedItems.length, 1);
      assert.strictEqual(fatiguedItems[0].itemId, 'item1');
    });

    it('should filter available items based on stock', () => {
      const nonFatiguedItems = [
        { id: 'item1', name: 'Sandwich' },
        { id: 'item2', name: 'Salad' }
      ];

      const stockData = [
        { itemId: 'item1', quantity: 5 },
        { itemId: 'item2', quantity: 0 }
      ];

      const availableItems = lunchEngine.getAvailableItems(nonFatiguedItems, stockData);

      assert.strictEqual(availableItems.length, 1);
      assert.strictEqual(availableItems[0].id, 'item1');
    });
  });

  describe('Balanced Lunch Slot Creation', () => {
    it('should create balanced lunch slot from recommendations', () => {
      const recommendations = [
        {
          item: { id: 'item1', name: 'Sandwich', category: 'main' },
          acceptanceScore: 0.8
        },
        {
          item: { id: 'item2', name: 'Salad', category: 'side' },
          acceptanceScore: 0.7
        }
      ];

      const slot = lunchEngine.createBalancedLunchSlot(recommendations, 2);

      assert(slot instanceof LunchSlot);
      assert.strictEqual(slot.getItemCount(), 2);
      assert.strictEqual(slot.getItem('item1').name, 'Sandwich');
      assert.strictEqual(slot.getItem('item2').name, 'Salad');
    });
  });

  describe('State Validation', () => {
    it('should validate rotation state correctly', () => {
      const userPreferences = [new ItemPreference({ itemId: 'item1', userId: 'user1' })];
      const userFatigueScores = [new FatigueScore({ itemId: 'item1', userId: 'user1' })];
      const stockData = [{ itemId: 'item1', quantity: 5 }];

      const validation = lunchEngine.validateRotationState(userPreferences, userFatigueScores, stockData);

      assert(validation.isValid);
      assert(Array.isArray(validation.warnings));
      assert(Array.isArray(validation.errors));
    });

    it('should detect missing stock data', () => {
      const validation = lunchEngine.validateRotationState([], [], []);

      assert(!validation.isValid);
      assert(validation.errors.includes('No stock data available'));
    });

    it('should warn about high fatigue percentage', () => {
      const fatigueScores = [
        new FatigueScore({ itemId: 'item1', userId: 'user1', currentFatigue: 80 }),
        new FatigueScore({ itemId: 'item2', userId: 'user1', currentFatigue: 90 })
      ];

      const validation = lunchEngine.validateRotationState([], fatigueScores, [{ itemId: 'item1', quantity: 5 }]);

      assert(validation.warnings.some(w => w.includes('High percentage of items are fatigued')));
    });
  });
});

describe('LunchSlot Model', () => {
  describe('Basic Operations', () => {
    it('should create lunch slot with default values', () => {
      const slot = new LunchSlot();
      assert(slot.id);
      assert(slot.date);
      assert.strictEqual(slot.timeSlot, 'lunch');
      assert(Array.isArray(slot.items));
      assert.strictEqual(slot.getItemCount(), 0);
    });

    it('should add and remove items', () => {
      const slot = new LunchSlot();
      const item = { id: 'item1', name: 'Sandwich' };

      slot.addItem(item);
      assert.strictEqual(slot.getItemCount(), 1);
      assert.strictEqual(slot.getItem('item1').name, 'Sandwich');

      slot.removeItem('item1');
      assert.strictEqual(slot.getItemCount(), 0);
      assert.strictEqual(slot.getItem('item1'), undefined);
    });
  });
});

describe('ItemPreference Model', () => {
  it('should update preference score and category', () => {
    const preference = new ItemPreference({ itemId: 'item1', userId: 'user1' });

    preference.updateScore(0.8);
    assert.strictEqual(preference.preferenceScore, 0.8);
    assert.strictEqual(preference.category, 'preferred');

    preference.updateScore(-0.8);
    assert.strictEqual(preference.preferenceScore, -0.8);
    assert.strictEqual(preference.category, 'disliked');
  });

  it('should record usage correctly', () => {
    const preference = new ItemPreference({ itemId: 'item1', userId: 'user1' });

    preference.recordUsage();
    assert.strictEqual(preference.usageCount, 1);
    assert(preference.lastUsed);
  });
});

describe('FatigueScore Model', () => {
  it('should record selection and calculate fatigue', () => {
    const fatigue = new FatigueScore({ itemId: 'item1', userId: 'user1' });

    fatigue.recordSelection();
    assert.strictEqual(fatigue.currentFatigue, 25);
    assert(fatigue.lastSelection);
    assert.strictEqual(fatigue.selectionHistory.length, 1);
  });

  it('should calculate cooldown correctly', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const fatigue = new FatigueScore({
      itemId: 'item1',
      userId: 'user1',
      currentFatigue: 50,
      lastSelection: threeDaysAgo.toISOString()
    });

    fatigue.calculateCooldown();
    assert(fatigue.currentFatigue < 50);
  });

  it('should identify fatigued items', () => {
    const fatigue = new FatigueScore({ itemId: 'item1', userId: 'user1', currentFatigue: 80 });

    assert(fatigue.isFatigued(75));
    assert(!fatigue.isFatigued(85));
  });
});

describe('AcceptanceScore Model', () => {
  it('should calculate acceptance score components', () => {
    const acceptance = new AcceptanceScore({ itemId: 'item1', userId: 'user1' });

    const score = acceptance.calculateScore(0.8, 25, 5, 10);
    assert(typeof score === 'number');
    assert(score >= 0 && score <= 1);
  });

  it('should categorize scores correctly', () => {
    const acceptance = new AcceptanceScore({ itemId: 'item1', userId: 'user1' });
    
    acceptance.finalScore = 0.9;
    assert.strictEqual(acceptance.getScoreCategory(), 'excellent');

    acceptance.finalScore = 0.7;
    assert.strictEqual(acceptance.getScoreCategory(), 'good');

    acceptance.finalScore = 0.3;
    assert.strictEqual(acceptance.getScoreCategory(), 'poor');
  });
});
