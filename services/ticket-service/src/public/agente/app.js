// Ã¢â€â‚¬Ã¢â€â‚¬ REFERENCIAS DOM Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const loginView    = document.getElementById('login-view');
const loginForm    = document.getElementById('login-form');
const loginError   = document.getElementById('login-error');
const appView      = document.getElementById('app-view');
const agentPill    = document.getElementById('agent-pill');
const formSection  = document.getElementById('form-section');
const confirmSection = document.getElementById('confirm-section');
const registroForm = document.getElementById('registro-form');
const formError    = document.getElementById('form-error');
const dniHint      = document.getElementById('dni-hint');
const resultCodigo = document.getElementById('result-codigo');
const resultFecha  = document.getElementById('result-fecha');
const resultEvidence = document.getElementById('result-evidence');
const deliverySummary = document.getElementById('delivery-summary');
const deliveryPayment = document.getElementById('delivery-payment');
const deliveryMessage = document.getElementById('delivery-message');
const fotosIngresoInput = document.getElementById('fotos_ingreso');
const evidencePreview = document.getElementById('evidence-preview');
const cameraDialog = document.getElementById('camera-dialog');
const cameraVideo = document.getElementById('camera-video');
const cameraCanvas = document.getElementById('camera-canvas');
const cameraError = document.getElementById('camera-error');

// Ã¢â€â‚¬Ã¢â€â‚¬ ESTADO Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
let token = sessionStorage.getItem('agente_token') || '';
let deliveryTicket = null;
let cameraStream = null;
let evidenceFiles = [];

// Ã¢â€â‚¬Ã¢â€â‚¬ HELPERS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
async function apiJson(url, options = {}) {
  const resp = await fetch(url, options);
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.message || data.error || 'Error en la solicitud');
  return data;
}

