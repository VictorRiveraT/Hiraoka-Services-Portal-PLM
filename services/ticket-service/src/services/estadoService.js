const ESTADOS = Object.freeze([
  "Recibido",
  "Diagnosticando",
  "Reparando",
  "Listo",
  "Entregado",
]);

const TRANSICIONES_VALIDAS = Object.freeze({
  Recibido: ["Diagnosticando"],
  Diagnosticando: ["Reparando"],
  Reparando: ["Listo"],
  Listo: ["Entregado"],
  Entregado: [],
});

const esEstadoValido = (estado) => ESTADOS.includes(estado);

const obtenerSiguientesEstados = (estadoActual) =>
  TRANSICIONES_VALIDAS[estadoActual] || [];

const esTransicionValida = (estadoActual, estadoNuevo) =>
  obtenerSiguientesEstados(estadoActual).includes(estadoNuevo);

const describirTransicion = (estadoActual) => {
  const siguientes = obtenerSiguientesEstados(estadoActual);

  if (!esEstadoValido(estadoActual)) {
    return "El estado actual del ticket no es valido.";
  }

  if (siguientes.length === 0) {
    return `Desde ${estadoActual} no existen transiciones disponibles.`;
  }

  return `Desde ${estadoActual} solo se puede pasar a: ${siguientes.join(", ")}.`;
};

module.exports = {
  ESTADOS,
  TRANSICIONES_VALIDAS,
  esEstadoValido,
  obtenerSiguientesEstados,
  esTransicionValida,
  describirTransicion,
};
