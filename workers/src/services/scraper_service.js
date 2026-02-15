const PlaywrightManager = require('../utils/playwright_manager');
const WoolworthsScraper = require('../scrapers/woolworths');
const NewWorldScraper = require('../scrapers/new_world');
const PakNSaveScraper = require('../scrapers/pak_n_save');

class ScraperService {
  constructor() {
    this.playwrightManager = new PlaywrightManager();
    this.scrapers = {
      woolworths: new WoolworthsScraper(this.playwrightManager),
      new_world: new NewWorldScraper(this.playwrightManager),
      pak_n_save: new PakNSaveScraper(this.playwrightManager)
    };
  }

  async initialize() {
    await this.playwrightManager.initialize();
  }

  async scrapeAllStores() {
    const results = {
      woolworths: [],
      new_world: [],
      pak_n_save: [],
      errors: []
    };

    for (const [storeName, scraper] of Object.entries(this.scrapers)) {
      try {
        console.log(`Starting scrape for ${storeName}...`);
        const storeResults = await scraper.scrape();
        results[storeName] = storeResults;
        console.log(`Completed scrape for ${storeName}: ${storeResults.length} products found`);
        
        await this.delay(2000);
      } catch (error) {
        console.error(`Failed to scrape ${storeName}:`, error);
        results.errors.push({
          store: storeName,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  async scrapeStore(storeName) {
    if (!this.scrapers[storeName]) {
      throw new Error(`Unknown store: ${storeName}`);
    }

    try {
      return await this.scrapers[storeName].scrape();
    } catch (error) {
      console.error(`Failed to scrape ${storeName}:`, error);
      throw error;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup() {
    await this.playwrightManager.cleanup();
  }

  validateScrapedData(data) {
    const validated = [];
    
    for (const item of data) {
      if (!item.name || typeof item.price !== 'number' || item.price <= 0) {
        console.warn('Invalid scraped item:', item);
        continue;
      }

      if (item.price > 100000) {
        console.warn('Suspicious price detected:', item);
        continue;
      }

      validated.push({
        ...item,
        name: item.name.trim().substring(0, 255),
        price: Math.round(item.price),
        timestamp: item.timestamp || new Date().toISOString()
      });
    }

    return validated;
  }
}

module.exports = ScraperService;
