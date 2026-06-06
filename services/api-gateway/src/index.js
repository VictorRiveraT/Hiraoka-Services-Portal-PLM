require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Seguridad ─────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
}));

// ── Rate limiting global (protección ante sobrecargas) ────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Demasiadas solicitudes. Intenta más tarde.' },
});
app.use(globalLimiter);

// ── Health check del gateway ──────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  });
});

// ── Proxy → Auth Service ──────────────────────────────────────
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('[GATEWAY] Error al conectar con auth-service:', err.message);
      res.status(503).json({ error: 'Servicio de autenticación no disponible.' });
    },
  },
}));

// ── Proxy → Ticket Service ────────────────────────────────────
app.use('/api/tickets', (req, res, next) => {
  req.url = '/tickets' + req.url;
  createProxyMiddleware({
    target: process.env.TICKET_SERVICE_URL || 'http://ticket-service:3002',
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.error('[GATEWAY] Error al conectar con ticket-service:', err.message);
        res.status(503).json({ error: 'Servicio de tickets no disponible.' });
      },
    },
  })(req, res, next);
});

// Proxy → Taller Service
app.use('/api/taller', createProxyMiddleware({
  target: process.env.TALLER_SERVICE_URL || 'http://taller-service:3003',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('[GATEWAY] Error al conectar con taller-service:', err.message);
      res.status(503).json({ error: 'Servicio de taller no disponible.' });
    },
  },
}));

// Proxy → Notification Service
app.use('/api/notifications', createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('[GATEWAY] Error al conectar con notification-service:', err.message);
      res.status(503).json({ error: 'Servicio de notificaciones no disponible.' });
    },
  },
}));

// Proxy -> Legacy Service (APIs legadas Hiraoka)
app.use('/api/legacy', createProxyMiddleware({
  target: process.env.LEGACY_SERVICE_URL || 'http://legacy-service:3005',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('[GATEWAY] Error al conectar con legacy-service:', err.message);
      res.status(503).json({ error: 'Servicio de integracion no disponible.' });
    },
  },
}));

// ── Frontend público → Ticket Service ────────────────────────
app.use('/', createProxyMiddleware({
  target: process.env.TICKET_SERVICE_URL || 'http://ticket-service:3002',
  changeOrigin: true,
}));

// ── Ruta no encontrada ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada en el gateway.' });
});

// ── Iniciar ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[api-gateway] corriendo en puerto ${PORT}`);
  console.log(`[api-gateway] auth-service → ${process.env.AUTH_SERVICE_URL}`);
});