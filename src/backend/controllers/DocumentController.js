const Document = require('../models/Document');

class DocumentController {
  constructor() {
    this.model = new Document();
  }

  async upload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'فایل ارسال نشده است' });
      }

      const hash = this.model.calculateFileHash(req.file.path);
      
      const document = await this.model.create({
        claim_id: req.body.claim_id,
        customer_id: req.userId,
        file_path: req.file.path,
        file_type: req.body.file_type,
        hash: hash
      });

      res.status(201).json({ success: true, data: document });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const document = await this.model.findById(req.params.id);
      if (!document) {
        return res.status(404).json({ success: false, error: 'مستند یافت نشد' });
      }
      res.json({ success: true, data: document });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();

