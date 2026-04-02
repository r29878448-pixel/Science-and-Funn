const apiService = require('../services/apiService');
const decryptionService = require('../services/decryptionService');
const tokenService = require('../services/tokenService');

/**
 * Content Controller
 * Handles content fetching and processing
 */
class ContentController {
  /**
   * Get content for a course
   * @route GET /api/content/:courseId
   */
  async getContent(req, res, next) {
    try {
      const { courseId } = req.params;
      const { parent_id } = req.query;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      // Fetch content from external API
      const content = await apiService.fetchContent(courseId, parent_id);

      // Process content items
      const processedContent = content.map(item => {
        const processed = {
          id: item.id,
          title: item.Title || item.title || item.name,
          type: item.material_type || item.type,
          parent_id: item.parent_id,
          created_at: item.created_at,
          thumbnail: item.video_thumbnail || item.thumbnail,
          duration: item.duration
        };

        // Handle PDF files - create secure access token
        if (processed.type === 'PDF' && item.file_link) {
          // Generate secure token for PDF access
          const pdfToken = tokenService.generatePdfToken(item.id);
          processed.pdf_access_token = pdfToken;
          processed.pdf_url = `/api/pdf/${item.id}?token=${pdfToken}`;
          // DO NOT expose raw encrypted or decrypted link
        }

        // Handle video files
        if (processed.type === 'VIDEO') {
          processed.video_id = item.id;
          processed.has_pdf = !!item.file_link;
        }

        return processed;
      });

      res.json({
        success: true,
        data: processedContent,
        count: processedContent.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get batches/courses
   * @route GET /api/content/batches
   */
  async getBatches(req, res, next) {
    try {
      const batches = await apiService.fetchBatches();

      res.json({
        success: true,
        data: batches,
        count: batches.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update base API URL (admin only)
   * @route POST /api/content/config
   */
  async updateConfig(req, res, next) {
    try {
      const { baseUrl } = req.body;

      if (!baseUrl) {
        return res.status(400).json({
          success: false,
          message: 'Base URL is required'
        });
      }

      // Validate URL format
      try {
        new URL(baseUrl);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL format'
        });
      }

      // Update base URL
      apiService.setBaseUrl(baseUrl);
      apiService.clearCache();

      res.json({
        success: true,
        message: 'Base API URL updated successfully',
        baseUrl: apiService.getBaseUrl()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current configuration
   * @route GET /api/content/config
   */
  async getConfig(req, res, next) {
    try {
      res.json({
        success: true,
        config: {
          baseUrl: apiService.getBaseUrl(),
          cacheStats: apiService.getCacheStats()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContentController();
