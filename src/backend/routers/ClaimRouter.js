const express = require('express');
const ClaimController = require('../controllers/ClaimController');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const Joi = require('joi');

const router = express.Router();
const controller = ClaimController;
const validator = ValidationMiddleware;
const auth = AuthMiddleware;

// Schema ها
const createClaimSchema = Joi.object({
  policy_id: Joi.number().required(),
  incident_id: Joi.number().optional(),
  claim_amount: Joi.number().positive().required(),
  description: Joi.string().optional()
});

// Routes
router.post('/',
  auth.authenticate(),
  validator.validate(createClaimSchema),
  controller.create.bind(controller)
);

router.get('/',
  auth.authenticate(),
  controller.getAll.bind(controller)
);

router.get('/:id',
  auth.authenticate(),
  validator.validateParams(Joi.object({ id: Joi.number().required() })),
  controller.getById.bind(controller)
);

module.exports = router;

