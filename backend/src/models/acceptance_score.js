/**
 * Acceptance Score Model
 * Calculates item acceptance scores based on preference, fatigue, and other factors
 */

class AcceptanceScore {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.itemId = data.itemId;
    this.userId = data.userId;
    this.baseScore = data.baseScore || 0.5;
    this.preferenceWeight = data.preferenceWeight || 0.4;
    this.fatigueWeight = data.fatigueWeight || 0.3;
    this.varietyWeight = data.varietyWeight || 0.2;
    this.stockWeight = data.stockWeight || 0.1;
    this.finalScore = data.finalScore || 0.5;
    this.calculationFactors = data.calculationFactors || {};
    this.lastCalculated = data.lastCalculated || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateId() {
    return `accept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateScore(preferenceScore, fatiguePercentage, daysSinceLastUsed, stockAvailability) {
    const preferenceComponent = this.calculatePreferenceComponent(preferenceScore);
    const fatigueComponent = this.calculateFatigueComponent(fatiguePercentage);
    const varietyComponent = this.calculateVarietyComponent(daysSinceLastUsed);
    const stockComponent = this.calculateStockComponent(stockAvailability);

    this.finalScore = (
      preferenceComponent * this.preferenceWeight +
      fatigueComponent * this.fatigueWeight +
      varietyComponent * this.varietyWeight +
      stockComponent * this.stockWeight
    );

    this.finalScore = Math.max(0, Math.min(1, this.finalScore));

    this.calculationFactors = {
      preferenceComponent,
      fatigueComponent,
      varietyComponent,
      stockComponent,
      preferenceScore,
      fatiguePercentage,
      daysSinceLastUsed,
      stockAvailability,
      weights: {
        preference: this.preferenceWeight,
        fatigue: this.fatigueWeight,
        variety: this.varietyWeight,
        stock: this.stockWeight
      }
    };

    this.lastCalculated = new Date().toISOString();
    this.updatedAt = new Date().toISOString();

    return this.finalScore;
  }

  calculatePreferenceComponent(preferenceScore) {
    if (typeof preferenceScore !== 'number' || preferenceScore < -1 || preferenceScore > 1) {
      return 0.5;
    }
    return (preferenceScore + 1) / 2;
  }

  calculateFatigueComponent(fatiguePercentage) {
    if (typeof fatiguePercentage !== 'number' || fatiguePercentage < 0 || fatiguePercentage > 100) {
      return 0.5;
    }
    return Math.max(0, 1 - (fatiguePercentage / 100));
  }

  calculateVarietyComponent(daysSinceLastUsed) {
    if (daysSinceLastUsed === Infinity) {
      return 1.0;
    }
    
    if (typeof daysSinceLastUsed !== 'number' || daysSinceLastUsed < 0) {
      return 0.5;
    }

    if (daysSinceLastUsed >= 7) {
      return 1.0;
    } else if (daysSinceLastUsed >= 3) {
      return 0.8;
    } else if (daysSinceLastUsed >= 1) {
      return 0.6;
    } else {
      return 0.3;
    }
  }

  calculateStockComponent(stockAvailability) {
    if (typeof stockAvailability !== 'number' || stockAvailability < 0) {
      return 0.5;
    }

    if (stockAvailability >= 10) {
      return 1.0;
    } else if (stockAvailability >= 5) {
      return 0.8;
    } else if (stockAvailability >= 2) {
      return 0.6;
    } else if (stockAvailability >= 1) {
      return 0.4;
    } else {
      return 0.1;
    }
  }

  getScoreCategory() {
    if (this.finalScore >= 0.8) return 'excellent';
    if (this.finalScore >= 0.6) return 'good';
    if (this.finalScore >= 0.4) return 'acceptable';
    if (this.finalScore >= 0.2) return 'poor';
    return 'very_poor';
  }

  isRecommended(threshold = 0.5) {
    return this.finalScore >= threshold;
  }

  updateWeights(preferenceWeight, fatigueWeight, varietyWeight, stockWeight) {
    const totalWeight = preferenceWeight + fatigueWeight + varietyWeight + stockWeight;
    
    if (totalWeight <= 0) {
      throw new Error('Total weight must be greater than 0');
    }

    this.preferenceWeight = preferenceWeight / totalWeight;
    this.fatigueWeight = fatigueWeight / totalWeight;
    this.varietyWeight = varietyWeight / totalWeight;
    this.stockWeight = stockWeight / totalWeight;
    
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      itemId: this.itemId,
      userId: this.userId,
      baseScore: this.baseScore,
      preferenceWeight: this.preferenceWeight,
      fatigueWeight: this.fatigueWeight,
      varietyWeight: this.varietyWeight,
      stockWeight: this.stockWeight,
      finalScore: this.finalScore,
      calculationFactors: this.calculationFactors,
      lastCalculated: this.lastCalculated,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new AcceptanceScore(json);
  }
}

module.exports = AcceptanceScore;
