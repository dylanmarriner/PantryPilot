class BaseScraper {
  constructor(storeName, playwrightManager) {
    this.storeName = storeName;
    this.playwrightManager = playwrightManager;
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async createPage() {
    const context = await this.playwrightManager.getContext();
    const page = await context.newPage();
    await page.setUserAgent(this.getRandomUserAgent());
    await page.setViewportSize({ width: 1920, height: 1080 });
    return page;
  }

  async extractPrice(priceText) {
    if (!priceText) return null;
    const cleanPrice = priceText.replace(/[^\d.]/g, '');
    const price = parseFloat(cleanPrice);
    if (isNaN(price)) return null;
    return Math.round(price * 100);
  }

  async extractUnitSize(sizeText) {
    if (!sizeText) return null;
    const normalized = sizeText.toLowerCase().trim();
    const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(g|kg|ml|l|ea|pack|bag|bottle|can|jar)$/);
    if (!match) return null;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    const conversions = {
      'kg': 1000,
      'l': 1000,
      'g': 1,
      'ml': 1,
      'ea': 1,
      'pack': 1,
      'bag': 1,
      'bottle': 1,
      'can': 1,
      'jar': 1
    };
    
    return {
      value: value,
      unit: unit,
      normalizedValue: value * (conversions[unit] || 1),
      baseUnit: unit === 'kg' || unit === 'l' ? (unit === 'kg' ? 'g' : 'ml') : unit
    };
  }

  async isOnSale(element) {
    const saleIndicators = [
      'sale', 'special', 'save', 'discount', 'was', 'now', 'reduced', 'clearance'
    ];
    
    const text = element.textContent?.toLowerCase() || '';
    return saleIndicators.some(indicator => text.includes(indicator));
  }

  async scrape() {
    throw new Error('scrape() method must be implemented by subclass');
  }

  async cleanup() {
    await this.playwrightManager.cleanup();
  }
}

module.exports = BaseScraper;
