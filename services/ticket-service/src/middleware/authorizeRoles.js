const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const role = req.user && req.user.rol;

  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({
      success: false,
      message: `Acceso restringido a los roles: ${allowedRoles.join(', ')}.`,
    });
  }

  return next();
};

module.exports = authorizeRoles;
