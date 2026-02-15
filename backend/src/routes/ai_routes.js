const express = require('express');
const aiController = require('../controllers/ai_controller');

const router = express.Router();

router.post('/process', aiController.processText);
router.post('/suggestions', aiController.getSuggestions);

module.exports = router;
