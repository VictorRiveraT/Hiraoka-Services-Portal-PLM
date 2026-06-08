const { clone, warranties } = require("../data/hiraokaMocks");

const calcularEstadoGarantia = (fechaVencimiento) => {
  const hoy = new Date();
  const vencimiento = new Date(`${fechaVencimiento}T23:59:59.999Z`);
  const diasRestantes = Math.ceil(
    (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  );
  const vigente = diasRestantes >= 0;

  return {
    vigente,
    dias_restantes: vigente ? diasRestantes : 0,
    estado: !vigente ? "vencida" : diasRestantes <= 30 ? "por_vencer" : "vigente",
  };
};

const getWarranty = (req, res) => {
  const numeroSerie = String(req.params.numero_serie || "").trim().toUpperCase();
  const garantia = warranties[numeroSerie];

  if (!garantia) {
    return res.status(404).json({
      success: false,
      message: `No se encontro garantia para el numero de serie ${numeroSerie}.`,
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      ...clone(garantia),
      ...calcularEstadoGarantia(garantia.fecha_vencimiento),
      fuente: "Sistema de Garantias Hiraoka - Mock v1.0",
    },
  });
};

module.exports = { getWarranty };
