const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');

// Rate limiting: máx 5 intentos de login por IP cada 15 min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos. Intenta en 15 minutos.' },
  standardHeaders: true,
});

router.post('/login',  loginLimiter, authController.login);
router.get('/verify',  verifyToken,  authController.verify);
router.post('/logout', verifyToken,  authController.logout);

module.exports = router;