const PolicyService = require('../services/PolicyService');

class PolicyController {
  constructor() {
    this.service = new PolicyService();
  }

  async create(req, res, next) {
    try {
      const data = { ...req.body, customer_id: req.userId };
      const policy = await this.service.createPolicy(data);
      res.status(201).json({ success: true, data: policy });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const policies = await this.service.getCustomerPolicies(req.userId);
      res.json({ success: true, data: policies });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const policy = await this.service.getPolicyById(req.params.id);
      res.json({ success: true, data: policy });
    } catch (error) {
      next(error);
    }
  }

  async updatePremium(req, res, next) {
    try {
      const result = await this.service.updateDynamicPremium(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PolicyController();

