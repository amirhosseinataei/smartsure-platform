const BaseModel = require('./BaseModel');

/**
 * کلاس Model برای مدل‌های هوش مصنوعی
 */
class AIModel extends BaseModel {
  constructor() {
    super('ai_models');
  }

  /**
   * پیدا کردن مدل فعال بر اساس نوع
   */
  async findActiveByType(type) {
    const query = `
      SELECT * FROM ai_models 
      WHERE type = @type AND active = 1
      ORDER BY deployed_at DESC
    `;
    const result = await this.query(query, { type });
    return result.length > 0 ? result[0] : null;
  }

  /**
   * پیدا کردن همه مدل‌های فعال
   */
  async findActive() {
    return await this.findAll({
      where: { active: 1 }
    });
  }

  /**
   * غیرفعال کردن همه مدل‌های یک نوع
   */
  async deactivateByType(type) {
    const query = `
      UPDATE ai_models 
      SET active = 0, updated_at = GETDATE()
      WHERE type = @type AND active = 1
    `;
    await this.query(query, { type });
  }

  /**
   * فعال‌سازی یک مدل
   */
  async activate(id) {
    // ابتدا غیرفعال کردن مدل‌های هم‌نوع
    const model = await this.findById(id);
    if (model) {
      await this.deactivateByType(model.type);
      return await this.update(id, { active: 1 });
    }
    return null;
  }

  /**
   * اجرای Query (متد کمکی)
   */
  async query(queryString, parameters = {}) {
    const database = require('../config/database');
    return await database.query(queryString, parameters);
  }
}

module.exports = AIModel;

