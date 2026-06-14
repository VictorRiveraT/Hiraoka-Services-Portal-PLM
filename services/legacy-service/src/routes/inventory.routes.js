const express = require('express');
const router = express.Router();
const { getInventory, listInventory } = require('../controllers/inventory.controller');

router.get('/', listInventory);
router.get('/:codigo', getInventory);

module.exports = router;
