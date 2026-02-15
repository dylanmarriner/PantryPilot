const BaseScraper = require('./base_scraper');

class NewWorldScraper extends BaseScraper {
  constructor(playwrightManager) {
    super('new_world', playwrightManager);
    this.baseUrl = 'https://www.newworld.co.nz';
  }

  async scrape() {
    const page = await this.createPage();
    const results = [];

    try {
      await page.goto(`${this.baseUrl}/shop`, { waitUntil: 'networkidle' });
      await this.delay(2000);

      const searchInput = await page.$('input[placeholder*="Search"], input[type="search"], #search');
      if (searchInput) {
        await searchInput.click();
        await searchInput.type('bread');
        await this.delay(1000);
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
        await this.delay(3000);
      }

      const productElements = await page.$$('.product-card, .product-tile, .grid-item, [data-testid*="product"]');
      
      for (let i = 0; i < Math.min(productElements.length, 20); i++) {
        try {
          const product = productElements[i];
          
          const nameElement = await product.$('.product-name, .title, h3, h4, [data-testid*="product-name"]');
          const priceElement = await product.$('.price, .currency, .amount, [data-testid*="price"]');
          const sizeElement = await product.$('.size, .unit, .quantity, .weight, [data-testid*="size"]');
          
          if (!nameElement || !priceElement) continue;

          const name = await nameElement.textContent();
          const priceText = await priceElement.textContent();
          const sizeText = sizeElement ? await sizeElement.textContent() : '';
          const isOnSale = await this.isOnSale(product);

          const price = await this.extractPrice(priceText);
          const unitSize = await this.extractUnitSize(sizeText);

          if (price && name) {
            results.push({
              name: name.trim(),
              price: price,
              unitSize: unitSize,
              isOnSale: isOnSale,
              store: this.storeName,
              timestamp: new Date().toISOString()
            });
          }

          if (i % 5 === 0) {
            await this.delay(500);
          }
        } catch (error) {
          console.error(`Error processing product ${i}:`, error.message);
        }
      }

    } catch (error) {
      console.error('New World scraping error:', error);
      throw error;
    } finally {
      await page.close();
    }

    return results;
  }
}

module.exports = NewWorldScraper;
