const Policy = require('../models/Policy');
const Customer = require('../models/Customer');
const IoTDevice = require('../models/IoTDevice');
const SensorData = require('../models/SensorData');
const { NotFoundError, ValidationError } = require('../utils/ErrorHandler');
const Logger = require('../utils/Logger');

/**
 * کلاس Service برای مدیریت بیمه‌نامه‌ها
 */
class PolicyService {
  constructor() {
    this.policyModel = new Policy();
    this.customerModel = new Customer();
    this.iotDeviceModel = new IoTDevice();
    this.sensorDataModel = new SensorData();
    this.logger = new Logger('PolicyService');
  }

  /**
   * ایجاد بیمه‌نامه جدید
   */
  async createPolicy(data) {
    try {
      // بررسی وجود مشتری
      const customer = await this.customerModel.findById(data.customer_id);
      if (!customer) {
        throw new NotFoundError('مشتری');
      }

      // ایجاد بیمه‌نامه
      const policy = await this.policyModel.create(data);

      return policy;
    } catch (error) {
      this.logger.error('Create policy error', error);
      throw error;
    }
  }

  /**
   * دریافت بیمه‌نامه‌های یک مشتری
   */
  async getCustomerPolicies(customerId, options = {}) {
    try {
      const policies = await this.policyModel.findByCustomerId(customerId, options);
      
      // اضافه کردن اطلاعات IoT برای هر بیمه‌نامه
      const policiesWithIoT = await Promise.all(
        policies.map(async (policy) => {
          if (policy.iot_enabled) {
            const devices = await this.iotDeviceModel.findByPolicyId(policy.id);
            return { ...policy, devices };
          }
          return policy;
        })
      );

      return policiesWithIoT;
    } catch (error) {
      this.logger.error('Get customer policies error', error);
      throw error;
    }
  }

  /**
   * دریافت جزئیات بیمه‌نامه
   */
  async getPolicyById(id) {
    try {
      const policy = await this.policyModel.findById(id);
      if (!policy) {
        throw new NotFoundError('بیمه‌نامه');
      }

      // اضافه کردن اطلاعات مشتری
      const customer = await this.customerModel.findById(policy.customer_id);
      
      // اضافه کردن اطلاعات IoT
      let devices = [];
      if (policy.iot_enabled) {
        devices = await this.iotDeviceModel.findByPolicyId(policy.id);
      }

      return {
        ...policy,
        customer,
        devices
      };
    } catch (error) {
      this.logger.error('Get policy by id error', error);
      throw error;
    }
  }

  /**
   * فعال‌سازی بیمه‌نامه
   */
  async activatePolicy(id) {
    try {
      const policy = await this.policyModel.findById(id);
      if (!policy) {
        throw new NotFoundError('بیمه‌نامه');
      }

      if (policy.policy_status === 'active') {
        throw new ValidationError('بیمه‌نامه قبلاً فعال است');
      }

      return await this.policyModel.activate(id);
    } catch (error) {
      this.logger.error('Activate policy error', error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی حق بیمه پویا
   */
  async updateDynamicPremium(id) {
    try {
      const policy = await this.policyModel.findById(id);
      if (!policy) {
        throw new NotFoundError('بیمه‌نامه');
      }

      if (!policy.dynamic_premium || !policy.iot_enabled) {
        throw new ValidationError('بیمه‌نامه حق بیمه پویا ندارد یا IoT فعال نیست');
      }

      // محاسبه Risk Score
      const riskScore = await this.calculateRiskScore(id);

      // محاسبه Behavior Score
      const behaviorScore = await this.calculateBehaviorScore(id);

      // به‌روزرسانی حق بیمه
      return await this.policyModel.updateDynamicPremium(id, riskScore, behaviorScore);
    } catch (error) {
      this.logger.error('Update dynamic premium error', error);
      throw error;
    }
  }

  /**
   * محاسبه Risk Score
   */
  async calculateRiskScore(policyId) {
    try {
      // این محاسبه باید با داده‌های IoT و تاریخچه ادعاها انجام شود
      // در اینجا یک نسخه ساده ارائه شده است

      const policy = await this.policyModel.findById(policyId);
      const customer = await this.customerModel.findById(policy.customer_id);
      
      let riskScore = parseFloat(customer.risk_profile === 'critical' ? 0.8 : 
                                 customer.risk_profile === 'high' ? 0.6 :
                                 customer.risk_profile === 'medium' ? 0.4 : 0.2);

      // بررسی داده‌های IoT برای ناهنجاری
      const devices = await this.iotDeviceModel.findByPolicyId(policyId);
      for (const device of devices) {
        const anomalies = await this.sensorDataModel.findAnomalies(device.id, { limit: 10 });
        if (anomalies.length > 5) {
          riskScore += 0.1;
        }
      }

      return Math.min(Math.max(riskScore, 0), 1);
    } catch (error) {
      this.logger.error('Calculate risk score error', error);
      return 0.5; // پیش‌فرض
    }
  }

  /**
   * محاسبه Behavior Score
   */
  async calculateBehaviorScore(policyId) {
    try {
      // این محاسبه باید با تحلیل رفتار از داده‌های IoT انجام شود
      // در اینجا یک نسخه ساده ارائه شده است

      const devices = await this.iotDeviceModel.findByPolicyId(policyId);
      if (devices.length === 0) {
        return 0.5; // پیش‌فرض
      }

      let behaviorScore = 0.5;

      // تحلیل داده‌های اخیر (30 روز گذشته)
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      for (const device of devices) {
        const stats = await this.sensorDataModel.getStatistics(
          device.id,
          null,
          startDate,
          endDate
        );

        // اگر ناهنجاری کم باشد، Behavior Score بالا می‌رود
        if (stats.anomaly_count < stats.total_count * 0.1) {
          behaviorScore += 0.1;
        }
      }

      return Math.min(Math.max(behaviorScore, 0), 1);
    } catch (error) {
      this.logger.error('Calculate behavior score error', error);
      return 0.5; // پیش‌فرض
    }
  }

  /**
   * تمدید بیمه‌نامه
   */
  async renewPolicy(id, newEndDate, newPremiumAmount) {
    try {
      const policy = await this.policyModel.findById(id);
      if (!policy) {
        throw new NotFoundError('بیمه‌نامه');
      }

      if (policy.policy_status !== 'active' && policy.policy_status !== 'expired') {
        throw new ValidationError('بیمه‌نامه قابل تمدید نیست');
      }

      return await this.policyModel.renew(id, newEndDate, newPremiumAmount);
    } catch (error) {
      this.logger.error('Renew policy error', error);
      throw error;
    }
  }

  /**
   * لغو بیمه‌نامه
   */
  async cancelPolicy(id) {
    try {
      const policy = await this.policyModel.findById(id);
      if (!policy) {
        throw new NotFoundError('بیمه‌نامه');
      }

      return await this.policyModel.cancel(id);
    } catch (error) {
      this.logger.error('Cancel policy error', error);
      throw error;
    }
  }

  /**
   * بررسی انقضای بیمه‌نامه‌ها (برای Cron Job)
   */
  async checkExpiredPolicies() {
    try {
      const expiredPolicies = await this.policyModel.checkExpired();
      this.logger.info(`Found ${expiredPolicies.length} expired policies`);
      return expiredPolicies;
    } catch (error) {
      this.logger.error('Check expired policies error', error);
      throw error;
    }
  }
}

module.exports = PolicyService;

