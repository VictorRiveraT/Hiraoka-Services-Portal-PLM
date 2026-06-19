const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');

// El rate limiting se aplica una sola vez en el API Gateway.
router.post('/login', authController.login);
router.get('/verify', verifyToken, authController.verify);
router.post('/logout', verifyToken, authController.logout);
router.get('/usuarios', verifyToken, authController.listarUsuarios);
router.post('/usuarios', verifyToken, authController.crearUsuario);
router.put('/usuarios/:id/rol', verifyToken, authController.cambiarRolUsuario);
router.put('/usuarios/:id/estado', verifyToken, authController.cambiarEstadoUsuario);

module.exports = router;
