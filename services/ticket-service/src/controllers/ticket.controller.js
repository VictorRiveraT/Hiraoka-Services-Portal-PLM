const pool = require("../config/database");

const {
  ESTADOS,
  esEstadoValido,
  esTransicionValida,
  describirTransicion,
} = require("../services/estadoService");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const normalizarUuid = (value) => String(value || "").toLowerCase();

const esUuidValido = (value) => UUID_REGEX.test(String(value || ""));

const obtenerUsuarioConRol = async (client, idUsuario) => {
  if (!esUuidValido(idUsuario)) {
    return null;
  }

  const result = await client.query(
    `SELECT
      u.id_usuario,
      u.activo,
      r.nombre AS rol
    FROM usuarios u
    JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.id_usuario = $1`,
    [idUsuario]
  );

  return result.rows[0] || null;
};

const registrarAuditoria = async (
  client,
  { idUsuario, accion, idEntidad, detalle, ip, resultado = "Exitoso" }
) => {
  await client.query(
    `INSERT INTO log_auditoria
      (id_usuario, accion, entidad_afectada, id_entidad, detalle, ip_origen, resultado)
     VALUES ($1, $2, 'tickets', $3, $4::jsonb, $5, $6)`,
    [
      idUsuario,
      accion,
      idEntidad,
      JSON.stringify(detalle || {}),
      ip,
      resultado,
    ]
  );
};

// GET /tickets/:id - FEAT01: Consulta pública de ticket por ID
const getTicketById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        t.id_ticket,
        t.estado,
        t.fecha_ingreso,
        t.fecha_estimada_entrega,
        t.descripcion_problema,
        c.nombre AS cliente,
        p.nombre AS producto,
        p.numero_serie
      FROM tickets t
      JOIN clientes c ON t.id_cliente = c.id_cliente
      JOIN productos p ON t.id_producto = p.id_producto
      WHERE t.id_ticket = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al consultar ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// GET /tickets/dni/:dni - FEAT01: Consulta por DNI del cliente
