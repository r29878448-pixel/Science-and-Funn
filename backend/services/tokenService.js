const jwt = require('jsonwebtoken');

/**
 * JWT Token Service
 * Handles token generation and verification for secure PDF access
 */
class TokenService {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    this.pdfTokenExpiry = parseInt(process.env.PDF_TOKEN_EXPIRY) || 10; // minutes
  }

  /**
   * Generate PDF access token
   * @param {string} pdfId - PDF identifier
   * @param {string} userId - User identifier (optional)
   * @returns {string} - JWT token
   */
  generatePdfToken(pdfId, userId = 'anonymous') {
    const payload = {
      pdfId,
      userId,
      type: 'pdf_access',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: `${this.pdfTokenExpiry}m`
    });
  }

  /**
   * Verify PDF access token
   * @param {string} token - JWT token
   * @returns {object} - Decoded token payload
   */
  verifyPdfToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret);
      
      if (decoded.type !== 'pdf_access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('PDF access token has expired');
      }
      throw new Error('Invalid PDF access token');
    }
  }

  /**
   * Generate API access token (for admin)
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @returns {string} - JWT token
   */
  generateApiToken(userId, role = 'user') {
    const payload = {
      userId,
      role,
      type: 'api_access',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: '24h'
    });
  }

  /**
   * Verify API access token
   * @param {string} token - JWT token
   * @returns {object} - Decoded token payload
   */
  verifyApiToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret);
      
      if (decoded.type !== 'api_access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('API token has expired');
      }
      throw new Error('Invalid API token');
    }
  }
}

module.exports = new TokenService();
