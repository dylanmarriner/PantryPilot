const aiService = require('../services/ai_service');

class AIController {
  async processText(req, res) {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const actions = await aiService.extractActions(text);
      res.json({ actions });
    } catch (error) {
      console.error('Error processing text:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSuggestions(req, res) {
    try {
      const { inventory } = req.body;
      
      if (!inventory) {
        return res.status(400).json({ error: 'Inventory data is required' });
      }

      const suggestions = await aiService.generateSuggestions(inventory);
      res.json({ suggestions });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AIController();
