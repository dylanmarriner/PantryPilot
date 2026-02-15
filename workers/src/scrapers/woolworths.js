const BaseScraper = require('./base_scraper');

class WoolworthsScraper extends BaseScraper {
  constructor(playwrightManager) {
    super('woolworths', playwrightManager);
    this.baseUrl = 'https://www.woolworths.co.nz';
  }

  async scrape() {
    const page = await this.createPage();
    const results = [];

    try {
      await page.goto(`${this.baseUrl}/shop/groceries`, { waitUntil: 'networkidle' });
      await this.delay(2000);

      const searchInput = await page.$('input[placeholder*="Search"]');
      if (searchInput) {
        await searchInput.click();
        await searchInput.type('milk');
        await this.delay(1000);
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
        await this.delay(3000);
      }

      const productElements = await page.$$('.product-tile, .grid-view-item, [data-testid*="product"]');
      
      for (let i = 0; i < Math.min(productElements.length, 20); i++) {
        try {
          const product = productElements[i];
          
          const nameElement = await product.$('.product-name, .title, h3, [data-testid*="product-name"]');
          const priceElement = await product.$('.price, .currency, [data-testid*="price"]');
          const sizeElement = await product.$('.size, .unit, .quantity, [data-testid*="size"]');
          
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
      console.error('Woolworths scraping error:', error);
      throw error;
    } finally {
      await page.close();
    }

    return results;
  }
}

module.exports = WoolworthsScraper;
