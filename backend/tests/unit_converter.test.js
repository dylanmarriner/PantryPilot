const UnitConverter = require('../src/services/unit_converter');

describe('UnitConverter', () => {
  let converter;

  beforeEach(() => {
    converter = new UnitConverter();
  });

  describe('Unit Normalization', () => {
    test('should normalize weight units', () => {
      expect(converter.normalizeUnit('grams')).toBe('g');
      expect(converter.normalizeUnit('kilograms')).toBe('kg');
      expect(converter.normalizeUnit('KG')).toBe('kg');
      expect(converter.normalizeUnit('ounces')).toBe('oz');
      expect(converter.normalizeUnit('pounds')).toBe('lb');
    });

    test('should normalize volume units', () => {
      expect(converter.normalizeUnit('milliliters')).toBe('ml');
      expect(converter.normalizeUnit('liters')).toBe('L');
      expect(converter.normalizeUnit('L')).toBe('L');
      expect(converter.normalizeUnit('fluid ounces')).toBe('fl_oz');
      expect(converter.normalizeUnit('tablespoons')).toBe('tbsp');
      expect(converter.normalizeUnit('teaspoons')).toBe('tsp');
    });

    test('should normalize count units', () => {
      expect(converter.normalizeUnit('count')).toBe('count');
      expect(converter.normalizeUnit('pieces')).toBe('piece');
      expect(converter.normalizeUnit('items')).toBe('item');
      expect(converter.normalizeUnit('units')).toBe('unit');
    });
  });

  describe('Unit Type Detection', () => {
    test('should detect weight units', () => {
      expect(converter.getUnitType('g')).toBe('weight');
      expect(converter.getUnitType('kg')).toBe('weight');
      expect(converter.getUnitType('oz')).toBe('weight');
      expect(converter.getUnitType('lb')).toBe('weight');
    });

    test('should detect volume units', () => {
      expect(converter.getUnitType('ml')).toBe('volume');
      expect(converter.getUnitType('L')).toBe('volume');
      expect(converter.getUnitType('fl_oz')).toBe('volume');
      expect(converter.getUnitType('tsp')).toBe('volume');
    });

    test('should detect count units', () => {
      expect(converter.getUnitType('count')).toBe('count');
      expect(converter.getUnitType('piece')).toBe('count');
      expect(converter.getUnitType('item')).toBe('count');
    });

    test('should default to count for unknown units', () => {
      expect(converter.getUnitType('unknown')).toBe('count');
    });
  });

  describe('Base Unit Conversion', () => {
    test('should convert weight to grams', () => {
      const result = converter.toBaseUnit(1, 'kg');
      expect(result.quantityBase).toBe(1000);
      expect(result.unitType).toBe('weight');
      expect(result.baseUnit).toBe('g');

      const result2 = converter.toBaseUnit(500, 'g');
      expect(result2.quantityBase).toBe(500);

      const result3 = converter.toBaseUnit(2, 'lb');
      expect(result3.quantityBase).toBe(908);
    });

    test('should convert volume to milliliters', () => {
      const result = converter.toBaseUnit(2, 'L');
      expect(result.quantityBase).toBe(2000);
      expect(result.unitType).toBe('volume');
      expect(result.baseUnit).toBe('ml');

      const result2 = converter.toBaseUnit(500, 'ml');
      expect(result2.quantityBase).toBe(500);

      const result3 = converter.toBaseUnit(1, 'cup');
      expect(result3.quantityBase).toBe(240);
    });

    test('should handle count units', () => {
      const result = converter.toBaseUnit(10, 'count');
      expect(result.quantityBase).toBe(10);
      expect(result.unitType).toBe('count');
      expect(result.baseUnit).toBe('count');
    });

    test('should handle decimal quantities', () => {
      const result = converter.toBaseUnit(1.5, 'kg');
      expect(result.quantityBase).toBe(1500);

      const result2 = converter.toBaseUnit(0.5, 'L');
      expect(result2.quantityBase).toBe(500);
    });
  });

  describe('From Base Unit Conversion', () => {
    test('should convert from grams to other weight units', () => {
      expect(converter.fromBaseUnit(1000, 'kg')).toBe(1);
      expect(converter.fromBaseUnit(500, 'g')).toBe(500);
      expect(converter.fromBaseUnit(454, 'lb')).toBe(1);
    });

    test('should convert from milliliters to other volume units', () => {
      expect(converter.fromBaseUnit(2000, 'L')).toBe(2);
      expect(converter.fromBaseUnit(500, 'ml')).toBe(500);
      expect(converter.fromBaseUnit(240, 'cup')).toBe(1);
    });

    test('should handle count units', () => {
      expect(converter.fromBaseUnit(10, 'count')).toBe(10);
      expect(converter.fromBaseUnit(5, 'piece')).toBe(5);
    });
  });

  describe('Direct Unit Conversion', () => {
    test('should convert between compatible units', () => {
      expect(converter.convert(1, 'kg', 'g')).toBe(1000);
      expect(converter.convert(1000, 'ml', 'L')).toBe(1);
      expect(converter.convert(2, 'L', 'ml')).toBe(2000);
    });

    test('should handle decimal conversions', () => {
      expect(converter.convert(0.5, 'kg', 'g')).toBe(500);
      expect(converter.convert(1.5, 'L', 'ml')).toBe(1500);
    });

    test('should round appropriately', () => {
      expect(converter.convert(1, 'lb', 'g')).toBe(454);
      expect(converter.convert(1, 'fl_oz', 'ml')).toBe(30);
    });
  });

  describe('Unit Compatibility', () => {
    test('should check if units are compatible', () => {
      expect(converter.areUnitsCompatible('kg', 'g')).toBe(true);
      expect(converter.areUnitsCompatible('L', 'ml')).toBe(true);
      expect(converter.areUnitsCompatible('count', 'piece')).toBe(true);
      expect(converter.areUnitsCompatible('kg', 'L')).toBe(false);
      expect(converter.areUnitsCompatible('g', 'count')).toBe(false);
    });
  });

  describe('Ambiguous Unit Handling', () => {
    test('should handle oz based on preferred unit context', () => {
      // As weight
      const weightResult = converter.toBaseUnit(8, 'oz', 'g');
      expect(weightResult.unitType).toBe('weight');
      expect(weightResult.quantityBase).toBe(224);

      // As volume
      const volumeResult = converter.toBaseUnit(8, 'oz', 'ml');
      expect(volumeResult.unitType).toBe('volume');
      expect(volumeResult.quantityBase).toBe(240);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid quantity', () => {
      expect(() => converter.toBaseUnit(0, 'kg')).toThrow();
      expect(() => converter.toBaseUnit(-1, 'kg')).toThrow();
      expect(() => converter.toBaseUnit(null, 'kg')).toThrow();
    });

    test('should throw error for unsupported units', () => {
      expect(() => converter.toBaseUnit(1, 'invalid_unit')).toThrow();
      expect(() => converter.fromBaseUnit(100, 'invalid_unit')).toThrow();
    });

    test('should handle zero quantity in fromBaseUnit', () => {
      expect(converter.fromBaseUnit(0, 'kg')).toBe(0);
      expect(converter.fromBaseUnit(null, 'kg')).toBe(0);
    });
  });

  describe('Deterministic Math Tests', () => {
    test('should produce consistent results for repeated conversions', () => {
      // Convert kg -> g -> kg
      const original = 1.234;
      const toGrams = converter.toBaseUnit(original, 'kg');
      const backToKg = converter.fromBaseUnit(toGrams.quantityBase, 'kg');
      expect(backToKg).toBe(1.23);

      // Convert L -> ml -> L
      const originalL = 2.567;
      const toMl = converter.toBaseUnit(originalL, 'L');
      const backToL = converter.fromBaseUnit(toMl.quantityBase, 'L');
      expect(backToL).toBe(2.57);
    });

    test('should handle cumulative operations without drift', () => {
      // Add 500g + 500g should equal 1kg
      const base1 = converter.toBaseUnit(500, 'g');
      const base2 = converter.toBaseUnit(500, 'g');
      const total = base1.quantityBase + base2.quantityBase;
      const result = converter.fromBaseUnit(total, 'kg');
      expect(result).toBe(1);

      // Add 0.5L + 0.5L should equal 1L
      const base3 = converter.toBaseUnit(0.5, 'L');
      const base4 = converter.toBaseUnit(0.5, 'L');
      const total2 = base3.quantityBase + base4.quantityBase;
      const result2 = converter.fromBaseUnit(total2, 'L');
      expect(result2).toBe(1);
    });
  });

  describe('Supported Units', () => {
    test('should return all supported units for each type', () => {
      const weightUnits = converter.getSupportedUnits('weight');
      expect(weightUnits).toContain('g');
      expect(weightUnits).toContain('kg');
      expect(weightUnits).toContain('oz');
      expect(weightUnits).toContain('lb');

      const volumeUnits = converter.getSupportedUnits('volume');
      expect(volumeUnits).toContain('ml');
      expect(volumeUnits).toContain('L');
      expect(volumeUnits).toContain('fl_oz');
      expect(volumeUnits).toContain('cup');

      const countUnits = converter.getSupportedUnits('count');
      expect(countUnits).toContain('count');
      expect(countUnits).toContain('piece');
    });
  });
});
