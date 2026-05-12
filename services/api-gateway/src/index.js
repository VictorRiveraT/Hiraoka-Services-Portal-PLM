require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Seguridad ─────────────────────────────────────────────────
app.use(helmet());

// ── Rate limiting global (protección ante sobrecargas) ────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,                  // máx 200 requests por IP
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

// ── Ruta no encontrada ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada en el gateway.' });
});

// ── Iniciar ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[api-gateway] corriendo en puerto ${PORT}`);
  console.log(`[api-gateway] auth-service → ${process.env.AUTH_SERVICE_URL}`);
});