const express = require('express');
const adminController = require('../controllers/admin_controller');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require both authentication and super-admin status
router.use(auth);
router.use(adminOnly);

router.get('/stats', adminController.getGlobalStats);
router.get('/health', adminController.getSystemHealth);
router.get('/financials', adminController.getFinancials);
router.get('/feature-flags', adminController.getFeatureFlags);
router.post('/feature-flags/:flagId/toggle', adminController.toggleFeatureFlag);

module.exports = router;
