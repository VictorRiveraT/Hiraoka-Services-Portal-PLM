const jwt = require('jsonwebtoken');

const JWT_PARTS = 3;

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token || token.split('.').length !== JWT_PARTS) {
    return res.status(401).json({ error: 'Token invalido o malformado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sesion expirada. Inicia sesion nuevamente.' });
    }

    return res.status(401).json({ error: 'Token invalido o malformado.' });
  }
};
