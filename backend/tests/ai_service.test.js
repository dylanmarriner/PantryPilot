const aiService = require('../src/services/ai_service');
const actionExtractor = require('../src/utils/action_extractor');

describe('AIService', () => {
  describe('extractActions', () => {
    test('should extract consume actions from text', async () => {
      const text = 'I ate 2 apples';
      const actions = await aiService.extractActions(text);
      
      expect(actions).toHaveLength(1);
      expect(actions[0]).toMatchObject({
        type: 'consume',
        item: 'apples',
        quantity: 2,
        unit: 'pieces'
      });
      expect(actions[0].confidence).toBeGreaterThan(0);
    });

    test('should extract purchase actions from text', async () => {
      const text = 'I bought 1kg of rice';
      const actions = await aiService.extractActions(text);
      
      expect(actions).toHaveLength(1);
      expect(actions[0]).toMatchObject({
        type: 'purchase',
        item: 'rice',
        quantity: 1,
        unit: 'kilograms'
      });
      expect(actions[0].confidence).toBeGreaterThan(0);
    });

    test('should extract meal actions from text', async () => {
      const text = 'I cooked pasta with tomato sauce';
      const actions = await aiService.extractActions(text);
      
      expect(actions).toHaveLength(1);
      expect(actions[0]).toMatchObject({
        type: 'meal',
        description: 'pasta with tomato sauce'
      });
      expect(actions[0].ingredients).toContain('pasta');
      expect(actions[0].ingredients).toContain('tomato');
      expect(actions[0].confidence).toBeGreaterThan(0);
    });

    test('should handle multiple actions in one text', async () => {
      const text = 'I ate 2 apples and bought 1 liter of milk';
      const actions = await aiService.extractActions(text);
      
      expect(actions).toHaveLength(2);
      expect(actions[0].type).toBe('consume');
      expect(actions[1].type).toBe('purchase');
    });

    test('should throw error for invalid input', async () => {
      await expect(aiService.extractActions(null)).rejects.toThrow();
      await expect(aiService.extractActions('')).rejects.toThrow();
      await expect(aiService.extractActions(123)).rejects.toThrow();
    });
  });

  describe('generateSuggestions', () => {
    test('should generate low stock suggestions', async () => {
      const inventory = {
        'milk': { quantity: 0.4, maxQuantity: 2 },
        'bread': { quantity: 1, maxQuantity: 1 }
      };

      const suggestions = await aiService.generateSuggestions(inventory);
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toMatchObject({
        type: 'purchase',
        item: 'milk',
        currentQuantity: 0.4,
        suggestedQuantity: 2,
        priority: 'medium'
      });
    });

    test('should generate expiring items suggestions', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const inventory = {
        'milk': { 
          quantity: 1, 
          maxQuantity: 2, 
          expiryDate: tomorrow.toISOString().split('T')[0] 
        }
      };

      const suggestions = await aiService.generateSuggestions(inventory);
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toMatchObject({
        type: 'use',
        item: 'milk',
        priority: 'high'
      });
    });

    test('should throw error for invalid inventory', async () => {
      await expect(aiService.generateSuggestions(null)).rejects.toThrow();
      await expect(aiService.generateSuggestions('invalid')).rejects.toThrow();
    });

    test('should return empty suggestions for healthy inventory', async () => {
      const inventory = {
        'milk': { quantity: 1.5, maxQuantity: 2 },
        'bread': { quantity: 0.8, maxQuantity: 1 }
      };

      const suggestions = await aiService.generateSuggestions(inventory);
      expect(suggestions).toHaveLength(0);
    });
  });
});

describe('ActionExtractor', () => {
  describe('extract', () => {
    test('should be deterministic for identical input', () => {
      const text = 'I ate 2 apples';
      const actions1 = actionExtractor.extract(text);
      const actions2 = actionExtractor.extract(text);
      
      expect(actions1).toEqual(actions2);
    });

    test('should handle different units correctly', () => {
      const texts = [
        'I ate 500g of cheese',
        'I drank 1 liter of water',
        'I used 2 tablespoons of oil'
      ];

      const actions = texts.map(text => actionExtractor.extract(text)[0]);
      
      expect(actions[0].unit).toBe('grams');
      expect(actions[0].quantity).toBe(500);
      
      expect(actions[1].unit).toBe('liters');
      expect(actions[1].quantity).toBe(1);
      
      expect(actions[2].unit).toBe('tablespoons');
      expect(actions[2].quantity).toBe(2);
    });
  });

  describe('parseQuantity', () => {
    test('should parse various quantity formats', () => {
      expect(actionExtractor.parseQuantity('2')).toBe(2);
      expect(actionExtractor.parseQuantity('2.5')).toBe(2.5);
      expect(actionExtractor.parseQuantity('')).toBe(1);
      expect(actionExtractor.parseQuantity(null)).toBe(1);
      expect(actionExtractor.parseQuantity('invalid')).toBe(1);
    });
  });

  describe('parseUnit', () => {
    test('should parse various unit formats', () => {
      expect(actionExtractor.parseUnit('g')).toBe('grams');
      expect(actionExtractor.parseUnit('kg')).toBe('kilograms');
      expect(actionExtractor.parseUnit('l')).toBe('liters');
      expect(actionExtractor.parseUnit('ml')).toBe('milliliters');
      expect(actionExtractor.parseUnit('')).toBe('pieces');
      expect(actionExtractor.parseUnit('unknown')).toBe('pieces');
    });
  });

  describe('cleanItemName', () => {
    test('should remove articles and clean item names', () => {
      expect(actionExtractor.cleanItemName('the red apple')).toBe('red apple');
      expect(actionExtractor.cleanItemName('a big banana')).toBe('big banana');
      expect(actionExtractor.cleanItemName('  fresh milk  ')).toBe('fresh milk');
      expect(actionExtractor.cleanItemName('')).toBe('');
    });
  });
});
