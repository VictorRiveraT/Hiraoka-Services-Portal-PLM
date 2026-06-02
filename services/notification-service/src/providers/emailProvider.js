const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const PLANTILLAS = {
  ticket_recibido: (datos) => ({
    subject: `Hiraoka Services — Ticket #${datos.id_ticket} recibido`,
    text: `Hola ${datos.nombre_cliente}, hemos recibido tu equipo ${datos.producto}. Tu numero de ticket es ${datos.id_ticket}. Te notificaremos cuando avance el proceso.`,
    html: `<h2>Hola ${datos.nombre_cliente},</h2><p>Hemos recibido tu equipo <strong>${datos.producto}</strong>.</p><p>Tu numero de ticket es <strong>#${datos.id_ticket}</strong>.</p><p>Te notificaremos cuando avance el proceso. Puedes consultar el estado en <a href="${process.env.PORTAL_URL || 'http://localhost'}">nuestro portal</a>.</p>`,
  }),
  en_diagnostico: (datos) => ({
    subject: `Hiraoka Services — Ticket #${datos.id_ticket} en diagnostico`,
    text: `Hola ${datos.nombre_cliente}, tu equipo ${datos.producto} esta siendo evaluado por nuestro tecnico especializado.`,
    html: `<h2>Hola ${datos.nombre_cliente},</h2><p>Tu equipo <strong>${datos.producto}</strong> esta siendo evaluado por nuestro tecnico especializado.</p><p>Ticket: <strong>#${datos.id_ticket}</strong></p>`,
  }),
  en_reparacion: (datos) => ({
    subject: `Hiraoka Services — Ticket #${datos.id_ticket} en reparacion`,
    text: `Hola ${datos.nombre_cliente}, tu equipo ${datos.producto} esta siendo reparado. Fecha estimada de entrega: ${datos.fecha_estimada}.`,
    html: `<h2>Hola ${datos.nombre_cliente},</h2><p>Tu equipo <strong>${datos.producto}</strong> esta en proceso de reparacion.</p><p>Fecha estimada de entrega: <strong>${datos.fecha_estimada}</strong></p><p>Ticket: <strong>#${datos.id_ticket}</strong></p>`,
  }),
  listo_retiro: (datos) => ({
    subject: `Hiraoka Services — Tu equipo esta listo para recoger`,
    text: `Hola ${datos.nombre_cliente}, tu equipo ${datos.producto} ya esta reparado y listo para ser recogido en nuestras tiendas. Horario: Lunes a Sabado de 9am a 8pm.`,
    html: `<h2>Hola ${datos.nombre_cliente},</h2><p>Tu equipo <strong>${datos.producto}</strong> ya esta reparado y listo para ser recogido.</p><p><strong>Puedes recogerlo en cualquiera de nuestras tiendas.</strong></p><p>Horario de atencion: Lunes a Sabado de 9:00am a 8:00pm.</p><p>Ticket: <strong>#${datos.id_ticket}</strong></p>`,
  }),
  entregado: (datos) => ({
    subject: `Hiraoka Services — Equipo entregado exitosamente`,
    text: `Hola ${datos.nombre_cliente}, tu equipo ${datos.producto} ha sido entregado exitosamente. Gracias por confiar en Hiraoka.`,
    html: `<h2>Hola ${datos.nombre_cliente},</h2><p>Tu equipo <strong>${datos.producto}</strong> ha sido entregado exitosamente.</p><p>Gracias por confiar en Hiraoka Services.</p>`,
  }),
};

const send = async ({ tipo, destinatario, datos }) => {
  const plantilla = PLANTILLAS[tipo];
  if (!plantilla) throw new Error(`Plantilla no encontrada para tipo: ${tipo}`);

  const contenido = plantilla(datos);

  const msg = {
    to: destinatario,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@hiraokaservices.lat',
      name: 'Hiraoka Services',
    },
    subject: contenido.subject,
    text: contenido.text,
    html: contenido.html,
  };

  const response = await sgMail.send(msg);
  return { status: response[0].statusCode, message: 'Email enviado via SendGrid' };
};

module.exports = { send };