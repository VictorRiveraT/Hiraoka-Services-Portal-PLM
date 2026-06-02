const emailProvider = require('../providers/emailProvider');

const TIPOS_VALIDOS = [
  'ticket_recibido',
  'en_diagnostico',
  'en_reparacion',
  'listo_retiro',
  'entregado',
];

const sendNotification = async (req, res) => {
  const { tipo, canal, destinatario, datos } = req.body;

  if (!tipo || !canal || !destinatario || !datos) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos requeridos: tipo, canal, destinatario, datos.',
    });
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({
      success: false,
      message: `Tipo de notificacion invalido. Tipos validos: ${TIPOS_VALIDOS.join(', ')}`,
    });
  }

  try {
    let result;

    if (canal === 'email') {
      result = await emailProvider.send({ tipo, destinatario, datos });
    } else {
      return res.status(400).json({
        success: false,
        message: `Canal no soportado: ${canal}. Canales disponibles: email`,
      });
    }

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