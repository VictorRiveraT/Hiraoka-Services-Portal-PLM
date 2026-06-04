// Mock de repuestos asignados por ticket
const REPUESTOS_POR_TICKET = {};

const getSparePartsByTicket = (req, res) => {
  const { id_ticket } = req.params;
  const repuestos = REPUESTOS_POR_TICKET[id_ticket] || [];

  return res.status(200).json({
    success: true,
    data: repuestos,
    total: repuestos.length,
  });
};

const assignSparePart = (req, res) => {
  const { id_ticket } = req.params;
  const { codigo, cantidad } = req.body;

  if (!codigo || !cantidad) {
    return res.status(400).json({
      success: false,
      message: 'Se requieren los campos codigo y cantidad.',
    });
  }

  if (!REPUESTOS_POR_TICKET[id_ticket]) {
    REPUESTOS_POR_TICKET[id_ticket] = [];
  }

  const repuesto = {
    codigo,
    cantidad,
    fecha_asignacion: new Date().toISOString(),
  };

  REPUESTOS_POR_TICKET[id_ticket].push(repuesto);

  return res.status(201).json({
    success: true,
    message: 'Repuesto asignado correctamente.',
    data: repuesto,
  });
};

module.exports = { getSparePartsByTicket, assignSparePart };