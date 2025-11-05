const BaseModel = require('./BaseModel');
const bcrypt = require('bcrypt');
const { NotFoundError, DuplicateError } = require('../utils/ErrorHandler');

/**
 * کلاس Model برای کاربران
 */
class User extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * پیدا کردن کاربر بر اساس نام کاربری
   */
  async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = @username';
    const result = await this.query(query, { username });
    return result.length > 0 ? result[0] : null;
  }

  /**
   * پیدا کردن کاربر بر اساس ایمیل
   */
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = @email';
    const result = await this.query(query, { email });
    return result.length > 0 ? result[0] : null;
  }

  /**
   * ایجاد کاربر جدید
   */
  async create(data) {
    // بررسی تکراری بودن نام کاربری
    const existingUser = await this.findByUsername(data.username);
    if (existingUser) {
      throw new DuplicateError('نام کاربری');
    }

    // بررسی تکراری بودن ایمیل
    if (data.email) {
      const existingEmail = await this.findByEmail(data.email);
      if (existingEmail) {
        throw new DuplicateError('ایمیل');
      }
    }

    // Hash کردن رمز عبور
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userData = {
      username: data.username,
      password_hash: hashedPassword,
      role: data.role || 'customer',
      fullname: data.fullname,
      phone: data.phone,
      email: data.email,
      address: data.address
    };

    return await super.create(userData);
  }

  /**
   * بررسی رمز عبور
   */
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  /**
   * به‌روزرسانی رمز عبور
   */
  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await this.update(id, { password_hash: hashedPassword });
  }

  /**
   * به‌روزرسانی آخرین ورود
   */
  async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = GETDATE() WHERE id = @id';
    await this.query(query, { id });
  }

  /**
   * پیدا کردن کاربران بر اساس نقش
   */
  async findByRole(role, options = {}) {
    return await this.findAll({
      where: { role },
      ...options
    });
  }

  /**
   * اجرای Query (متد کمکی)
   */
  async query(queryString, parameters = {}) {
    const database = require('../config/database');
    return await database.query(queryString, parameters);
  }
}

module.exports = User;

