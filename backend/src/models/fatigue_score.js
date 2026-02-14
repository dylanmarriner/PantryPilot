/**
 * Fatigue Score Model
 * Manages item fatigue calculations with deterministic cooldown logic
 */

class FatigueScore {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.itemId = data.itemId;
    this.userId = data.userId;
    this.currentFatigue = data.currentFatigue || 0;
    this.maxFatigue = data.maxFatigue || 100;
    this.fatigueIncrement = data.fatigueIncrement || 25;
    this.cooldownRate = data.cooldownRate || 5;
    this.lastSelection = data.lastSelection || null;
    this.lastCooldownCalculation = data.lastCooldownCalculation || null;
    this.selectionHistory = data.selectionHistory || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateId() {
    return `fatigue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  recordSelection() {
    this.currentFatigue = Math.min(this.currentFatigue + this.fatigueIncrement, this.maxFatigue);
    this.lastSelection = new Date().toISOString();
    this.selectionHistory.push({
      timestamp: this.lastSelection,
      fatigueBefore: this.currentFatigue - this.fatigueIncrement,
      fatigueAfter: this.currentFatigue
    });
    
    if (this.selectionHistory.length > 100) {
      this.selectionHistory = this.selectionHistory.slice(-50);
    }
    
    this.updatedAt = new Date().toISOString();
  }

  calculateCooldown() {
    if (!this.lastSelection) return 0;
    
    const now = new Date();
    const lastSelection = new Date(this.lastSelection);
    const daysSinceSelection = Math.floor((now - lastSelection) / (1000 * 60 * 60 * 24));
    
    const cooldownAmount = daysSinceSelection * this.cooldownRate;
    const newFatigue = Math.max(0, this.currentFatigue - cooldownAmount);
    
    this.lastCooldownCalculation = new Date().toISOString();
    this.currentFatigue = newFatigue;
    this.updatedAt = new Date().toISOString();
    
    return cooldownAmount;
  }

  getFatiguePercentage() {
    return (this.currentFatigue / this.maxFatigue) * 100;
  }

  isFatigued(threshold = 75) {
    this.calculateCooldown();
    return this.getFatiguePercentage() >= threshold;
  }

  getDaysSinceLastSelection() {
    if (!this.lastSelection) return Infinity;
    const lastSelection = new Date(this.lastSelection);
    const now = new Date();
    return Math.floor((now - lastSelection) / (1000 * 60 * 60 * 24));
  }

  getSelectionFrequency(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentSelections = this.selectionHistory.filter(
      selection => new Date(selection.timestamp) >= cutoffDate
    );
    
    return recentSelections.length;
  }

  reset() {
    this.currentFatigue = 0;
    this.lastSelection = null;
    this.lastCooldownCalculation = null;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      itemId: this.itemId,
      userId: this.userId,
      currentFatigue: this.currentFatigue,
      maxFatigue: this.maxFatigue,
      fatigueIncrement: this.fatigueIncrement,
      cooldownRate: this.cooldownRate,
      lastSelection: this.lastSelection,
      lastCooldownCalculation: this.lastCooldownCalculation,
      selectionHistory: this.selectionHistory,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new FatigueScore(json);
  }
}

module.exports = FatigueScore;
