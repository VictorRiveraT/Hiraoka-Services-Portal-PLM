const pool = require("../config/database");

const {
  ESTADOS,
  esEstadoValido,
  esTransicionValida,
  obtenerSiguientesEstados,
  describirTransicion,
} = require("../services/estadoService");
const {
  LegacyServiceError,
  assignSparePartsToTicket,
  getInventory,
  getSparePartsByTicket,
  getWarranty,
} = require("../services/legacyClient");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODIGO_TICKET_REGEX = /^TK-\d{4}-\d{3,}$/i;
const CODIGO_REPUESTO_REGEX = /^REP-\d{3,}$/i;
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:3004";
const NOTIFICATION_TIMEOUT_MS = Number(process.env.NOTIFICATION_TIMEOUT_MS || 3000);
const ROLES_REPUESTOS = ["Tecnico", "Agente"];
const REPUESTOS_COMPATIBLES = {
  laptop: ["REP-006", "REP-007", "REP-008"],
  smartphone: ["REP-001", "REP-009", "REP-010"],
  tablet: ["REP-011", "REP-012"],
  lavadora: ["REP-003", "REP-013", "REP-014"],
  televisor: ["REP-005", "REP-015", "REP-016"],
};

const normalizarUuid = (value) => String(value || "").toLowerCase();

const esUuidValido = (value) => UUID_REGEX.test(String(value || ""));

const normalizarCodigoTicket = (value) => String(value || "").trim().toUpperCase();

const esCodigoTicketValido = (value) =>
  CODIGO_TICKET_REGEX.test(normalizarCodigoTicket(value));

const normalizarCodigoRepuesto = (value) => String(value || "").trim().toUpperCase();

const esCodigoRepuestoValido = (value) =>
  CODIGO_REPUESTO_REGEX.test(normalizarCodigoRepuesto(value));

const getTicketLookup = (value) => ({
  uuid: esUuidValido(value) ? normalizarUuid(value) : null,
  codigo: esCodigoTicketValido(value) ? normalizarCodigoTicket(value) : null,
});

const resumenTicket = (ticket) => ({
  id_ticket: ticket.id_ticket,
  codigo_ticket: ticket.codigo_ticket,
  estado: ticket.estado,
  producto: [ticket.producto, ticket.marca, ticket.modelo]
    .filter(Boolean)
    .join(" "),
  numero_serie: ticket.numero_serie,
});

const normalizarRepuestosPayload = (body) => {
  const items = Array.isArray(body && body.repuestos)
    ? body.repuestos
    : body && body.codigo
      ? [body]
      : [];

  if (!items.length) {
    return {
      error:
        "Se requiere un repuesto en { codigo, cantidad } o una lista en { repuestos: [...] }.",
    };
  }

  const repuestos = [];
  for (const item of items) {
    const codigo = normalizarCodigoRepuesto(item.codigo);
    const cantidad = Number(item.cantidad);

    if (!esCodigoRepuestoValido(codigo)) {
      return {
        error: "Cada repuesto debe tener un codigo valido con formato REP-000.",
      };
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return {
        error: "Cada repuesto debe tener una cantidad entera mayor a cero.",
      };
    }

    repuestos.push({ codigo, cantidad });
  }

  return { repuestos };
};

const obtenerCodigosCompatibles = (ticket) => {
  const texto = [ticket.producto, ticket.marca, ticket.modelo]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (texto.includes("laptop") || texto.includes("dell")) {
    return REPUESTOS_COMPATIBLES.laptop;
  }
  if (texto.includes("smartphone") || texto.includes("galaxy")) {
    return REPUESTOS_COMPATIBLES.smartphone;
  }
  if (texto.includes("tablet") || texto.includes("ipad")) {
    return REPUESTOS_COMPATIBLES.tablet;
  }
  if (texto.includes("lavadora") || texto.includes("wm3600")) {
    return REPUESTOS_COMPATIBLES.lavadora;
  }
  if (texto.includes("televisor") || texto.includes("bravia")) {
    return REPUESTOS_COMPATIBLES.televisor;
  }

  return [];
};