function authHeaders() {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function syncEvidenceInput() {
  if (typeof DataTransfer === 'undefined') return;
  const transfer = new DataTransfer();
  evidenceFiles.slice(0, 5).forEach((file) => transfer.items.add(file));
  fotosIngresoInput.files = transfer.files;
}

function renderEvidencePreview() {
  evidencePreview.innerHTML = '';
  evidencePreview.hidden = evidenceFiles.length === 0;
  evidenceFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'evidence-preview-item';
    const image = document.createElement('img');
    image.src = URL.createObjectURL(file);
    image.alt = `Evidencia de ingreso ${index + 1}`;
    image.addEventListener('load', () => URL.revokeObjectURL(image.src), { once: true });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Eliminar evidencia ${index + 1}`);
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      evidenceFiles.splice(index, 1);
      syncEvidenceInput();
      renderEvidencePreview();
    });
    item.append(image, remove);
    evidencePreview.appendChild(item);
  });
}

function addEvidenceFiles(files) {
  const accepted = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
  evidenceFiles = [...evidenceFiles, ...accepted].slice(0, 5);
  syncEvidenceInput();
  renderEvidencePreview();
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  cameraVideo.srcObject = null;
}

async function openCamera() {
  cameraError.hidden = true;
  cameraDialog.showModal();
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.textContent = 'Este navegador no permite captura directa. Use el selector de archivos para abrir la cámara del dispositivo.';
    cameraError.hidden = false;
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    });
    cameraVideo.srcObject = cameraStream;
  } catch {
    cameraError.textContent = 'No se pudo acceder a la cámara. Revise el permiso del navegador o seleccione una imagen.';
    cameraError.hidden = false;
  }
}

function fmtFecha(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
}

function val(id) { return document.getElementById(id).value.trim(); }
function setVal(id, v) { document.getElementById(id).value = v; }

function money(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const DELIVERY_STAGE_LABELS = {
  Recibido: 'Recepción',
  Diagnosticando: 'Diagnóstico',
  Reparando: 'Reparación',
  Listo: 'Listo para retiro',
  Entregado: 'Entrega',
};

function renderDeliveryDetails(ticket) {
  const repuestos = ticket.repuestos_asignados || [];
  const pago = ticket.pago || {};
  const etapas = ticket.etapas || {};
  const totalRepuestos = repuestos.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const stageHtml = Object.entries(DELIVERY_STAGE_LABELS)
    .map(([estado, label]) => {
      const etapa = etapas[estado] || {};
      const observaciones = (etapa.observaciones || [])
        .map((item) => item.texto || item)
        .filter(Boolean);
      const evidencias = etapa.evidencias || [];
      if (!observaciones.length && !evidencias.length) return '';
      return `
        <section class="delivery-stage">
          <h4>${label}</h4>
          ${observaciones.map((texto) => `<p>${escapeHtml(texto)}</p>`).join('')}
          ${evidencias.length ? `
            <div class="delivery-evidence">
              ${evidencias.map((url) => `
                <a href="${escapeHtml(url)}" target="_blank" rel="noopener">
                  <img src="${escapeHtml(url)}" alt="Evidencia de ${label}">
                </a>
              `).join('')}
            </div>
          ` : ''}
        </section>
      `;
    })
    .join('');

  deliverySummary.innerHTML = `
    <div class="delivery-heading">
      <strong>Ticket #${escapeHtml(ticket.codigo_ticket || ticket.id_ticket)}</strong>
      <span class="delivery-status">${escapeHtml(ticket.estado)}</span>
    </div>
    <p>${escapeHtml([ticket.producto, ticket.marca, ticket.modelo].filter(Boolean).join(' '))}</p>
    <section class="delivery-stage">
      <h4>Tipo de reparación / problema reportado</h4>
      <p>${escapeHtml(ticket.descripcion_problema || 'Sin descripción registrada.')}</p>
    </section>
    ${stageHtml || '<p>No hay comentarios ni fotografías adicionales registradas.</p>'}
    <section class="delivery-stage">
      <h4>Repuestos agregados</h4>
      ${repuestos.length
        ? `<ul>${repuestos.map((item) => `
            <li>${escapeHtml(item.codigo)} - ${escapeHtml(item.nombre || 'Repuesto')} (${Number(item.cantidad || 1)}): ${money(item.subtotal)}</li>
          `).join('')}</ul>`
        : '<p>Sin repuestos registrados.</p>'}
    </section>
    <div class="delivery-totals" id="delivery-totals">
      <span>Monto estimado inicial <strong>${money(pago.monto_estimado_inicial)}</strong></span>
      <span>Adelanto 25% <strong>${money(pago.adelanto)}</strong></span>
      <span>Repuestos <strong>${money(totalRepuestos)}</strong></span>
      <span>Costo de reparación <strong>${money(0)}</strong></span>
      <span>Monto final <strong>${money(totalRepuestos)}</strong></span>
      <span>Saldo pendiente <strong>${money(Math.max(0, totalRepuestos - Number(pago.adelanto || 0)))}</strong></span>
    </div>
  `;
}

function updateDeliveryTotals() {
  if (!deliveryTicket) return;
  const totals = document.getElementById('delivery-totals');
  if (!totals) return;
  const pago = deliveryTicket.pago || {};
  const totalRepuestos = (deliveryTicket.repuestos_asignados || [])
    .reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const costo = Number(val('entrega-costo') || 0);
  const montoFinal = totalRepuestos + costo;
  const saldo = Math.max(0, montoFinal - Number(pago.adelanto || 0));
  totals.innerHTML = `
    <span>Monto estimado inicial <strong>${money(pago.monto_estimado_inicial)}</strong></span>
    <span>Adelanto 25% <strong>${money(pago.adelanto)}</strong></span>
    <span>Repuestos <strong>${money(totalRepuestos)}</strong></span>
    <span>Costo de reparación <strong>${money(costo)}</strong></span>
    <span>Monto final <strong>${money(montoFinal)}</strong></span>
    <span>Saldo pendiente <strong>${money(saldo)}</strong></span>
  `;
}

function showFormError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}

function clearFormError() { formError.hidden = true; }

// Ã¢â€â‚¬Ã¢â€â‚¬ LOGIN Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.hidden = true;
  try {
    const data = await apiJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value,
      }),
    });
    token = data.token;
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.rol !== 'Agente') throw new Error('Este portal es exclusivo para usuarios con rol Agente.');
    sessionStorage.setItem('agente_token', token);
    agentPill.textContent = `Agente: ${payload.nombre || payload.username || 'Agente'}`;
    showApp();
    loadTecnicos();
  } catch (err) {
    loginError.textContent = err.message;
    loginError.hidden = false;
  }
});

function showApp() {
  loginView.hidden = true;
  appView.hidden = false;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ LÃ³gica del ojito para la contraseÃ±a Ã¢â€â‚¬Ã¢â€â‚¬
const togglePwd = document.getElementById('toggle-pwd');
const pwdInput = document.getElementById('password');

if (togglePwd && pwdInput) {
  togglePwd.addEventListener('click', () => {
    const isText = pwdInput.type === 'text';
    
    // Cambiamos el tipo de input
    pwdInput.type = isText ? 'password' : 'text';
    
    // Cambiamos el Ã­cono SVG
    togglePwd.innerHTML = isText 
      ? `<svg viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>` 
      : `<svg viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`;
  });
}

document.getElementById('logout-btn').addEventListener('click', () => {
  token = '';
  sessionStorage.removeItem('agente_token');
  loginView.hidden = false;
  appView.hidden = true;
  registroForm.reset();
  dniHint.textContent = '';
  clearFormError();
  formSection.hidden = false;
  confirmSection.hidden = true;
});

// Ã¢â€â‚¬Ã¢â€â‚¬ BUSCAR CLIENTE POR DNI Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
document.getElementById('btn-buscar-cliente').addEventListener('click', async () => {
  const dni = val('dni');
  if (!/^\d{8}$/.test(dni)) {
    dniHint.style.color = '#CC0000';
    dniHint.textContent = 'El DNI debe tener 8 dígitos.';
    return;
  }
  try {
    const data = await apiJson(`/api/tickets/dni/${dni}`, { headers: authHeaders() });
    const tickets = data.data || [];
    if (tickets.length > 0) {
      const ultimo = tickets[0];
      setVal('nombre',   ultimo.cliente || '');
      setVal('telefono', ultimo.telefono || '');
      setVal('email',    ultimo.email || '');
      dniHint.style.color = '#1B5E20';
      dniHint.textContent = `Cliente encontrado: ${ultimo.cliente}`;
    } else {
      dniHint.style.color = '#E65100';
      dniHint.textContent = 'Cliente nuevo - complete los datos manualmente.';
    }
  } catch (_) {
    dniHint.style.color = '#E65100';
    dniHint.textContent = 'Cliente nuevo - complete los datos manualmente.';
  }
});

// Ã¢â€â‚¬Ã¢â€â‚¬ CARGAR TECNICOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
async function loadTecnicos() {
  const select = document.getElementById('id_tecnico');
  try {
    const data = await apiJson('/api/usuarios?rol=Tecnico', { headers: authHeaders() });
    const tecnicos = data.data || data.usuarios || [];
    tecnicos.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id_usuario;
      opt.textContent = t.nombre_completo || t.username;
      select.appendChild(opt);
    });
  } catch (_) {
    // Si no hay endpoint de usuarios, dejamos solo "Sin asignar"
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬ REGISTRAR EQUIPO Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
registroForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearFormError();

  const dni = val('dni');
  if (!/^\d{8}$/.test(dni)) {
    showFormError('El DNI debe tener exactamente 8 dígitos.');
    return;
  }

  const body = {
    cliente: {
      dni,
      nombre:   val('nombre'),
      telefono: val('telefono') || undefined,
      email:    val('email')    || undefined,
    },
    equipo: {
      numero_serie: val('numero_serie'),
      modelo:       val('modelo'),
      marca:        val('marca') || undefined,
    },
    descripcion_problema: val('descripcion'),
    id_tecnico: val('id_tecnico') || undefined,
    pago_inicial: {
      monto_estimado_inicial: Number(val('monto_estimado') || 0),
      medio_pago: val('medio_adelanto') || 'Pendiente',
    },
  };

  const btn = document.getElementById('btn-registrar');
  btn.disabled = true;
  btn.textContent = 'Registrando...';

  try {
    const data = await apiJson('/api/tickets', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    const ticket = data.data;
    const fotosIngreso = evidenceFiles.slice(0, 5);
    resultEvidence.textContent = '';
    if (fotosIngreso.length) {
      try {
        const evidenceData = new FormData();
        fotosIngreso.forEach((file) => evidenceData.append('fotos', file));
        evidenceData.append('estado', 'Recibido');
        const evidenceResponse = await fetch(`/api/tickets/${ticket.id_ticket}/evidencias`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: evidenceData,
        });
        const evidenceResult = await evidenceResponse.json().catch(() => ({}));
        resultEvidence.textContent = evidenceResponse.ok
          ? `${fotosIngreso.length} evidencia(s) de ingreso guardada(s).`
          : `Ticket creado, pero las evidencias no se guardaron: ${evidenceResult.message || 'error de carga'}`;
      } catch {
        resultEvidence.textContent = 'Ticket creado, pero no se pudo conectar para guardar las evidencias.';
      }
    }

    resultCodigo.textContent = ticket.codigo_ticket || ticket.id_ticket?.slice(0,8).toUpperCase() || 'TK-NUEVO';
    resultFecha.textContent  = fmtFecha(ticket.fecha_estimada_entrega);

    formSection.hidden   = true;
    confirmSection.hidden = false;

  } catch (err) {
    showFormError(err.message || 'Error al registrar el equipo. Intenta nuevamente.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg> Registrar Entrada de Equipo`;
  }
});

