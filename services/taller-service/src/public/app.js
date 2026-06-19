// Ã¢â€â‚¬Ã¢â€â‚¬ Referencias DOM Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const loginView   = document.getElementById('login-view');
const appView     = document.getElementById('app-view');
const loginForm   = document.getElementById('login-form');
const loginError  = document.getElementById('login-error');
const mainView    = document.getElementById('main-view');
const detailView  = document.getElementById('detail-view');
const repuestosView = document.getElementById('repuestos-view');
const garantiaView  = document.getElementById('garantia-view');
const historialView = document.getElementById('historial-view');
const configView     = document.getElementById('config-view');
const assignedList  = document.getElementById('assigned-list');
const stateGrid     = document.getElementById('state-grid');
const updateForm    = document.getElementById('update-form');
const saveButton    = document.getElementById('save-button');
const panelMessage  = document.getElementById('panel-message');
const searchInput   = document.getElementById('search-input');
const stateFilter   = document.getElementById('state-filter');

// Sidebar nav
const navTickets   = document.getElementById('nav-tickets');
const navRepuestos = document.getElementById('nav-repuestos');
const navGarantia  = document.getElementById('nav-garantia');
const navHistorial = document.getElementById('nav-historial');
const navConfig    = document.getElementById('nav-config');

// HSPP88
const btnBuscarRepuesto = document.getElementById('btn-buscar-repuesto');
const repuestoQuery     = document.getElementById('repuesto-query');
const repuestoCategoria = document.getElementById('repuesto-categoria');
const repuestoTbody     = document.getElementById('repuesto-tbody');

// HSPP89
const btnVerificarGarantia = document.getElementById('btn-verificar-garantia');
const garantiaSerial       = document.getElementById('garantia-serial');
const garantiaResultado    = document.getElementById('garantia-resultado');
const garantiaCard         = document.getElementById('garantia-card');
const garantiaEquipoNombre = document.getElementById('garantia-equipo-nombre');
const garantiaSerieLbl     = document.getElementById('garantia-serie-label');
const garantiaBadgeBlock   = document.getElementById('garantia-badge-block');
const garantiaDetails      = document.getElementById('garantia-details');

// Ã¢â€â‚¬Ã¢â€â‚¬ Estado Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const ESTADO_LABELS = {
  Recibido: 'Recibido',
  Diagnosticando: 'En diagnóstico',
  Reparando: 'En reparación',
  Listo: 'Listo para retiro',
  Entregado: 'Entregado',
};

const FORM_STATES = ['Diagnosticando', 'Reparando', 'Listo'];

const TICKET_ESTADOS = ['Recibido', 'Diagnosticando', 'Reparando', 'Listo', 'Entregado'];

let token = sessionStorage.getItem('taller_token') || '';
let tickets = [];
let selectedTicket = null;
let selectedNextState = '';
let refreshTimer = null;
let preferences = JSON.parse(localStorage.getItem('taller_preferences') || '{}');
let repuestosEncontrados = [];
const OFFLINE_QUEUE_PREFIX = 'taller_offline_queue';
const TICKETS_CACHE_PREFIX = 'taller_tickets_cache';
let syncingOfflineChanges = false;

// Ã¢â€â‚¬Ã¢â€â‚¬ Helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function fmtFecha(value) {
  if (!value) return 'Por confirmar';
  return new Date(value).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function ticketCode(ticket) {
  return ticket.codigo_ticket || String(ticket.id_ticket || '').slice(0, 8).toUpperCase();
}

function productName(ticket) {
  return [ticket.producto, ticket.marca, ticket.modelo].filter(Boolean).join(' ') || 'Equipo registrado';
}

function badge(estado) {
  return `<span class="badge state-${estado}">${ESTADO_LABELS[estado] || estado}</span>`;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function apiJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || 'No se pudo completar la solicitud.');
  return data;
}

function parseToken(value) {
  return JSON.parse(atob(value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  window.setTimeout(() => { toast.hidden = true; }, 3500);
}

function currentUserCacheSuffix() {
  if (!token) return 'anonymous';
  try {
    return parseToken(token).id_usuario || 'anonymous';
  } catch (_error) {
    return 'anonymous';
  }
}

function offlineQueueKey() {
  return `${OFFLINE_QUEUE_PREFIX}:${currentUserCacheSuffix()}`;
}

function ticketsCacheKey() {
  return `${TICKETS_CACHE_PREFIX}:${currentUserCacheSuffix()}`;
}

function getOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(offlineQueueKey()) || '[]');
  } catch (_error) {
    return [];
  }
}

