const express = require("express");
const router = express.Router();
const {
  getTicketById,
  getTicketsByDni,
  consultarTicketSeguro,
  consultarRepuestosTicket,
  asignarRepuestosTicket,
  consultarGarantiaTicket,
  getTicketsAsignadosTecnico,
  actualizarEstadoTicket,
  asignarTecnicoTicket,
} = require("../controllers/ticket.controller");
const validateDni = require("../middleware/validateDni");
const verifyToken = require("../middleware/verifyToken");

// POST /tickets/consulta — HSPP-34: Validación segura DNI + id_ticket (FEAT01)
// IMPORTANTE: debe declararse ANTES de /:id para que Express no lo capture como parámetro
router.post("/consulta", consultarTicketSeguro);

// GET /tickets/dni/:dni — Consulta todos los tickets de un cliente por DNI
router.get("/dni/:dni", validateDni, getTicketsByDni);

// GET /tickets/tecnico/mis-tickets — Panel tecnico: tickets asignados
router.get("/tecnico/mis-tickets", verifyToken, getTicketsAsignadosTecnico);

// PUT /tickets/:id/estado — Tecnico asignado actualiza estado del ticket
router.put("/:id/estado", verifyToken, actualizarEstadoTicket);

// POST /tickets/:id/asignar — Agente/Admin asigna tecnico al ticket
router.post("/:id/asignar", verifyToken, asignarTecnicoTicket);

// GET /tickets/:id/repuestos — FEAT10: disponibilidad y repuestos asignados
router.get("/:id/repuestos", consultarRepuestosTicket);

// POST /tickets/:id/repuestos — FEAT11: asigna repuestos y descuenta stock
router.post("/:id/repuestos", verifyToken, asignarRepuestosTicket);

// GET /tickets/:id/garantia — FEAT12: cobertura de garantia
router.get("/:id/garantia", consultarGarantiaTicket);

// GET /tickets/:id — Consulta un ticket por su UUID
router.get("/:id", getTicketById);

module.exports = router;
