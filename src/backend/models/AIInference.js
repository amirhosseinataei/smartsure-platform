const BaseModel = require('./BaseModel');

/**
 * کلاس Model برای نتیجه اجرای مدل‌های AI
 */
class AIInference extends BaseModel {
  constructor() {
    super('ai_inferences');
  }

  /**
   * ایجاد نتیجه اجرای AI
   */
  async create(data) {
    const inferenceData = {
      model_id: data.model_id,
      claim_id: data.claim_id || null,
      incident_id: data.incident_id || null,
      input_reference: data.input_reference || null,
      output_json: typeof data.output_json === 'string' 
        ? data.output_json 
        : JSON.stringify(data.output_json),
      confidence: data.confidence || null
    };

    return await super.create(inferenceData);
  }

  /**
   * پیدا کردن نتایج یک خسارت
   */
  async findByClaimId(claimId) {
    return await this.findAll({
      where: { claim_id: claimId },
      orderBy: 'executed_at DESC'
    });
  }

  /**
   * پیدا کردن نتایج یک مدل
   */
  async findByModelId(modelId, options = {}) {
    return await this.findAll({
      where: { model_id: modelId },
      ...options
    });
  }

  /**
   * دریافت آخرین نتیجه برای یک خسارت
   */
  async getLatestByClaimId(claimId) {
    const query = `
      SELECT TOP 1 * FROM ai_inferences
      WHERE claim_id = @claimId
      ORDER BY executed_at DESC
    `;
    const result = await this.query(query, { claimId });
    return result.length > 0 ? result[0] : null;
  }

  /**
   * اجرای Query (متد کمکی)
   */
  async query(queryString, parameters = {}) {
    const database = require('../config/database');
    return await database.query(queryString, parameters);
  }
}

module.exports = AIInference;

