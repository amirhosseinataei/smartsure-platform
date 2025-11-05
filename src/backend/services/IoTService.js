const IoTDevice = require('../models/IoTDevice');
const SensorData = require('../models/SensorData');
const Policy = require('../models/Policy');
const Incident = require('../models/Incident');
const { NotFoundError, ValidationError, IoTError } = require('../utils/ErrorHandler');
const Logger = require('../utils/Logger');

/**
 * کلاس Service برای مدیریت IoT
 */
class IoTService {
  constructor() {
    this.deviceModel = new IoTDevice();
    this.sensorDataModel = new SensorData();
    this.policyModel = new Policy();
    this.incidentModel = new Incident();
    this.logger = new Logger('IoTService');
  }

  /**
   * ثبت دستگاه IoT
   */
  async registerDevice(data) {
    try {
      // بررسی وجود بیمه‌نامه
      const policy = await this.policyModel.findById(data.policy_id);
      if (!policy) {
        throw new NotFoundError('بیمه‌نامه');
      }

      if (!policy.iot_enabled) {
        throw new ValidationError('IoT برای این بیمه‌نامه فعال نیست');
      }

      // ایجاد دستگاه
      const device = await this.deviceModel.create(data);

      return device;
    } catch (error) {
      this.logger.error('Register device error', error);
      throw error;
    }
  }

  /**
   * دریافت داده‌های Telemetry
   */
  async receiveTelemetry(deviceUid, dataArray) {
    try {
      // پیدا کردن دستگاه
      const device = await this.deviceModel.findByDeviceUid(deviceUid);
      if (!device) {
        throw new NotFoundError('دستگاه IoT');
      }

      if (device.status !== 'active') {
        throw new IoTError('دستگاه فعال نیست');
      }

      // به‌روزرسانی Heartbeat
      await this.deviceModel.updateHeartbeat(deviceUid);

      // ذخیره داده‌ها
      const sensorDataArray = dataArray.map(data => ({
        device_id: device.id,
        timestamp: data.timestamp || new Date(),
        metric: data.metric,
        value: data.value,
        unit: data.unit,
        anomaly_flag: data.anomaly_flag || false
      }));

      const savedData = await this.sensorDataModel.createBatch(sensorDataArray);

      // بررسی ناهنجاری و تشخیص حادثه
      await this.checkAnomaliesAndIncidents(device, savedData);

      return savedData;
    } catch (error) {
      this.logger.error('Receive telemetry error', error);
      throw error;
    }
  }

  /**
   * بررسی ناهنجاری و تشخیص حادثه
   */
  async checkAnomaliesAndIncidents(device, sensorData) {
    try {
      // بررسی ناهنجاری‌ها
      const anomalies = sensorData.filter(data => data.anomaly_flag);

      if (anomalies.length > 0) {
        // تشخیص نوع حادثه بر اساس نوع متریک
        let incidentType = 'damage';
        let severity = 'medium';

        // تشخیص تصادف (شتاب ناگهانی)
        const crashDetected = anomalies.some(data => 
          data.metric === 'acceleration' && Math.abs(data.value) > 5
        );

        if (crashDetected) {
          incidentType = 'crash';
          severity = 'high';
        }

        // تشخیص نشت (سنسور نشت)
        const leakDetected = anomalies.some(data => 
          data.metric === 'gas' && data.value > 100
        );

        if (leakDetected) {
          incidentType = 'leak';
          severity = 'high';
        }

        // ایجاد حادثه خودکار
        await this.incidentModel.create({
          policy_id: device.policy_id,
          device_id: device.id,
          incident_type: incidentType,
          severity: severity,
          auto_detected: true,
          description: `حادثه خودکار تشخیص داده شد: ${incidentType}`
        });

        this.logger.info(`Auto-detected incident: ${incidentType} for device ${device.device_uid}`);
      }
    } catch (error) {
      this.logger.error('Check anomalies error', error);
      // خطا را throw نمی‌کنیم تا دریافت Telemetry موفق باشد
    }
  }

  /**
   * دریافت دستگاه‌های یک بیمه‌نامه
   */
  async getPolicyDevices(policyId) {
    try {
      const devices = await this.deviceModel.findByPolicyId(policyId);

      // اضافه کردن اطلاعات سلامت
      const devicesWithHealth = await Promise.all(
        devices.map(async (device) => {
          const health = await this.getDeviceHealth(device.id);
          return { ...device, health };
        })
      );

      return devicesWithHealth;
    } catch (error) {
      this.logger.error('Get policy devices error', error);
      throw error;
    }
  }

  /**
   * دریافت سلامت دستگاه
   */
  async getDeviceHealth(deviceId) {
    try {
      const device = await this.deviceModel.findById(deviceId);
      if (!device) {
        throw new NotFoundError('دستگاه');
      }

      // بررسی آخرین Heartbeat
      const isConnected = device.last_heartbeat && 
        (new Date() - new Date(device.last_heartbeat)) < 5 * 60 * 1000; // 5 دقیقه

      // دریافت آمار داده‌های اخیر
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 ساعت گذشته

      const stats = await this.sensorDataModel.getStatistics(
        deviceId,
        null,
        startDate,
        endDate
      );

      return {
        status: device.status,
        connected: isConnected,
        last_heartbeat: device.last_heartbeat,
        data_count: stats.total_count || 0,
        anomaly_count: stats.anomaly_count || 0
      };
    } catch (error) {
      this.logger.error('Get device health error', error);
      throw error;
    }
  }

  /**
   * دریافت داده‌های تاریخی
   */
  async getHistoricalData(deviceId, startDate, endDate, options = {}) {
    try {
      return await this.sensorDataModel.findByDeviceAndTimeRange(
        deviceId,
        startDate,
        endDate,
        options
      );
    } catch (error) {
      this.logger.error('Get historical data error', error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی Firmware
   */
  async updateFirmware(deviceUid, firmwareVersion) {
    try {
      return await this.deviceModel.updateFirmware(deviceUid, firmwareVersion);
    } catch (error) {
      this.logger.error('Update firmware error', error);
      throw error;
    }
  }
}

module.exports = IoTService;

