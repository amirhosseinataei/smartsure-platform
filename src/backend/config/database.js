const sql = require('mssql');
const Logger = require('../utils/Logger');

/**
 * کلاس مدیریت اتصال به پایگاه داده SQL Server
 */
class Database {
  constructor() {
    this.pool = null;
    this.config = {
      server: process.env.DB_SERVER || 'localhost',
      database: process.env.DB_DATABASE || 'smartsure',
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT) || 1433,
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        enableArithAbort: true
      },
      pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        min: parseInt(process.env.DB_POOL_MIN) || 0,
        idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000
      }
    };
    this.logger = new Logger('Database');
  }

  /**
   * اتصال به پایگاه داده
   */
  async connect() {
    try {
      if (this.pool) {
        return this.pool;
      }

      this.pool = await sql.connect(this.config);
      this.logger.info('Connected to SQL Server database');
      
      // مدیریت خطاهای اتصال
      this.pool.on('error', (err) => {
        this.logger.error('Database connection error:', err);
        this.pool = null;
      });

      return this.pool;
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  /**
   * بستن اتصال
   */
  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.close();
        this.pool = null;
        this.logger.info('Database connection closed');
      }
    } catch (error) {
      this.logger.error('Error closing database connection:', error);
      throw error;
    }
  }

  /**
   * اجرای Query
   */
  async query(queryString, parameters = {}) {
    try {
      if (!this.pool) {
        await this.connect();
      }

      const request = this.pool.request();
      
      // اضافه کردن پارامترها
      Object.keys(parameters).forEach(key => {
        request.input(key, parameters[key]);
      });

      const result = await request.query(queryString);
      return result.recordset;
    } catch (error) {
      this.logger.error('Query error:', { query: queryString, error });
      throw error;
    }
  }

  /**
   * اجرای Stored Procedure
   */
  async executeProcedure(procedureName, parameters = {}) {
    try {
      if (!this.pool) {
        await this.connect();
      }

      const request = this.pool.request();
      
      // اضافه کردن پارامترها
      Object.keys(parameters).forEach(key => {
        request.input(key, parameters[key]);
      });

      const result = await request.execute(procedureName);
      return result.recordset;
    } catch (error) {
      this.logger.error('Stored procedure error:', { procedure: procedureName, error });
      throw error;
    }
  }

  /**
   * شروع Transaction
   */
  async beginTransaction() {
    try {
      if (!this.pool) {
        await this.connect();
      }

      const transaction = new sql.Transaction(this.pool);
      await transaction.begin();
      return transaction;
    } catch (error) {
      this.logger.error('Transaction begin error:', error);
      throw error;
    }
  }

  /**
   * دریافت Connection Pool
   */
  getPool() {
    return this.pool;
  }

  /**
   * بررسی سلامت اتصال
   */
  async healthCheck() {
    try {
      if (!this.pool) {
        await this.connect();
      }
      
      const result = await this.query('SELECT 1 AS health');
      return result.length > 0;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
const database = new Database();

module.exports = database;

