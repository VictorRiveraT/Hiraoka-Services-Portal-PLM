const express = require('express');
const router = express.Router();
const { getWarranty } = require('../controllers/warranty.controller');

router.get('/:numero_serie', getWarranty);

module.exports = router;