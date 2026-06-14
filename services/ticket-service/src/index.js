require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ticketRoutes = require("./routes/ticket.routes");
const verifyToken = require("./middleware/verifyToken");
const { getMetricasDashboard } = require("./controllers/ticket.controller");

const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

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
    .map((origin) => origin.trim())
    .filter((origin) => origin && origin !== "*");

const allowedOrigins = parseAllowedOrigins();

app.disable("x-powered-by");
app.use((req, res, next) => {
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  res.removeHeader("X-XSS-Protection");
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    return callback(null, allowedOrigins.includes(origin));
  },
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/agente', express.static(path.join(__dirname, 'public/agente')));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "ticket-service" });
});

// Rutas
app.get("/dashboard/metricas", verifyToken, getMetricasDashboard);
app.use("/tickets", ticketRoutes);

app.listen(PORT);
