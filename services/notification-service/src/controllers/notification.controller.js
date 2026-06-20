const emailProvider = require('../providers/emailProvider');
const twilioProvider = require('../providers/twilioProvider');

const TIPOS_VALIDOS = [
  'estado_cambiado',
  'listo_retiro',
  'entregado',
];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{7,15}$/;
const CANALES_VALIDOS = ['email', 'whatsapp', 'sms'];

const sendNotification = async (req, res) => {
  const {
    id_ticket,
    tipo,
    canal,
    destinatario,
    email,
    datos = {},
  } = req.body;

  if (!id_ticket || !tipo || !canal) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos requeridos: id_ticket, tipo, canal.',
    });
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({
      success: false,
      message: `Tipo de notificacion invalido. Tipos validos: ${TIPOS_VALIDOS.join(', ')}`,
    });
  }

  if (!CANALES_VALIDOS.includes(canal)) {
    return res.status(400).json({
      success: false,
      message: `Canal no soportado: ${canal}. Canales disponibles: ${CANALES_VALIDOS.join(', ')}`,
    });
  }

  const destinatarioFinal = canal === 'email'
    ? destinatario || email || datos.destinatario || datos.email_cliente
    : destinatario || datos.destinatario || datos.telefono || datos.telefono_cliente;

  if (!destinatarioFinal) {
    return res.status(400).json({
      success: false,
      message: `Se requiere destinatario para enviar por canal ${canal}.`,
    });
  }

  if (canal === 'email' && !EMAIL_REGEX.test(String(destinatarioFinal).trim())) {
    return res.status(400).json({
      success: false,
      message: 'El destinatario debe tener un formato de email valido.',
    });
  }

  if (canal !== 'email' && !PHONE_REGEX.test(String(destinatarioFinal).trim())) {
    return res.status(400).json({
      success: false,
      message: 'El destinatario debe tener entre 7 y 15 digitos y puede iniciar con +.',
    });
  }

  try {
    const portalUrl = String(datos.portal_url || process.env.PORTAL_URL || 'http://localhost').replace(/\/+$/, '');
    const ticket = datos.ticket || datos.codigo_ticket || id_ticket;
    const variables = {
      ...datos,
      id_ticket,
      ticket,
      nombre: datos.nombre || datos.nombre_cliente || 'Cliente',
      estado: datos.estado || datos.estado_nuevo || 'Actualizado',
      fecha: datos.fecha || datos.fecha_estimada || datos.fecha_estimada_entrega || 'Por confirmar',
      portal_url: portalUrl,
      nps_url: `${portalUrl}/encuesta/?ticket=${encodeURIComponent(ticket)}`,
    };

    const provider = canal === 'email' ? emailProvider : twilioProvider;
    const result = await provider.send({
      tipo,
      canal,
      destinatario: destinatarioFinal,
      datos: variables,
    });

    return res.status(200).json({
      success: true,
      message: `Notificacion por ${canal} enviada correctamente.`,
      result,
    });
  } catch (error) {
    console.error('[notification-service] Error al enviar notificacion:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Error al enviar la notificacion. Intenta de nuevo.',
    });
  }
};

module.exports = { sendNotification };
