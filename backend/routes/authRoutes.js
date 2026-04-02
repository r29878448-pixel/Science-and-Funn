const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Generate API token
router.post('/token', authController.generateToken.bind(authController));

// Verify token
router.post('/verify', authController.verifyToken.bind(authController));

module.exports = router;
