const express = require("express");
const router = express.Router();
const { getTicketById, getTicketsByDni } = require("../controllers/ticket.controller");
const validateDni = require("../middleware/validateDni");

router.get("/dni/:dni", validateDni, getTicketsByDni);
router.get("/:id", getTicketById);

module.exports = router;