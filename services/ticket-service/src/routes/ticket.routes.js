const express = require("express");
const router = express.Router();
const { getTicketById, getTicketsByDni } = require("../controllers/ticket.controller");

router.get("/:id", getTicketById);
router.get("/dni/:dni", getTicketsByDni);

module.exports = router;
