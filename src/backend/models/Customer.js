const BaseModel = require('./BaseModel');
const { NotFoundError, DuplicateError } = require('../utils/ErrorHandler');

/**
 * کلاس Model برای مشتریان
 */
class Customer extends BaseModel {
  constructor() {
    super('customers');
  }

  /**
   * پیدا کردن مشتری بر اساس user_id
   */
  async findByUserId(userId) {
    const query = 'SELECT * FROM customers WHERE user_id = @userId';
    const result = await this.query(query, { userId });
    return result.length > 0 ? result[0] : null;
  }

  /**
   * پیدا کردن مشتری بر اساس کد ملی
   */
  async findByNationalId(nationalId) {
    const query = 'SELECT * FROM customers WHERE national_id = @nationalId';
    const result = await this.query(query, { nationalId });
    return result.length > 0 ? result[0] : null;
  }

  /**
   * ایجاد مشتری جدید
   */
  async create(data) {
    // بررسی تکراری بودن user_id
    const existing = await this.findByUserId(data.user_id);
    if (existing) {
      throw new DuplicateError('مشتری با این کاربر');
    }

    // بررسی تکراری بودن کد ملی
    if (data.national_id) {
      const existingNationalId = await this.findByNationalId(data.national_id);
      if (existingNationalId) {
        throw new DuplicateError('کد ملی');
      }
    }

    return await super.create(data);
  }

  /**
   * دریافت اطلاعات کامل مشتری (با User)
   */
  async findByIdWithUser(id) {
    const query = `
      SELECT 
        c.*,
        u.username,
        u.email,
        u.phone,
        u.fullname,
        u.role,
        u.created_at as user_created_at
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.id = @id
    `;
    const result = await this.query(query, { id });
    return result.length > 0 ? result[0] : null;
  }

  /**
   * محاسبه Risk Score
   */
  async calculateRiskScore(customerId) {
    // این متد باید با داده‌های IoT و تاریخچه ادعاها محاسبه شود
    // در اینجا یک نسخه ساده ارائه شده است
    
    const query = `
      SELECT 
        COUNT(DISTINCT c.id) as claim_count,
        SUM(c.claim_amount) as total_claims,
        AVG(c.fraud_score) as avg_fraud_score
      FROM customers cust
      LEFT JOIN policies p ON cust.id = p.customer_id
      LEFT JOIN claims c ON p.id = c.policy_id
      WHERE cust.id = @customerId
      GROUP BY cust.id
    `;
    
    const result = await this.query(query, { customerId });
    
    if (result.length === 0) {
      return 0.5; // پیش‌فرض
    }

    const data = result[0];
    let riskScore = 0.5; // پایه

    // افزایش بر اساس تعداد خسارت
    riskScore += (data.claim_count || 0) * 0.1;
    
    // افزایش بر اساس Fraud Score
    if (data.avg_fraud_score) {
      riskScore += data.avg_fraud_score * 0.3;
    }

    // محدود کردن بین 0 و 1
    return Math.min(Math.max(riskScore, 0), 1);
  }

  /**
   * به‌روزرسانی Risk Profile
   */
  async updateRiskProfile(id, riskScore) {
    let riskProfile = 'low';
    if (riskScore >= 0.75) {
      riskProfile = 'critical';
    } else if (riskScore >= 0.5) {
      riskProfile = 'high';
    } else if (riskScore >= 0.25) {
      riskProfile = 'medium';
    }

    return await this.update(id, { risk_profile: riskProfile });
  }

  /**
   * اجرای Query (متد کمکی)
   */
  async query(queryString, parameters = {}) {
    const database = require('../config/database');
    return await database.query(queryString, parameters);
  }
}

module.exports = Customer;

