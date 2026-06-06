// Mock de inventario de repuestos de Hiraoka
const INVENTARIO = {
  'REP-001': { codigo: 'REP-001', nombre: 'Pantalla LCD Samsung 6.5"', stock: 12, precio: 280.00, tiempo_llegada_dias: 0 },
  'REP-002': { codigo: 'REP-002', nombre: 'Bateria iPhone 13', stock: 8, precio: 95.00, tiempo_llegada_dias: 0 },
  'REP-003': { codigo: 'REP-003', nombre: 'Placa base LG Lavadora 10kg', stock: 3, precio: 450.00, tiempo_llegada_dias: 2 },
  'REP-004': { codigo: 'REP-004', nombre: 'Compresor LG Refrigeradora', stock: 0, precio: 620.00, tiempo_llegada_dias: 7 },
  'REP-005': { codigo: 'REP-005', nombre: 'Control remoto Samsung TV', stock: 25, precio: 45.00, tiempo_llegada_dias: 0 },
  'REP-006': { codigo: 'REP-006', nombre: 'Teclado Dell Inspiron 15', stock: 5, precio: 120.00, tiempo_llegada_dias: 0 },
};

const getInventory = (req, res) => {
  const { codigo } = req.params;
  const repuesto = INVENTARIO[codigo.toUpperCase()];

  if (!repuesto) {
    return res.status(404).json({
      success: false,
      message: `Repuesto con codigo ${codigo} no encontrado en el inventario de Hiraoka.`,
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      ...repuesto,
      disponible: repuesto.stock > 0,
      fuente: 'Sistema de Inventario Hiraoka — Mock v1.0',
    },
  });
};

module.exports = { getInventory };