const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
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
  getHistorialProducto,
  getMetricasDashboard,
  crearTicket,
  registrarEntregaTicket,
  responderNps,
  subirEvidencias,
} = require("../controllers/ticket.controller");

const validateDni = require("../middleware/validateDni");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");

const uploadDir = process.env.UPLOAD_DIR || "/app/uploads/evidencias";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.params.id}-${crypto.randomUUID()}${extension}`);
  },
});
const upload = multer({
  storage,
  limits: { files: 5, fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});

// POST /tickets/consulta — HSPP-34: Validación segura DNI + id_ticket (FEAT01)
// IMPORTANTE: debe declararse ANTES de /:id para que Express no lo capture como parámetro
router.post("/consulta", consultarTicketSeguro);

// GET /tickets/dni/:dni — Consulta todos los tickets de un cliente por DNI
router.get("/dni/:dni", verifyToken, validateDni, getTicketsByDni);

// GET /tickets/tecnico/mis-tickets — Panel tecnico: tickets asignados
router.get("/tecnico/mis-tickets", verifyToken, getTicketsAsignadosTecnico);

// GET /tickets/historial/:numero_serie — FEAT07: historial del equipo
router.get("/historial/:numero_serie", verifyToken, getHistorialProducto);

// GET /dashboard/metricas — FEAT14: KPIs del periodo solicitado
router.get("/dashboard/metricas", verifyToken, getMetricasDashboard);

// POST /tickets - FEAT05: Registro de entrada de equipo
router.post('/', verifyToken, crearTicket);

// POST /tickets/:id/nps - FEAT15: registra una unica encuesta NPS
router.post("/:id/nps", responderNps);

// POST /tickets/:id/entrega - Agente registra pago simulado y entrega
router.post("/:id/entrega", verifyToken, authorizeRoles("Agente", "Administrador"), registrarEntregaTicket);

// PUT /tickets/:id/estado — Tecnico asignado actualiza estado del ticket
router.put("/:id/estado", verifyToken, authorizeRoles("Tecnico"), actualizarEstadoTicket);

// POST /tickets/:id/asignar — Agente/Admin asigna tecnico al ticket
router.post("/:id/asignar", verifyToken, authorizeRoles("Agente", "Administrador"), asignarTecnicoTicket);

// GET /tickets/:id/repuestos — FEAT10: disponibilidad y repuestos asignados
router.get("/:id/repuestos", consultarRepuestosTicket);

// POST /tickets/:id/repuestos — FEAT11: asigna repuestos y descuenta stock
router.post("/:id/repuestos", verifyToken, authorizeRoles("Tecnico", "Agente", "Administrador"), asignarRepuestosTicket);

// GET /tickets/:id/garantia — FEAT12: cobertura de garantia
router.get("/:id/garantia", consultarGarantiaTicket);

// GET /tickets/:id — Consulta un ticket por su UUID
router.get("/:id", verifyToken, getTicketById);

router.post("/:id/evidencias", verifyToken, authorizeRoles("Tecnico"), upload.array("fotos", 5), subirEvidencias);

module.exports = router;

