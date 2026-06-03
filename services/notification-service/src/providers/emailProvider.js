const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');

const SUBJECTS = {
  estado_cambiado: (datos) =>
    `Hiraoka Services - Ticket ${datos.ticket} actualizado a ${datos.estado}`,
  listo_retiro: (datos) =>
    `Hiraoka Services - Tu equipo esta listo para retiro (${datos.ticket})`,
  entregado: (datos) =>
    `Hiraoka Services - Equipo entregado (${datos.ticket})`,
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderTemplate = (tipo, datos) => {
  const templatePath = path.join(TEMPLATE_DIR, `${tipo}.html`);
  const template = fs.readFileSync(templatePath, 'utf8');

  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) =>
    escapeHtml(datos[key])
  );
};

const buildText = (tipo, datos) => {
  if (tipo === 'listo_retiro') {
    return `Hola ${datos.nombre}, tu equipo ${datos.producto || ''} esta listo para retiro. Ticket ${datos.ticket}. Fecha: ${datos.fecha}.`;
  }

  if (tipo === 'entregado') {
    return `Hola ${datos.nombre}, tu equipo ${datos.producto || ''} fue entregado. Ticket ${datos.ticket}. Gracias por confiar en Hiraoka Services.`;
  }

  return `Hola ${datos.nombre}, el ticket ${datos.ticket} cambio a estado ${datos.estado}. Fecha estimada: ${datos.fecha}.`;
};

const send = async ({ tipo, destinatario, datos }) => {
  const subjectBuilder = SUBJECTS[tipo];
  if (!subjectBuilder) throw new Error(`Plantilla no encontrada para tipo: ${tipo}`);

  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY no configurada');
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: destinatario,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@hiraokaservices.lat',
      name: 'Hiraoka Services',
    },
    subject: subjectBuilder(datos),
    text: buildText(tipo, datos),
    html: renderTemplate(tipo, datos),
  };

  const response = await sgMail.send(msg);
  return { status: response[0].statusCode, message: 'Email enviado via SendGrid' };
};

module.exports = { send };
