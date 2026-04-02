const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// Get PDF by ID (streams or redirects)
router.get('/:id', pdfController.getPdf.bind(pdfController));

// Get PDF URL (returns decrypted URL)
router.get('/:id/url', pdfController.getPdfUrl.bind(pdfController));

module.exports = router;
