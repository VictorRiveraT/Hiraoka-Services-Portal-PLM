const jwt = require('jsonwebtoken');

const JWT_PARTS = 3;

/**
 * Middleware de autenticacion JWT.
 * Protege los endpoints del panel tecnico (FEAT08, FEAT09).
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. Token no proporcionado.',
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token invalido o malformado.',
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token || token.split('.').length !== JWT_PARTS) {
    return res.status(401).json({
      success: false,
      message: 'Token invalido o malformado.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Inicia sesion nuevamente.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token invalido o malformado.',
    });
  }
};

module.exports = verifyToken;
