const pool = require("../config/database");

// GET /tickets/:id - FEAT01: Consulta publica de ticket
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

module.exports = { getTicketById, getTicketsByDni };
