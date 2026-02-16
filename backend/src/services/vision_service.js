const axios = require('axios');

class VisionService {
    constructor() {
        this.openFoodFactsUrl = 'https://world.openfoodfacts.org/api/v0/product/';
    }

    /**
     * Identifies an item by its barcode using OpenFoodFacts API
     * @param {string} barcode 
     * @returns {Promise<Object>}
     */
    async identifyByBarcode(barcode) {
        if (!barcode) {
            throw new Error('Barcode is required');
        }

        try {
            const response = await axios.get(`${this.openFoodFactsUrl}${barcode}.json`);
            const data = response.data;

            if (data.status === 1) {
                const product = data.product;
                return {
                    name: product.product_name || 'Unknown Item',
                    brand: product.brands || '',
                    quantity: product.quantity || '1',
                    category: this.mapCategory(product.categories_tags?.[0] || ''),
                    image: product.image_url || null,
                    metadata: {
                        source: 'OpenFoodFacts',
                        fullData: data.product
                    }
                };
            }

            return {
                name: 'Unrecognized Item',
                barcode,
                status: 'not_found'
            };
        } catch (error) {
            console.error('Error fetching from OpenFoodFacts:', error);
            throw new Error('Failed to lookup barcode');
        }
    }

    /**
     * Processes a photo using OCR to extract item details (Mock for now)
     * @param {string} imagePath 
     * @returns {Promise<Object>}
     */
    async processPhotoOCR(imagePath) {
        // In a production app, we would use Google Vision API or Tesseract.js here.
        // For now, we simulate basic OCR results.
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    name: 'Manual Scan Result',
                    quantity: '1',
                    unit: 'pc',
                    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Mocking 1 week
                    confidence: 0.85
                });
            }, 1000);
        });
    }

    /**
     * Maps OpenFoodFacts categories to PantryPilot categories
     * @param {string} tag 
     * @returns {string}
     */
    mapCategory(tag) {
        const lowerTag = tag.toLowerCase();
        if (lowerTag.includes('dairy') || lowerTag.includes('milk') || lowerTag.includes('cheese')) return 'Dairy';
        if (lowerTag.includes('produce') || lowerTag.includes('fruit') || lowerTag.includes('vegetable')) return 'Produce';
        if (lowerTag.includes('meat') || lowerTag.includes('poultry') || lowerTag.includes('beef')) return 'Meat';
        if (lowerTag.includes('grain') || lowerTag.includes('bread') || lowerTag.includes('pasta')) return 'Grains';
        if (lowerTag.includes('snack') || lowerTag.includes('candy') || lowerTag.includes('cookie')) return 'Snacks';
        return 'Other';
    }
}

module.exports = new VisionService();
