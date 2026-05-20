/**
 * Middleware de validación de DNI
 * Verifica que el DNI tenga exactamente 8 dígitos numéricos (FEAT01)
 */
const validateDni = (req, res, next) => {
  const { dni } = req.params;

  if (!dni) {
    return res.status(400).json({
      success: false,
      message: "El DNI es requerido.",
    });
  }

  const dniRegex = /^\d{8}$/;

  if (!dniRegex.test(dni)) {
    return res.status(400).json({
      success: false,
      message: "El DNI debe contener exactamente 8 dígitos numéricos.",
    });
  }

  next();
};

module.exports = validateDni;