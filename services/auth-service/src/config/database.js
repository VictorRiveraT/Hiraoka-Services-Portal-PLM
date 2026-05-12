const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  max: 10,                  // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en el pool:', err);
  process.exit(-1);
});

module.exports = pool;