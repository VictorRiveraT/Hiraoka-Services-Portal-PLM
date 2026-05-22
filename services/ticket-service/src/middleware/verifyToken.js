const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticacion JWT
 * Protege los endpoints del panel tecnico (FEAT08, FEAT09)
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. Token no proporcionado.',
    });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. Formato de token invalido.',
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
    return res.status(403).json({
      success: false,
      message: 'Token invalido.',
    });
  }
};

module.exports = verifyToken;