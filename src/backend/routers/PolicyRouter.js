const express = require('express');
const PolicyController = require('../controllers/PolicyController');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const Joi = require('joi');

const router = express.Router();
const controller = PolicyController;
const validator = ValidationMiddleware;
const auth = AuthMiddleware;

// Schema ها
const createPolicySchema = Joi.object({
  insurance_type: Joi.string().valid('vehicle', 'home', 'health', 'cargo').required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  premium_amount: Joi.number().positive().required(),
  dynamic_premium: Joi.boolean().default(false),
  iot_enabled: Joi.boolean().default(true)
});

// Routes
router.post('/',
  auth.authenticate(),
  validator.validate(createPolicySchema),
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

router.patch('/:id/premium',
  auth.authenticate(),
  validator.validateParams(Joi.object({ id: Joi.number().required() })),
  controller.updatePremium.bind(controller)
);

module.exports = router;

