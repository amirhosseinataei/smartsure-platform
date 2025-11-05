const database = require('../config/database');
const Logger = require('../utils/Logger');

/**
 * کلاس پایه برای تمام Model ها
 */
class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.logger = new Logger(`Model:${tableName}`);
  }

  /**
   * پیدا کردن رکورد بر اساس ID
   */
  async findById(id) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = @id`;
      const result = await database.query(query, { id });
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      this.logger.error(`Error finding by id: ${id}`, error);
      throw error;
    }
  }

  /**
   * پیدا کردن همه رکوردها
   */
  async findAll(options = {}) {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const params = {};

      // اضافه کردن WHERE
      if (options.where) {
        const whereClauses = [];
        Object.keys(options.where).forEach((key, index) => {
          whereClauses.push(`${key} = @param${index}`);
          params[`param${index}`] = options.where[key];
        });
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      // اضافه کردن ORDER BY
      if (options.orderBy) {
        query += ` ORDER BY ${options.orderBy}`;
      }

      // اضافه کردن LIMIT و OFFSET
      if (options.limit) {
        query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
        params.offset = options.offset || 0;
        params.limit = options.limit;
      }

      const result = await database.query(query, params);
      return result;
    } catch (error) {
      this.logger.error('Error finding all records', error);
      throw error;
    }
  }

  /**
   * ایجاد رکورد جدید
   */
  async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const values = Object.keys(data).map((key, index) => `@param${index}`).join(', ');
      const params = {};
      
      Object.keys(data).forEach((key, index) => {
        params[`param${index}`] = data[key];
      });

      const query = `INSERT INTO ${this.tableName} (${fields}) OUTPUT INSERTED.* VALUES (${values})`;
      const result = await database.query(query, params);
      return result[0];
    } catch (error) {
      this.logger.error('Error creating record', error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی رکورد
   */
  async update(id, data) {
    try {
      const setClauses = [];
      const params = { id };
      
      Object.keys(data).forEach((key, index) => {
        setClauses.push(`${key} = @param${index}`);
        params[`param${index}`] = data[key];
      });

      const query = `UPDATE ${this.tableName} SET ${setClauses.join(', ')}, updated_at = GETDATE() OUTPUT INSERTED.* WHERE id = @id`;
      const result = await database.query(query, params);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      this.logger.error(`Error updating record: ${id}`, error);
      throw error;
    }
  }

  /**
   * حذف رکورد
   */
  async delete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} OUTPUT DELETED.* WHERE id = @id`;
      const result = await database.query(query, { id });
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      this.logger.error(`Error deleting record: ${id}`, error);
      throw error;
    }
  }

  /**
   * شمارش رکوردها
   */
  async count(options = {}) {
    try {
      let query = `SELECT COUNT(*) AS count FROM ${this.tableName}`;
      const params = {};

      if (options.where) {
        const whereClauses = [];
        Object.keys(options.where).forEach((key, index) => {
          whereClauses.push(`${key} = @param${index}`);
          params[`param${index}`] = options.where[key];
        });
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      const result = await database.query(query, params);
      return result[0].count;
    } catch (error) {
      this.logger.error('Error counting records', error);
      throw error;
    }
  }

  /**
   * پیدا کردن یک رکورد
   */
  async findOne(options = {}) {
    try {
      const results = await this.findAll({ ...options, limit: 1 });
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      this.logger.error('Error finding one record', error);
      throw error;
    }
  }
}

module.exports = BaseModel;

