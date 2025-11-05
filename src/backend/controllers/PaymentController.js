const PaymentService = require('../services/PaymentService');

class PaymentController {
  constructor() {
    this.service = new PaymentService();
  }

  async processClaimPayment(req, res, next) {
    try {
      const { claim_id, amount, method } = req.body;
      const payment = await this.service.processClaimPayment(claim_id, amount, method);
      res.json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await this.service.getPaymentHistory(req.userId);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();

