/**
 * Lunch Slot Model
 * Represents a time slot for lunch planning with associated items and metadata
 */

class LunchSlot {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.timeSlot = data.timeSlot || 'lunch';
    this.items = data.items || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateId() {
    return `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addItem(item) {
    if (!item || !item.id) {
      throw new Error('Item must have an id property');
    }
    
    const existingIndex = this.items.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      this.items[existingIndex] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      this.items.push({ ...item, addedAt: new Date().toISOString() });
    }
    
    this.updatedAt = new Date().toISOString();
  }

  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.updatedAt = new Date().toISOString();
  }

  getItem(itemId) {
    return this.items.find(item => item.id === itemId);
  }

  getAllItems() {
    return [...this.items];
  }

  getItemCount() {
    return this.items.length;
  }

  toJSON() {
    return {
      id: this.id,
      date: this.date,
      timeSlot: this.timeSlot,
      items: this.items,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new LunchSlot(json);
  }
}

module.exports = LunchSlot;
