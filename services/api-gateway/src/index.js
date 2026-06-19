require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const proxyCache = new Map();
const cachedProxy = (key, options) => {
  if (!proxyCache.has(key)) proxyCache.set(key, createProxyMiddleware(options));
  return proxyCache.get(key);
};
app.set('trust proxy', 1);

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const logEvent = (level, event, details = {}) => {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: 'api-gateway',
    event,
    ...details,
  });
  (level === 'error' ? console.error : console.log)(entry);
};

const sanitizePath = (value) =>
  String(value || '')
    .replace(/\/dni\/\d{8}(?=\/|$|\?)/gi, '/dni/[REDACTED]')
    .replace(/([?&](?:token|email|dni)=)[^&]*/gi, '$1[REDACTED]');

app.use((req, res, next) => {
  const requestId = String(req.headers['x-request-id'] || crypto.randomUUID()).slice(0, 100);
  const startedAt = process.hrtime.bigint();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    logEvent(res.statusCode >= 500 ? 'error' : 'info', 'http_request', {
      request_id: requestId,
      method: req.method,
      path: sanitizePath(req.originalUrl),
      status: res.statusCode,
      duration_ms: Number(durationMs.toFixed(2)),
      ip: req.ip,
      user_agent: req.get('user-agent') || null,
    });
  });
  next();
});

// ── Seguridad ─────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
}));

// ── Rate limiting ─────────────────────────────────────────────

// Global: 1000 requests por IP cada 15 minutos
const globalLimiter = rateLimit({
  windowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: parsePositiveInt(process.env.RATE_LIMIT_MAX, 1000),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    logEvent('warn', 'rate_limit_exceeded', {
      request_id: res.getHeader('X-Request-Id'),
      path: sanitizePath(req.originalUrl),
      ip: req.ip,
    });
    res.status(options.statusCode).send(options.message);
  },
  message: { error: 'Demasiadas solicitudes. Intenta más tarde.' },
});
app.use(globalLimiter);

// Auth: 10 intentos por IP cada 15 minutos (proteccion fuerza bruta)
const authLimiter = rateLimit({
  windowMs: parsePositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticacion. Espera 15 minutos.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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
  pathRewrite: { '^/api/auth': '' },
  on: {
    error: (err, req, res) => {
      console.error('[GATEWAY] Error al conectar con auth-service:', err.message);
      res.status(503).json({ error: 'Servicio de autenticación no disponible.' });
    },
  },
}));

app.use('/api/usuarios', (req, res, next) => {
  req.url = '/api/auth/usuarios' + req.url;
  cachedProxy('auth-users', {
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.error('[GATEWAY] Error al conectar con auth-service:', err.message);
        res.status(503).json({ error: 'Servicio de autenticacion no disponible.' });
      },
    },
  })(req, res, next);
});

app.use('/usuarios', (req, res, next) => {
  req.url = '/api/auth/usuarios' + req.url;
  cachedProxy('auth-users', {
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.error('[GATEWAY] Error al conectar con auth-service:', err.message);
        res.status(503).json({ error: 'Servicio de autenticacion no disponible.' });
      },
    },
  })(req, res, next);
});

// ── Proxy → Ticket Service ────────────────────────────────────
app.use('/api/tickets', (req, res, next) => {
  req.url = '/tickets' + req.url;
  cachedProxy('tickets', {
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

app.use('/api/dashboard', (req, res, next) => {
  req.url = '/dashboard' + req.url;
  cachedProxy('tickets', {
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
app.use('/taller', createProxyMiddleware({
  target: process.env.TALLER_SERVICE_URL || 'http://taller-service:3003',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('[GATEWAY] Error al conectar con taller-service:', err.message);
      res.status(503).json({ error: 'Servicio de taller no disponible.' });
    },
  },
}));

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
app.use('/api/notifications', (req, res, next) => {
  req.url = '/notifications' + req.url;
  cachedProxy('notifications', {
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004',
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.error('[GATEWAY] Error al conectar con notification-service:', err.message);
        res.status(503).json({ error: 'Servicio de notificaciones no disponible.' });
      },
    },
  })(req, res, next);
});

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

app.use('/api/repuestos', (req, res, next) => {
  req.url = '/inventory' + req.url;
  cachedProxy('inventory', {
    target: process.env.LEGACY_SERVICE_URL || 'http://legacy-service:3005',
    changeOrigin: true,
  })(req, res, next);
});

app.use('/api/garantia', (req, res, next) => {
  req.url = '/warranty' + req.url;
  cachedProxy('warranty', {
    target: process.env.LEGACY_SERVICE_URL || 'http://legacy-service:3005',
    changeOrigin: true,
  })(req, res, next);
});

// Proxy → Admin Service
app.use('/admin', createProxyMiddleware({
  target: process.env.ADMIN_SERVICE_URL || 'http://admin-service:3006',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('[GATEWAY] Error al conectar con admin-service:', err.message);
      res.status(503).json({ error: 'Servicio administrativo no disponible.' });
    },
  },
}));

// Proxy → Admin API
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
app.listen(PORT);
