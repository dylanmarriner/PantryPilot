const express = require('express');
const router = express.Router();
const groceryListController = require('../controllers/grocery_list_controller');

router.get('/', (req, res) => groceryListController.getList(req, res));
router.post('/add', (req, res) => groceryListController.addItem(req, res));
router.post('/generate', (req, res) => groceryListController.generateList(req, res)); // For Sync button
router.put('/:id', (req, res) => groceryListController.updateItem(req, res));

module.exports = router;
