const { clone, inventory } = require("../data/hiraokaMocks");

const getInventory = (req, res) => {
  const codigo = String(req.params.codigo || "").trim().toUpperCase();
  const repuesto = inventory[codigo];

  if (!repuesto) {
    return res.status(404).json({
      success: false,
      message: `Repuesto con codigo ${codigo} no encontrado en inventario Hiraoka.`,
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      ...clone(repuesto),
      disponible: repuesto.stock > 0,
      fuente: "Sistema de Inventario Hiraoka - Mock v1.0",
    },
  });
};

module.exports = { getInventory };
