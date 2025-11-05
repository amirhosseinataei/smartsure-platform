const winston = require('winston');
const path = require('path');
const fs = require('fs');

/**
 * کلاس Logger برای ثبت رویدادها
 */
class Logger {
  constructor(module = 'App') {
    this.module = module;
    
    // ایجاد دایرکتوری logs در صورت عدم وجود
    const logDir = process.env.LOG_FILE_PATH ? path.dirname(process.env.LOG_FILE_PATH) : './logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // تنظیمات Logger
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, module, ...meta }) => {
        let msg = `${timestamp} [${level}] [${module || this.module}] ${message}`;
        if (Object.keys(meta).length > 0) {
          msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
      })
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { module: this.module },
      transports: [
        // فایل برای تمام Log ها
        new winston.transports.File({
          filename: process.env.LOG_FILE_PATH || path.join(logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        // فایل برای تمام Log ها
        new winston.transports.File({
          filename: process.env.LOG_FILE_PATH || path.join(logDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });

    // در حالت Development، نمایش در Console
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: consoleFormat
      }));
    }
  }

  /**
   * ثبت Log با سطح info
   */
  info(message, meta = {}) {
    this.logger.info(message, { ...meta, module: this.module });
  }

  /**
   * ثبت Log با سطح error
   */
  error(message, error = {}) {
    const errorMeta = {
      ...(error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error)
    };
    this.logger.error(message, { ...errorMeta, module: this.module });
  }

  /**
   * ثبت Log با سطح warn
   */
  warn(message, meta = {}) {
    this.logger.warn(message, { ...meta, module: this.module });
  }

  /**
   * ثبت Log با سطح debug
   */
  debug(message, meta = {}) {
    this.logger.debug(message, { ...meta, module: this.module });
  }

  /**
   * ثبت Log با سطح verbose
   */
  verbose(message, meta = {}) {
    this.logger.verbose(message, { ...meta, module: this.module });
  }
}

module.exports = Logger;

