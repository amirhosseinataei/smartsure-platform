const express = require('express');
const AuthController = require('../controllers/AuthController');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const Joi = require('joi');

/**
 * کلاس Router برای احراز هویت
 */
class AuthRouter {
  constructor() {
    this.router = express.Router();
    this.controller = AuthController;
    this.validator = ValidationMiddleware;
    this.auth = AuthMiddleware;
    
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Schema ها
    const registerSchema = Joi.object({
      username: Joi.string().required().min(3).max(50),
      email: Joi.string().email().required(),
      password: Joi.string().required().min(8),
      fullname: Joi.string().required(),
      phone: Joi.string().optional(),
      role: Joi.string().valid('customer', 'partner').default('customer'),
      national_id: Joi.string().optional()
    });

    const loginSchema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required()
    });

    const refreshTokenSchema = Joi.object({
      refreshToken: Joi.string().required()
    });

    const changePasswordSchema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required().min(8)
    });

    // Routes
    this.router.post('/register', 
      this.validator.validate(registerSchema),
      this.controller.register.bind(this.controller)
    );

    this.router.post('/login',
      this.validator.validate(loginSchema),
      this.controller.login.bind(this.controller)
    );

    this.router.post('/refresh-token',
      this.validator.validate(refreshTokenSchema),
      this.controller.refreshToken.bind(this.controller)
    );

    this.router.get('/profile',
      this.auth.authenticate(),
      this.controller.getProfile.bind(this.controller)
    );

    this.router.put('/change-password',
      this.auth.authenticate(),
      this.validator.validate(changePasswordSchema),
      this.controller.changePassword.bind(this.controller)
    );
  }

  getRouter() {
    return this.router;
  }
}

// Export router instance
const authRouter = new AuthRouter();
module.exports = authRouter.getRouter();

