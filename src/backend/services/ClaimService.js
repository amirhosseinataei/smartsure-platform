const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const Incident = require('../models/Incident');
const Payment = require('../models/Payment');
const Document = require('../models/Document');
const AIService = require('./AIService');
const PaymentService = require('./PaymentService');
const appConfig = require('../config/app');
const { NotFoundError, ValidationError } = require('../utils/ErrorHandler');
const Logger = require('../utils/Logger');

/**
 * کلاس Service برای مدیریت خسارت‌ها
 */
class ClaimService {
  constructor() {
    this.claimModel = new Claim();
    this.policyModel = new Policy();
    this.incidentModel = new Incident();
    this.paymentModel = new Payment();
    this.documentModel = new Document();
    this.aiService = new AIService();
    this.paymentService = new PaymentService();
    this.logger = new Logger('ClaimService');
  }

  /**
   * ثبت خسارت
   */
  async createClaim(data) {
    try {
      // بررسی وجود بیمه‌نامه
      const policy = await this.policyModel.findById(data.policy_id);
      if (!policy) {
        throw new NotFoundError('بیمه‌نامه');
      }

      if (policy.policy_status !== 'active') {
        throw new ValidationError('بیمه‌نامه فعال نیست');
      }

      // ایجاد حادثه (اگر وجود ندارد)
      let incident = null;
      if (data.incident_id) {
        incident = await this.incidentModel.findById(data.incident_id);
      } else if (data.incident_data) {
        incident = await this.incidentModel.create({
          ...data.incident_data,
          policy_id: data.policy_id
        });
      }

      // ایجاد خسارت
      const claim = await this.claimModel.create({
        policy_id: data.policy_id,
        incident_id: incident ? incident.id : null,
        submitted_by: data.submitted_by,
        claim_amount: data.claim_amount
      });

      // ارزیابی خودکار با AI
      await this.evaluateClaim(claim.id);

      return claim;
    } catch (error) {
      this.logger.error('Create claim error', error);
      throw error;
    }
  }

  /**
   * ارزیابی خسارت با AI
   */
  async evaluateClaim(claimId) {
    try {
      const claim = await this.claimModel.findById(claimId);
      if (!claim) {
        throw new NotFoundError('خسارت');
      }

      // دریافت مدارک
      const documents = await this.documentModel.findByClaimId(claimId);

      // ارزیابی با AI
      const aiResult = await this.aiService.evaluateDamage({
        claimId,
        documents,
        claimAmount: claim.claim_amount
      });

      // به‌روزرسانی خسارت
      await this.claimModel.updateAIEstimatedCost(claimId, aiResult.estimated_cost);

      // بررسی تقلب
      const fraudResult = await this.aiService.checkFraud(claimId);
      await this.claimModel.updateFraudScore(claimId, fraudResult.fraud_score);

      // اگر شرایط پرداخت خودکار را دارد
      if (aiResult.confidence >= 0.9 && 
          fraudResult.fraud_score < 0.7 && 
          aiResult.estimated_cost <= appConfig.payment.autoApproveThreshold) {
        await this.autoApproveClaim(claimId, aiResult.estimated_cost);
      }

      return {
        estimated_cost: aiResult.estimated_cost,
        confidence: aiResult.confidence,
        fraud_score: fraudResult.fraud_score
      };
    } catch (error) {
      this.logger.error('Evaluate claim error', error);
      throw error;
    }
  }

  /**
   * تایید خودکار خسارت
   */
  async autoApproveClaim(claimId, amount) {
    try {
      const claim = await this.claimModel.findById(claimId);
      if (!claim) {
        throw new NotFoundError('خسارت');
      }

      // به‌روزرسانی وضعیت
      await this.claimModel.markAsAutoPaid(claimId, `AUTO-${Date.now()}`);

      // پرداخت خودکار
      await this.paymentService.processClaimPayment(claimId, amount, 'auto_deduct');

      return claim;
    } catch (error) {
      this.logger.error('Auto approve claim error', error);
      throw error;
    }
  }

  /**
   * بررسی خسارت توسط کارشناس
   */
  async reviewClaim(claimId, reviewedBy, decision, approvedAmount = null, notes = null) {
    try {
      const claim = await this.claimModel.findById(claimId);
      if (!claim) {
        throw new NotFoundError('خسارت');
      }

      if (decision === 'approved') {
        if (!approvedAmount) {
          approvedAmount = claim.ai_estimated_cost || claim.claim_amount;
        }

        await this.claimModel.approve(claimId, approvedAmount, reviewedBy, notes);

        // پرداخت
        await this.paymentService.processClaimPayment(claimId, approvedAmount);
      } else if (decision === 'rejected') {
        await this.claimModel.reject(claimId, reviewedBy, notes);
      }

      return claim;
    } catch (error) {
      this.logger.error('Review claim error', error);
      throw error;
    }
  }

  /**
   * دریافت خسارت‌های یک مشتری
   */
  async getCustomerClaims(customerId, options = {}) {
    try {
      const claims = await this.claimModel.findByCustomerId(customerId, options);

      // اضافه کردن اطلاعات تکمیلی
      const claimsWithDetails = await Promise.all(
        claims.map(async (claim) => {
          const policy = await this.policyModel.findById(claim.policy_id);
          const payments = await this.paymentModel.findByClaimId(claim.id);
          const documents = await this.documentModel.findByClaimId(claim.id);

          return {
            ...claim,
            policy,
            payments,
            documents
          };
        })
      );

      return claimsWithDetails;
    } catch (error) {
      this.logger.error('Get customer claims error', error);
      throw error;
    }
  }

  /**
   * دریافت جزئیات خسارت
   */
  async getClaimById(id) {
    try {
      const claim = await this.claimModel.findById(id);
      if (!claim) {
        throw new NotFoundError('خسارت');
      }

      const policy = await this.policyModel.findById(claim.policy_id);
      const incident = claim.incident_id ? await this.incidentModel.findById(claim.incident_id) : null;
      const payments = await this.paymentModel.findByClaimId(id);
      const documents = await this.documentModel.findByClaimId(id);

      return {
        ...claim,
        policy,
        incident,
        payments,
        documents
      };
    } catch (error) {
      this.logger.error('Get claim by id error', error);
      throw error;
    }
  }
}

module.exports = ClaimService;