const obtenerTicketParaIntegracion = async (db, id) => {
  const lookup = getTicketLookup(id);

  const result = await db.query(
    `SELECT
      t.id_ticket,
      t.codigo_ticket,
      t.estado,
      t.id_tecnico,
      p.nombre AS producto,
      p.marca,
      p.modelo,
      p.numero_serie
     FROM tickets t
     JOIN productos p ON t.id_producto = p.id_producto
     WHERE
      ($1::uuid IS NOT NULL AND t.id_ticket = $1::uuid)
      OR ($2::text IS NOT NULL AND t.codigo_ticket = $2)`,
    [lookup.uuid, lookup.codigo]
  );

  return result.rows[0] || null;
};

const responderErrorLegacy = (res, error) => {
  if (error instanceof LegacyServiceError) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }

  console.error("Error no controlado al integrar con legacy-service:", error);
  return res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
};

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

const parsePeriodo = (query) => {
  const desde = query.desde ? new Date(query.desde) : new Date("1970-01-01T00:00:00.000Z");
  const hasta = query.hasta ? new Date(query.hasta) : new Date();

  if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime()) || desde > hasta) {
    return { error: "El periodo debe usar fechas validas en desde/hasta." };
  }

  return { desde, hasta };
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

    return response.json().catch(() => ({
      success: true,
      message: "Notificacion aceptada por notification-service.",
    }));
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

// GET /tickets/:id/repuestos - FEAT10: Consulta repuestos compatibles/asignados
const consultarRepuestosTicket = async (req, res) => {
  const { id } = req.params;
  const codigo = req.query.codigo
    ? normalizarCodigoRepuesto(req.query.codigo)
    : null;
  const lookup = getTicketLookup(id);

  if (!lookup.uuid && !lookup.codigo) {
    return res.status(400).json({
      success: false,
      message: "El ticket debe tener formato UUID o codigo TK-AAAA-000.",
    });
  }

  if (codigo && !esCodigoRepuestoValido(codigo)) {
    return res.status(400).json({
      success: false,
      message: "El codigo de repuesto debe tener formato REP-000.",
    });
  }

  try {
    const ticket = await obtenerTicketParaIntegracion(pool, id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
    }

    if (codigo) {
      const inventario = await getInventory(codigo);
      return res.status(200).json({
        success: true,
        data: {
          ticket: resumenTicket(ticket),
          disponibilidad: inventario.data,
        },
      });
    }

    const codigosCompatibles = obtenerCodigosCompatibles(ticket);
    const [asignados, disponibilidad] = await Promise.all([
      getSparePartsByTicket(ticket.id_ticket),
      Promise.all(codigosCompatibles.map((item) => getInventory(item))),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ticket: resumenTicket(ticket),
        repuestos_asignados: asignados.data || [],
        total_asignados: asignados.total || 0,
        disponibilidad: disponibilidad.map((item) => item.data),
      },
    });
  } catch (error) {
    return responderErrorLegacy(res, error);
  }
};

