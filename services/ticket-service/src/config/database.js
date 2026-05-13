const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST     || "postgres",
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  console.error('[ticket-service] Error en pool DB:', err);
  process.exit(-1);
});

module.exports = pool;
