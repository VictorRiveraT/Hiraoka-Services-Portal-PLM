const { assignedSpareParts, clone, inventory } = require("../data/hiraokaMocks");

const CODIGO_REPUESTO_REGEX = /^REP-\d{3,}$/i;

const normalizarPayload = (body) => {
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
    const codigo = String(item.codigo || "").trim().toUpperCase();
    const cantidad = Number(item.cantidad);

    if (!CODIGO_REPUESTO_REGEX.test(codigo)) {
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

const getSparePartsByTicket = (req, res) => {
  const idTicket = String(req.params.id_ticket || "").trim();
  const repuestos = assignedSpareParts[idTicket] || [];

  return res.status(200).json({
    success: true,
    data: clone(repuestos),
    total: repuestos.length,
    fuente: "Sistema de Taller Hiraoka - Mock v1.0",
  });
};

const assignSparePart = (req, res) => {
  const idTicket = String(req.params.id_ticket || "").trim();
  const { repuestos, error } = normalizarPayload(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }

  const faltantes = repuestos.filter((item) => !inventory[item.codigo]);
  if (faltantes.length) {
    return res.status(404).json({
      success: false,
      message: "Uno o mas repuestos no existen en inventario Hiraoka.",
      details: faltantes,
    });
  }

  const sinStock = repuestos
    .map((item) => ({
      ...item,
      stock_actual: inventory[item.codigo].stock,
    }))
    .filter((item) => item.cantidad > item.stock_actual);

  if (sinStock.length) {
    return res.status(409).json({
      success: false,
      message: "Stock insuficiente para asignar uno o mas repuestos.",
      details: sinStock,
    });
  }

  if (!assignedSpareParts[idTicket]) {
    assignedSpareParts[idTicket] = [];
  }

  const now = new Date().toISOString();
  const asignados = repuestos.map((item, index) => {
    const repuesto = inventory[item.codigo];
    repuesto.stock -= item.cantidad;

    const asignacion = {
      id_asignacion: `ASG-${Date.now()}-${index + 1}`,
      codigo: repuesto.codigo,
      nombre: repuesto.nombre,
      cantidad: item.cantidad,
      precio_unitario: repuesto.precio,
      subtotal: Number((repuesto.precio * item.cantidad).toFixed(2)),
      stock_restante: repuesto.stock,
      fecha_asignacion: now,
      asignado_por: req.body.asignado_por || null,
    };

    assignedSpareParts[idTicket].push(asignacion);
    return asignacion;
  });

  return res.status(201).json({
    success: true,
    message: "Repuestos asignados y stock actualizado correctamente.",
    data: {
      id_ticket: idTicket,
      repuestos: clone(asignados),
      total: asignados.length,
      monto_total: Number(
        asignados.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
      ),
    },
  });
};

module.exports = { assignSparePart, getSparePartsByTicket };