function saveOfflineQueue(queue) {
  localStorage.setItem(offlineQueueKey(), JSON.stringify(queue));
}

function updateSyncStatus() {
  const online = navigator.onLine;
  const pending = getOfflineQueue().length;
  document.getElementById('sync-banner').hidden = online;
  document.getElementById('sync-pill').textContent = pending
    ? `${pending} cambio${pending === 1 ? '' : 's'} pendiente${pending === 1 ? '' : 's'}`
    : online ? 'Sincronizado' : 'Sin sincronizar';
}

function queueStateChange(ticket, estado, observaciones) {
  const queue = getOfflineQueue();
  queue.push({
    id: `${ticket.id_ticket}-${Date.now()}`,
    ticketId: ticket.id_ticket,
    estado,
    observaciones,
    createdAt: new Date().toISOString(),
  });
  saveOfflineQueue(queue);

  ticket.estado = estado;
  ticket.observaciones_tecnicas = observaciones;
  ticket.siguientes_estados = [];
  localStorage.setItem(ticketsCacheKey(), JSON.stringify(tickets));
  updateSyncStatus();
}

async function syncOfflineChanges() {
  if (!navigator.onLine || !token || syncingOfflineChanges) return;
  const queue = getOfflineQueue();
  if (!queue.length) {
    updateSyncStatus();
    return;
  }

  syncingOfflineChanges = true;
  const pending = [];

  for (let index = 0; index < queue.length; index += 1) {
    const change = queue[index];
    try {
      await apiJson(`/api/tickets/${change.ticketId}/estado`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          estado: change.estado,
          observaciones: change.observaciones,
        }),
      });
    } catch (error) {
      pending.push(change);
      if (/token|sesion|acceso/i.test(error.message)) {
        pending.push(...queue.slice(index + 1));
        break;
      }
    }
  }

  saveOfflineQueue(pending);
  syncingOfflineChanges = false;
  updateSyncStatus();

  if (pending.length < queue.length) {
    showToast(`${queue.length - pending.length} cambio(s) offline sincronizado(s).`);
    await loadTickets().catch(() => {});
  }
}

function updateConnectionState() {
  updateSyncStatus();
  if (navigator.onLine) syncOfflineChanges().catch(() => {});
}

document.getElementById('evidence-upload').addEventListener('change', async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    if (!selectedTicket) {
        alert('No hay un ticket seleccionado.');
        return;
    }
    const ticketId = selectedTicket.id_ticket; 
    
    const formData = new FormData();
    for (let file of files) {
        formData.append('fotos', file);
    }
    formData.append('estado', selectedNextState || selectedTicket.estado);

    try {
        const response = await fetch(`/api/tickets/${ticketId}/evidencias`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            const etapa = data.data?.estado || selectedNextState || selectedTicket.estado;
            selectedTicket.etapas ||= {};
            selectedTicket.etapas[etapa] ||= { observaciones: [], evidencias: [] };
            selectedTicket.etapas[etapa].evidencias.push(...(data.evidencias || []));
            renderEvidenceGallery(data.evidencias, false);
            showToast('Fotos subidas correctamente');
        } else {
            alert('Error al subir las imágenes de evidencia.');
        }
    } catch (error) {
        console.error('Error de red:', error);
    }
});

