// Mock de garantias de Hiraoka basado en los productos del seed.sql
const GARANTIAS = {
  'SM-S928B-001234': {
    numero_serie: 'SM-S928B-001234',
    producto: 'Samsung Galaxy S24',
    fecha_compra: '2025-10-01',
    fecha_vencimiento: '2026-10-01',
    cobertura: 'Garantia de fabrica — cubre defectos de manufactura',
    vigente: true,
  },
  'DL-INS15-SN00123': {
    numero_serie: 'DL-INS15-SN00123',
    producto: 'Dell Inspiron 15 3511',
    fecha_compra: '2024-03-15',
    fecha_vencimiento: '2025-03-15',
    cobertura: 'Garantia de fabrica — vencida',
    vigente: false,
  },
  'LG-WM10-SN00456': {
    numero_serie: 'LG-WM10-SN00456',
    producto: 'LG Lavadora 10kg',
    fecha_compra: '2025-08-20',
    fecha_vencimiento: '2026-08-20',
    cobertura: 'Garantia extendida — cubre piezas y mano de obra',
    vigente: true,
  },
  'SN-X90J-SN00789': {
    numero_serie: 'SN-X90J-SN00789',
    producto: 'Sony Bravia X90J 55"',
    fecha_compra: '2025-11-10',
    fecha_vencimiento: '2026-11-10',
    cobertura: 'Garantia de fabrica — cubre defectos de manufactura',
    vigente: true,
  },
};

const getWarranty = (req, res) => {
  const { numero_serie } = req.params;
  const garantia = GARANTIAS[numero_serie];

  if (!garantia) {
    return res.status(404).json({
      success: false,
      message: `No se encontro garantia para el numero de serie ${numero_serie}.`,
    });
  }

  const hoy = new Date();
  const vencimiento = new Date(garantia.fecha_vencimiento);
  const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

  return res.status(200).json({
    success: true,
    data: {
      ...garantia,
      dias_restantes: garantia.vigente ? diasRestantes : 0,
      estado: !garantia.vigente ? 'vencida' : diasRestantes <= 30 ? 'por_vencer' : 'vigente',
      fuente: 'Sistema de Garantias Hiraoka — Mock v1.0',
    },
  });
};

module.exports = { getWarranty };