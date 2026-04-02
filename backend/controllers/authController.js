const tokenService = require('../services/tokenService');

/**
 * Auth Controller
 * Handles authentication and token generation
 */
class AuthController {
  /**
   * Generate API access token
   * @route POST /api/auth/token
   */
  async generateToken(req, res, next) {
    try {
      const { userId, role } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const token = tokenService.generateApiToken(userId, role || 'user');

      res.json({
        success: true,
        data: {
          token,
          expiresIn: '24h',
          userId,
          role: role || 'user'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify token
   * @route POST /api/auth/verify
   */
  async verifyToken(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }

      const decoded = tokenService.verifyApiToken(token);

      res.json({
        success: true,
        data: {
          valid: true,
          userId: decoded.userId,
          role: decoded.role,
          issuedAt: new Date(decoded.iat * 1000).toISOString()
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