function setUpdateFormMode(mode, ticket, estado) {
   const obsInput = document.getElementById('observations');
   const obsLabel = document.querySelector('label[for="observations"]');
   const saveBtn = document.getElementById('save-button');
   const evidenceUploadLabel = document.querySelector('.evidence-button');
   const evidenceInput = document.getElementById('evidence-upload');
   const gallery = document.getElementById('evidence-gallery');
   const evidenceSection = document.querySelector('.evidence-section');

   if (obsLabel) obsLabel.style.display = 'block';
   if (obsInput) obsInput.style.display = 'block';
   if (gallery) gallery.style.display = 'flex';
   if (evidenceSection) evidenceSection.classList.toggle('read-only', mode === 'view' || estado === 'Entregado');

   if (estado === 'Entregado') {
      if (obsLabel) obsLabel.textContent = 'Servicio entregado al cliente:';
      obsInput.readOnly = true;
      obsInput.required = false;
      obsInput.value = 'Equipo entregado. La orden ya no permite cambios desde taller.';
      saveBtn.style.display = 'none';
      if (evidenceUploadLabel) evidenceUploadLabel.style.display = 'none';
      if (evidenceInput) evidenceInput.style.display = 'none';
      renderEvidenceGallery(ticket._stateData?.Entregado?.evidencias || [], true);
      return;
   }

   if (mode === 'edit') {
      if (obsLabel) {
        obsLabel.textContent = estado === 'Listo'
          ? 'Mensaje final para el cliente (requerido)'
          : 'Observaciones técnicas (requerido)';
      }
      obsInput.readOnly = false;
      obsInput.disabled = false;
      obsInput.required = true;
      obsInput.value = estado === 'Listo' ? 'Dispositivo listo para retiro.' : '';
      saveBtn.style.display = 'block';
      saveBtn.textContent = estado === 'Listo'
        ? 'Confirmar y Notificar al Cliente'
        : 'Guardar Registro';

      if (evidenceUploadLabel) {
        evidenceUploadLabel.style.display = 'inline-block';
        evidenceUploadLabel.textContent = estado === 'Listo'
          ? 'Adjuntar foto final del dispositivo'
          : 'Adjuntar fotografías de evidencia';
      }
      if (evidenceInput) evidenceInput.style.display = '';

      renderEvidenceGallery([], true);
      saveBtn.disabled = false;
      clearMessage();
   } else if (mode === 'view') {
      const data = ticket._stateData[estado] || { observaciones: '', evidencias: [] };
      if (obsLabel) obsLabel.textContent = 'Observaciones registradas en esta etapa:';
      obsInput.readOnly = true;
      obsInput.disabled = true;
      obsInput.required = false;
      obsInput.value = data.observaciones || 'No se registraron observaciones en esta etapa.';

      saveBtn.style.display = 'none';
      if (evidenceUploadLabel) evidenceUploadLabel.style.display = 'none';
      if (evidenceInput) evidenceInput.style.display = 'none';

      renderEvidenceGallery(data.evidencias, true);
   }
}

function renderEvidenceGallery(urls, clear = true) {
    const gallery = document.getElementById('evidence-gallery');
    if (clear) gallery.innerHTML = '';
    
    if (urls && urls.length > 0) {
        urls.forEach((url, index) => {
            const img = document.createElement('img');
            img.src = url; 
            img.className = 'evidence-thumbnail';
            // Â¡FÃJATE AQUÃ! Ya no hay etiqueta <a>. El clic dispara el visor.
            img.addEventListener('click', () => openLightbox(urls, index));
            gallery.appendChild(img);
        });
    }
}

function renderAssignedParts(ticket) {
  let panel = document.getElementById('assigned-parts-panel');
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'assigned-parts-panel';
    panel.className = 'assigned-parts-panel';
    stateGrid.insertAdjacentElement('afterend', panel);
  }

  const repuestos = ticket.repuestos_asignados || [];
  if (!repuestos.length) {
    panel.innerHTML = '<h3>Repuestos agregados</h3><p class="muted">Aún no se agregaron repuestos a esta reparación.</p>';
    return;
  }

  const total = repuestos.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  panel.innerHTML = `
    <h3>Repuestos agregados</h3>
    <ul>
      ${repuestos.map((item) => `
        <li>
          <strong>${item.codigo}</strong>
          <span>${item.nombre || 'Repuesto'}</span>
          <em>${item.cantidad || 1} und. · S/. ${Number(item.subtotal || 0).toFixed(2)}</em>
        </li>
      `).join('')}
    </ul>
    <p class="parts-total">Total repuestos: S/. ${total.toFixed(2)}</p>
  `;
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

// Ã¢â€â‚¬Ã¢â€â‚¬ Navegacion entre vistas Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function setActiveNav(activeBtn) {
  [navTickets, navRepuestos, navGarantia, navHistorial, navConfig]
    .forEach((b) => b.classList.remove('active'));
  activeBtn.classList.add('active');
}

function hideAllViews() {
  mainView.hidden    = true;
  detailView.hidden  = true;
  repuestosView.hidden = true;
  garantiaView.hidden  = true;
  historialView.hidden = true;
  configView.hidden = true;
}

function showLogin(message) {
  loginView.hidden = false;
  appView.hidden   = true;
  if (message) {
    loginError.textContent = message;
    loginError.hidden = false;
  }
}

function showApp() {
  loginView.hidden = true;
  appView.hidden   = false;
}

function showMain() {
  hideAllViews();
  mainView.hidden = false;
  setActiveNav(navTickets);
  selectedNextState = '';
  clearMessage();
}

