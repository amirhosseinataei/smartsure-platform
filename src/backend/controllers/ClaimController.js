const ClaimService = require('../services/ClaimService');

class ClaimController {
  constructor() {
    this.service = new ClaimService();
  }

  async create(req, res, next) {
    try {
      const data = { ...req.body, submitted_by: req.userId };
      const claim = await this.service.createClaim(data);
      res.status(201).json({ success: true, data: claim });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const claims = await this.service.getCustomerClaims(req.userId);
      res.json({ success: true, data: claims });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const claim = await this.service.getClaimById(req.params.id);
      res.json({ success: true, data: claim });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClaimController();

