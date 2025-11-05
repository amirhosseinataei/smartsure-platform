const User = require('../models/User');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const appConfig = require('../config/app');
const { AuthenticationError, ValidationError, NotFoundError } = require('../utils/ErrorHandler');
const Logger = require('../utils/Logger');

/**
 * کلاس Service برای احراز هویت و مدیریت کاربران
 */
class AuthService {
  constructor() {
    this.userModel = new User();
    this.customerModel = new Customer();
    this.logger = new Logger('AuthService');
  }

  /**
   * ثبت‌نام کاربر
   */
  async register(data) {
    try {
      // ایجاد کاربر
      const user = await this.userModel.create({
        username: data.username,
        password: data.password,
        email: data.email,
        fullname: data.fullname,
        phone: data.phone,
        role: data.role || 'customer'
      });

      // اگر کاربر customer است، ایجاد رکورد Customer
      if (user.role === 'customer' && data.national_id) {
        await this.customerModel.create({
          user_id: user.id,
          national_id: data.national_id,
          birthdate: data.birthdate,
          gender: data.gender,
          occupation: data.occupation
        });
      }

      // تولید JWT Token
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // حذف password_hash از پاسخ
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
        refreshToken
      };
    } catch (error) {
      this.logger.error('Registration error', error);
      throw error;
    }
  }

  /**
   * ورود کاربر
   */
  async login(username, password) {
    try {
      // پیدا کردن کاربر
      const user = await this.userModel.findByUsername(username);
      if (!user) {
        throw new AuthenticationError('نام کاربری یا رمز عبور اشتباه است');
      }

      // بررسی رمز عبور
      const isValidPassword = await this.userModel.verifyPassword(user, password);
      if (!isValidPassword) {
        throw new AuthenticationError('نام کاربری یا رمز عبور اشتباه است');
      }

      // به‌روزرسانی آخرین ورود
      await this.userModel.updateLastLogin(user.id);

      // تولید Token
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // حذف password_hash از پاسخ
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
        refreshToken
      };
    } catch (error) {
      this.logger.error('Login error', error);
      throw error;
    }
  }

  /**
   * تولید JWT Token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    return jwt.sign(payload, appConfig.jwt.secret, {
      expiresIn: appConfig.jwt.expiresIn
    });
  }

  /**
   * تولید Refresh Token
   */
  generateRefreshToken(user) {
    const payload = {
      id: user.id,
      type: 'refresh'
    };

    return jwt.sign(payload, appConfig.jwt.secret, {
      expiresIn: appConfig.jwt.refreshExpiresIn
    });
  }

  /**
   * تایید Token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, appConfig.jwt.secret);
    } catch (error) {
      throw new AuthenticationError('Token نامعتبر است');
    }
  }

  /**
   * تمدید Token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('Refresh Token نامعتبر است');
      }

      const user = await this.userModel.findById(decoded.id);
      if (!user) {
        throw new NotFoundError('کاربر');
      }

      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      this.logger.error('Refresh token error', error);
      throw error;
    }
  }

  /**
   * تغییر رمز عبور
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundError('کاربر');
      }

      // بررسی رمز عبور فعلی
      const isValidPassword = await this.userModel.verifyPassword(user, currentPassword);
      if (!isValidPassword) {
        throw new ValidationError('رمز عبور فعلی اشتباه است');
      }

      // به‌روزرسانی رمز عبور
      await this.userModel.updatePassword(userId, newPassword);

      return { success: true, message: 'رمز عبور با موفقیت تغییر یافت' };
    } catch (error) {
      this.logger.error('Change password error', error);
      throw error;
    }
  }

  /**
   * دریافت اطلاعات کاربر
   */
  async getUserProfile(userId) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundError('کاربر');
      }

      const { password_hash, ...userWithoutPassword } = user;

      // اگر کاربر customer است، اطلاعات Customer را هم اضافه کن
      if (user.role === 'customer') {
        const customer = await this.customerModel.findByUserId(userId);
        return {
          ...userWithoutPassword,
          customer
        };
      }

      return userWithoutPassword;
    } catch (error) {
      this.logger.error('Get user profile error', error);
      throw error;
    }
  }
}

module.exports = AuthService;

