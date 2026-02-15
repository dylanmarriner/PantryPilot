const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth_controller');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const resetPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/logout', auth, authController.logout);
router.get('/validate', auth, authController.validateToken);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
