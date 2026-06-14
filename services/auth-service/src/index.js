require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const pool = require('./config/database');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;
app.set('trust proxy', 1);

const cspDirectives = {
  defaultSrc: ["'self'"],
  baseUri: ["'self'"],
  frameAncestors: ["'none'"],
  objectSrc: ["'none'"],
  scriptSrc: ["'self'"],
  scriptSrcAttr: ["'none'"],
  styleSrc: ["'self'"],
  imgSrc: ["'self'", 'data:'],
  fontSrc: ["'self'"],
  connectSrc: ["'self'"],
  formAction: ["'self'"],
};

// ── Seguridad y parseo ────────────────────────────────────────────
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: cspDirectives,
  },
  xXssProtection: false,
}));
app.use(express.json());

// ── Health check (para el API Gateway) ───────────────────────────
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', service: 'auth-service' });
  } catch {
    res.status(503).json({ status: 'error', service: 'auth-service' });
  }
});

// ── Rutas ─────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/', authRoutes);

// ── Manejo de rutas no encontradas ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// ── Iniciar servidor ──────────────────────────────────────────────
app.listen(PORT);
