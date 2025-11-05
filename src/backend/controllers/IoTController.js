const IoTService = require('../services/IoTService');

class IoTController {
  constructor() {
    this.service = new IoTService();
  }

  async registerDevice(req, res, next) {
    try {
      const device = await this.service.registerDevice(req.body);
      res.status(201).json({ success: true, data: device });
    } catch (error) {
      next(error);
    }
  }

  async receiveTelemetry(req, res, next) {
    try {
      const { device_uid, data } = req.body;
      const result = await this.service.receiveTelemetry(device_uid, data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getDevices(req, res, next) {
    try {
      const devices = await this.service.getPolicyDevices(req.query.policy_id);
      res.json({ success: true, data: devices });
    } catch (error) {
      next(error);
    }
  }

  async getHistoricalData(req, res, next) {
    try {
      const { deviceId } = req.params;
      const { start_date, end_date } = req.query;
      const data = await this.service.getHistoricalData(deviceId, start_date, end_date);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IoTController();

