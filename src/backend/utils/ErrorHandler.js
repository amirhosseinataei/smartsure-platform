const Logger = require('./Logger');

/**
 * کلاس مدیریت خطاهای سفارشی
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * کلاس‌های خطای سفارشی
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'احراز هویت نشده است') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'دسترسی غیرمجاز') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'منبع') {
    super(`${resource} یافت نشد`, 404, 'NOT_FOUND');
  }
}

class DuplicateError extends AppError {
  constructor(field = 'رکورد') {
    super(`${field} تکراری است`, 409, 'DUPLICATE_ENTRY');
  }
}

class PaymentError extends AppError {
  constructor(message = 'خطا در پردازش پرداخت') {
    super(message, 402, 'PAYMENT_ERROR');
  }
}

class AIError extends AppError {
  constructor(message = 'خطا در پردازش هوش مصنوعی') {
    super(message, 500, 'AI_ERROR');
  }
}

class IoTError extends AppError {
  constructor(message = 'خطا در ارتباط با دستگاه IoT') {
    super(message, 500, 'IOT_ERROR');
  }
}

/**
 * Middleware مدیریت خطا
 */
class ErrorHandler {
  constructor() {
    this.logger = new Logger('ErrorHandler');
  }

  /**
   * مدیریت خطاها
   */
  handle(err, req, res, next) {
    // خطای عملیاتی (از AppError)
    if (err.isOperational) {
      return this.sendErrorResponse(res, err.statusCode, {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.errors && { details: err.errors })
        }
      });
    }

    // خطای اعتبارسنجی (Joi)
    if (err.isJoi) {
      return this.sendErrorResponse(res, 400, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'اطلاعات ارسالی نامعتبر است',
          details: err.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    // خطای SQL Server
    if (err.code && err.code.startsWith('SQL')) {
      this.logger.error('Database error:', err);
      return this.sendErrorResponse(res, 500, {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'خطا در ارتباط با پایگاه داده'
        }
      });
    }

    // خطای ناشناخته
    this.logger.error('Unexpected error:', err);
    return this.sendErrorResponse(res, 500, {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? 'خطای داخلی سرور' 
          : err.message
      }
    });
  }

  /**
   * ارسال پاسخ خطا
   */
  sendErrorResponse(res, statusCode, error) {
    return res.status(statusCode).json(error);
  }

  /**
   * مدیریت خطای 404
   */
  handleNotFound(req, res) {
    return this.sendErrorResponse(res, 404, {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'مسیر یافت نشد'
      }
    });
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DuplicateError,
  PaymentError,
  AIError,
  IoTError,
  ErrorHandler
};

