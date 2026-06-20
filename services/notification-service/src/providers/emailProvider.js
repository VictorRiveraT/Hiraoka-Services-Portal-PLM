const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const PDFDocument = require('pdfkit');

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
    return `Hola ${datos.nombre}, tu equipo ${datos.producto || ''} fue entregado. Ticket ${datos.ticket}. Complete la encuesta de satisfaccion: ${datos.nps_url}`;
  }

  return `Hola ${datos.nombre}, el ticket ${datos.ticket} cambio a estado ${datos.estado}. Fecha estimada: ${datos.fecha}.`;
};

const buildReceiptPdf = (datos) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: `Comprobante ${datos.ticket}` } });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pago = datos.pago || {};
    doc.fontSize(20).fillColor('#CC0000').text('Hiraoka Services');
    doc.moveDown(0.4).fontSize(13).fillColor('#111827').text(`${pago.comprobante || 'Comprobante'} de servicio tecnico`);
    doc.moveDown();
    doc.fontSize(11);
    [
      ['Ticket', datos.ticket],
      ['Cliente', datos.nombre],
      ['Equipo', datos.producto || '-'],
      ['Estado', datos.estado || 'Entregado'],
      ['Medio de pago', pago.medio_pago || '-'],
      ['Costo de reparacion', `S/. ${Number(pago.costo_reparacion || 0).toFixed(2)}`],
      ['Repuestos', `S/. ${Number(pago.monto_repuestos || 0).toFixed(2)}`],
      ['Adelanto', `S/. ${Number(pago.adelanto || 0).toFixed(2)}`],
      ['Monto final', `S/. ${Number(pago.monto_final || 0).toFixed(2)}`],
      ['Saldo registrado', `S/. ${Number(pago.saldo_pendiente || 0).toFixed(2)}`],
    ].forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(String(value || '-'));
    });
    doc.moveDown(1.5).fontSize(9).fillColor('#6B7280')
      .text('Documento generado automaticamente por Hiraoka Services.');
    doc.end();
  });

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

  if (tipo === 'entregado' && datos.pago) {
    const receipt = await buildReceiptPdf(datos);
    msg.attachments = [{
      content: receipt.toString('base64'),
      filename: `comprobante-${datos.ticket}.pdf`,
      type: 'application/pdf',
      disposition: 'attachment',
    }];
  }

  const response = await sgMail.send(msg);
  return {
    status: response[0].statusCode,
    message: 'Email enviado via SendGrid',
    message_id: response[0].headers && response[0].headers['x-message-id'],
  };
};

module.exports = { send, buildReceiptPdf };
