const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

/**
 * External API Service
 * Handles all external API calls with caching
 */
class ApiService {
  constructor() {
    this.baseUrl = process.env.BASE_API_URL || 'https://ABD.onrender.com';
    this.timeout = 10000; // 10 seconds
  }

  /**
   * Set base API URL (admin configurable)
   * @param {string} url - New base URL
   */
  setBaseUrl(url) {
    this.baseUrl = url;
    console.log('✅ Base API URL updated:', url);
  }

  /**
   * Get current base URL
   * @returns {string} - Current base URL
   */
  getBaseUrl() {
    return this.baseUrl;
  }

  /**
   * Fetch content from external API
   * @param {string} courseId - Course ID
   * @param {string} parentId - Parent folder ID (optional)
   * @returns {Promise<Array>} - Content items
   */
  async fetchContent(courseId, parentId = null) {
    try {
      // Create cache key
      const cacheKey = `content_${courseId}_${parentId || 'root'}`;
      
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log('📦 Cache hit:', cacheKey);
        return cached;
      }

      // Build URL
      let url = `${this.baseUrl}/api/scienceandfun/content?course_id=${courseId}`;
      if (parentId) {
        url += `&parent_id=${parentId}`;
      }

      console.log('🌐 Fetching:', url);

      // Make request
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'ScienceAndFun-Backend/1.0'
        }
      });

      const data = response.data?.data || response.data || [];
      
      // Cache the result
      cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('API fetch error:', error.message);
      throw new Error('Failed to fetch content from external API');
    }
  }

  /**
   * Fetch batches/courses
   * @returns {Promise<Array>} - List of batches
   */
  async fetchBatches() {
    try {
      const cacheKey = 'batches';
      
      // Check cache
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log('📦 Cache hit:', cacheKey);
        return cached;
      }

      const url = `${this.baseUrl}/api/scienceandfun/batches`;
      console.log('🌐 Fetching batches:', url);

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'ScienceAndFun-Backend/1.0'
        }
      });

      const data = response.data?.data || response.data || [];
      
      // Cache for 10 minutes
      cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Batches fetch error:', error.message);
      throw new Error('Failed to fetch batches');
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    cache.flushAll();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache stats
   * @returns {object} - Cache statistics
   */
  getCacheStats() {
    return cache.getStats();
  }
}

module.exports = new ApiService();
