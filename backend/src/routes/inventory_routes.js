const express = require('express');
const { param, body } = require('express-validator');
const inventoryController = require('../controllers/inventory_controller');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const itemValidation = [
  body('name').notEmpty().withMessage('Item name is required'),
  body('quantity').optional().isNumeric().withMessage('Quantity must be numeric'),
  body('unit').optional().isString().withMessage('Unit must be a string'),
  body('price').optional().isNumeric().withMessage('Price must be numeric')
];

const updateValidation = [
  param('itemId').notEmpty().withMessage('Item ID is required'),
  body('quantity').optional().isNumeric().withMessage('Quantity must be numeric'),
  body('name').optional().isString().withMessage('Name must be a string'),
  body('unit').optional().isString().withMessage('Unit must be a string'),
  body('price').optional().isNumeric().withMessage('Price must be numeric')
];

// Routes
router.get('/', auth, inventoryController.getInventory);
router.post('/', auth, itemValidation, inventoryController.addItem);
router.get('/:itemId', auth, inventoryController.getItem);
router.put('/:itemId', auth, updateValidation, inventoryController.updateItem);
router.delete('/:itemId', auth, inventoryController.deleteItem);

module.exports = router;
