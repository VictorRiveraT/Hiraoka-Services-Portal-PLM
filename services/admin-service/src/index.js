require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3006;

const SECURITY_HEADERS = {
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
};

const parseAllowedOrigins = () =>
  (process.env.CORS_ORIGIN || "http://localhost,http://localhost:80")
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o && o !== "*");

const allowedOrigins = parseAllowedOrigins();

app.disable("x-powered-by");
app.use((req, res, next) => {
  Object.entries(SECURITY_HEADERS).forEach(([h, v]) => res.setHeader(h, v));
  res.removeHeader("X-XSS-Protection");
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    return callback(null, allowedOrigins.includes(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Servir archivos estaticos del panel admin bajo /admin
//app.use('/admin', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'public')));

// Redirigir raiz al panel
// app.get('/', (req, res) => res.redirect('/admin/'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'admin-service' });
});

app.listen(PORT);
