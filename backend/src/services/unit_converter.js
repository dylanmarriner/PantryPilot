/**
 * Unit Converter Service - handles deterministic unit conversions
 * All conversions use integer math to avoid floating point errors
 */
class UnitConverter {
  constructor() {
    // Conversion factors to base units
    // All values are integers for deterministic math
    this.conversions = {
      // Weight conversions (base unit: grams)
      weight: {
        g: 1,      // 1 gram = 1 gram
        kg: 1000,  // 1 kg = 1000 grams
        oz: 28,    // 1 oz ≈ 28 grams (rounded for integer math)
        lb: 454,   // 1 lb ≈ 454 grams (rounded for integer math)
      },
      // Volume conversions (base unit: milliliters)
      volume: {
        ml: 1,     // 1 ml = 1 ml
        L: 1000,   // 1 L = 1000 ml
        fl_oz: 30, // 1 fl oz ≈ 30 ml (rounded for integer math)
        tsp: 5,    // 1 tsp ≈ 5 ml
        tbsp: 15,  // 1 tbsp ≈ 15 ml
        cup: 240,  // 1 cup = 240 ml
        pint: 473, // 1 pint ≈ 473 ml
        quart: 946, // 1 quart ≈ 946 ml
        gallon: 3785, // 1 gallon ≈ 3785 ml
      },
      // Count conversions (base unit: count)
      count: {
        count: 1,
        piece: 1,
        items: 1,
        unit: 1,
      },
    };

    // Unit type mapping
    this.unitTypes = {
      // Weight units
      g: 'weight',
      kg: 'weight',
      oz: 'weight', // Default to weight for 'oz'
      lb: 'weight',
      gram: 'weight',
      kilogram: 'weight',
      ounce: 'weight',
      pound: 'weight',
      // Volume units
      ml: 'volume',
      L: 'volume',
      l: 'volume',
      fl_oz: 'volume',
      tsp: 'volume',
      tbsp: 'volume',
      cup: 'volume',
      pint: 'volume',
      quart: 'volume',
      gallon: 'volume',
      milliliter: 'volume',
      liter: 'volume',
      fluid_ounce: 'volume',
      tablespoon: 'volume',
      teaspoon: 'volume',
      // Note: 'oz' is ambiguous - handled in context
      // Count units
      count: 'count',
      piece: 'count',
      pieces: 'count',
      item: 'count',
      items: 'count',
      unit: 'count',
      units: 'count',
    };
  }

  /**
   * Normalize unit name to standard format
   * @param {string} unit - Unit name to normalize
   * @returns {string} Normalized unit name
   */
  normalizeUnit(unit) {
    if (!unit) return 'count';

    const normalized = unit.toLowerCase().trim();
    
    // Handle common variations
    switch (normalized) {
    case 'grams':
    case 'gram':
      return 'g';
    case 'kilograms':
    case 'kilogram':
      return 'kg';
    case 'liters':
    case 'liter':
    case 'l':
      return 'L';
    case 'milliliters':
    case 'milliliter':
      return 'ml';
    case 'ounces':
      return 'oz';
    case 'pounds':
      return 'lb';
    case 'fluid ounces':
    case 'fluid ounce':
      return 'fl_oz';
    case 'tablespoons':
    case 'tablespoon':
      return 'tbsp';
    case 'teaspoons':
    case 'teaspoon':
      return 'tsp';
    case 'cups':
      return 'cup';
    case 'pints':
      return 'pint';
    case 'quarts':
      return 'quart';
    case 'gallons':
      return 'gallon';
    case 'pieces':
      return 'piece';
    case 'pcs':
    case 'pc':
      return 'piece';
    case 'items':
      return 'item';
    case 'units':
      return 'unit';
    default:
      return normalized;
    }
  }

  /**
   * Get unit type for a given unit
   * @param {string} unit - Unit name
   * @returns {string} Unit type: 'weight', 'volume', or 'count'
   */
  getUnitType(unit) {
    const normalized = this.normalizeUnit(unit);
    return this.unitTypes[normalized] || 'count';
  }

  /**
   * Convert quantity to base units
   * @param {number} quantity - The quantity to convert
   * @param {string} fromUnit - Source unit
   * @param {string} preferredUnit - Preferred unit for context
   * @returns {Object} Conversion result with base quantity and unit info
   */
  toBaseUnit(quantity, fromUnit, preferredUnit = null) {
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }

    const normalizedUnit = this.normalizeUnit(fromUnit);
    let unitType = this.getUnitType(normalizedUnit);

