const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function obtenerAdmin(idUsuario) {
  if (!UUID_REGEX.test(String(idUsuario || ''))) return null;

  const result = await pool.query(
    `SELECT u.id_usuario, u.activo, r.nombre AS rol
     FROM usuarios u
     JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.id_usuario = $1`,
    [idUsuario]
  );

  return result.rows[0] || null;
}

async function exigirAdministrador(req, res) {
  const idUsuario = req.usuario && req.usuario.id_usuario;
  const usuario = await obtenerAdmin(idUsuario);

  if (!usuario || !usuario.activo || usuario.rol !== 'Administrador') {
    res.status(403).json({ error: 'Solo un Administrador activo puede gestionar usuarios.' });
    return null;
  }

  return usuario;
}

async function obtenerRolPorNombre(nombre) {
  const result = await pool.query('SELECT id_rol, nombre FROM roles WHERE nombre = $1', [nombre]);
  return result.rows[0] || null;
}

async function esUltimoAdministradorActivo(idUsuario) {
  const result = await pool.query(
    `SELECT
      EXISTS (
        SELECT 1 FROM usuarios u
        JOIN roles r ON r.id_rol = u.id_rol
        WHERE u.id_usuario = $1 AND u.activo = TRUE AND r.nombre = 'Administrador'
      ) AS objetivo_es_admin,
      (
        SELECT COUNT(*)::int FROM usuarios u
        JOIN roles r ON r.id_rol = u.id_rol
        WHERE u.activo = TRUE AND r.nombre = 'Administrador'
      ) AS administradores_activos`,
    [idUsuario]
  );
  return result.rows[0].objetivo_es_admin && result.rows[0].administradores_activos <= 1;
}

const SALT_ROUNDS = 12; // según DAS sección 9.1

