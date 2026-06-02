const express = require('express');
const router = express.Router();
const { sendNotification } = require('../controllers/notification.controller');

router.post('/send', sendNotification);

module.exports = router;