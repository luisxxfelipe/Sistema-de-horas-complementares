const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/me', authMiddleware, authController.me);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;
