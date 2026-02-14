/**
 * Lunch Engine Service
 * Core service for lunch rotation, fatigue management, and item recommendations
 */

const LunchSlot = require('../models/lunch_slot');
const ItemPreference = require('../models/item_preference');
const FatigueScore = require('../models/fatigue_score');
const AcceptanceScore = require('../models/acceptance_score');

class LunchEngine {
  constructor(options = {}) {
    this.seed = options.seed || Date.now();
    this.recommendationCount = options.recommendationCount || 5;
    this.fatigueThreshold = options.fatigueThreshold || 75;
    this.acceptanceThreshold = options.acceptanceThreshold || 0.5;
  }

  generateDeterministicRandom(input) {
    const hash = this.simpleHash(`${this.seed}_${input}`);
    return (hash % 10000) / 10000;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  createLunchSlot(data = {}) {
    return new LunchSlot(data);
  }

  createItemPreference(data = {}) {
    return new ItemPreference(data);
  }

  createFatigueScore(data = {}) {
    return new FatigueScore(data);
  }

  createAcceptanceScore(data = {}) {
    return new AcceptanceScore(data);
  }

  calculateAcceptanceScore(itemId, userId, preferenceScore, fatigueScore, daysSinceLastUsed, stockAvailability) {
    const acceptanceScore = new AcceptanceScore({
      itemId,
      userId
    });

    return acceptanceScore.calculateScore(
      preferenceScore,
      fatigueScore,
      daysSinceLastUsed,
      stockAvailability
    );
  }

  generateRecommendations(availableItems, userPreferences, userFatigueScores, stockData, options = {}) {
    const recommendations = [];
    const count = options.count || this.recommendationCount;
    const seed = options.seed || this.seed;

    for (const item of availableItems) {
      const preference = userPreferences.find(p => p.itemId === item.id);
      const fatigue = userFatigueScores.find(f => f.itemId === item.id);
      const stock = stockData.find(s => s.itemId === item.id);

      const preferenceScore = preference ? preference.preferenceScore : 0;
      const fatiguePercentage = fatigue ? fatigue.getFatiguePercentage() : 0;
      const daysSinceLastUsed = preference ? preference.getDaysSinceLastUsed() : Infinity;
      const stockAvailability = stock ? stock.quantity : 0;

      const acceptanceScore = this.calculateAcceptanceScore(
        item.id,
        preference?.userId || 'default',
        preferenceScore,
        fatiguePercentage,
        daysSinceLastUsed,
        stockAvailability
      );

      if (acceptanceScore >= this.acceptanceThreshold && stockAvailability > 0) {
        recommendations.push({
          item,
          acceptanceScore,
          preferenceScore,
          fatiguePercentage,
          daysSinceLastUsed,
          stockAvailability,
          recommendationReason: this.getRecommendationReason(acceptanceScore, preferenceScore, fatiguePercentage)
        });
      }
    }

    recommendations.sort((a, b) => {
      const randomA = this.generateDeterministicRandom(`${a.item.id}_${seed}_sort`);
      const randomB = this.generateDeterministicRandom(`${b.item.id}_${seed}_sort`);
      
      const scoreDiff = b.acceptanceScore - a.acceptanceScore;
      if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
      
      return randomA - randomB;
    });

    return recommendations.slice(0, count);
  }

  getRecommendationReason(acceptanceScore, preferenceScore, fatiguePercentage) {
    const reasons = [];
    
    if (acceptanceScore >= 0.8) {
      reasons.push('high_acceptance');
    } else if (acceptanceScore >= 0.6) {
      reasons.push('good_acceptance');
    }

    if (preferenceScore > 0.5) {
      reasons.push('preferred');
    } else if (preferenceScore < -0.5) {
      reasons.push('disliked');
    }

    if (fatiguePercentage < 25) {
      reasons.push('low_fatigue');
    } else if (fatiguePercentage > 75) {
      reasons.push('high_fatigue');
    }

    return reasons.length > 0 ? reasons : 'neutral';
  }

  recordItemSelection(itemId, userId, userPreferences, userFatigueScores) {
    let preference = userPreferences.find(p => p.itemId === itemId && p.userId === userId);
    if (!preference) {
      preference = new ItemPreference({
        itemId,
        userId,
        preferenceScore: 0
      });
      userPreferences.push(preference);
    }

    preference.recordUsage();

    let fatigue = userFatigueScores.find(f => f.itemId === itemId && f.userId === userId);
    if (!fatigue) {
      fatigue = new FatigueScore({
        itemId,
        userId
      });
      userFatigueScores.push(fatigue);
    }

    fatigue.recordSelection();

    return { preference, fatigue };
  }

  applyCooldownToAll(userFatigueScores) {
    const cooldownResults = [];
    
    for (const fatigue of userFatigueScores) {
      const previousFatigue = fatigue.currentFatigue;
      const cooldownAmount = fatigue.calculateCooldown();
      
      if (cooldownAmount > 0) {
        cooldownResults.push({
          itemId: fatigue.itemId,
          previousFatigue,
          newFatigue: fatigue.currentFatigue,
          cooldownAmount
        });
      }
    }

    return cooldownResults;
  }

  getFatiguedItems(userFatigueScores, threshold = null) {
    const fatigueThreshold = threshold || this.fatigueThreshold;
    return userFatigueScores.filter(fatigue => fatigue.isFatigued(fatigueThreshold));
  }

  getAvailableItems(nonFatiguedItems, stockData) {
    return nonFatiguedItems.filter(item => {
      const stock = stockData.find(s => s.itemId === item.id);
      return stock && stock.quantity > 0;
    });
  }

  createBalancedLunchSlot(recommendations, maxItems = 3) {
    const slot = new LunchSlot();
    
    const selectedItems = recommendations.slice(0, maxItems).map(rec => ({
      id: rec.item.id,
      name: rec.item.name,
      category: rec.item.category,
      acceptanceScore: rec.acceptanceScore,
      addedAt: new Date().toISOString()
    }));

    selectedItems.forEach(item => slot.addItem(item));
    
    return slot;
  }

  validateRotationState(userPreferences, userFatigueScores, stockData) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: []
    };

    if (!userPreferences || userPreferences.length === 0) {
      validation.warnings.push('No user preferences found');
    }

    if (!userFatigueScores || userFatigueScores.length === 0) {
      validation.warnings.push('No fatigue scores found');
    }

    if (!stockData || stockData.length === 0) {
      validation.errors.push('No stock data available');
      validation.isValid = false;
    }

    const fatiguedItems = this.getFatiguedItems(userFatigueScores);
    if (fatiguedItems.length > userFatigueScores.length * 0.5) {
      validation.warnings.push('High percentage of items are fatigued');
    }

    const outOfStockItems = stockData.filter(s => s.quantity <= 0);
    if (outOfStockItems.length > stockData.length * 0.3) {
      validation.warnings.push('High percentage of items are out of stock');
    }

    return validation;
  }
}

module.exports = LunchEngine;
