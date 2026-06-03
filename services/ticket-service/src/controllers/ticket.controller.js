const pool = require("../config/database");

const {
  ESTADOS,
  esEstadoValido,
  esTransicionValida,
  obtenerSiguientesEstados,
  describirTransicion,
} = require("../services/estadoService");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODIGO_TICKET_REGEX = /^TK-\d{4}-\d{3,}$/i;
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:3004";
const NOTIFICATION_TIMEOUT_MS = Number(process.env.NOTIFICATION_TIMEOUT_MS || 3000);

const normalizarUuid = (value) => String(value || "").toLowerCase();

const esUuidValido = (value) => UUID_REGEX.test(String(value || ""));

const normalizarCodigoTicket = (value) => String(value || "").trim().toUpperCase();

const esCodigoTicketValido = (value) =>
  CODIGO_TICKET_REGEX.test(normalizarCodigoTicket(value));

const getTicketLookup = (value) => ({
  uuid: esUuidValido(value) ? normalizarUuid(value) : null,
  codigo: esCodigoTicketValido(value) ? normalizarCodigoTicket(value) : null,
});

const formatearFecha = (value) => {
  if (!value) return "Por confirmar";
  return new Date(value).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTipoNotificacion = (estado) => {
  if (estado === "Listo") return "listo_retiro";
  if (estado === "Entregado") return "entregado";
  return "estado_cambiado";
};

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
     VALUES ($1, $2, 'tickets', $3::text, $4::jsonb, $5, $6)`,
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

const registrarAuditoriaIndependiente = async (payload) => {
  const client = await pool.connect();
  try {
    await registrarAuditoria(client, payload);
  } finally {
    client.release();
  }
};

const enviarNotificacionCambioEstado = async (ticket, estadoNuevo) => {
  if (!ticket.email_cliente) {
    throw new Error("El cliente no tiene email registrado.");
  }

  const producto = [ticket.producto, ticket.marca, ticket.modelo]
    .filter(Boolean)
    .join(" ");
  const fecha =
    estadoNuevo === "Entregado"
      ? formatearFecha(ticket.fecha_entrega_real)
      : formatearFecha(ticket.fecha_estimada_entrega);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NOTIFICATION_TIMEOUT_MS);

  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/notifications/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        id_ticket: ticket.codigo_ticket || ticket.id_ticket,
        tipo: getTipoNotificacion(estadoNuevo),
        canal: "email",
        destinatario: ticket.email_cliente,
        datos: {
          nombre: ticket.nombre_cliente,
          ticket: ticket.codigo_ticket || ticket.id_ticket,
          codigo_ticket: ticket.codigo_ticket,
          estado: estadoNuevo,
          fecha,
          producto,
          numero_serie: ticket.numero_serie,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`notification-service respondio ${response.status}: ${body}`);
    }
  } finally {
    clearTimeout(timeout);
  }
};

// GET /tickets/:id - FEAT01: Consulta pública de ticket por ID
const getTicketById = async (req, res) => {
  const { id } = req.params;
  const lookup = getTicketLookup(id);

  if (!lookup.uuid && !lookup.codigo) {
    return res.status(400).json({
      success: false,
      message: "El ticket debe tener formato UUID o codigo TK-AAAA-000.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT 
        t.id_ticket,
        t.codigo_ticket,
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
      WHERE
        ($1::uuid IS NOT NULL AND t.id_ticket = $1::uuid)
        OR ($2::text IS NOT NULL AND t.codigo_ticket = $2)`,
      [lookup.uuid, lookup.codigo]
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
        t.codigo_ticket,
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
  const lookup = getTicketLookup(id_ticket);

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

  // ── Validacion de formato UUID interno o codigo publico TK-AAAA-000
  if (!lookup.uuid && !lookup.codigo) {
    return res.status(400).json({
      success: false,
      message: "El id_ticket debe tener formato UUID o codigo TK-AAAA-000.",
    });
  }

  try {
    // ── Query: busca el ticket y verifica que el cliente con ese DNI sea el dueño
    const result = await pool.query(
      `SELECT
        t.id_ticket,
        t.codigo_ticket,
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
      WHERE (
          ($1::uuid IS NOT NULL AND t.id_ticket = $1::uuid)
          OR ($2::text IS NOT NULL AND t.codigo_ticket = $2)
        )
        AND c.dni = $3`,
      [lookup.uuid, lookup.codigo, dni]
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

// GET /tickets/tecnico/mis-tickets - Lista tickets asignados al tecnico autenticado
const getTicketsAsignadosTecnico = async (req, res) => {
  const idUsuario = req.user && req.user.id_usuario;

  let client;
  try {
    client = await pool.connect();

    const usuario = await obtenerUsuarioConRol(client, idUsuario);
    if (!usuario || !usuario.activo || usuario.rol !== "Tecnico") {
      return res.status(403).json({
        success: false,
        message: "Solo un tecnico activo puede ver sus tickets asignados.",
      });
    }

    const result = await client.query(
      `SELECT
        t.id_ticket,
        t.codigo_ticket,
        t.estado,
        t.fecha_ingreso,
        t.fecha_estimada_entrega,
        t.descripcion_problema,
        c.nombre AS cliente,
        c.dni AS dni_cliente,
        p.nombre AS producto,
        p.marca,
        p.modelo,
        p.numero_serie
       FROM tickets t
       JOIN clientes c ON t.id_cliente = c.id_cliente
       JOIN productos p ON t.id_producto = p.id_producto
       WHERE t.id_tecnico = $1
       ORDER BY t.fecha_ingreso DESC`,
      [idUsuario]
    );

    const data = result.rows.map((ticket) => ({
      ...ticket,
      siguientes_estados: obtenerSiguientesEstados(ticket.estado),
    }));

    return res.status(200).json({
      success: true,
      data,
      total: data.length,
    });
  } catch (error) {
    console.error("Error al listar tickets asignados al tecnico:", error);
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
      `SELECT
        t.id_ticket,
        t.codigo_ticket,
        t.id_tecnico,
        t.estado,
        t.fecha_estimada_entrega,
        c.nombre AS nombre_cliente,
        c.email AS email_cliente,
        p.nombre AS producto,
        p.marca,
        p.modelo,
        p.numero_serie
       FROM tickets t
       JOIN clientes c ON t.id_cliente = c.id_cliente
       JOIN productos p ON t.id_producto = p.id_producto
       WHERE t.id_ticket = $1
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
        estado = $1::varchar(20),
        fecha_entrega_real = CASE
          WHEN $1::varchar(20) = 'Entregado' THEN COALESCE(fecha_entrega_real, NOW())
          ELSE fecha_entrega_real
       END
       WHERE id_ticket = $2
       RETURNING id_ticket, codigo_ticket, id_tecnico, estado, fecha_entrega_real`,
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

    const ticketActualizado = {
      ...ticket,
      ...updateResult.rows[0],
    };

    try {
      await enviarNotificacionCambioEstado(ticketActualizado, estado);
    } catch (notificationError) {
      console.error(
        "Error al disparar notificacion de cambio de estado:",
        notificationError
      );

      try {
        await registrarAuditoriaIndependiente({
          idUsuario,
          accion: "Fallo de Notificacion de Ticket",
          idEntidad: id,
          detalle: {
            ticket: ticketActualizado.codigo_ticket || id,
            estado_nuevo: estado,
            error: notificationError.message,
          },
          ip: req.ip,
          resultado: "Fallido",
        });
      } catch (auditError) {
        console.error("Error al registrar auditoria de notificacion:", auditError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Estado del ticket actualizado correctamente.",
      data: ticketActualizado,
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
  getTicketsAsignadosTecnico,
  actualizarEstadoTicket,
  asignarTecnicoTicket,
};