// Ã¢â€â‚¬Ã¢â€â‚¬ REGISTRAR OTRO Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
document.getElementById('btn-nuevo').addEventListener('click', () => {
  registroForm.reset();
  evidenceFiles = [];
  renderEvidencePreview();
  dniHint.textContent = '';
  clearFormError();
  formSection.hidden   = false;
  confirmSection.hidden = true;
});

// Ã¢â€â‚¬Ã¢â€â‚¬ IMPRIMIR Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
document.getElementById('btn-imprimir').addEventListener('click', () => {
  window.print();
});

fotosIngresoInput.addEventListener('change', () => {
  evidenceFiles = [];
  addEvidenceFiles(fotosIngresoInput.files);
});
document.getElementById('btn-abrir-camara').addEventListener('click', openCamera);
document.getElementById('btn-capturar-foto').addEventListener('click', () => {
  if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) {
    cameraError.textContent = 'La cámara todavía no está lista.';
    cameraError.hidden = false;
    return;
  }
  cameraCanvas.width = cameraVideo.videoWidth;
  cameraCanvas.height = cameraVideo.videoHeight;
  cameraCanvas.getContext('2d').drawImage(cameraVideo, 0, 0);
  cameraCanvas.toBlob((blob) => {
    if (!blob) return;
    addEvidenceFiles([
      new File([blob], `evidencia-${Date.now()}.jpg`, { type: 'image/jpeg' }),
    ]);
    stopCamera();
    cameraDialog.close();
  }, 'image/jpeg', 0.9);
});
cameraDialog.addEventListener('close', stopCamera);


