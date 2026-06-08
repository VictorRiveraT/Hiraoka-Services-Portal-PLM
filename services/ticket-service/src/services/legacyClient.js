const LEGACY_SERVICE_URL = (
  process.env.LEGACY_SERVICE_URL || "http://legacy-service:3005"
).replace(/\/+$/, "");
const DEFAULT_TIMEOUT_MS = Number(process.env.LEGACY_TIMEOUT_MS || 2000);
const FAILURE_THRESHOLD = Number(
  process.env.LEGACY_CIRCUIT_BREAKER_FAILURES || 3
);
const RESET_TIMEOUT_MS = Number(
  process.env.LEGACY_CIRCUIT_BREAKER_RESET_MS || 30000
);

const circuits = new Map();

class LegacyServiceError extends Error {
  constructor(message, { status = 502, code = "LEGACY_ERROR", details, cause } = {}) {
    super(message);
    this.name = "LegacyServiceError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.cause = cause;
  }
}

const getCircuit = (operation) => {
  if (!circuits.has(operation)) {
    circuits.set(operation, {
      state: "CLOSED",
      failures: 0,
      openedAt: null,
    });
  }

  return circuits.get(operation);
};

const ensureCircuitAllowsRequest = (operation) => {
  const circuit = getCircuit(operation);

  if (circuit.state !== "OPEN") {
    return circuit;
  }

  const elapsedMs = Date.now() - circuit.openedAt;
  if (elapsedMs >= RESET_TIMEOUT_MS) {
    circuit.state = "HALF_OPEN";
    return circuit;
  }

  throw new LegacyServiceError(
    "Servicio legacy temporalmente no disponible por circuito abierto.",
    {
      status: 503,
      code: "LEGACY_CIRCUIT_OPEN",
      details: {
        operation,
        retry_after_ms: RESET_TIMEOUT_MS - elapsedMs,
      },
    }
  );
};

const recordSuccess = (operation) => {
  const circuit = getCircuit(operation);
  circuit.state = "CLOSED";
  circuit.failures = 0;
  circuit.openedAt = null;
};

const recordFailure = (operation) => {
  const circuit = getCircuit(operation);
  circuit.failures += 1;

  if (
    circuit.state === "HALF_OPEN" ||
    circuit.failures >= FAILURE_THRESHOLD
  ) {
    circuit.state = "OPEN";
    circuit.openedAt = Date.now();
  }
};

const parseResponseBody = async (response) => {
  const body = await response.text();
  if (!body) return null;

  try {
    return JSON.parse(body);
  } catch (error) {
    return body;
  }
};

const requestLegacy = async (
  path,
  { method = "GET", body, operation = "legacy", timeoutMs = DEFAULT_TIMEOUT_MS } = {}
) => {
  ensureCircuitAllowsRequest(operation);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${LEGACY_SERVICE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
      if (response.status >= 500) {
        recordFailure(operation);
      } else {
        recordSuccess(operation);
      }

      throw new LegacyServiceError(
        responseBody && responseBody.message
          ? responseBody.message
          : "Legacy-service respondio con error.",
        {
          status: response.status,
          code:
            response.status >= 500
              ? "LEGACY_BAD_RESPONSE"
              : "LEGACY_BUSINESS_ERROR",
          details: responseBody,
        }
      );
    }

    recordSuccess(operation);
    return responseBody;
  } catch (error) {
    if (error instanceof LegacyServiceError) {
      throw error;
    }

    recordFailure(operation);

    if (error.name === "AbortError") {
      throw new LegacyServiceError("Timeout al consultar legacy-service.", {
        status: 504,
        code: "LEGACY_TIMEOUT",
        cause: error,
      });
    }

    throw new LegacyServiceError("No se pudo conectar con legacy-service.", {
      status: 503,
      code: "LEGACY_UNAVAILABLE",
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const getInventory = (codigo) =>
  requestLegacy(`/inventory/${encodeURIComponent(codigo)}`, {
    operation: "inventory",
  });

const getWarranty = (numeroSerie) =>
  requestLegacy(`/warranty/${encodeURIComponent(numeroSerie)}`, {
    operation: "warranty",
  });

const getSparePartsByTicket = (idTicket) =>
  requestLegacy(`/spare-parts/${encodeURIComponent(idTicket)}`, {
    operation: "spare-parts",
  });

const assignSparePartsToTicket = (idTicket, payload) =>
  requestLegacy(`/spare-parts/${encodeURIComponent(idTicket)}`, {
    method: "POST",
    body: payload,
    operation: "spare-parts",
  });

module.exports = {
  LegacyServiceError,
  assignSparePartsToTicket,
  getInventory,
  getSparePartsByTicket,
  getWarranty,
};
