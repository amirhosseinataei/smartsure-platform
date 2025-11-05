const BaseModel = require('./BaseModel');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * کلاس Model برای مستندات
 */
class Document extends BaseModel {
  constructor() {
    super('documents');
  }

  /**
   * ایجاد مستند جدید
   */
  async create(data) {
    const documentData = {
      claim_id: data.claim_id || null,
      customer_id: data.customer_id || null,
      partner_id: data.partner_id || null,
      file_path: data.file_path,
      file_type: data.file_type,
      hash: data.hash || null,
      digital_signature: data.digital_signature || null,
      verified: data.verified || false,
      location: data.location || null
    };

    return await super.create(documentData);
  }

  /**
   * پیدا کردن مستندات یک خسارت
   */
  async findByClaimId(claimId) {
    return await this.findAll({
      where: { claim_id: claimId }
    });
  }

  /**
   * محاسبه Hash فایل
   */
  calculateFileHash(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      return hashSum.digest('hex');
    } catch (error) {
      throw new Error(`Error calculating file hash: ${error.message}`);
    }
  }

  /**
   * تایید Hash فایل
   */
  async verifyHash(id) {
    const document = await this.findById(id);
    if (!document || !document.file_path) {
      return false;
    }

    const currentHash = this.calculateFileHash(document.file_path);
    return currentHash === document.hash;
  }

  /**
   * تایید مستند
   */
  async verify(id, digitalSignature = null) {
    const updateData = {
      verified: true
    };

    if (digitalSignature) {
      updateData.digital_signature = digitalSignature;
    }

    return await this.update(id, updateData);
  }

  /**
   * پیدا کردن مستندات بر اساس نوع
   */
  async findByType(fileType, options = {}) {
    return await this.findAll({
      where: { file_type: fileType },
      ...options
    });
  }

  /**
   * پیدا کردن مستندات تایید نشده
   */
  async findUnverified(options = {}) {
    return await this.findAll({
      where: { verified: false },
      ...options
    });
  }

  /**
   * اجرای Query (متد کمکی)
   */
  async query(queryString, parameters = {}) {
    const database = require('../config/database');
    return await database.query(queryString, parameters);
  }
}

module.exports = Document;