const getTicketsByDni = async (req, res) => {
  const { dni } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        t.id_ticket,
        t.estado,
        t.fecha_ingreso,
        t.fecha_estimada_entrega,
        p.nombre AS producto
      FROM tickets t
      JOIN clientes c ON t.id_cliente = c.id_cliente
      JOIN productos p ON t.id_producto = p.id_producto
      WHERE c.dni = $1
      ORDER BY t.fecha_ingreso DESC`,
      [dni]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Error al consultar tickets por DNI:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// POST /tickets/consulta - FEAT01: Seguridad — valida que DNI y ticket pertenezcan al mismo cliente
// Body: { dni: "12345678", id_ticket: "uuid-del-ticket" }
const consultarTicketSeguro = async (req, res) => {
  const { dni, id_ticket } = req.body;

  // ── Validación de campos obligatorios
  if (!dni || !id_ticket) {
    return res.status(400).json({
      success: false,
      message: "Se requieren los campos 'dni' e 'id_ticket'.",
    });
  }

  // ── Validación de formato DNI (8 dígitos numéricos)
  const dniRegex = /^\d{8}$/;
  if (!dniRegex.test(dni)) {
    return res.status(400).json({
      success: false,
      message: "El DNI debe contener exactamente 8 dígitos numéricos.",
    });
  }

  // ── Validación de formato UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id_ticket)) {
    return res.status(400).json({
      success: false,
      message: "El id_ticket no tiene un formato válido.",
    });
  }

  try {
    // ── Query: busca el ticket y verifica que el cliente con ese DNI sea el dueño
    const result = await pool.query(
      `SELECT
        t.id_ticket,
        t.estado,
        t.fecha_ingreso,
        t.fecha_estimada_entrega,
        t.descripcion_problema,
        c.nombre          AS cliente,
        c.dni             AS dni_cliente,
        p.nombre          AS producto,
        p.marca,
        p.modelo,
        p.numero_serie
      FROM tickets t
      JOIN clientes c ON t.id_cliente = c.id_cliente
      JOIN productos p ON t.id_producto = p.id_producto
      WHERE t.id_ticket = $1
        AND c.dni = $2`,
      [id_ticket, dni]
    );

    // ── Sin resultado: el ticket no existe O el DNI no corresponde a ese ticket
    // Se devuelve el mismo mensaje en ambos casos para no revelar si el ticket existe
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No se encontró un ticket con esos datos. Verifique su DNI y número de ticket.",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en consulta segura de ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// PUT /tickets/:id/estado - Actualiza el estado del ticket asignado al tecnico
// Body: { estado: "Diagnosticando" }
const actualizarEstadoTicket = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const idUsuario = req.user && req.user.id_usuario;

  if (!esUuidValido(id)) {
    return res.status(400).json({
      success: false,
      message: "El id del ticket no tiene un formato valido.",
    });
  }

  if (!estado) {
    return res.status(400).json({
      success: false,
      message: "Se requiere el campo 'estado'.",
    });
  }

  if (!esEstadoValido(estado)) {
    return res.status(400).json({
      success: false,
      message: "Estado no valido.",
      estados_validos: ESTADOS,
    });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const usuario = await obtenerUsuarioConRol(client, idUsuario);
    if (!usuario || !usuario.activo || usuario.rol !== "Tecnico") {
      await client.query("ROLLBACK");
      return res.status(403).json({
        success: false,
        message: "Solo un tecnico activo puede actualizar estados de tickets.",
      });
    }

    const ticketResult = await client.query(
      `SELECT id_ticket, id_tecnico, estado
       FROM tickets
       WHERE id_ticket = $1
       FOR UPDATE`,
      [id]
    );

    if (ticketResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
    }

    const ticket = ticketResult.rows[0];
    if (
      !ticket.id_tecnico ||
      normalizarUuid(ticket.id_tecnico) !== normalizarUuid(idUsuario)
    ) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        success: false,
        message: "El ticket no esta asignado al tecnico autenticado.",
      });
    }

    if (ticket.estado === estado) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "El ticket ya se encuentra en ese estado.",
      });
    }

    if (!esTransicionValida(ticket.estado, estado)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Transicion de estado no valida.",
        detalle: describirTransicion(ticket.estado),
      });
    }

    const updateResult = await client.query(
      `UPDATE tickets
       SET
        estado = $1,
        fecha_entrega_real = CASE
          WHEN $1 = 'Entregado' THEN COALESCE(fecha_entrega_real, NOW())
          ELSE fecha_entrega_real
        END
       WHERE id_ticket = $2
       RETURNING id_ticket, id_tecnico, estado, fecha_entrega_real`,
      [estado, id]
    );

    await registrarAuditoria(client, {
      idUsuario,
      accion: "Cambio de Estado de Ticket",
      idEntidad: id,
      detalle: {
        estado_anterior: ticket.estado,
        estado_nuevo: estado,
        tecnico: idUsuario,
      },
      ip: req.ip,
    });

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Estado del ticket actualizado correctamente.",
      data: updateResult.rows[0],
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Error al actualizar estado del ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// POST /tickets/:id/asignar - Asigna un tecnico a un ticket
// Body: { id_tecnico: "uuid-del-tecnico" }
const asignarTecnicoTicket = async (req, res) => {
  const { id } = req.params;
  const { id_tecnico } = req.body;
  const idUsuario = req.user && req.user.id_usuario;

  if (!esUuidValido(id)) {
    return res.status(400).json({
      success: false,
      message: "El id del ticket no tiene un formato valido.",
    });
  }

  if (!esUuidValido(id_tecnico)) {
    return res.status(400).json({
      success: false,
      message: "Se requiere un id_tecnico con formato UUID valido.",
    });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const usuario = await obtenerUsuarioConRol(client, idUsuario);
    if (
      !usuario ||
      !usuario.activo ||
      !["Agente", "Administrador"].includes(usuario.rol)
    ) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        success: false,
        message:
          "Solo los roles Agente y Administrador pueden asignar tecnicos.",
      });
    }

    const tecnico = await obtenerUsuarioConRol(client, id_tecnico);
    if (!tecnico || !tecnico.activo || tecnico.rol !== "Tecnico") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "El id_tecnico no corresponde a un tecnico activo.",
      });
    }

    const ticketResult = await client.query(
      `SELECT id_ticket, id_tecnico, estado
       FROM tickets
       WHERE id_ticket = $1
       FOR UPDATE`,
      [id]
    );

    if (ticketResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
    }

    const ticket = ticketResult.rows[0];
    const updateResult = await client.query(
      `UPDATE tickets
       SET id_tecnico = $1
       WHERE id_ticket = $2
       RETURNING id_ticket, id_tecnico, estado`,
      [id_tecnico, id]
    );

    await registrarAuditoria(client, {
      idUsuario,
      accion: "Asignacion de Tecnico a Ticket",
      idEntidad: id,
      detalle: {
        tecnico_anterior: ticket.id_tecnico,
        tecnico_nuevo: id_tecnico,
        asignado_por: idUsuario,
      },
      ip: req.ip,
    });

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Tecnico asignado al ticket correctamente.",
      data: updateResult.rows[0],
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Error al asignar tecnico al ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  getTicketById,
  getTicketsByDni,
  consultarTicketSeguro,
  actualizarEstadoTicket,
  asignarTecnicoTicket,
};
