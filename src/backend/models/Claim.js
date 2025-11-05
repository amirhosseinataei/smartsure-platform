const BaseModel = require('./BaseModel');
const { NotFoundError } = require('../utils/ErrorHandler');
const uuid = require('uuid');

/**
 * کلاس Model برای ادعاهای خسارت
 */
class Claim extends BaseModel {
  constructor() {
    super('claims');
  }

  /**
   * پیدا کردن خسارت بر اساس claim_number
   */
  async findByClaimNumber(claimNumber) {
    const query = 'SELECT * FROM claims WHERE claim_number = @claimNumber';
    const result = await this.query(query, { claimNumber });
    return result.length > 0 ? result[0] : null;
  }

  /**
   * ایجاد خسارت جدید
   */
  async create(data) {
    // تولید شماره خسارت یکتا
    const claimNumber = await this.generateClaimNumber();
    
    const claimData = {
      policy_id: data.policy_id,
      incident_id: data.incident_id || null,
      claim_number: claimNumber,
      submitted_by: data.submitted_by,
      claim_amount: data.claim_amount,
      status: data.status || 'pending',
      ai_estimated_cost: data.ai_estimated_cost || null,
      fraud_score: data.fraud_score || null
    };

    return await super.create(claimData);
  }

  /**
   * تولید شماره خسارت یکتا
   */
  async generateClaimNumber() {
    let claimNumber;
    let exists = true;
    
    while (exists) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      claimNumber = `CLM-${year}-${random}`;
      
      const existing = await this.findByClaimNumber(claimNumber);
      exists = existing !== null;
    }

    return claimNumber;
  }

  /**
   * پیدا کردن خسارت‌های یک بیمه‌نامه
   */
  async findByPolicyId(policyId, options = {}) {
    return await this.findAll({
      where: { policy_id: policyId },
      ...options
    });
  }

  /**
   * پیدا کردن خسارت‌های یک مشتری
   */
  async findByCustomerId(customerId, options = {}) {
    const query = `
      SELECT c.* 
      FROM claims c
      INNER JOIN policies p ON c.policy_id = p.id
      WHERE p.customer_id = @customerId
      ${options.orderBy ? `ORDER BY ${options.orderBy}` : 'ORDER BY c.submitted_at DESC'}
      ${options.limit ? `OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY` : ''}
    `;
    
    const params = { customerId };
    if (options.limit) {
      params.offset = options.offset || 0;
      params.limit = options.limit;
    }

    return await this.query(query, params);
  }

  /**
   * پیدا کردن خسارت‌ها بر اساس وضعیت
   */
  async findByStatus(status, options = {}) {
    return await this.findAll({
      where: { status },
      ...options
    });
  }

  /**
   * به‌روزرسانی وضعیت خسارت
   */
  async updateStatus(id, status, reviewedBy = null, assessmentNotes = null) {
    const updateData = {
      status,
      updated_at: new Date()
    };

    if (reviewedBy) {
      updateData.reviewed_by = reviewedBy;
    }

    if (assessmentNotes) {
      updateData.assessment_notes = assessmentNotes;
    }

    return await this.update(id, updateData);
  }

  /**
   * تایید خسارت
   */
  async approve(id, approvedAmount, reviewedBy, notes = null) {
    return await this.update(id, {
      status: 'approved',
      approved_amount: approvedAmount,
      reviewed_by: reviewedBy,
      assessment_notes: notes
    });
  }

  /**
   * رد خسارت
   */
  async reject(id, reviewedBy, notes) {
    return await this.update(id, {
      status: 'rejected',
      reviewed_by: reviewedBy,
      assessment_notes: notes
    });
  }

  /**
   * پرداخت خودکار
   */
  async markAsAutoPaid(id, payoutReference) {
    return await this.update(id, {
      status: 'auto_paid',
      auto_approved: true,
      approved_amount: this.ai_estimated_cost,
      payout_reference: payoutReference
    });
  }

  /**
   * به‌روزرسانی Fraud Score
   */
  async updateFraudScore(id, fraudScore) {
    return await this.update(id, { fraud_score: fraudScore });
  }

  /**
   * به‌روزرسانی AI Estimated Cost
   */
  async updateAIEstimatedCost(id, estimatedCost) {
    return await this.update(id, { ai_estimated_cost: estimatedCost });
  }

  /**
   * دریافت آمار خسارت‌ها
   */
  async getStatistics(customerId = null, policyId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_claims,
        SUM(claim_amount) as total_claim_amount,
        SUM(approved_amount) as total_approved_amount,
        AVG(fraud_score) as avg_fraud_score,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
      FROM claims c
    `;
    
    const params = {};
    const conditions = [];

    if (customerId) {
      query = `
        SELECT 
          COUNT(*) as total_claims,
          SUM(c.claim_amount) as total_claim_amount,
          SUM(c.approved_amount) as total_approved_amount,
          AVG(c.fraud_score) as avg_fraud_score,
          COUNT(CASE WHEN c.status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN c.status = 'rejected' THEN 1 END) as rejected_count,
          COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_count
        FROM claims c
        INNER JOIN policies p ON c.policy_id = p.id
        WHERE p.customer_id = @customerId
      `;
      params.customerId = customerId;
    } else if (policyId) {
      conditions.push('c.policy_id = @policyId');
      params.policyId = policyId;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
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

module.exports = Claim;

