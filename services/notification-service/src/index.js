require('dotenv').config();
const express = require('express');
const cors = require('cors');
const notificationRoutes = require('./routes/notification.routes');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'notification-service' });
});

app.get('/notifications/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'notification-service' });
});

app.use('/notifications', notificationRoutes);

app.listen(PORT);
