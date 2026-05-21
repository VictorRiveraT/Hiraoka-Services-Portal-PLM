const express = require("express");
const router = express.Router();
const {
  getTicketById,
  getTicketsByDni,
  consultarTicketSeguro,
} = require("../controllers/ticket.controller");
const validateDni = require("../middleware/validateDni");

// POST /tickets/consulta — HSPP-34: Validación segura DNI + id_ticket (FEAT01)
// IMPORTANTE: debe declararse ANTES de /:id para que Express no lo capture como parámetro
router.post("/consulta", consultarTicketSeguro);

// GET /tickets/dni/:dni — Consulta todos los tickets de un cliente por DNI
router.get("/dni/:dni", validateDni, getTicketsByDni);

// GET /tickets/:id — Consulta un ticket por su UUID
router.get("/:id", getTicketById);

module.exports = router;