    // Handle ambiguous 'oz' based on context
    let actualUnit = normalizedUnit;
    if (normalizedUnit === 'oz' && preferredUnit) {
      const preferredType = this.getUnitType(preferredUnit);
      if (preferredType === 'weight') {
        actualUnit = 'oz'; // weight ounce
      } else if (preferredType === 'volume') {
        actualUnit = 'fl_oz'; // fluid ounce
      }
    } else if (normalizedUnit === 'oz') {
      // Default to weight ounce when no context provided
      actualUnit = 'oz';
    }
    
    // Update unitType if we changed the unit
    if (actualUnit === 'fl_oz') {
      unitType = 'volume';
    }

    // Get conversion factor
    const conversionMap = this.conversions[unitType];
    if (!conversionMap || !conversionMap[actualUnit]) {
      throw new Error(`Unsupported unit: ${fromUnit}`);
    }

    const conversionFactor = conversionMap[actualUnit];
    
    // Convert to base unit - for weight and volume, use integer math
    // For count, keep as is
    let baseQuantity;
    if (unitType === 'count') {
      baseQuantity = Math.round(quantity);
    } else {
      // For weight/volume, multiply by conversion factor
      // Handle decimal quantities by rounding to nearest integer
      baseQuantity = Math.round(quantity * conversionFactor);
    }

    // Determine base unit
    let baseUnit;
    switch (unitType) {
    case 'weight':
      baseUnit = 'g';
      break;
    case 'volume':
      baseUnit = 'ml';
      break;
    case 'count':
      baseUnit = 'count';
      break;
    default:
      baseUnit = 'count';
    }

    return {
      quantityBase: baseQuantity,
      unitType,
      baseUnit,
    };
  }

  /**
   * Convert quantity from base units to specified unit
   * @param {number} baseQuantity - Quantity in base units
   * @param {string} toUnit - Target unit
   * @param {string} preferredUnit - Preferred unit for context
   * @returns {number} Converted quantity
   */
  fromBaseUnit(baseQuantity, toUnit, preferredUnit = null) {
    if (!baseQuantity || baseQuantity < 0) {
      return 0;
    }

    const normalizedUnit = this.normalizeUnit(toUnit);
    let unitType = this.getUnitType(normalizedUnit);

    // Handle ambiguous 'oz' based on context
    let actualUnit = normalizedUnit;
    if (normalizedUnit === 'oz' && preferredUnit) {
      const preferredType = this.getUnitType(preferredUnit);
      if (preferredType === 'weight') {
        actualUnit = 'oz'; // weight ounce
      } else if (preferredType === 'volume') {
        actualUnit = 'fl_oz'; // fluid ounce
      }
    } else if (normalizedUnit === 'oz') {
      // Default to weight ounce when no context provided
      actualUnit = 'oz';
    }
    
    // Update unitType if we changed the unit
    if (actualUnit === 'fl_oz') {
      unitType = 'volume';
    }

    // Get conversion factor
    const conversionMap = this.conversions[unitType];
    if (!conversionMap || !conversionMap[actualUnit]) {
      throw new Error(`Unsupported unit: ${toUnit}`);
    }

    const conversionFactor = conversionMap[actualUnit];
    
    // Convert from base unit
    let convertedQuantity;
    if (unitType === 'count') {
      convertedQuantity = baseQuantity;
    } else {
      // For weight/volume, divide by conversion factor
      convertedQuantity = baseQuantity / conversionFactor;
    }

    // Return with appropriate precision (2 decimal places for weight/volume)
    return unitType === 'count' ? convertedQuantity : Math.round(convertedQuantity * 100) / 100;
  }

  /**
   * Convert between two units of the same type
   * @param {number} quantity - Quantity to convert
   * @param {string} fromUnit - Source unit
   * @param {string} toUnit - Target unit
   * @param {string} preferredUnit - Preferred unit for context
   * @returns {number} Converted quantity
   */
  convert(quantity, fromUnit, toUnit, preferredUnit = null) {
    // Convert to base unit first
    const { quantityBase } = this.toBaseUnit(quantity, fromUnit, preferredUnit);
    
    // Then convert from base unit to target
    return this.fromBaseUnit(quantityBase, toUnit, preferredUnit);
  }

  /**
   * Check if two units are compatible (same type)
   * @param {string} unit1 - First unit
   * @param {string} unit2 - Second unit
   * @returns {boolean} True if units are compatible
   */
  areUnitsCompatible(unit1, unit2) {
    const type1 = this.getUnitType(unit1);
    const type2 = this.getUnitType(unit2);
    return type1 === type2;
  }

  /**
   * Get all supported units for a type
   * @param {string} type - Unit type: 'weight', 'volume', or 'count'
   * @returns {Array} Array of supported units
   */
  getSupportedUnits(type) {
    const conversionMap = this.conversions[type];
    return conversionMap ? Object.keys(conversionMap) : [];
  }
}

module.exports = UnitConverter;
