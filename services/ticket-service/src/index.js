require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ticketRoutes = require("./routes/ticket.routes");

const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost',
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "ticket-service" });
});

// Rutas
app.use("/tickets", ticketRoutes);

app.listen(PORT, () => {
  console.log(`Ticket Service corriendo en puerto ${PORT}`);
});