document.getElementById('btn-buscar-entrega').addEventListener('click', async () => {
  const dni = val('entrega-dni');
  const idTicket = val('entrega-ticket').toUpperCase();
  deliveryMessage.textContent = '';
  deliverySummary.hidden = true;
  deliveryPayment.hidden = true;
  deliveryTicket = null;

  if (!/^\d{8}$/.test(dni) || !idTicket) {
    deliveryMessage.textContent = 'Ingrese DNI y código de ticket.';
    return;
  }

  try {
    const data = await apiJson('/api/tickets/consulta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni, id_ticket: idTicket }),
    });
    const ticket = data.data;
    deliveryTicket = ticket;
    renderDeliveryDetails(ticket);
    deliverySummary.hidden = false;
    if (ticket.estado !== 'Listo') {
      deliveryMessage.textContent = 'Este equipo aún no está listo para retiro.';
      return;
    }
    deliveryPayment.hidden = false;
    updateDeliveryTotals();
  } catch (error) {
    deliveryMessage.textContent = error.message;
  }
});

document.getElementById('entrega-costo').addEventListener('input', updateDeliveryTotals);

document.getElementById('btn-confirmar-entrega').addEventListener('click', async () => {
  if (!deliveryTicket) return;
  try {
    const data = await apiJson(`/api/tickets/${deliveryTicket.id_ticket}/entrega`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        costo_reparacion: Number(val('entrega-costo') || 0),
        medio_pago: val('entrega-medio'),
        comprobante: val('entrega-comprobante'),
      }),
    });
    const pago = data.data?.pago || {};
    deliveryMessage.textContent = data.message;
    deliverySummary.insertAdjacentHTML('beforeend', `
      <section class="simulated-receipt">
        <div>
          <span>COMPROBANTE SIMULADO</span>
          <strong>${escapeHtml(pago.comprobante || 'Comprobante')}</strong>
        </div>
        <p>Ticket: ${escapeHtml(data.data?.codigo_ticket || deliveryTicket.codigo_ticket)}</p>
        <p>Medio de pago: ${escapeHtml(pago.medio_pago || val('entrega-medio'))}</p>
        <p>Monto final: ${money(pago.monto_final)} · Adelanto: ${money(pago.adelanto)} · Saldo registrado: ${money(pago.saldo_pendiente)}</p>
        <p>${escapeHtml(pago.correo_simulado || 'Notificacion preparada con el detalle del pago y comprobante PDF.')}</p>
      </section>
    `);
    deliveryTicket.estado = 'Entregado';
    deliveryPayment.hidden = true;
  } catch (error) {
    deliveryMessage.textContent = error.message;
  }
});
// Ã¢â€â‚¬Ã¢â€â‚¬ ARRANQUE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.rol !== 'Agente') throw new Error('Rol invalido');
    agentPill.textContent = `Agente: ${payload.nombre || payload.username || 'Agente'}`;
    showApp();
    loadTecnicos();
  } catch (_) {
    sessionStorage.removeItem('agente_token');
    token = '';
  }
}
