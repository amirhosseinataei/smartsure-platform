const AuthService = require('../services/AuthService');
const Logger = require('../utils/Logger');

/**
 * کلاس Controller برای احراز هویت
 */
class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.logger = new Logger('AuthController');
  }

  /**
   * ثبت‌نام
   */
  async register(req, res, next) {
    try {
      const result = await this.authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'کاربر با موفقیت ثبت‌نام شد',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ورود
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await this.authService.login(username, password);
      
      res.json({
        success: true,
        message: 'ورود موفق',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * تمدید Token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * دریافت پروفایل کاربر
   */
  async getProfile(req, res, next) {
    try {
      const profile = await this.authService.getUserProfile(req.userId);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * تغییر رمز عبور
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await this.authService.changePassword(req.userId, currentPassword, newPassword);
      
      res.json({
        success: true,
        message: 'رمز عبور با موفقیت تغییر یافت'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

