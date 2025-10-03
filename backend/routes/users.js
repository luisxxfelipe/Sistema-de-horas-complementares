const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');

router.put('/me', authMiddleware, usersController.updateProfile);
router.get('/me/preferences', authMiddleware, usersController.getPreferences);
router.put('/me/preferences', authMiddleware, usersController.updatePreferences);
router.get('/me/login-logs', authMiddleware, usersController.getLoginLogs);

router.put('/me/password', authMiddleware, authController.updatePassword);

module.exports = router;
