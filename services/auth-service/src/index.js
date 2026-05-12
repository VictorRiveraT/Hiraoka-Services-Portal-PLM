require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const pool = require('./config/database');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Seguridad y parseo ────────────────────────────────────────────
app.use(helmet());
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

// ── Manejo de rutas no encontradas ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// ── Iniciar servidor ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[auth-service] corriendo en puerto ${PORT}`);
  console.log(`[auth-service] entorno: ${process.env.NODE_ENV}`);
});