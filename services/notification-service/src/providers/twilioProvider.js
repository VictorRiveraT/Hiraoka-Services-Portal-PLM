const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';

const buildMessage = (tipo, datos) => {
  if (tipo === 'listo_retiro') {
    return `Hola ${datos.nombre}, tu equipo ${datos.producto || ''} esta listo para retiro. Ticket ${datos.ticket}. Fecha: ${datos.fecha}.`;
  }

  if (tipo === 'entregado') {
    return `Hola ${datos.nombre}, tu equipo ${datos.producto || ''} fue entregado. Ticket ${datos.ticket}. Gracias por confiar en Hiraoka Services.`;
  }

  return `Hola ${datos.nombre}, el ticket ${datos.ticket} cambio a estado ${datos.estado}. Fecha estimada: ${datos.fecha}.`;
};

const normalizePhone = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('+')) return `+${raw.slice(1).replace(/\D/g, '')}`;

  const digits = raw.replace(/\D/g, '');
  if (digits.length === 9) return `+51${digits}`;
  return `+${digits}`;
};

const send = async ({ tipo, canal, destinatario, datos }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const to = normalizePhone(destinatario);
  const isWhatsApp = canal === 'whatsapp';
  const from = isWhatsApp
    ? process.env.TWILIO_WHATSAPP_FROM
    : process.env.TWILIO_SMS_FROM;

  if (!accountSid || !authToken) {
    throw new Error('Credenciales de Twilio no configuradas');
  }

  if (!from) {
    throw new Error(
      isWhatsApp
        ? 'TWILIO_WHATSAPP_FROM no configurada'
        : 'TWILIO_SMS_FROM no configurada'
    );
  }

  if (!/^\+\d{7,15}$/.test(to)) {
    throw new Error('Numero de telefono invalido para Twilio');
  }

  const body = new URLSearchParams({
    From: isWhatsApp && !from.startsWith('whatsapp:') ? `whatsapp:${from}` : from,
    To: isWhatsApp ? `whatsapp:${to}` : to,
    Body: buildMessage(tipo, datos),
  });

  const response = await fetch(
    `${TWILIO_API_BASE}/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    }
  );

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || `Twilio respondio ${response.status}`);
  }

  return {
    status: response.status,
    message: `${isWhatsApp ? 'WhatsApp' : 'SMS'} enviado via Twilio`,
    message_id: result.sid,
  };
};

module.exports = { send, normalizePhone, buildMessage };
