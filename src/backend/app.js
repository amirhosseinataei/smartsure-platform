const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const appConfig = require('./config/app');
const { ErrorHandler } = require('./utils/ErrorHandler');
const Logger = require('./utils/Logger');

/**
 * کلاس اصلی اپلیکیشن Express
 */
class App {
  constructor() {
    this.app = express();
    this.logger = new Logger('App');
    this.errorHandler = new ErrorHandler();
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * راه‌اندازی Middleware ها
   */
  initializeMiddlewares() {
    // Security
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors(appConfig.cors));
    
    // Compression
    this.app.use(compression());
    
    // Body Parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Logging
    if (appConfig.isDevelopment()) {
      this.app.use(morgan('dev'));
    }
    
    // Request Logger
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      next();
    });
  }

  /**
   * راه‌اندازی Routes
   */
  initializeRoutes() {
    const apiPath = appConfig.getApiPath();
    
    // Health Check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // API Routes
    this.app.use(`${apiPath}/auth`, require('./routers/AuthRouter'));
    this.app.use(`${apiPath}/users`, require('./routers/UserRouter'));
    this.app.use(`${apiPath}/policies`, require('./routers/PolicyRouter'));
    this.app.use(`${apiPath}/iot`, require('./routers/IoTRouter'));
    this.app.use(`${apiPath}/claims`, require('./routers/ClaimRouter'));
    this.app.use(`${apiPath}/payments`, require('./routers/PaymentRouter'));
    this.app.use(`${apiPath}/documents`, require('./routers/DocumentRouter'));
    this.app.use(`${apiPath}/admin`, require('./routers/AdminRouter'));
    
    // 404 Handler
    this.app.use((req, res) => {
      this.errorHandler.handleNotFound(req, res);
    });
  }

  /**
   * راه‌اندازی Error Handling
   */
  initializeErrorHandling() {
    this.app.use((err, req, res, next) => {
      this.errorHandler.handle(err, req, res, next);
    });
  }

  /**
   * دریافت Express App
   */
  getApp() {
    return this.app;
  }
}

module.exports = App;

