const BaseModel = require('./BaseModel');
const { NotFoundError, DuplicateError } = require('../utils/ErrorHandler');

/**
 * کلاس Model برای دستگاه‌های IoT
 */
class IoTDevice extends BaseModel {
  constructor() {
    super('iot_devices');
  }

  /**
   * پیدا کردن دستگاه بر اساس device_uid
   */
  async findByDeviceUid(deviceUid) {
    const query = 'SELECT * FROM iot_devices WHERE device_uid = @deviceUid';
    const result = await this.query(query, { deviceUid });
    return result.length > 0 ? result[0] : null;
  }

  /**
   * ایجاد دستگاه جدید
   */
  async create(data) {
    // بررسی تکراری بودن device_uid
    const existing = await this.findByDeviceUid(data.device_uid);
    if (existing) {
      throw new DuplicateError('دستگاه IoT');
    }

    const deviceData = {
      device_uid: data.device_uid,
      policy_id: data.policy_id,
      type: data.type,
      manufacturer: data.manufacturer,
      model: data.model,
      firmware_version: data.firmware_version || '1.0.0',
      connection_protocol: data.connection_protocol || 'MQTT',
      status: data.status || 'active',
      location: data.location
    };

    return await super.create(deviceData);
  }

  /**
   * پیدا کردن دستگاه‌های یک بیمه‌نامه
   */
  async findByPolicyId(policyId, options = {}) {
    return await this.findAll({
      where: { policy_id: policyId },
      ...options
    });
  }

  /**
   * به‌روزرسانی آخرین Heartbeat
   */
  async updateHeartbeat(deviceUid) {
    const query = `
      UPDATE iot_devices 
      SET last_heartbeat = GETDATE(), 
          status = CASE WHEN status = 'disconnected' THEN 'active' ELSE status END,
          updated_at = GETDATE()
      WHERE device_uid = @deviceUid
    `;
    
    await this.query(query, { deviceUid });
    
    return await this.findByDeviceUid(deviceUid);
  }

  /**
   * تغییر وضعیت دستگاه
   */
  async updateStatus(deviceUid, status) {
    return await this.update(
      (await this.findByDeviceUid(deviceUid)).id,
      { status }
    );
  }

  /**
   * به‌روزرسانی Firmware
   */
  async updateFirmware(deviceUid, firmwareVersion) {
    const device = await this.findByDeviceUid(deviceUid);
    if (!device) {
      throw new NotFoundError('دستگاه IoT');
    }

    return await this.update(device.id, {
      firmware_version: firmwareVersion,
      status: 'active'
    });
  }

  /**
   * پیدا کردن دستگاه‌های غیرفعال (Disconnected)
   */
  async findDisconnected(thresholdMinutes = 5) {
    const query = `
      SELECT * FROM iot_devices
      WHERE status = 'active'
      AND (
        last_heartbeat IS NULL 
        OR last_heartbeat < DATEADD(MINUTE, -@threshold, GETDATE())
      )
    `;
    
    return await this.query(query, { threshold: thresholdMinutes });
  }

  /**
   * بررسی سلامت دستگاه‌ها
   */
  async healthCheck(policyId = null) {
    let query = `
      SELECT 
        d.*,
        CASE 
          WHEN d.last_heartbeat IS NULL THEN 'disconnected'
          WHEN d.last_heartbeat < DATEADD(MINUTE, -5, GETDATE()) THEN 'disconnected'
          ELSE 'active'
        END AS health_status
      FROM iot_devices d
    `;
    
    const params = {};
    
    if (policyId) {
      query += ' WHERE d.policy_id = @policyId';
      params.policyId = policyId;
    }

    return await this.query(query, params);
  }

  /**
   * اجرای Query (متد کمکی)
   */
  async query(queryString, parameters = {}) {
    const database = require('../config/database');
    return await database.query(queryString, parameters);
  }
}

module.exports = IoTDevice;

