const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/generate', authMiddleware, pdfController.generate);

module.exports = router;