function showDetail(ticket) {
  selectedTicket = ticket;
  hideAllViews();
  detailView.hidden = false;
  selectedNextState = '';
  renderDetail(ticket);
  clearMessage();
}

function showRepuestosView() {
  hideAllViews();
  repuestosView.hidden = false;
  setActiveNav(navRepuestos);
}

function showGarantiaView() {
  hideAllViews();
  garantiaView.hidden = false;
  setActiveNav(navGarantia);
}

function showHistorialView() {
  hideAllViews();
  historialView.hidden = false;
  setActiveNav(navHistorial);
}

function applyRefreshPreference() {
  window.clearInterval(refreshTimer);
  refreshTimer = preferences.autoRefresh
    ? window.setInterval(() => loadTickets().catch(() => {}), 60000)
    : null;
}

function showConfigView() {
  hideAllViews();
  configView.hidden = false;
  setActiveNav(navConfig);
  document.getElementById('config-auto-refresh').checked = Boolean(preferences.autoRefresh);
  document.getElementById('config-show-delivered').checked = preferences.showDelivered !== false;
  document.getElementById('config-device-name').value = preferences.deviceName || '';
  const fontOption = document.querySelector(`[name="font-size"][value="${preferences.fontSize || 'normal'}"]`);
  if (fontOption) fontOption.checked = true;
  document.getElementById('cache-usage').textContent =
    `Preferencias locales almacenadas: ${new Blob([JSON.stringify(localStorage)]).size} bytes.`;
}

function setMessage(message, ok = false) {
  panelMessage.textContent = message;
  panelMessage.style.color = ok ? '#1B5E20' : '#CC0000';
  panelMessage.hidden = false;
}

function clearMessage() {
  panelMessage.hidden = true;
  panelMessage.textContent = '';
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Tickets: lista y detalle Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function visibleTickets() {
  const search = searchInput.value.trim().toLowerCase();
  const estado = stateFilter.value;
  return tickets.filter((ticket) => {
    const haystack = [ticketCode(ticket), ticket.cliente, productName(ticket), ticket.estado]
      .join(' ').toLowerCase();
    const showDelivered = preferences.showDelivered !== false || ticket.estado !== 'Entregado';
    return showDelivered && (!estado || ticket.estado === estado) && (!search || haystack.includes(search));
  });
}

function renderTicketList() {
  const filtered = visibleTickets();
  document.getElementById('assignment-count').textContent =
    `${filtered.length} orden${filtered.length === 1 ? '' : 'es'} activa${filtered.length === 1 ? '' : 's'}`;
  assignedList.innerHTML = '';

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-panel';
    empty.textContent = 'No hay tickets asignados con esos filtros.';
    assignedList.appendChild(empty);
    return;
  }

  filtered.forEach((ticket) => {
    const row = document.createElement('article');
    // HSPP48: clase de borde izquierdo segun estado
    row.className = `ticket-row border-${ticket.estado}`;
    const action = ticket.estado === 'Recibido' ? 'Iniciar'
      : ticket.estado === 'Entregado' ? 'Servicio concluido'
      : 'Actualizar';

    row.innerHTML = `
      <div>
        <h2>Ticket #${ticketCode(ticket)}</h2>
        <strong>${productName(ticket)}</strong>
        <p>Cliente: ${ticket.cliente || '-'}</p>
      </div>
      <div class="date-cell">
        <small>Ingreso: ${fmtFecha(ticket.fecha_ingreso)}</small>
      </div>
      <div>${badge(ticket.estado)}</div>
      <button class="row-action" type="button" ${ticket.estado === 'Entregado' ? 'disabled' : ''}>${action}</button>
    `;
    row.querySelector('.row-action').addEventListener('click', () => showDetail(ticket));
    row.addEventListener('dblclick', () => showDetail(ticket));
    assignedList.appendChild(row);
  });
}

