const express = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();
const auth = AuthMiddleware;

// Placeholder - می‌تواند با Controller تکمیل شود
router.get('/profile',
  auth.authenticate(),
  (req, res) => {
    res.json({ message: 'User profile endpoint' });
  }
);

module.exports = router;

