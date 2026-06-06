const express = require('express');
const router = express.Router();
const { getSparePartsByTicket, assignSparePart } = require('../controllers/spareParts.controller');

router.get('/:id_ticket', getSparePartsByTicket);
router.post('/:id_ticket', assignSparePart);

module.exports = router;