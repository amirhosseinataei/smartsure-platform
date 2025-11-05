const express = require('express');
const DocumentController = require('../controllers/DocumentController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const multer = require('multer');
const path = require('path');
const appConfig = require('../config/app');

const router = express.Router();
const controller = DocumentController;
const auth = AuthMiddleware;

// تنظیمات Multer برای آپلود فایل
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, appConfig.upload.path);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: appConfig.upload.maxSize },
  fileFilter: (req, file, cb) => {
    if (appConfig.upload.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع فایل مجاز نیست'), false);
    }
  }
});

router.post('/',
  auth.authenticate(),
  upload.single('file'),
  controller.upload.bind(controller)
);

router.get('/:id',
  auth.authenticate(),
  controller.getById.bind(controller)
);

module.exports = router;

