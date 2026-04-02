const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Get batches
router.get('/batches', contentController.getBatches.bind(contentController));

// Get content for a course
router.get('/:courseId', contentController.getContent.bind(contentController));

// Get/Update configuration (admin only)
router.get('/config/current', contentController.getConfig.bind(contentController));
router.post('/config/update', contentController.updateConfig.bind(contentController));

module.exports = router;
