const express = require('express');
const router = express.Router();
const { sendNotification } = require('../controllers/notification.controller');
const crypto = require('crypto');

const requireInternalToken = (req, res, next) => {
  const expected = process.env.NOTIFICATION_INTERNAL_TOKEN || '';
  const received = String(req.get('x-internal-token') || '');

  if (!expected && process.env.NODE_ENV !== 'production') return next();
  if (
    !expected ||
    expected.length !== received.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  ) {
    return res.status(401).json({ success: false, message: 'Credencial interna invalida.' });
  }
  next();
};

router.post('/send', requireInternalToken, sendNotification);

module.exports = router;
