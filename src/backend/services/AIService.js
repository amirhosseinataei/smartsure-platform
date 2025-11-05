const AIModel = require('../models/AIModel');
const AIInference = require('../models/AIInference');
const Claim = require('../models/Claim');
const SensorData = require('../models/SensorData');
const { NotFoundError, AIError } = require('../utils/ErrorHandler');
const Logger = require('../utils/Logger');
const axios = require('axios');
const appConfig = require('../config/app');

/**
 * کلاس Service برای مدیریت هوش مصنوعی
 */
class AIService {
  constructor() {
    this.aiModelModel = new AIModel();
    this.aiInferenceModel = new AIInference();
    this.claimModel = new Claim();
    this.sensorDataModel = new SensorData();
    this.logger = new Logger('AIService');
  }

  /**
   * ارزیابی خسارت با AI
   */
  async evaluateDamage(data) {
    try {
      // دریافت مدل فعال
      const model = await this.aiModelModel.findActiveByType('damage_estimation');
      if (!model) {
        throw new AIError('مدل تخمین خسارت یافت نشد');
      }

      // آماده‌سازی داده‌ها
      const inputData = {
        claimId: data.claimId,
        documents: data.documents,
        claimAmount: data.claimAmount
      };

      // اجرای مدل (در واقعیت باید با TensorFlow Serving یا API دیگر ارتباط برقرار شود)
      const result = await this.executeModel(model, 'evaluate_damage', inputData);

      // ذخیره نتیجه
      await this.aiInferenceModel.create({
        model_id: model.id,
        claim_id: data.claimId,
        input_reference: JSON.stringify(inputData),
        output_json: JSON.stringify(result),
        confidence: result.confidence
      });

      return {
        estimated_cost: result.estimated_cost,
        confidence: result.confidence,
        damage_map: result.damage_map
      };
    } catch (error) {
      this.logger.error('Evaluate damage error', error);
      throw error;
    }
  }

  /**
   * بررسی تقلب
   */
  async checkFraud(claimId) {
    try {
      const claim = await this.claimModel.findById(claimId);
      if (!claim) {
        throw new NotFoundError('خسارت');
      }

      // دریافت مدل فعال
      const model = await this.aiModelModel.findActiveByType('fraud_detection');
      if (!model) {
        throw new AIError('مدل تشخیص تقلب یافت نشد');
      }

      // جمع‌آوری داده‌ها برای تحلیل تقلب
      const fraudData = await this.collectFraudData(claimId);

      // اجرای مدل
      const result = await this.executeModel(model, 'check_fraud', fraudData);

      // ذخیره نتیجه
      await this.aiInferenceModel.create({
        model_id: model.id,
        claim_id: claimId,
        input_reference: JSON.stringify(fraudData),
        output_json: JSON.stringify(result),
        confidence: result.confidence
      });

      return {
        fraud_score: result.fraud_score,
        risk_level: this.calculateRiskLevel(result.fraud_score),
        reasons: result.reasons || [],
        recommendation: result.recommendation || 'review'
      };
    } catch (error) {
      this.logger.error('Check fraud error', error);
      throw error;
    }
  }

  /**
   * جمع‌آوری داده‌ها برای تحلیل تقلب
   */
  async collectFraudData(claimId) {
    try {
      const claim = await this.claimModel.findById(claimId);
      const policy = await this.policyModel.findById(claim.policy_id);

      // دریافت داده‌های IoT
      const IoTDevice = require('../models/IoTDevice');
      const Policy = require('../models/Policy');
      const iotDeviceModel = new IoTDevice();
      const policyModel = new Policy();
      
      const policy = await policyModel.findById(claim.policy_id);
      const devices = await iotDeviceModel.findByPolicyId(claim.policy_id);
      const iotData = [];
      
      for (const device of devices) {
        const data = await this.sensorDataModel.findByDeviceAndTimeRange(
          device.id,
          new Date(claim.submitted_at.getTime() - 24 * 60 * 60 * 1000),
          claim.submitted_at,
          { limit: 100 }
        );
        iotData.push(...data);
      }

      return {
        claim: {
          claim_amount: claim.claim_amount,
          submitted_at: claim.submitted_at,
          ai_estimated_cost: claim.ai_estimated_cost
        },
        policy: {
          policy_number: policy.policy_number,
          insurance_type: policy.insurance_type
        },
        iot_data: iotData,
        history: await this.getClaimHistory(claim.policy_id)
      };
    } catch (error) {
      this.logger.error('Collect fraud data error', error);
      return {};
    }
  }

  /**
   * اجرای مدل AI
   */
  async executeModel(model, operation, inputData) {
    try {
      // در واقعیت، این باید با TensorFlow Serving یا API دیگر ارتباط برقرار شود
      // این یک پیاده‌سازی نمونه است

      if (appConfig.ai.serviceUrl) {
        // استفاده از سرویس AI خارجی
        const response = await axios.post(
          `${appConfig.ai.serviceUrl}/api/${operation}`,
          {
            model_id: model.id,
            model_version: model.version,
            input: inputData
          },
          {
            headers: {
              'Authorization': `Bearer ${appConfig.ai.apiKey}`
            }
          }
        );

        return response.data;
      } else {
        // پیاده‌سازی نمونه محلی
        return this.simulateModelExecution(operation, inputData);
      }
    } catch (error) {
      this.logger.error('Execute model error', error);
      throw new AIError('خطا در اجرای مدل AI');
    }
  }

  /**
   * شبیه‌سازی اجرای مدل (برای توسعه)
   */
  simulateModelExecution(operation, inputData) {
    if (operation === 'evaluate_damage') {
      // شبیه‌سازی تخمین خسارت
      const baseAmount = inputData.claimAmount || 5000000;
      const estimatedCost = baseAmount * (0.8 + Math.random() * 0.4); // ±20%
      const confidence = 0.85 + Math.random() * 0.1; // 85-95%

      return {
        estimated_cost: Math.round(estimatedCost),
        confidence: parseFloat(confidence.toFixed(2)),
        damage_map: {
          total: estimatedCost,
          parts: []
        }
      };
    } else if (operation === 'check_fraud') {
      // شبیه‌سازی تشخیص تقلب
      const fraudScore = Math.random() * 0.5; // 0-0.5 (کم)
      const confidence = 0.75 + Math.random() * 0.2; // 75-95%

      return {
        fraud_score: parseFloat(fraudScore.toFixed(2)),
        confidence: parseFloat(confidence.toFixed(2)),
        reasons: [],
        recommendation: fraudScore < 0.3 ? 'approve' : 'review'
      };
    }

    throw new AIError('Operation نامعتبر');
  }

  /**
   * محاسبه Risk Level
   */
  calculateRiskLevel(fraudScore) {
    if (fraudScore >= 0.7) return 'critical';
    if (fraudScore >= 0.5) return 'high';
    if (fraudScore >= 0.3) return 'medium';
    return 'low';
  }

  /**
   * دریافت تاریخچه خسارت‌ها
   */
  async getClaimHistory(policyId) {
    try {
      const claims = await this.claimModel.findByPolicyId(policyId);
      return claims.map(claim => ({
        claim_number: claim.claim_number,
        claim_amount: claim.claim_amount,
        fraud_score: claim.fraud_score,
        status: claim.status,
        submitted_at: claim.submitted_at
      }));
    } catch (error) {
      this.logger.error('Get claim history error', error);
      return [];
    }
  }
}

module.exports = AIService;