function renderStateButtons(ticket) {
  stateGrid.innerHTML = '';
  selectedNextState = '';

  const currentIndex = Math.max(0, TICKET_ESTADOS.indexOf(ticket.estado));

  FORM_STATES.forEach((estado) => {
    const stateIndex = TICKET_ESTADOS.indexOf(estado);
    const isPastOrCurrent = stateIndex <= currentIndex;
    const isCurrent = ticket.estado === estado;
    const isNext = (ticket.siguientes_estados || []).includes(estado);
    
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `state-button${isCurrent ? ' current' : ''}${isNext ? ' next' : ''}`;
    
    // Le damos una clase especial a los botones del pasado
    if (isPastOrCurrent && !isCurrent) {
        button.classList.add('past');
    }

    button.textContent = ESTADO_LABELS[estado];
    // Se puede clickear si es el siguiente estado (para editar) o si es un estado pasado (para ver)
    button.disabled = !isNext && !isPastOrCurrent;

    if (isNext && !selectedNextState) {
      selectedNextState = estado;
      button.classList.add('selected');
      setUpdateFormMode('edit', ticket, estado);
    }

    button.addEventListener('click', () => {
      document.querySelectorAll('.state-button').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      
      if (isNext) {
        selectedNextState = estado;
        setUpdateFormMode('edit', ticket, estado);
      } else if (isPastOrCurrent) {
        selectedNextState = ''; // Es solo lectura, no permite guardar
        setUpdateFormMode('view', ticket, estado);
      }
    });

    stateGrid.appendChild(button);
  });
  
  // Si ya no hay estados siguientes (ej. Listo para retiro), mostramos el actual en modo lectura
  if (!selectedNextState && FORM_STATES.includes(ticket.estado)) {
      setUpdateFormMode('view', ticket, ticket.estado);
      const currentBtn = Array.from(stateGrid.children).find(b => b.textContent === ESTADO_LABELS[ticket.estado]);
      if (currentBtn) currentBtn.classList.add('selected');
  } else if (!selectedNextState) {
      setUpdateFormMode('edit', ticket, null); 
  }
}

function renderDetail(ticket) {
  document.getElementById('detail-code').textContent    = `Ticket #${ticketCode(ticket)}`;
  document.getElementById('equipment-name').textContent = productName(ticket);
  document.getElementById('equipment-serie').textContent = `Serie: ${ticket.numero_serie || '-'}`;
  document.getElementById('entry-date').textContent     = fmtFecha(ticket.fecha_ingreso);
  document.getElementById('assigned-tech').textContent  = ticket.tecnico_asignado || 'Jander Huamani';
  document.getElementById('customer-name').textContent  = ticket.cliente || '-';

  const chip = document.getElementById('warranty-chip');
  if (ticket.garantia === false || ticket.garantia === 'expirada') {
    chip.textContent = 'Sin Garantia / Expirado';
    chip.classList.add('expired');
  } else {
    chip.textContent = 'Con Garantia Activa';
    chip.classList.remove('expired');
  }

  const stateData = {};
  TICKET_ESTADOS.forEach((estado) => {
    const etapa = ticket.etapas?.[estado] || {};
    stateData[estado] = {
      observaciones: (etapa.observaciones || []).map((item) => item.texto || item).filter(Boolean).join('\n'),
      evidencias: etapa.evidencias || [],
    };
  });
  ticket._stateData = stateData;

  renderAssignedParts(ticket);
  renderStateButtons(ticket);
}

