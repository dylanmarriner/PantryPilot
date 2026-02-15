class ActionExtractor {
  extract(text) {
    const actions = [];
    
    const consumeActions = this.extractConsumeActions(text);
    actions.push(...consumeActions);
    
    const purchaseActions = this.extractPurchaseActions(text);
    actions.push(...purchaseActions);
    
    const mealActions = this.extractMealActions(text);
    actions.push(...mealActions);

    return this.deduplicateActions(actions);
  }

  deduplicateActions(actions) {
    const uniqueActions = [];
    const seen = new Set();

    for (const action of actions) {
      const key = `${action.type}-${action.item}-${action.quantity}-${action.unit}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueActions.push(action);
      }
    }

    return uniqueActions;
  }

  extractConsumeActions(text) {
    const actions = [];
    const consumePatterns = [
      /(?:ate|used|consumed|finished|drank)\s+(\d+(?:\.\d+)?)\s*(g|grams?|kg|kilograms?|l|liters?|ml|milliliters?|cups?|tbsp|tablespoons?|tsp|teaspoons?|pieces?|items?|cans?|bottles?|boxes?)\s+(?:of\s+)?([a-zA-Z\s]{2,})/gi,
      /(?:ate|used|consumed|finished|drank)\s+(\d+(?:\.\d+)?)\s+(?:of\s+)?([a-zA-Z\s]{2,})/gi,
      /(?:ate|used|consumed|finished|drank)\s+([a-zA-Z\s]{2,})/gi
    ];

    const normalizedText = text.toLowerCase();

    for (const pattern of consumePatterns) {
      let match;
      while ((match = pattern.exec(normalizedText)) !== null) {
        let quantity, unit, item;
        
        if (match[1] && /^\d+(?:\.\d+)?$/.test(match[1])) {
          quantity = this.parseQuantity(match[1]);
          unit = this.parseUnit(match[2] || 'pieces');
          item = this.cleanItemName(match[3] || match[2] || '');
        } else {
          quantity = 1;
          unit = 'pieces';
          item = this.cleanItemName(match[1] || '');
        }

        if (item && item.length > 1 && !this.isPronoun(item) && quantity > 0) {
          actions.push({
            type: 'consume',
            item: item.trim(),
            quantity: quantity,
            unit: unit,
            confidence: this.calculateConfidence(match[0])
          });
        }
      }
    }

    return actions;
  }

  extractPurchaseActions(text) {
    const actions = [];
    const purchasePatterns = [
      /(?:bought|purchased|added|got|acquired)\s+(\d+(?:\.\d+)?)\s*(g|grams?|kg|kilograms?|l|liters?|ml|milliliters?|cups?|tbsp|tablespoons?|tsp|teaspoons?|pieces?|items?|cans?|bottles?|boxes?)\s+(?:of\s+)?([a-zA-Z\s]{2,})/gi,
      /(?:bought|purchased|added|got|acquired)\s+(\d+(?:\.\d+)?)\s+(?:of\s+)?([a-zA-Z\s]{2,})/gi,
      /(?:bought|purchased|added|got|acquired)\s+([a-zA-Z\s]{2,})/gi
    ];

    const normalizedText = text.toLowerCase();

    for (const pattern of purchasePatterns) {
      let match;
      while ((match = pattern.exec(normalizedText)) !== null) {
        let quantity, unit, item;
        
        if (match[1] && /^\d+(?:\.\d+)?$/.test(match[1])) {
          quantity = this.parseQuantity(match[1]);
          unit = this.parseUnit(match[2] || 'pieces');
          item = this.cleanItemName(match[3] || match[2] || '');
        } else {
          quantity = 1;
          unit = 'pieces';
          item = this.cleanItemName(match[1] || '');
        }

        if (item && item.length > 1 && !this.isPronoun(item) && quantity > 0) {
          actions.push({
            type: 'purchase',
            item: item.trim(),
            quantity: quantity,
            unit: unit,
            confidence: this.calculateConfidence(match[0])
          });
        }
      }
    }

    return actions;
  }

  extractMealActions(text) {
    const actions = [];
    const mealPatterns = [
      /(?:cooked|made|prepared)\s+([a-zA-Z\s]+)/gi,
      /(?:had|ate)\s+(?:breakfast|lunch|dinner|supper|meal|snack)\s+(?:with|containing|of)\s+([a-zA-Z\s]+)/gi,
      /(?:breakfast|lunch|dinner|supper|meal|snack):\s*([a-zA-Z\s]+)/gi
    ];

    const normalizedText = text.toLowerCase();

    for (const pattern of mealPatterns) {
      let match;
      while ((match = pattern.exec(normalizedText)) !== null) {
        const mealDescription = this.cleanItemName(match[1]);
        
        if (mealDescription) {
          const ingredients = this.extractIngredientsFromMeal(mealDescription);
          
          actions.push({
            type: 'meal',
            description: mealDescription.trim(),
            ingredients: ingredients,
            confidence: this.calculateConfidence(match[0])
          });
        }
      }
    }

    return actions;
  }

  extractIngredientsFromMeal(mealDescription) {
    const commonIngredients = [
      'rice', 'pasta', 'chicken', 'beef', 'pork', 'fish', 'eggs', 'milk', 'cheese',
      'bread', 'butter', 'oil', 'salt', 'pepper', 'onion', 'garlic', 'tomato', 'potato',
      'carrot', 'broccoli', 'spinach', 'flour', 'sugar', 'beans', 'lentils'
    ];

    const ingredients = [];
    const words = mealDescription.toLowerCase().split(/\s+/);

    for (const ingredient of commonIngredients) {
      if (words.includes(ingredient)) {
        ingredients.push(ingredient);
      }
    }

    return ingredients;
  }

  parseQuantity(quantityStr) {
    if (!quantityStr) return 1;
    
    const quantity = parseFloat(quantityStr);
    return isNaN(quantity) ? 1 : Math.max(0.1, quantity);
  }

  parseUnit(unitStr) {
    if (!unitStr) return 'pieces';
    
    const unitMap = {
      'g': 'grams',
      'gram': 'grams',
      'grams': 'grams',
      'kg': 'kilograms',
      'kilogram': 'kilograms',
      'kilograms': 'kilograms',
      'l': 'liters',
      'liter': 'liters',
      'liters': 'liters',
      'ml': 'milliliters',
      'milliliter': 'milliliters',
      'milliliters': 'milliliters',
      'cup': 'cups',
      'cups': 'cups',
      'tbsp': 'tablespoons',
      'tablespoon': 'tablespoons',
      'tablespoons': 'tablespoons',
      'tsp': 'teaspoons',
      'teaspoon': 'teaspoons',
      'teaspoons': 'teaspoons',
      'piece': 'pieces',
      'pieces': 'pieces',
      'item': 'pieces',
      'items': 'pieces',
      'can': 'cans',
      'cans': 'cans',
      'bottle': 'bottles',
      'bottles': 'bottles',
      'box': 'boxes',
      'boxes': 'boxes'
    };

    const normalizedUnit = unitStr.toLowerCase().trim();
    return unitMap[normalizedUnit] || 'pieces';
  }

  isPronoun(word) {
    const pronouns = ['i', 'me', 'my', 'mine', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its', 'we', 'us', 'our', 'ours', 'they', 'them', 'their', 'theirs'];
    return pronouns.includes(word.toLowerCase().trim());
  }

  cleanItemName(itemName) {
    if (!itemName) return '';
    
    return itemName
      .replace(/\b(the|a|an|some|my|our|their|his|her|its)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  calculateConfidence(matchText) {
    if (!matchText) return 0.5;
    
    let confidence = 0.5;
    
    if (/\d+/.test(matchText)) {
      confidence += 0.2;
    }
    
    if (/(grams?|kilograms?|liters?|cups?|tablespoons?|teaspoons?)/i.test(matchText)) {
      confidence += 0.2;
    }
    
    if (matchText.length > 10) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }
}

module.exports = new ActionExtractor();
