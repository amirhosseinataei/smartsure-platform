const Joi = require('joi');
const { ValidationError } = require('../utils/ErrorHandler');
const Logger = require('../utils/Logger');

/**
 * کلاس Middleware برای اعتبارسنجی
 */
class ValidationMiddleware {
  constructor() {
    this.logger = new Logger('ValidationMiddleware');
  }

  /**
   * اعتبارسنجی Request Body
   */
  validate(schema) {
    return (req, res, next) => {
      try {
        const { error, value } = schema.validate(req.body, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }));

          throw new ValidationError('اطلاعات ارسالی نامعتبر است', errors);
        }

        req.body = value;
        next();
      } catch (error) {
        this.logger.error('Validation error', error);
        next(error);
      }
    };
  }

  /**
   * اعتبارسنجی Query Parameters
   */
  validateQuery(schema) {
    return (req, res, next) => {
      try {
        const { error, value } = schema.validate(req.query, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }));

          throw new ValidationError('پارامترهای Query نامعتبر است', errors);
        }

        req.query = value;
        next();
      } catch (error) {
        this.logger.error('Query validation error', error);
        next(error);
      }
    };
  }

  /**
   * اعتبارسنجی URL Parameters
   */
  validateParams(schema) {
    return (req, res, next) => {
      try {
        const { error, value } = schema.validate(req.params, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }));

          throw new ValidationError('پارامترهای URL نامعتبر است', errors);
        }

        req.params = value;
        next();
      } catch (error) {
        this.logger.error('Params validation error', error);
        next(error);
      }
    };
  }
}

module.exports = new ValidationMiddleware();