// POST /tickets/:id/repuestos - FEAT11: Asigna repuestos y descuenta stock legacy
const asignarRepuestosTicket = async (req, res) => {
  const { id } = req.params;
  const idUsuario = req.user && req.user.id_usuario;
  const lookup = getTicketLookup(id);
  const { repuestos, error: payloadError } = normalizarRepuestosPayload(req.body);

  if (!lookup.uuid && !lookup.codigo) {
    return res.status(400).json({
      success: false,
      message: "El ticket debe tener formato UUID o codigo TK-AAAA-000.",
    });
  }

  if (payloadError) {
    return res.status(400).json({
      success: false,
      message: payloadError,
    });
  }

  let usuario;
  let ticket;
  let client;

  try {
    client = await pool.connect();

    usuario = await obtenerUsuarioConRol(client, idUsuario);
    if (
      !usuario ||
      !usuario.activo ||
      !ROLES_REPUESTOS.includes(usuario.rol)
    ) {
      return res.status(403).json({
        success: false,
        message: "Solo Tecnico y Agente pueden asignar repuestos.",
      });
    }

    ticket = await obtenerTicketParaIntegracion(client, id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
    }
  } catch (error) {
    console.error("Error al preparar asignacion de repuestos:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  } finally {
    if (client) {
      client.release();
    }
  }

  try {
    const legacyResult = await assignSparePartsToTicket(ticket.id_ticket, {
      repuestos,
      asignado_por: idUsuario,
      rol: usuario.rol,
    });

    await registrarAuditoriaIndependiente({
      idUsuario,
      accion: "Asignacion de Repuestos a Ticket",
      idEntidad: ticket.id_ticket,
      detalle: {
        ticket: ticket.codigo_ticket,
        repuestos,
        legacy: legacyResult.data,
      },
      ip: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: "Repuestos asignados al ticket correctamente.",
      data: {
        ticket: resumenTicket(ticket),
        asignacion: legacyResult.data,
      },
    });
  } catch (error) {
    try {
      await registrarAuditoriaIndependiente({
        idUsuario,
        accion: "Asignacion de Repuestos a Ticket",
        idEntidad: ticket && ticket.id_ticket,
        detalle: {
          ticket: ticket && ticket.codigo_ticket,
          repuestos,
          error: error.message,
          code: error.code,
        },
        ip: req.ip,
        resultado: "Fallido",
      });
    } catch (auditError) {
      console.error("Error al auditar fallo de repuestos:", auditError);
    }

    return responderErrorLegacy(res, error);
  }
};

// GET /tickets/:id/garantia - FEAT12: Verifica cobertura via legacy-service
const consultarGarantiaTicket = async (req, res) => {
  const { id } = req.params;
  const lookup = getTicketLookup(id);

  if (!lookup.uuid && !lookup.codigo) {
    return res.status(400).json({
      success: false,
      message: "El ticket debe tener formato UUID o codigo TK-AAAA-000.",
    });
  }

  try {
    const ticket = await obtenerTicketParaIntegracion(pool, id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
    }

    const garantia = await getWarranty(ticket.numero_serie);
    return res.status(200).json({
      success: true,
      data: {
        ticket: resumenTicket(ticket),
        garantia: garantia.data,
      },
    });
  } catch (error) {
    return responderErrorLegacy(res, error);
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
        t.observaciones_tecnicas,
        t.evidencias_tecnicas,
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
  const { estado, observaciones } = req.body;
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
        t.observaciones_tecnicas,
        t.evidencias_tecnicas,
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
        observaciones_tecnicas = COALESCE(NULLIF($3::text, ''), observaciones_tecnicas),
        fecha_entrega_real = CASE
          WHEN $1::varchar(20) = 'Entregado' THEN COALESCE(fecha_entrega_real, NOW())
          ELSE fecha_entrega_real
       END
       WHERE id_ticket = $2
       RETURNING id_ticket, codigo_ticket, id_tecnico, estado, observaciones_tecnicas,
        evidencias_tecnicas, fecha_entrega_real`,
      [estado, id, String(observaciones || "").trim()]
    );

    await registrarAuditoria(client, {
      idUsuario,
      accion: "Cambio de Estado de Ticket",
      idEntidad: id,
      detalle: {
        estado_anterior: ticket.estado,
        estado_nuevo: estado,
        tecnico: idUsuario,
        observaciones_actualizadas: Boolean(String(observaciones || "").trim()),
      },
      ip: req.ip,
    });

    await client.query("COMMIT");

    const ticketActualizado = {
      ...ticket,
      ...updateResult.rows[0],
    };

    try {
      const notificationResult = await enviarNotificacionCambioEstado(
        ticketActualizado,
        estado
      );

      await registrarAuditoriaIndependiente({
        idUsuario,
        accion: "Notificacion de Ticket Enviada",
        idEntidad: id,
        detalle: {
          ticket: ticketActualizado.codigo_ticket || id,
          estado_nuevo: estado,
          proveedor: notificationResult.result || notificationResult.message,
        },
        ip: req.ip,
      });
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

// GET /tickets/historial/:numero_serie - FEAT07: historial completo del producto
const getHistorialProducto = async (req, res) => {
  const numeroSerie = String(req.params.numero_serie || "").trim();

  if (!numeroSerie) {
    return res.status(400).json({
      success: false,
      message: "El numero de serie es requerido.",
    });
  }

  try {
    const ticketsResult = await pool.query(
      `SELECT
        t.id_ticket,
        t.codigo_ticket,
        t.estado,
        t.descripcion_problema,
        t.fecha_ingreso,
        t.fecha_estimada_entrega,
        t.fecha_entrega_real,
        c.nombre AS cliente,
        p.nombre AS producto,
        p.marca,
        p.modelo,
        p.numero_serie,
        u.id_usuario AS id_tecnico,
        u.nombre_completo AS tecnico
       FROM tickets t
       JOIN productos p ON t.id_producto = p.id_producto
       JOIN clientes c ON t.id_cliente = c.id_cliente
       LEFT JOIN usuarios u ON t.id_tecnico = u.id_usuario
       WHERE p.numero_serie = $1
       ORDER BY t.fecha_ingreso ASC`,
      [numeroSerie]
    );

    if (!ticketsResult.rowCount) {
      return res.status(404).json({
        success: false,
        message: "No se encontro historial para el numero de serie indicado.",
      });
    }

    const ticketIds = ticketsResult.rows.map((ticket) => ticket.id_ticket);
    const auditoriaResult = await pool.query(
      `SELECT id_entidad, accion, detalle, fecha_hora
       FROM log_auditoria
       WHERE entidad_afectada = 'tickets'
         AND id_entidad = ANY($1::text[])
       ORDER BY fecha_hora ASC`,
      [ticketIds]
    );

    const eventosPorTicket = new Map();
    auditoriaResult.rows.forEach((evento) => {
      const lista = eventosPorTicket.get(evento.id_entidad) || [];
      lista.push(evento);
      eventosPorTicket.set(evento.id_entidad, lista);
    });

    const data = ticketsResult.rows.map((ticket) => {
      const eventos = eventosPorTicket.get(String(ticket.id_ticket)) || [];
      const cambiosEstado = eventos
        .filter((evento) => evento.accion === "Cambio de Estado de Ticket")
        .map((evento) => ({
          estado_anterior: evento.detalle && evento.detalle.estado_anterior,
          estado_nuevo: evento.detalle && evento.detalle.estado_nuevo,
          fecha_hora: evento.fecha_hora,
        }));

      const repuestosUsados = eventos
        .filter((evento) => evento.accion === "Asignacion de Repuestos a Ticket")
        .flatMap((evento) => {
          const repuestos = evento.detalle && evento.detalle.repuestos;
          return Array.isArray(repuestos) ? repuestos : [];
        });

      const estadosRecorridos = [
        { estado: "Recibido", fecha_hora: ticket.fecha_ingreso },
        ...cambiosEstado.map((item) => ({
          estado: item.estado_nuevo,
          estado_anterior: item.estado_anterior,
          fecha_hora: item.fecha_hora,
        })),
      ];

      if (!estadosRecorridos.some((item) => item.estado === ticket.estado)) {
        estadosRecorridos.push({
          estado: ticket.estado,
          fecha_hora: ticket.fecha_entrega_real || ticket.fecha_estimada_entrega || ticket.fecha_ingreso,
          inferido: true,
        });
      }

      return {
        ...ticket,
        estados_recorridos: estadosRecorridos,
        repuestos_usados: repuestosUsados,
      };
    });

    return res.status(200).json({
      success: true,
      numero_serie: numeroSerie,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("Error al consultar historial de producto:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// GET /dashboard/metricas - FEAT14: KPIs del periodo solicitado
const getMetricasDashboard = async (req, res) => {
  const periodo = parsePeriodo(req.query);
  if (periodo.error) {
    return res.status(400).json({
      success: false,
      message: periodo.error,
    });
  }

  try {
    const [porEstado, tiempoPromedio, tecnicoTop, nps] = await Promise.all([
      pool.query(
        `SELECT estado, COUNT(*)::int AS total
         FROM tickets
         WHERE fecha_ingreso BETWEEN $1 AND $2
         GROUP BY estado
         ORDER BY estado`,
        [periodo.desde, periodo.hasta]
      ),
      pool.query(
        `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (fecha_entrega_real - fecha_ingreso)) / 3600)::numeric, 2) AS horas
         FROM tickets
         WHERE fecha_entrega_real IS NOT NULL
           AND fecha_ingreso BETWEEN $1 AND $2`,
        [periodo.desde, periodo.hasta]
      ),
      pool.query(
        `SELECT
          u.id_usuario,
          u.nombre_completo AS tecnico,
          COUNT(*)::int AS tickets_cerrados
         FROM tickets t
         JOIN usuarios u ON t.id_tecnico = u.id_usuario
         WHERE t.estado = 'Entregado'
           AND t.fecha_entrega_real BETWEEN $1 AND $2
         GROUP BY u.id_usuario, u.nombre_completo
         ORDER BY tickets_cerrados DESC, tecnico ASC
         LIMIT 1`,
        [periodo.desde, periodo.hasta]
      ),
      pool.query(
        `SELECT to_regclass('public.encuestas_satisfaccion') AS tabla`
      ),
    ]);

    let npsData = {
      disponible: false,
      tasa_nps: null,
      promotores: 0,
      pasivos: 0,
      detractores: 0,
      total_respuestas: 0,
    };

    if (nps.rows[0] && nps.rows[0].tabla) {
      const npsResult = await pool.query(
        `SELECT
          COUNT(*)::int AS total_respuestas,
          COUNT(*) FILTER (WHERE puntaje >= 9)::int AS promotores,
          COUNT(*) FILTER (WHERE puntaje BETWEEN 7 AND 8)::int AS pasivos,
          COUNT(*) FILTER (WHERE puntaje <= 6)::int AS detractores,
          ROUND((
            ((COUNT(*) FILTER (WHERE puntaje >= 9))::numeric / NULLIF(COUNT(*), 0)) -
            ((COUNT(*) FILTER (WHERE puntaje <= 6))::numeric / NULLIF(COUNT(*), 0))
          ) * 100, 2) AS tasa_nps
         FROM encuestas_satisfaccion
         WHERE fecha_respuesta BETWEEN $1 AND $2`,
        [periodo.desde, periodo.hasta]
      );

      npsData = { disponible: true, ...npsResult.rows[0] };
    }

    return res.status(200).json({
      success: true,
      periodo: {
        desde: periodo.desde.toISOString(),
        hasta: periodo.hasta.toISOString(),
      },
      data: {
        tickets_por_estado: porEstado.rows,
        tiempo_promedio_resolucion_horas: Number(tiempoPromedio.rows[0].horas || 0),
        tecnico_mas_tickets_cerrados: tecnicoTop.rows[0] || null,
        satisfaccion_nps: npsData,
      },
    });
  } catch (error) {
    console.error("Error al consultar metricas dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  getTicketById,
  getTicketsByDni,
  consultarTicketSeguro,
  consultarRepuestosTicket,
  asignarRepuestosTicket,
  consultarGarantiaTicket,
  getTicketsAsignadosTecnico,
  actualizarEstadoTicket,
  asignarTecnicoTicket,
  getHistorialProducto,
  getMetricasDashboard,
};
