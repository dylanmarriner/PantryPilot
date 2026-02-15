const { chromium } = require('playwright');

class PlaywrightManager {
  constructor() {
    this.browser = null;
    this.context = null;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }

    if (!this.context) {
      this.context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true
      });
    }
  }

  async getContext() {
    if (!this.context) {
      await this.initialize();
    }
    return this.context;
  }

  async getBrowser() {
    if (!this.browser) {
      await this.initialize();
    }
    return this.browser;
  }

  async cleanup() {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async restart() {
    await this.cleanup();
    await this.initialize();
  }
}

module.exports = PlaywrightManager;
