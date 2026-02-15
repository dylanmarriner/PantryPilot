const express = require('express');
const usersController = require('../controllers/users_controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:userId/households', auth, usersController.getUserHouseholds);

module.exports = router;
