const BaseScraper = require('../src/scrapers/base_scraper');
const WoolworthsScraper = require('../src/scrapers/woolworths');
const NewWorldScraper = require('../src/scrapers/new_world');
const PakNSaveScraper = require('../src/scrapers/pak_n_save');
const PlaywrightManager = require('../src/utils/playwright_manager');
const ScraperService = require('../src/services/scraper_service');

describe('Scraper Tests', () => {
  let playwrightManager;

  beforeAll(async () => {
    playwrightManager = new PlaywrightManager();
    await playwrightManager.initialize();
  });

  afterAll(async () => {
    await playwrightManager.cleanup();
  });

  describe('BaseScraper', () => {
    let baseScraper;

    beforeEach(() => {
      baseScraper = new BaseScraper('test', playwrightManager);
    });

    test('should extract price correctly', async () => {
      const price = await baseScraper.extractPrice('$5.99');
      expect(price).toBe(599);
    });

    test('should handle invalid price', async () => {
      const price = await baseScraper.extractPrice('invalid');
      expect(price).toBeNull();
    });

    test('should extract unit size correctly', async () => {
      const unitSize = await baseScraper.extractUnitSize('500g');
      expect(unitSize).toEqual({
        value: 500,
        unit: 'g',
        normalizedValue: 500,
        baseUnit: 'g'
      });
    });

    test('should normalize kg to g', async () => {
      const unitSize = await baseScraper.extractUnitSize('1.5kg');
      expect(unitSize).toEqual({
        value: 1.5,
        unit: 'kg',
        normalizedValue: 1500,
        baseUnit: 'g'
      });
    });

    test('should detect sale indicators', async () => {
      const mockElement = {
        textContent: 'Special Offer - Save $2!'
      };
      const isOnSale = await baseScraper.isOnSale(mockElement);
      expect(isOnSale).toBe(true);
    });

    test('should not detect sale when not present', async () => {
      const mockElement = {
        textContent: 'Regular Price'
      };
      const isOnSale = await baseScraper.isOnSale(mockElement);
      expect(isOnSale).toBe(false);
    });
  });

  describe('Store Scrapers', () => {
    test('WoolworthsScraper should be instantiated correctly', () => {
      const scraper = new WoolworthsScraper(playwrightManager);
      expect(scraper.storeName).toBe('woolworths');
      expect(scraper.baseUrl).toBe('https://www.woolworths.co.nz');
    });

    test('NewWorldScraper should be instantiated correctly', () => {
      const scraper = new NewWorldScraper(playwrightManager);
      expect(scraper.storeName).toBe('new_world');
      expect(scraper.baseUrl).toBe('https://www.newworld.co.nz');
    });

    test('PakNSaveScraper should be instantiated correctly', () => {
      const scraper = new PakNSaveScraper(playwrightManager);
      expect(scraper.storeName).toBe('pak_n_save');
      expect(scraper.baseUrl).toBe('https://www.paknsave.co.nz');
    });
  });

  describe('ScraperService', () => {
    let scraperService;

    beforeEach(() => {
      scraperService = new ScraperService();
    });

    afterEach(async () => {
      await scraperService.cleanup();
    });

    test('should initialize correctly', async () => {
      await scraperService.initialize();
      expect(scraperService.playwrightManager).toBeDefined();
      expect(scraperService.scrapers).toBeDefined();
    });

    test('should validate scraped data correctly', () => {
      const invalidData = [
        { name: '', price: 599 },
        { name: 'Test Product', price: -100 },
        { name: 'Test Product', price: 1000000 }
      ];

      const validData = [
        { name: 'Test Product', price: 599, timestamp: '2024-01-01T00:00:00Z' }
      ];

      const validated = scraperService.validateScrapedData([...invalidData, ...validData]);
      expect(validated).toHaveLength(1);
      expect(validated[0].name).toBe('Test Product');
      expect(validated[0].price).toBe(599);
    });

    test('should handle unknown store error', async () => {
      await expect(scraperService.scrapeStore('unknown_store'))
        .rejects.toThrow('Unknown store: unknown_store');
    });
  });

  describe('PlaywrightManager', () => {
    let manager;

    beforeEach(() => {
      manager = new PlaywrightManager();
    });

    afterEach(async () => {
      await manager.cleanup();
    });

    test('should initialize browser and context', async () => {
      await manager.initialize();
      expect(manager.browser).toBeDefined();
      expect(manager.context).toBeDefined();
    });

    test('should cleanup correctly', async () => {
      await manager.initialize();
      await manager.cleanup();
      expect(manager.browser).toBeNull();
      expect(manager.context).toBeNull();
    });

    test('should restart correctly', async () => {
      await manager.initialize();
      const oldBrowser = manager.browser;
      await manager.restart();
      expect(manager.browser).toBeDefined();
      expect(manager.browser).not.toBe(oldBrowser);
    });
  });
});
