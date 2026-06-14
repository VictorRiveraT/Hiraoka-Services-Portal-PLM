const { clone, inventory } = require("../data/hiraokaMocks");

const listInventory = (req, res) => {
  const query = String(req.query.q || "").trim().toLowerCase();
  const categoria = String(req.query.categoria || "").trim().toLowerCase();
  const data = Object.values(inventory)
    .filter((item) => {
      const matchesQuery =
        !query ||
        item.codigo.toLowerCase().includes(query) ||
        item.nombre.toLowerCase().includes(query);
      const matchesCategory =
        !categoria || item.categoria.toLowerCase() === categoria;
      return matchesQuery && matchesCategory;
    })
    .map((item) => ({
      ...clone(item),
      disponible: item.stock > 0,
      eta: item.tiempo_llegada_dias
        ? `${item.tiempo_llegada_dias} dias habiles`
        : "Inmediato",
    }));

  return res.status(200).json({ success: true, data, total: data.length });
};

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

module.exports = { getInventory, listInventory };
