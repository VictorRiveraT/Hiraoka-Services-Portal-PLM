const express = require('express');
const router = express.Router();
const { getInventory } = require('../controllers/inventory.controller');

router.get('/:codigo', getInventory);

module.exports = router;