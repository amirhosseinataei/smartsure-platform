/**
 * تنظیمات اصلی اپلیکیشن
 */
class AppConfig {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.port = parseInt(process.env.PORT) || 3000;
    this.apiVersion = process.env.API_VERSION || 'v1';
    this.baseUrl = process.env.BASE_URL || `http://localhost:${this.port}`;
    
    // JWT Configuration
    this.jwt = {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    };

    // File Upload
    this.upload = {
      maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760, // 10MB
      path: process.env.UPLOAD_PATH || './uploads',
      allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(',')
    };

    // Rate Limiting
    this.rateLimit = {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    };

    // CORS
    this.cors = {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
      credentials: true
    };

    // Payment Gateway
    this.payment = {
      apiKey: process.env.PAYMENT_GATEWAY_API_KEY || '',
      autoApproveThreshold: 5000000 // 5M تومان
    };

    // AI Service
    this.ai = {
      serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:5000',
      apiKey: process.env.AI_SERVICE_API_KEY || ''
    };

    // Blockchain
    this.blockchain = {
      nodeUrl: process.env.BLOCKCHAIN_NODE_URL || 'http://localhost:8545',
      privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || ''
    };
  }

  /**
   * بررسی اینکه آیا در حالت Production است
   */
  isProduction() {
    return this.env === 'production';
  }

  /**
   * بررسی اینکه آیا در حالت Development است
   */
  isDevelopment() {
    return this.env === 'development';
  }

  /**
   * دریافت API Base Path
   */
  getApiPath() {
    return `/api/${this.apiVersion}`;
  }
}

module.exports = new AppConfig();