function populateHistoryTechnicians() {
  const select = document.getElementById('historial-tecnico');
  if (!select) return;
  const current = select.value;
  const technicians = [...new Set(tickets.map((ticket) => ticket.tecnico_asignado).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'es'));
  select.innerHTML = '<option value="">Todos los tecnicos</option>' +
    technicians.map((name) => `<option value="${name}">${name}</option>`).join('');
  if (technicians.includes(current)) select.value = current;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ HSPP88: Consulta de Repuestos Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
async function buscarRepuesto() {
  const query = repuestoQuery.value.trim();
  const categoria = repuestoCategoria.value;

  repuestoTbody.innerHTML = `<tr class="repuesto-empty-row"><td colspan="6">Buscando...</td></tr>`;

  try {
    const params = new URLSearchParams();
    if (query)     params.set('q', query);
    if (categoria) params.set('categoria', categoria);

    const data = await apiJson(`/api/repuestos?${params.toString()}`, {
      headers: authHeaders(),
    });

    const items = data.data || data.repuestos || [];
    repuestosEncontrados = items;

    if (!items.length) {
      repuestoTbody.innerHTML = `<tr class="repuesto-empty-row"><td colspan="6">No se encontraron repuestos con esos criterios.</td></tr>`;
      return;
    }

    repuestoTbody.innerHTML = items.map((item) => {
      const stockNum = item.stock ?? item.cantidad ?? 0;
      const disponible = stockNum > 0;
      const stockBadge = disponible
        ? `<span class="stock-badge disponible">${stockNum} unidades</span>`
        : `<span class="stock-badge agotado">0 unidades (Agotado)</span>`;
      const accionBtn = disponible
        ? `<button class="solicitar-btn" type="button" data-id="${item.codigo || item.id}">Solicitar</button>`
        : `<button class="reservar-btn" type="button" data-id="${item.id || item.codigo}">Reservar Pedido</button>`;
      const precio = item.precio ? `S/. ${Number(item.precio).toFixed(2)}` : '-';
      const eta = item.eta || (disponible ? 'Inmediato (Sede Central)' : '3 a 5 dias habiles');

      return `
        <tr>
          <td><strong>${item.codigo || item.id || '-'}</strong></td>
          <td>${item.descripcion || item.nombre || '-'}</td>
          <td>${stockBadge}</td>
          <td><strong>${precio}</strong></td>
          <td>${eta}</td>
          <td>${accionBtn}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    repuestoTbody.innerHTML =
      `<tr class="repuesto-empty-row"><td colspan="6">${err.message}</td></tr>`;
  }
}

async function solicitarRepuesto(codigo) {
  if (!selectedTicket) {
    showToast('Abre primero un ticket para asociar el repuesto.');
    showMain();
    return;
  }

  try {
    const data = await apiJson(`/api/tickets/${selectedTicket.id_ticket}/repuestos`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ codigo, cantidad: 1 }),
    });
    showToast(data.message || 'Repuesto agregado al ticket.');
    await loadTickets();
    const actualizado = tickets.find((ticket) => ticket.id_ticket === selectedTicket.id_ticket);
    if (actualizado) showDetail(actualizado);
  } catch (error) {
    showToast(error.message);
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬ HSPP89: Verificacion de Garantia Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
async function verificarGarantia() {
  const serial = garantiaSerial.value.trim();
  if (!serial) {
    garantiaSerial.focus();
    return;
  }

  garantiaResultado.hidden = true;
  garantiaBadgeBlock.textContent = 'Verificando...';

  try {
    const data = await apiJson(`/api/garantia/${encodeURIComponent(serial)}`, {
      headers: authHeaders(),
    });

    const garantia = data.data || data;
    renderGarantiaResult({
      ...garantia,
      equipo: garantia.producto,
      serie: garantia.numero_serie,
      detalles: [
        { label: 'Vencimiento', valor: fmtFecha(garantia.fecha_vencimiento) },
        { label: 'Cobertura', valor: garantia.cobertura || '-' },
        { label: 'Proveedor', valor: garantia.proveedor || '-' },
      ],
    });

  } catch (err) {
    garantiaResultado.hidden = false;
    garantiaBadgeBlock.textContent = err.message;
  }
}

function renderGarantiaResult(data) {
  garantiaResultado.hidden = false;

  garantiaEquipoNombre.textContent = data.equipo || data.producto || 'Equipo';
  garantiaSerieLbl.textContent     = `S/N: ${data.serie || data.numero_serie || '-'}`;

  // Determinar estado
  let estado = data.estado || 'vigente';
  if (data.vigente === false || estado === 'expirada' || estado === 'sin_garantia') {
    estado = 'expirada';
  } else if (estado === 'por_vencer' || estado === 'por-vencer') {
    estado = 'por-vencer';
  } else {
    estado = 'vigente';
  }

  const etiquetas = {
    vigente:    'CON GARANTIA VIGENTE',
    expirada:   'SIN GARANTIA / EXPIRADO',
    'por-vencer': 'GARANTIA POR VENCER',
  };

  garantiaCard.className      = `garantia-result-card ${estado}`;
  garantiaBadgeBlock.className = `garantia-badge-block ${estado}`;
  garantiaBadgeBlock.textContent = data.etiqueta || etiquetas[estado] || etiquetas.vigente;

  // Detalles
  const detalles = data.detalles || [];
  garantiaDetails.innerHTML = detalles.map((d) =>
    `<li class="${estado}"><strong>${d.label}:</strong> ${d.valor}</li>`
  ).join('');
}

async function buscarHistorial() {
  const serial = document.getElementById('historial-serial').value.trim();
  const technician = document.getElementById('historial-tecnico').value;
  const feedback = document.getElementById('historial-feedback');
  const list = document.getElementById('historial-list');
  if (!serial) {
    feedback.textContent = 'Ingrese un numero de serie.';
    feedback.hidden = false;
    return;
  }

  feedback.textContent = 'Consultando historial...';
  feedback.hidden = false;
  list.innerHTML = '';
  try {
    const data = await apiJson(`/api/tickets/historial/${encodeURIComponent(serial)}`, {
      headers: authHeaders(),
    });
    const state = document.getElementById('historial-state').value;
    const items = (data.data || []).filter((item) =>
      (!state || item.estado === state) &&
      (!technician || item.tecnico === technician)
    );
    feedback.textContent = items.length ? `${items.length} atencion(es) encontrada(s).` : 'No hay atenciones registradas.';
    list.innerHTML = items.map((item) => `
      <article class="history-card border-${item.estado}">
        <div><strong>Ticket #${ticketCode(item)}</strong><span>${productName(item)}</span></div>
        ${badge(item.estado)}
        <div><small>Ingreso</small><strong>${fmtFecha(item.fecha_ingreso)}</strong></div>
        <p>${item.descripcion_problema || item.observaciones_tecnicas || 'Sin detalle registrado.'}</p>
        <button class="row-action" type="button">Ver archivo</button>
      </article>
    `).join('');
  } catch (error) {
    feedback.textContent = error.message;
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬ LÃ³gica del Visor de ImÃ¡genes (Lightbox) Ã¢â€â‚¬Ã¢â€â‚¬
let galleryUrls = [];
let currentImgIndex = 0;

function openLightbox(urls, index) {
    galleryUrls = urls;
    currentImgIndex = index;
    document.getElementById('lightbox-img').src = galleryUrls[currentImgIndex];
    document.getElementById('lightbox').hidden = false;
}

document.getElementById('lightbox-close').addEventListener('click', () => {
    document.getElementById('lightbox').hidden = true;
});

document.getElementById('lightbox-prev').addEventListener('click', () => {
    currentImgIndex = (currentImgIndex - 1 + galleryUrls.length) % galleryUrls.length;
    document.getElementById('lightbox-img').src = galleryUrls[currentImgIndex];
});

document.getElementById('lightbox-next').addEventListener('click', () => {
    currentImgIndex = (currentImgIndex + 1) % galleryUrls.length;
    document.getElementById('lightbox-img').src = galleryUrls[currentImgIndex];
});

// Ã¢â€â‚¬Ã¢â€â‚¬ Carga inicial Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
async function loadTickets() {
  try {
    const data = await apiJson('/api/tickets/tecnico/mis-tickets', {
      headers: authHeaders(),
    });
    tickets = data.data || [];
    localStorage.setItem(ticketsCacheKey(), JSON.stringify(tickets));
  } catch (error) {
    const cached = JSON.parse(localStorage.getItem(ticketsCacheKey()) || '[]');
    if (!cached.length) throw error;
    tickets = cached;
    showToast('Mostrando la ultima informacion disponible sin conexion.');
  }

  populateHistoryTechnicians();
  showApp();
  showMain();
  renderTicketList();
  updateSyncStatus();
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Eventos Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.hidden = true;

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const data = await apiJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    token = data.token;
    if (parseToken(token).rol !== 'Tecnico') throw new Error('Este portal es exclusivo para usuarios con rol Tecnico.');
    sessionStorage.setItem('taller_token', token);
    await loadTickets();
  } catch (error) {
    showLogin(error.message);
  }
});

updateForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!selectedTicket || !selectedNextState) return;

  saveButton.disabled = true;
  clearMessage();

  const observaciones = document.getElementById('observations').value.trim();

  if (!navigator.onLine) {
    queueStateChange(selectedTicket, selectedNextState, observaciones);
    setMessage('Cambio guardado en este dispositivo. Se sincronizara cuando vuelva la conexion.', true);
    showToast('Cambio agregado a la cola offline.');
    renderTicketList();
    saveButton.disabled = false;
    return;
  }

  try {
    await apiJson(`/api/tickets/${selectedTicket.id_ticket}/estado`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        estado: selectedNextState,
        observaciones,
      }),
    });

    setMessage('Registro guardado correctamente. La notificacion se disparo en segundo plano.', true);
    showToast('Estado actualizado correctamente.');
    await loadTickets();
  } catch (error) {
    setMessage(error.message);
  } finally {
    saveButton.disabled = !selectedNextState;
  }
});

// Sidebar nav
navTickets.addEventListener('click', showMain);
navRepuestos.addEventListener('click', showRepuestosView);
navGarantia.addEventListener('click', showGarantiaView);
navHistorial.addEventListener('click', showHistorialView);
navConfig.addEventListener('click', showConfigView);

// HSPP88: boton dentro del detalle del ticket
document.getElementById('btn-repuesto-shortcut').addEventListener('click', showRepuestosView);

document.getElementById('back-to-list').addEventListener('click', showMain);

document.getElementById('logout-button').addEventListener('click', () => {
  token = '';
  sessionStorage.removeItem('taller_token');
  showLogin();
});

searchInput.addEventListener('input', renderTicketList);
stateFilter.addEventListener('change', renderTicketList);

// HSPP88 eventos
btnBuscarRepuesto.addEventListener('click', buscarRepuesto);
repuestoQuery.addEventListener('keydown', (e) => { if (e.key === 'Enter') buscarRepuesto(); });
repuestoTbody.addEventListener('click', (event) => {
  const button = event.target.closest('.solicitar-btn');
  if (!button) return;
  solicitarRepuesto(button.dataset.id);
});

// HSPP89 eventos
btnVerificarGarantia.addEventListener('click', verificarGarantia);
garantiaSerial.addEventListener('keydown', (e) => { if (e.key === 'Enter') verificarGarantia(); });
document.getElementById('btn-buscar-historial').addEventListener('click', buscarHistorial);
document.getElementById('historial-serial').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') buscarHistorial();
});
document.getElementById('config-form').addEventListener('submit', (event) => {
  event.preventDefault();
  preferences = {
    autoRefresh: document.getElementById('config-auto-refresh').checked,
    showDelivered: document.getElementById('config-show-delivered').checked,
    deviceName: document.getElementById('config-device-name').value.trim(),
    fontSize: document.querySelector('[name="font-size"]:checked')?.value || 'normal',
  };
  localStorage.setItem('taller_preferences', JSON.stringify(preferences));
  applyRefreshPreference();
  renderTicketList();
  const feedback = document.getElementById('config-feedback');
  feedback.textContent = 'Preferencias guardadas en este dispositivo.';
  feedback.hidden = false;
  showToast('Configuracion guardada.');
});
document.getElementById('clear-cache').addEventListener('click', async () => {
  localStorage.removeItem('taller_preferences');
  localStorage.removeItem(ticketsCacheKey());
  localStorage.removeItem(offlineQueueKey());
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith('hiraoka-taller-'))
      .map((name) => caches.delete(name)));
  }
  preferences = {};
  document.body.dataset.fontSize = 'normal';
  showConfigView();
  updateSyncStatus();
  showToast('Cache local y cambios pendientes eliminados.');
});
document.querySelectorAll('[name="font-size"]').forEach((option) => option.addEventListener('change', () => {
  document.body.dataset.fontSize = option.value;
}));
document.getElementById('historial-state').addEventListener('change', buscarHistorial);
document.getElementById('historial-tecnico').addEventListener('change', () => {
  if (document.getElementById('historial-serial').value.trim()) buscarHistorial();
});
document.getElementById('btn-exportar-historial').addEventListener('click', () => {
  const rows = [['Ticket', 'Equipo', 'Estado', 'Ingreso'], ...tickets.map((ticket) => [
    ticketCode(ticket), productName(ticket), ticket.estado, fmtFecha(ticket.fecha_ingreso),
  ])];
  const blob = new Blob([rows.map((row) => row.join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'historial-taller.csv';
  link.click();
  URL.revokeObjectURL(link.href);
});

document.getElementById('download-csv').addEventListener('click', () => {
  const rows = [
    ['Ticket', 'Cliente', 'Equipo', 'Tecnico', 'Ingreso', 'Estado'],
    ...visibleTickets().map((ticket) => [
      ticketCode(ticket),
      ticket.cliente || '',
      productName(ticket),
      ticket.tecnico_asignado || 'Jander Huamani',
      fmtFecha(ticket.fecha_ingreso),
      ESTADO_LABELS[ticket.estado] || ticket.estado,
    ]),
  ];
  const csv = rows.map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'hiraoka-servicios-activos.csv';
  link.click();
  URL.revokeObjectURL(url);
});

window.addEventListener('online', updateConnectionState);
window.addEventListener('offline', updateConnectionState);
updateConnectionState();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/taller/service-worker.js', { scope: '/taller/' })
      .catch((error) => console.error('No se pudo registrar el service worker:', error));
  });
}

if (token) {
  Promise.resolve().then(() => {
    if (parseToken(token).rol !== 'Tecnico') throw new Error('Rol invalido');
    return loadTickets();
  }).catch(() => {
    sessionStorage.removeItem('taller_token');
    token = '';
    showLogin('Sesion expirada. Inicia sesion nuevamente.');
  });
} else {
  showLogin();
 }

applyRefreshPreference();
document.body.dataset.fontSize = preferences.fontSize || 'normal';
