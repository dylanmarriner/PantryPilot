const actionExtractor = require('../utils/action_extractor');

class AIService {
  async extractActions(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Valid text input is required');
    }

    const normalizedText = text.toLowerCase().trim();

    const actions = actionExtractor.extract(normalizedText);

    return actions;
  }

  async generateSuggestions(inventory) {
    if (!inventory || typeof inventory !== 'object') {
      throw new Error('Valid inventory object is required');
    }

    const suggestions = [];

    const lowStockItems = this.findLowStockItems(inventory);
    for (const item of lowStockItems) {
      suggestions.push({
        type: 'purchase',
        item: item.name,
        currentQuantity: item.quantity,
        suggestedQuantity: item.suggestedQuantity,
        priority: this.calculatePriority(item),
        reason: `Low stock: ${item.quantity} remaining`
      });
    }

    const expiringItems = this.findExpiringItems(inventory);
    for (const item of expiringItems) {
      suggestions.push({
        type: 'use',
        item: item.name,
        expiryDate: item.expiryDate,
        priority: 'high',
        reason: `Expiring soon: ${item.expiryDate}`
      });
    }

    return suggestions;
  }

  findLowStockItems(inventory) {
    const lowStockThreshold = 0.2;
    const lowStockItems = [];

    for (const [itemName, itemData] of Object.entries(inventory)) {
      if (itemData.quantity !== undefined && itemData.maxQuantity !== undefined) {
        const quantity = parseFloat(itemData.quantity);
        const maxQuantity = parseFloat(itemData.maxQuantity);

        if (!isNaN(quantity) && !isNaN(maxQuantity) && maxQuantity > 0) {
          const ratio = quantity / maxQuantity;
          if (ratio <= lowStockThreshold) {
            lowStockItems.push({
              name: itemName,
              quantity: quantity,
              maxQuantity: maxQuantity,
              suggestedQuantity: Math.ceil(maxQuantity * 0.8)
            });
          }
        }
      }
    }

    return lowStockItems;
  }

  findExpiringItems(inventory) {
    const expiringItems = [];
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    for (const [itemName, itemData] of Object.entries(inventory)) {
      if (itemData.expiryDate) {
        const expiryDate = new Date(itemData.expiryDate);
        if (expiryDate <= threeDaysFromNow) {
          expiringItems.push({
            name: itemName,
            expiryDate: itemData.expiryDate
          });
        }
      }
    }

    return expiringItems;
  }

  calculatePriority(item) {
    const ratio = item.quantity / item.maxQuantity;
    if (ratio <= 0.1) return 'high';
    if (ratio <= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Strategic Roadmap Phase 1: Meal Scoring Algorithm
   * MealScore = (InventoryMatch * 0.35) + (ExpiryUsage * 0.20) + (LowCost * 0.20) + (VarietyFactor * 0.15) + (TimeFit * 0.10)
   */
  async calculateMealScore(meal, inventory, kidProfiles = []) {
    const weights = {
      inventory: 0.35,
      expiry: 0.20,
      cost: 0.20,
      variety: 0.15,
      time: 0.10
    };

    const matchScore = this.calculateInventoryMatch(meal, inventory);
    const expiryScore = this.calculateExpiryScore(meal, inventory);

    // Normalize cost (lower is better). Assume max reasonable cost per meal is $50.
    const cost = parseFloat(meal.costEstimate) || 0;
    const costScore = Math.max(0, 1 - (cost / 50));

    // Time fit (simplified: prefer quick meals). Assume max time is 120 mins.
    const totalTime = (meal.prepTime || 0) + (meal.cookTime || 0);
    const timeScore = Math.max(0, 1 - (totalTime / 120));

    // Kid Preference Penalty
    let kidPenalty = 0;
    for (const profile of kidProfiles) {
      if (this.hasDislikedIngredients(meal, profile)) {
        kidPenalty += 0.5; // Significant penalty if a kid dislikes it
      }
    }

    // Variety Factor (Placeholder for RotationLog integration)
    const varietyScore = 1.0;

    const totalScore = (
      (matchScore * weights.inventory) +
      (expiryScore * weights.expiry) +
      (costScore * weights.cost) +
      (varietyScore * weights.variety) +
      (timeScore * weights.time)
    ) - kidPenalty;

    return Math.max(0, totalScore); // Ensure score isn't negative
  }

  calculateInventoryMatch(meal, inventory) {
    if (!meal.ingredients || meal.ingredients.length === 0) return 0;

    let matchingIngredients = 0;
    for (const ingredient of meal.ingredients) {
      // Logic assumes inventory keys match ingredient names approximately
      // In a real app, we'd match IDs. For MVP, we match names.
      const invItem = Object.values(inventory).find(i =>
        i.name && ingredient.name && i.name.toLowerCase().includes(ingredient.name.toLowerCase())
      );

      if (invItem && invItem.quantity > 0) {
        matchingIngredients++;
      }
    }

    return matchingIngredients / meal.ingredients.length;
  }

  calculateExpiryScore(meal, inventory) {
    if (!meal.ingredients || meal.ingredients.length === 0) return 0;

    let expiringIngredientsUsed = 0;
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    for (const ingredient of meal.ingredients) {
      const invItem = Object.values(inventory).find(i =>
        i.name && ingredient.name && i.name.toLowerCase().includes(ingredient.name.toLowerCase())
      );

      if (invItem && invItem.expiryDate) {
        const expiry = new Date(invItem.expiryDate);
        if (expiry <= threeDaysFromNow) {
          expiringIngredientsUsed++;
        }
      }
    }

    // Boost score if using even one expiring item.
    // Score is % of ingredients that are expiring (which is rare, so maybe just 1.0 if any match)
    // Strategy: 1.0 if using ANY expiring item, plus bonus for more?
    // Let's stick to proportional for now.
    return expiringIngredientsUsed > 0 ? 1.0 : 0.0;
  }

  hasDislikedIngredients(meal, profile) {
    if (!profile.dislikes || !meal.ingredients) return false;

    for (const dislike of profile.dislikes) {
      const match = meal.ingredients.some(ing =>
        ing.name && ing.name.toLowerCase().includes(dislike.toLowerCase())
      );
      if (match) return true;
    }
    return false;
  }

  /**
   * Strategic Roadmap Phase 1.5: Lunch Logic & Variety Guard
   */
  async generateLunchSuggestions(inventory, kidProfile, rotationLogs = []) {
    const slots = ['Main', 'Fruit', 'Snack', 'Treat', 'Drink'];
    const suggestions = {};

    // 1. Categorize Inventory
    const categorizedInventory = {
      'Main': [], 'Fruit': [], 'Snack': [], 'Treat': [], 'Drink': []
    };

    // Simple keyword mapping for MVP. In production, use `LunchComponent.category`
    for (const [id, item] of Object.entries(inventory)) {
      if (!item.name) continue;
      const name = item.name.toLowerCase();

      if (name.includes('sandwich') || name.includes('wrap') || name.includes('leftover') || name.includes('pasta')) {
        categorizedInventory['Main'].push({ id, ...item });
      } else if (name.includes('apple') || name.includes('banana') || name.includes('grape') || name.includes('berry')) {
        categorizedInventory['Fruit'].push({ id, ...item });
      } else if (name.includes('bar') || name.includes('cracker') || name.includes('chip') || name.includes('yogurt')) {
        categorizedInventory['Snack'].push({ id, ...item });
      } else if (name.includes('cookie') || name.includes('chocolate')) {
        categorizedInventory['Treat'].push({ id, ...item });
      } else if (name.includes('juice') || name.includes('water') || name.includes('milk')) {
        categorizedInventory['Drink'].push({ id, ...item });
      }
    }

    // 2. Score and Guard (Available Items)
    for (const slot of slots) {
      suggestions[slot] = {
        available: [],
        shop: []
      };

      // Process Available Inventory
      suggestions[slot].available = categorizedInventory[slot].map(item => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const usageCount = rotationLogs.filter(log =>
          log.itemName === item.name &&
          log.kid_profile_id === kidProfile.id &&
          new Date(log.dateServed) >= oneWeekAgo
        ).length;

        let varietyScore = 1.0;
        let warning = null;
        let alternative = null;

        if (usageCount >= 2) {
          varietyScore = 0.5;
          warning = `Served ${usageCount} times this week`;
          const alt = categorizedInventory[slot].find(i => i.name !== item.name);
          if (alt) alternative = `Try ${alt.name} instead?`;
        }

        return {
          ...item,
          usageCount,
          varietyScore,
          warning,
          alternative
        };
      }).sort((a, b) => b.varietyScore - a.varietyScore);

      // Process Shopping Suggestions (Gap Analysis)
      // If we have few options (<= 2) or for variety, suggest items NOT in inventory.
      const worldOfLunch = this.getCommonLunchItems(slot);
      const ownedNames = categorizedInventory[slot].map(i => i.name.toLowerCase());

      const missingItems = worldOfLunch.filter(i => !ownedNames.some(owned => owned.includes(i.toLowerCase())));

      // Pick 1-2 random missing items to suggest buying
      if (missingItems.length > 0) {
        const suggestion1 = missingItems[Math.floor(Math.random() * missingItems.length)];
        suggestions[slot].shop.push({
          name: suggestion1,
          reason: "Variety injection",
          msg: `How about you buy ${suggestion1} this week?`
        });
      }
    }

    return suggestions;
  }

  getMissingIngredients(meal, inventory) {
    if (!meal.ingredients) return [];

    const missing = [];
    for (const ingredient of meal.ingredients) {
      const invItem = Object.values(inventory).find(i =>
        i.name && ingredient.name && i.name.toLowerCase().includes(ingredient.name.toLowerCase())
      );

      // If item doesn't exist or quantity is 0
      if (!invItem || invItem.quantity <= 0) {
        missing.push(ingredient.name);
      }
    }
    return missing;
  }

  getCommonLunchItems(slot) {
    const db = {
      'Main': ['Ham Sandwich', 'Turkey Wrap', 'Pasta Salad', 'Sushi Roll', 'Cheese & Crackers'],
      'Fruit': ['Apple', 'Banana', 'Grapes', 'Strawberries', 'Blueberries', 'Mandarin'],
      'Snack': ['Muesli Bar', 'LCM Bar', 'Yogurt Pouch', 'Cheese Stick', 'Popcorn'],
      'Treat': ['Chocolate Chip Cookie', 'Fruit Winder', 'Mini Muffin'],
      'Drink': ['Apple Juice', 'Orange Juice', 'Flavored Milk']
    };
    return db[slot] || [];
  }
}

module.exports = new AIService();
