const BaseModel = require('./BaseModel');
const { NotFoundError } = require('../utils/ErrorHandler');
const uuid = require('uuid');

/**
 * کلاس Model برای پرداخت‌ها
 */
class Payment extends BaseModel {
  constructor() {
    super('payments');
  }

  /**
   * پیدا کردن پرداخت بر اساس transaction_id
   */
  async findByTransactionId(transactionId) {
    const query = 'SELECT * FROM payments WHERE transaction_id = @transactionId';
    const result = await this.query(query, { transactionId });
    return result.length > 0 ? result[0] : null;
  }

  /**
   * ایجاد پرداخت جدید
   */
  async create(data) {
    // تولید transaction_id یکتا
    const transactionId = data.transaction_id || `TXN-${Date.now()}-${uuid.v4().substring(0, 8)}`;
    
    const paymentData = {
      claim_id: data.claim_id,
      amount: data.amount,
      method: data.method,
      transaction_id: transactionId,
      status: data.status || 'pending',
      processor: data.processor || null
    };

    return await super.create(paymentData);
  }

  /**
   * پیدا کردن پرداخت‌های یک خسارت
   */
  async findByClaimId(claimId) {
    return await this.findAll({
      where: { claim_id: claimId }
    });
  }

  /**
   * به‌روزرسانی وضعیت پرداخت
   */
  async updateStatus(id, status, transactionId = null) {
    const updateData = {
      status,
      updated_at: new Date()
    };

    if (transactionId) {
      updateData.transaction_id = transactionId;
    }

    return await this.update(id, updateData);
  }

  /**
   * تایید پرداخت
   */
  async markAsCompleted(id, transactionId) {
    return await this.update(id, {
      status: 'completed',
      transaction_id: transactionId,
      paid_at: new Date()
    });
  }

  /**
   * دریافت آمار پرداخت‌ها
   */
  async getStatistics(customerId = null, policyId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM payments p
    `;
    
    const params = {};
    const conditions = [];

    if (customerId) {
      query = `
        SELECT 
          COUNT(*) as total_payments,
          SUM(p.amount) as total_amount,
          COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN p.status = 'failed' THEN 1 END) as failed_count
        FROM payments p
        INNER JOIN claims c ON p.claim_id = c.id
        INNER JOIN policies pol ON c.policy_id = pol.id
        WHERE pol.customer_id = @customerId
      `;
      params.customerId = customerId;
    } else if (policyId) {
      query = `
        SELECT 
          COUNT(*) as total_payments,
          SUM(p.amount) as total_amount,
          COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN p.status = 'failed' THEN 1 END) as failed_count
        FROM payments p
        INNER JOIN claims c ON p.claim_id = c.id
        WHERE c.policy_id = @policyId
      `;
      params.policyId = policyId;
    }

    const result = await this.query(query, params);
    return result[0];
  }

  /**
   * اجرای Query (متد کمکی)
   */
  async query(queryString, parameters = {}) {
    const database = require('../config/database');
    return await database.query(queryString, parameters);
  }
}

module.exports = Payment;

