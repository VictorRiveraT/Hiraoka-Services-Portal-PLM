const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "hiraoka_services",
  user: process.env.DB_USER || "hiraoka_admin",
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
