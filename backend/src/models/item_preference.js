/**
 * Item Preference Model
 * Tracks user preferences for lunch items with scoring and metadata
 */

class ItemPreference {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.itemId = data.itemId;
    this.userId = data.userId;
    this.preferenceScore = data.preferenceScore || 0;
    this.category = data.category || 'neutral';
    this.tags = data.tags || [];
    this.lastUsed = data.lastUsed || null;
    this.usageCount = data.usageCount || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateId() {
    return `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  updateScore(newScore) {
    if (typeof newScore !== 'number' || newScore < -1 || newScore > 1) {
      throw new Error('Preference score must be a number between -1 and 1');
    }
    this.preferenceScore = newScore;
    this.updatedAt = new Date().toISOString();
    this.updateCategory();
  }

  updateCategory() {
    if (this.preferenceScore > 0.5) {
      this.category = 'preferred';
    } else if (this.preferenceScore < -0.5) {
      this.category = 'disliked';
    } else {
      this.category = 'neutral';
    }
  }

  recordUsage() {
    this.usageCount += 1;
    this.lastUsed = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date().toISOString();
    }
  }

  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    this.updatedAt = new Date().toISOString();
  }

  getDaysSinceLastUsed() {
    if (!this.lastUsed) return Infinity;
    const lastUsed = new Date(this.lastUsed);
    const now = new Date();
    return Math.floor((now - lastUsed) / (1000 * 60 * 60 * 24));
  }

  toJSON() {
    return {
      id: this.id,
      itemId: this.itemId,
      userId: this.userId,
      preferenceScore: this.preferenceScore,
      category: this.category,
      tags: this.tags,
      lastUsed: this.lastUsed,
      usageCount: this.usageCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new ItemPreference(json);
  }
}

module.exports = ItemPreference;
