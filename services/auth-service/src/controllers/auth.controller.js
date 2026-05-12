const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const SALT_ROUNDS = 12; // según DAS sección 9.1

// ── LOGIN ──────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  try {
    // 1. Buscar usuario
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1 AND activo = TRUE',
      [username]
    );

    if (result.rows.length === 0) {
      await registrarAuditoria(null, 'Login Fallido', ip, 'Fallido');
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const usuario = result.rows[0];

    // 2. Verificar contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      await registrarAuditoria(usuario.id_usuario, 'Login Fallido', ip, 'Fallido');
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // 3. Generar token JWT (expira en 30 min — según DAS FEAT09)
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        username: usuario.username,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '30m' }
    );

    // 4. Registrar en log de auditoría (Ley 29733)
    await registrarAuditoria(usuario.id_usuario, 'Login Exitoso', ip, 'Exitoso');

    return res.status(200).json({
      message: 'Autenticación exitosa.',
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre_completo,
        rol: usuario.rol,
      },
    });

  } catch (err) {
    console.error('[AUTH] Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── VERIFICAR TOKEN ────────────────────────────────────────────────
exports.verify = async (req, res) => {
  // El middleware verifyToken ya validó el token
  return res.status(200).json({
    valid: true,
    usuario: req.usuario,
  });
};

// ── LOGOUT (registrar en auditoría) ───────────────────────────────
exports.logout = async (req, res) => {
  await registrarAuditoria(req.usuario.id_usuario, 'Logout', req.ip, 'Exitoso');
  return res.status(200).json({ message: 'Sesión cerrada correctamente.' });
};

// ── UTILIDAD INTERNA: Log de Auditoría ────────────────────────────
async function registrarAuditoria(id_usuario, accion, ip, resultado) {
  try {
    await pool.query(
      `INSERT INTO log_auditoria (id_usuario, accion, entidad_afectada, ip_origen, resultado)
       VALUES ($1, $2, 'usuarios', $3, $4)`,
      [id_usuario, accion, ip, resultado]
    );
  } catch (err) {
    console.error('[AUDIT] Error al registrar en log:', err);
  }
}