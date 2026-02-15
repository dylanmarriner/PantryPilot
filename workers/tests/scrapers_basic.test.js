const BaseScraper = require('../src/scrapers/base_scraper');

// Mock PlaywrightManager for testing
class MockPlaywrightManager {
  async getContext() {
    return {
      newPage: jest.fn(() => ({
        setUserAgent: jest.fn(),
        setViewportSize: jest.fn(),
        goto: jest.fn(),
        $: jest.fn(),
        $$: jest.fn(),
        click: jest.fn(),
        type: jest.fn(),
        keyboard: { press: jest.fn() },
        waitForLoadState: jest.fn(),
        close: jest.fn()
      }))
    };
  }
  async cleanup() {}
}

describe('Basic Scraper Tests', () => {
  let baseScraper;
  let mockManager;

  beforeEach(() => {
    mockManager = new MockPlaywrightManager();
    baseScraper = new BaseScraper('test', mockManager);
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

  test('should validate currency as integer cents', async () => {
    const price1 = await baseScraper.extractPrice('$1.00');
    const price2 = await baseScraper.extractPrice('$1.99');
    const price3 = await baseScraper.extractPrice('$0.50');
    
    expect(price1).toBe(100);
    expect(price2).toBe(199);
    expect(price3).toBe(50);
    
    expect(typeof price1).toBe('number');
    expect(Number.isInteger(price1)).toBe(true);
  });
});
