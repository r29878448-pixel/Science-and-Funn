const apiService = require('../services/apiService');
const decryptionService = require('../services/decryptionService');
const tokenService = require('../services/tokenService');
const axios = require('axios');

/**
 * PDF Controller
 * Handles secure PDF access with decryption
 */
class PdfController {
  /**
   * Get PDF by ID with token verification
   * @route GET /api/pdf/:id
   */
  async getPdf(req, res, next) {
    try {
      const { id } = req.params;
      const { token, course_id, parent_id } = req.query;

      // Verify token
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token is required'
        });
      }

      try {
        const decoded = tokenService.verifyPdfToken(token);
        
        // Verify PDF ID matches token
        if (decoded.pdfId !== id) {
          return res.status(403).json({
            success: false,
            message: 'Token does not match PDF ID'
          });
        }
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      // Fetch content to get encrypted PDF link
      const content = await apiService.fetchContent(course_id, parent_id);
      const pdfItem = content.find(item => item.id === id);

      if (!pdfItem) {
        return res.status(404).json({
          success: false,
          message: 'PDF not found'
        });
      }

      if (!pdfItem.file_link) {
        return res.status(404).json({
          success: false,
          message: 'PDF link not available'
        });
      }

      // Decrypt PDF link
      const decryptedUrl = decryptionService.decryptPdfLink(pdfItem);

      if (!decryptedUrl || !decryptionService.isValidUrl(decryptedUrl)) {
        return res.status(500).json({
          success: false,
          message: 'Failed to decrypt PDF link'
        });
      }

      console.log('✅ PDF decrypted successfully for ID:', id);

      // Option 1: Redirect to decrypted URL
      // res.redirect(decryptedUrl);

      // Option 2: Stream PDF (more secure)
      try {
        const pdfResponse = await axios.get(decryptedUrl, {
          responseType: 'stream',
          timeout: 30000
        });

        // Set headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${pdfItem.Title || 'document'}.pdf"`);
        res.setHeader('Cache-Control', 'private, max-age=300'); // 5 minutes cache

        // Stream PDF to client
        pdfResponse.data.pipe(res);
      } catch (streamError) {
        console.error('PDF streaming error:', streamError.message);
        // Fallback to redirect
        res.redirect(decryptedUrl);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get PDF URL (returns decrypted URL with short expiry)
   * @route GET /api/pdf/:id/url
   */
  async getPdfUrl(req, res, next) {
    try {
      const { id } = req.params;
      const { token, course_id, parent_id } = req.query;

      // Verify token
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token is required'
        });
      }

      try {
        const decoded = tokenService.verifyPdfToken(token);
        
        if (decoded.pdfId !== id) {
          return res.status(403).json({
            success: false,
            message: 'Token does not match PDF ID'
          });
        }
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      // Fetch and decrypt
      const content = await apiService.fetchContent(course_id, parent_id);
      const pdfItem = content.find(item => item.id === id);

      if (!pdfItem || !pdfItem.file_link) {
        return res.status(404).json({
          success: false,
          message: 'PDF not found'
        });
      }

      const decryptedUrl = decryptionService.decryptPdfLink(pdfItem);

      if (!decryptedUrl || !decryptionService.isValidUrl(decryptedUrl)) {
        return res.status(500).json({
          success: false,
          message: 'Failed to decrypt PDF link'
        });
      }

      res.json({
        success: true,
        data: {
          url: decryptedUrl,
          title: pdfItem.Title || pdfItem.title,
          expiresIn: '5 minutes',
          warning: 'This URL will expire soon. Do not share.'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PdfController();
