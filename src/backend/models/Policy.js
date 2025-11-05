const BaseModel = require('./BaseModel');
const { NotFoundError, DuplicateError } = require('../utils/ErrorHandler');
const uuid = require('uuid');

/**
 * کلاس Model برای بیمه‌نامه‌ها
 */
class Policy extends BaseModel {
  constructor() {
    super('policies');
  }

  /**
   * پیدا کردن بیمه‌نامه بر اساس شماره بیمه‌نامه
   */
  async findByPolicyNumber(policyNumber) {
    const query = 'SELECT * FROM policies WHERE policy_number = @policyNumber';
    const result = await this.query(query, { policyNumber });
    return result.length > 0 ? result[0] : null;
  }

  /**
   * ایجاد بیمه‌نامه جدید
   */
  async create(data) {
    // تولید شماره بیمه‌نامه یکتا
    const policyNumber = await this.generatePolicyNumber(data.insurance_type);
    
    const policyData = {
      policy_number: policyNumber,
      customer_id: data.customer_id,
      insurance_type: data.insurance_type,
      start_date: data.start_date,
      end_date: data.end_date,
      premium_amount: data.premium_amount,
      dynamic_premium: data.dynamic_premium || false,
      risk_level: data.risk_level || 'medium',
      iot_enabled: data.iot_enabled !== false,
      policy_status: data.policy_status || 'pending_activation'
    };

    return await super.create(policyData);
  }

  /**
   * تولید شماره بیمه‌نامه یکتا
   */
  async generatePolicyNumber(insuranceType) {
    const prefix = {
      vehicle: 'VEH',
      home: 'HOM',
      health: 'HLT',
      cargo: 'CRG'
    }[insuranceType] || 'POL';

    let policyNumber;
    let exists = true;
    
    while (exists) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      policyNumber = `${prefix}-${year}-${random}`;
      
      const existing = await this.findByPolicyNumber(policyNumber);
      exists = existing !== null;
    }

    return policyNumber;
  }

  /**
   * پیدا کردن بیمه‌نامه‌های یک مشتری
   */
  async findByCustomerId(customerId, options = {}) {
    return await this.findAll({
      where: { customer_id: customerId },
      ...options
    });
  }

  /**
   * پیدا کردن بیمه‌نامه‌های فعال
   */
  async findActive(options = {}) {
    const query = `
      SELECT * FROM policies 
      WHERE policy_status = 'active' 
      AND end_date >= CAST(GETDATE() AS DATE)
      ${options.orderBy ? `ORDER BY ${options.orderBy}` : ''}
      ${options.limit ? `OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY` : ''}
    `;
    
    const params = {};
    if (options.limit) {
      params.offset = options.offset || 0;
      params.limit = options.limit;
    }

    return await this.query(query, params);
  }

  /**
   * فعال‌سازی بیمه‌نامه
   */
  async activate(id) {
    return await this.update(id, { 
      policy_status: 'active' 
    });
  }

  /**
   * تمدید بیمه‌نامه
   */
  async renew(id, newEndDate, newPremiumAmount) {
    const policy = await this.findById(id);
    if (!policy) {
      throw new NotFoundError('بیمه‌نامه');
    }

    return await this.update(id, {
      start_date: policy.end_date,
      end_date: newEndDate,
      premium_amount: newPremiumAmount,
      policy_status: 'active'
    });
  }

  /**
   * لغو بیمه‌نامه
   */
  async cancel(id) {
    return await this.update(id, {
      policy_status: 'canceled'
    });
  }

  /**
   * به‌روزرسانی حق بیمه پویا
   */
  async updateDynamicPremium(id, riskScore, behaviorScore) {
    const policy = await this.findById(id);
    if (!policy) {
      throw new NotFoundError('بیمه‌نامه');
    }

    const basePremium = parseFloat(policy.premium_amount);
    const riskMultiplier = 1 + (riskScore - 0.5) * 0.2;
    const behaviorMultiplier = 1 + (behaviorScore - 0.5) * 0.1;
    
    const newPremium = basePremium * riskMultiplier * behaviorMultiplier;

    return await this.update(id, {
      premium_amount: newPremium,
      risk_level: this.calculateRiskLevel(riskScore)
    });
  }

  /**
   * محاسبه Risk Level بر اساس Risk Score
   */
  calculateRiskLevel(riskScore) {
    if (riskScore >= 0.75) return 'critical';
    if (riskScore >= 0.5) return 'high';
    if (riskScore >= 0.25) return 'medium';
    return 'low';
  }

  /**
   * بررسی انقضای بیمه‌نامه‌ها
   */
  async checkExpired() {
    const query = `
      UPDATE policies 
      SET policy_status = 'expired', updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE policy_status = 'active' 
      AND end_date < CAST(GETDATE() AS DATE)
    `;
    
    return await this.query(query);
  }

  /**
   * اجرای Query (متد کمکی)
   */
  async query(queryString, parameters = {}) {
    const database = require('../config/database');
    return await database.query(queryString, parameters);
  }
}

module.exports = Policy;

