const express = require('express');
const IoTController = require('../controllers/IoTController');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const Joi = require('joi');

const router = express.Router();
const controller = IoTController;
const validator = ValidationMiddleware;
const auth = AuthMiddleware;

// Routes
router.post('/devices',
  auth.authenticate(),
  controller.registerDevice.bind(controller)
);

router.post('/telemetry',
  auth.authenticate(),
  controller.receiveTelemetry.bind(controller)
);

router.get('/devices',
  auth.authenticate(),
  controller.getDevices.bind(controller)
);

router.get('/devices/:deviceId/data',
  auth.authenticate(),
  controller.getHistoricalData.bind(controller)
);

module.exports = router;