// ── LOGIN ──────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');
  const ip = req.ip;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  if (username.length > 60 || password.length > 200) {
    return res.status(400).json({ error: 'Credenciales con formato invalido.' });
  }

  try {
    // 1. Buscar usuario
    const result = await pool.query(
      `SELECT u.*, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.username = $1
         AND u.activo = TRUE`,
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

exports.listarUsuarios = async (req, res) => {
  try {
    const { rol, activo, q } = req.query;
    const solicitante = await obtenerAdmin(req.usuario && req.usuario.id_usuario);
    const puedeConsultarTecnicos =
      solicitante &&
      solicitante.activo &&
      solicitante.rol === 'Agente' &&
      rol === 'Tecnico' &&
      activo === undefined &&
      !q;

    if (
      !solicitante ||
      !solicitante.activo ||
      (solicitante.rol !== 'Administrador' && !puedeConsultarTecnicos)
    ) {
      return res.status(403).json({
        error: 'Solo Administradores o Agentes consultando tecnicos pueden listar usuarios.',
      });
    }

    const filtros = [];
    const params = [];

    if (rol) {
      params.push(rol);
      filtros.push(`r.nombre = $${params.length}`);
    }

    if (activo !== undefined) {
      if (!['true', 'false'].includes(String(activo).toLowerCase())) {
        return res.status(400).json({ error: 'El filtro activo debe ser true o false.' });
      }
      params.push(String(activo).toLowerCase() === 'true');
      filtros.push(`u.activo = $${params.length}`);
    }

    if (q) {
      params.push(`%${String(q).trim()}%`);
      filtros.push(`(u.username ILIKE $${params.length} OR u.nombre_completo ILIKE $${params.length})`);
    }

    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre_completo, u.username, r.nombre AS rol,
        u.activo, u.fecha_creacion
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       ${filtros.length ? `WHERE ${filtros.join(' AND ')}` : ''}
       ORDER BY u.fecha_creacion DESC`,
      params
    );

    return res.status(200).json({ success: true, data: result.rows, total: result.rowCount });
  } catch (err) {
    console.error('[AUTH] Error al listar usuarios:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

exports.crearUsuario = async (req, res) => {
  const { nombre_completo, username, password, rol } = req.body;

  if (!nombre_completo || !username || !password || !rol) {
    return res.status(400).json({ error: 'nombre_completo, username, password y rol son requeridos.' });
  }

  if (String(password).length < 8) {
    return res.status(400).json({ error: 'La contrasena debe tener al menos 8 caracteres.' });
  }
  if (
    String(nombre_completo).trim().length > 150 ||
    !/^[a-zA-Z0-9._-]{3,60}$/.test(String(username).trim()) ||
    String(password).length > 200
  ) {
    return res.status(400).json({ error: 'Los datos del usuario exceden el formato permitido.' });
  }

  try {
    const admin = await exigirAdministrador(req, res);
    if (!admin) return;

    const rolDb = await obtenerRolPorNombre(rol);
    if (!rolDb) {
      return res.status(400).json({ error: 'Rol no valido.' });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre_completo, username, password_hash, id_rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario, nombre_completo, username, activo, fecha_creacion`,
      [String(nombre_completo).trim(), String(username).trim(), passwordHash, rolDb.id_rol]
    );

    await registrarAuditoria(admin.id_usuario, 'Creacion de Usuario', req.ip, 'Exitoso');
    return res.status(201).json({ success: true, data: { ...result.rows[0], rol: rolDb.nombre } });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El username ya existe.' });
    }
    console.error('[AUTH] Error al crear usuario:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

exports.cambiarRolUsuario = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  if (!UUID_REGEX.test(String(id || ''))) {
    return res.status(400).json({ error: 'El id de usuario no tiene formato valido.' });
  }

  if (!rol) {
    return res.status(400).json({ error: 'El campo rol es requerido.' });
  }

  try {
    const admin = await exigirAdministrador(req, res);
    if (!admin) return;

    const rolDb = await obtenerRolPorNombre(rol);
    if (!rolDb) {
      return res.status(400).json({ error: 'Rol no valido.' });
    }
    if (String(admin.id_usuario) === String(id) && rolDb.nombre !== 'Administrador') {
      return res.status(409).json({ error: 'No puede retirar su propio rol de Administrador.' });
    }
    if (rolDb.nombre !== 'Administrador' && await esUltimoAdministradorActivo(id)) {
      return res.status(409).json({ error: 'Debe existir al menos un Administrador activo.' });
    }

    const result = await pool.query(
      `UPDATE usuarios
       SET id_rol = $1
       WHERE id_usuario = $2
       RETURNING id_usuario, nombre_completo, username, activo, fecha_creacion`,
      [rolDb.id_rol, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    await registrarAuditoria(admin.id_usuario, 'Cambio de Rol de Usuario', req.ip, 'Exitoso');
    return res.status(200).json({ success: true, data: { ...result.rows[0], rol: rolDb.nombre } });
  } catch (err) {
    console.error('[AUTH] Error al cambiar rol:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

exports.cambiarEstadoUsuario = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  if (!UUID_REGEX.test(String(id || ''))) {
    return res.status(400).json({ error: 'El id de usuario no tiene formato valido.' });
  }

  if (typeof activo !== 'boolean') {
    return res.status(400).json({ error: 'El campo activo debe ser booleano.' });
  }

  try {
    const admin = await exigirAdministrador(req, res);
    if (!admin) return;
    if (String(admin.id_usuario) === String(id) && activo === false) {
      return res.status(409).json({ error: 'No puede desactivar su propia cuenta.' });
    }
    if (activo === false && await esUltimoAdministradorActivo(id)) {
      return res.status(409).json({ error: 'Debe existir al menos un Administrador activo.' });
    }

    const result = await pool.query(
      `UPDATE usuarios
       SET activo = $1
       WHERE id_usuario = $2
       RETURNING id_usuario, nombre_completo, username, activo, fecha_creacion,
        (SELECT nombre FROM roles WHERE id_rol = usuarios.id_rol) AS rol`,
      [activo, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    await registrarAuditoria(admin.id_usuario, activo ? 'Activacion de Usuario' : 'Desactivacion de Usuario', req.ip, 'Exitoso');
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[AUTH] Error al cambiar estado:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
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
