const express = require('express');
const { body } = require('express-validator');
const syncController = require('../controllers/sync_controller');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const syncValidation = [
  body('clientId').notEmpty().withMessage('Client ID is required'),
  body('lastSyncTimestamp').optional().isISO8601().withMessage('Invalid timestamp format'),
  body('operations').optional().isArray().withMessage('Operations must be an array')
];

// Routes
router.post('/initiate', auth, syncValidation, syncController.initiateSync);
router.get('/status/:syncId', auth, syncController.getSyncStatus);
router.get('/pending', auth, syncController.getPendingOperations);

module.exports = router;
