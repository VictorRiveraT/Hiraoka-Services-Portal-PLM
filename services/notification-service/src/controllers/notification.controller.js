const emailProvider = require('../providers/emailProvider');

const TIPOS_VALIDOS = [
  'estado_cambiado',
  'listo_retiro',
  'entregado',
];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  if (canal !== 'email') {
    return res.status(400).json({
      success: false,
      message: `Canal no soportado: ${canal}. Canales disponibles: email`,
    });
  }

  const destinatarioEmail =
    destinatario || email || datos.destinatario || datos.email_cliente;

  if (!destinatarioEmail) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere destinatario o email para enviar por canal email.',
    });
  }

  if (!EMAIL_REGEX.test(String(destinatarioEmail).trim())) {
    return res.status(400).json({
      success: false,
      message: 'El destinatario debe tener un formato de email valido.',
    });
  }

  try {
    const variables = {
      ...datos,
      id_ticket,
      ticket: datos.ticket || datos.codigo_ticket || id_ticket,
      nombre: datos.nombre || datos.nombre_cliente || 'Cliente',
      estado: datos.estado || datos.estado_nuevo || 'Actualizado',
      fecha: datos.fecha || datos.fecha_estimada || datos.fecha_estimada_entrega || 'Por confirmar',
      portal_url: datos.portal_url || process.env.PORTAL_URL || 'http://localhost',
    };

    const result = await emailProvider.send({
      tipo,
      destinatario: destinatarioEmail,
      datos: variables,
    });

    return res.status(200).json({
      success: true,
      message: 'Notificacion enviada correctamente.',
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
