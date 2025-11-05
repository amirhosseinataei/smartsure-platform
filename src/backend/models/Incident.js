const BaseModel = require('./BaseModel');
const { NotFoundError } = require('../utils/ErrorHandler');

/**
 * کلاس Model برای حوادث
 */
class Incident extends BaseModel {
  constructor() {
    super('incidents');
  }

  /**
   * ایجاد حادثه جدید
   */
  async create(data) {
    const incidentData = {
      policy_id: data.policy_id,
      device_id: data.device_id || null,
      incident_type: data.incident_type,
      detected_time: data.detected_time || new Date(),
      severity: data.severity || 'medium',
      description: data.description,
      auto_detected: data.auto_detected || false,
      verified: data.verified || false
    };

    return await super.create(incidentData);
  }

  /**
   * پیدا کردن حوادث یک بیمه‌نامه
   */
  async findByPolicyId(policyId, options = {}) {
    return await this.findAll({
      where: { policy_id: policyId },
      ...options
    });
  }

  /**
   * پیدا کردن حوادث یک دستگاه
   */
  async findByDeviceId(deviceId, options = {}) {
    return await this.findAll({
      where: { device_id: deviceId },
      ...options
    });
  }

  /**
   * تایید حادثه
   */
  async verify(id) {
    return await this.update(id, { verified: true });
  }

  /**
   * پیدا کردن حوادث خودکار
   */
  async findAutoDetected(options = {}) {
    return await this.findAll({
      where: { auto_detected: true },
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

module.exports = Incident;

