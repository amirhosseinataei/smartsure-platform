const AuthService = require('../services/AuthService');
const { AuthenticationError, AuthorizationError } = require('../utils/ErrorHandler');
const Logger = require('../utils/Logger');

/**
 * کلاس Middleware برای احراز هویت
 */
class AuthMiddleware {
  constructor() {
    this.authService = new AuthService();
    this.logger = new Logger('AuthMiddleware');
  }

  /**
   * بررسی Token و احراز هویت
   */
  authenticate() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new AuthenticationError('Token ارسال نشده است');
        }

        const token = authHeader.substring(7); // حذف 'Bearer '
        const decoded = this.authService.verifyToken(token);

        // اضافه کردن اطلاعات کاربر به Request
        req.user = decoded;
        req.userId = decoded.id;

        next();
      } catch (error) {
        this.logger.error('Authentication error', error);
        next(error);
      }
    };
  }

  /**
   * بررسی نقش کاربر
   */
  authorize(...allowedRoles) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          throw new AuthenticationError('کاربر احراز هویت نشده است');
        }

        if (!allowedRoles.includes(req.user.role)) {
          throw new AuthorizationError('دسترسی غیرمجاز');
        }

        next();
      } catch (error) {
        this.logger.error('Authorization error', error);
        next(error);
      }
    };
  }

  /**
   * ترکیب احراز هویت و بررسی نقش
   */
  requireAuth(...allowedRoles) {
    return [
      this.authenticate(),
      ...(allowedRoles.length > 0 ? [this.authorize(...allowedRoles)] : [])
    ];
  }
}

module.exports = new AuthMiddleware();

