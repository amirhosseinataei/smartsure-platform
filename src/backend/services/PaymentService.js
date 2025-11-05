const Payment = require('../models/Payment');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const { NotFoundError, PaymentError } = require('../utils/ErrorHandler');
const Logger = require('../utils/Logger');
const axios = require('axios');
const appConfig = require('../config/app');

/**
 * کلاس Service برای مدیریت پرداخت‌ها
 */
class PaymentService {
  constructor() {
    this.paymentModel = new Payment();
    this.claimModel = new Claim();
    this.policyModel = new Policy();
    this.logger = new Logger('PaymentService');
  }

  /**
   * پرداخت خسارت
   */
  async processClaimPayment(claimId, amount, method = 'online') {
    try {
      const claim = await this.claimModel.findById(claimId);
      if (!claim) {
        throw new NotFoundError('خسارت');
      }

      if (claim.status !== 'approved' && claim.status !== 'auto_paid') {
        throw new PaymentError('خسارت تایید نشده است');
      }

      // ایجاد پرداخت
      const payment = await this.paymentModel.create({
        claim_id: claimId,
        amount: amount || claim.approved_amount,
        method: method
      });

      // پردازش پرداخت
      const paymentResult = await this.processPayment(payment, method);

      // به‌روزرسانی وضعیت
      await this.paymentModel.markAsCompleted(payment.id, paymentResult.transactionId);

      return payment;
    } catch (error) {
      this.logger.error('Process claim payment error', error);
      
      // به‌روزرسانی وضعیت به failed
      if (payment && payment.id) {
        await this.paymentModel.updateStatus(payment.id, 'failed');
      }

      throw error;
    }
  }

  /**
   * پردازش پرداخت (درگاه پرداخت)
   */
  async processPayment(payment, method) {
    try {
      // در اینجا باید با درگاه پرداخت واقعی ارتباط برقرار شود
      // این یک پیاده‌سازی نمونه است

      if (method === 'auto_deduct') {
        // پرداخت خودکار از حساب کاربر
        return await this.autoDeductPayment(payment);
      } else {
        // پرداخت آنلاین
        return await this.onlinePayment(payment);
      }
    } catch (error) {
      this.logger.error('Process payment error', error);
      throw new PaymentError('خطا در پردازش پرداخت');
    }
  }

  /**
   * پرداخت خودکار
   */
  async autoDeductPayment(payment) {
    // شبیه‌سازی پرداخت خودکار
    // در واقعیت باید با سیستم بانکی ارتباط برقرار شود
    
    const transactionId = `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId,
      message: 'پرداخت با موفقیت انجام شد'
    };
  }

  /**
   * پرداخت آنلاین
   */
  async onlinePayment(payment) {
    // شبیه‌سازی درگاه پرداخت
    // در واقعیت باید با درگاه پرداخت (مثل Zarinpal, IDPay) ارتباط برقرار شود

    try {
      // مثال استفاده از API درگاه پرداخت
      // const response = await axios.post('https://payment-gateway.com/api/pay', {
      //   amount: payment.amount,
      //   callback_url: `${appConfig.baseUrl}/api/v1/payments/callback`
      // }, {
      //   headers: {
      //     'Authorization': `Bearer ${appConfig.payment.apiKey}`
      //   }
      // });

      // return {
      //   success: true,
      //   transactionId: response.data.transaction_id,
      //   paymentUrl: response.data.payment_url
      // };

      // برای نمونه، یک Transaction ID تولید می‌کنیم
      const transactionId = `ONLINE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        transactionId,
        message: 'پرداخت با موفقیت انجام شد'
      };
    } catch (error) {
      this.logger.error('Online payment error', error);
      throw new PaymentError('خطا در ارتباط با درگاه پرداخت');
    }
  }

  /**
   * دریافت تاریخچه پرداخت‌ها
   */
  async getPaymentHistory(customerId = null, policyId = null, claimId = null) {
    try {
      if (claimId) {
        return await this.paymentModel.findByClaimId(claimId);
      }

      // در صورت نیاز، می‌توان Query پیچیده‌تری نوشت
      const query = `
        SELECT p.* 
        FROM payments p
        INNER JOIN claims c ON p.claim_id = c.id
        INNER JOIN policies pol ON c.policy_id = pol.id
        WHERE 1=1
        ${customerId ? 'AND pol.customer_id = @customerId' : ''}
        ${policyId ? 'AND pol.id = @policyId' : ''}
        ORDER BY p.paid_at DESC
      `;

      const params = {};
      if (customerId) params.customerId = customerId;
      if (policyId) params.policyId = policyId;

      const database = require('../config/database');
      return await database.query(query, params);
    } catch (error) {
      this.logger.error('Get payment history error', error);
      throw error;
    }
  }

  /**
   * دریافت آمار پرداخت‌ها
   */
  async getPaymentStatistics(customerId = null, policyId = null) {
    try {
      return await this.paymentModel.getStatistics(customerId, policyId);
    } catch (error) {
      this.logger.error('Get payment statistics error', error);
      throw error;
    }
  }
}

module.exports = PaymentService;

