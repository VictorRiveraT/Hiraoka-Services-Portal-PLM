require('dotenv').config();
const express = require('express');
const cors = require('cors');
const notificationRoutes = require('./routes/notification.routes');

const app = express();
const PORT = process.env.PORT || 3004;
const isProduction = process.env.NODE_ENV === 'production';

if (
  isProduction &&
  (
    !process.env.NOTIFICATION_INTERNAL_TOKEN ||
    process.env.NOTIFICATION_INTERNAL_TOKEN.length < 32 ||
    process.env.NOTIFICATION_INTERNAL_TOKEN.includes('change_me') ||
    process.env.NOTIFICATION_INTERNAL_TOKEN.startsWith('dev-')
  )
) {
  throw new Error('NOTIFICATION_INTERNAL_TOKEN segura es obligatoria en produccion.');
}

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin && origin !== '*');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    return callback(null, allowedOrigins.includes(origin));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'notification-service' });
});

app.get('/notifications/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'notification-service' });
});

app.use('/notifications', notificationRoutes);

app.listen(PORT);
