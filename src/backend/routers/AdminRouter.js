const express = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();
const auth = AuthMiddleware;

// فقط Admin و Operator دسترسی دارند
router.get('/dashboard',
  auth.requireAuth('admin', 'operator'),
  (req, res) => {
    res.json({ message: 'Admin dashboard endpoint' });
  }
);

module.exports = router;

