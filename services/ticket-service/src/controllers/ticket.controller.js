const pool = require("../config/database");

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

module.exports = { getTicketById, getTicketsByDni, consultarTicketSeguro };