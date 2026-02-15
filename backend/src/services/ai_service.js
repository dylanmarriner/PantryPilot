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
}

module.exports = new AIService();
