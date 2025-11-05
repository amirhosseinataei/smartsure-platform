const BaseModel = require('./BaseModel');

/**
 * کلاس Model برای داده‌های حسگر (Time-Series)
 */
class SensorData extends BaseModel {
  constructor() {
    super('sensor_data');
  }

  /**
   * ایجاد داده حسگر جدید
   */
  async create(data) {
    const sensorData = {
      device_id: data.device_id,
      timestamp: data.timestamp || new Date(),
      metric: data.metric,
      value: data.value,
      unit: data.unit || null,
      anomaly_flag: data.anomaly_flag || false,
      processed: data.processed || false
    };

    return await super.create(sensorData);
  }

  /**
   * ایجاد چندین داده حسگر (Batch Insert)
   */
  async createBatch(dataArray) {
    if (dataArray.length === 0) return [];

    const database = require('../config/database');
    const transaction = await database.beginTransaction();
    
    try {
      const request = transaction.request();
      const results = [];

      for (const data of dataArray) {
        const query = `
          INSERT INTO sensor_data (device_id, timestamp, metric, value, unit, anomaly_flag, processed)
          OUTPUT INSERTED.*
          VALUES (@device_id, @timestamp, @metric, @value, @unit, @anomaly_flag, @processed)
        `;
        
        request.input('device_id', data.device_id);
        request.input('timestamp', data.timestamp || new Date());
        request.input('metric', data.metric);
        request.input('value', data.value);
        request.input('unit', data.unit || null);
        request.input('anomaly_flag', data.anomaly_flag || false);
        request.input('processed', data.processed || false);
        
        const result = await request.query(query);
        results.push(result.recordset[0]);
      }

      await transaction.commit();
      return results;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * پیدا کردن داده‌های یک دستگاه در بازه زمانی
   */
  async findByDeviceAndTimeRange(deviceId, startDate, endDate, options = {}) {
    const query = `
      SELECT * FROM sensor_data
      WHERE device_id = @deviceId
      AND timestamp >= @startDate
      AND timestamp <= @endDate
      ${options.metric ? 'AND metric = @metric' : ''}
      ORDER BY timestamp DESC
      ${options.limit ? 'OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY' : ''}
    `;

    const params = {
      deviceId,
      startDate,
      endDate
    };

    if (options.metric) {
      params.metric = options.metric;
    }

    if (options.limit) {
      params.offset = options.offset || 0;
      params.limit = options.limit;
    }

    return await this.query(query, params);
  }

  /**
   * پیدا کردن داده‌های ناهنجار
   */
  async findAnomalies(deviceId = null, options = {}) {
    let query = `
      SELECT * FROM sensor_data
      WHERE anomaly_flag = 1
    `;

    const params = {};

    if (deviceId) {
      query += ' AND device_id = @deviceId';
      params.deviceId = deviceId;
    }

    query += ' ORDER BY timestamp DESC';
    
    if (options.limit) {
      query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
      params.offset = options.offset || 0;
      params.limit = options.limit;
    }

    return await this.query(query, params);
  }

  /**
   * علامت‌گذاری داده‌ها به عنوان پردازش شده
   */
  async markAsProcessed(ids) {
    if (ids.length === 0) return;

    const database = require('../config/database');
    const placeholders = ids.map((_, index) => `@id${index}`).join(',');
    const query = `
      UPDATE sensor_data 
      SET processed = 1
      WHERE id IN (${placeholders})
    `;

    const params = {};
    ids.forEach((id, index) => {
      params[`id${index}`] = id;
    });

    return await this.query(query, params);
  }

  /**
   * دریافت آمار داده‌های حسگر
   */
  async getStatistics(deviceId, metric = null, startDate = null, endDate = null) {
    let query = `
      SELECT 
        COUNT(*) as total_count,
        AVG(value) as avg_value,
        MIN(value) as min_value,
        MAX(value) as max_value,
        COUNT(CASE WHEN anomaly_flag = 1 THEN 1 END) as anomaly_count
      FROM sensor_data
      WHERE device_id = @deviceId
    `;

    const params = { deviceId };

    if (metric) {
      query += ' AND metric = @metric';
      params.metric = metric;
    }

    if (startDate) {
      query += ' AND timestamp >= @startDate';
      params.startDate = startDate;
    }

    if (endDate) {
      query += ' AND timestamp <= @endDate';
      params.endDate = endDate;
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

module.exports = SensorData;

