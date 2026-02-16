const express = require('express');
const multer = require('multer');
const path = require('path');
const aiController = require('../controllers/ai_controller');

const router = express.Router();

// Multer setup for temporary image storage
const upload = multer({
    dest: 'uploads/temp/',
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/process', aiController.processText);
router.post('/suggestions', aiController.getSuggestions);
// Scan image or barcode
router.post('/scan', upload.single('image'), aiController.scanImage);

// Strategic Roadmap: Generate Weekly Plan
router.post('/generate-plan', aiController.generateWeeklyPlan);

module.exports = router;
