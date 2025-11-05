const express = require('express');
const PaymentController = require('../controllers/PaymentController');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();
const controller = PaymentController;
const auth = AuthMiddleware;

router.post('/claim',
  auth.authenticate(),
  controller.processClaimPayment.bind(controller)
);

router.get('/',
  auth.authenticate(),
  controller.getHistory.bind(controller)
);

module.exports = router;

