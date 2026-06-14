// ── Referencias DOM ──────────────────────────────────────────────────────────
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

// ── Estado ────────────────────────────────────────────────────────────────────
const ESTADO_LABELS = {
  Recibido: 'Recibido',
  Diagnosticando: 'En diagnostico',
  Reparando: 'En reparacion',
  Listo: 'Listo para retiro',
  Entregado: 'Entregado',
};

const FORM_STATES = ['Diagnosticando', 'Reparando', 'Listo'];

let token = sessionStorage.getItem('taller_token') || '';
let tickets = [];
let selectedTicket = null;
let selectedNextState = '';
let refreshTimer = null;
let preferences = JSON.parse(localStorage.getItem('taller_preferences') || '{}');

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function updateConnectionState() {
  const online = navigator.onLine;
  document.getElementById('sync-banner').hidden = online;
  document.getElementById('sync-pill').textContent = online ? 'Sincronizado' : 'Sin sincronizar';
}

// ── Navegacion entre vistas ───────────────────────────────────────────────────
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

// ── Tickets: lista y detalle ──────────────────────────────────────────────────
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

  FORM_STATES.forEach((estado) => {
    const isCurrent = ticket.estado === estado;
    const isNext = (ticket.siguientes_estados || []).includes(estado);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `state-button${isCurrent ? ' current' : ''}${isNext ? ' next' : ''}`;
    button.textContent = ESTADO_LABELS[estado];
    button.disabled = !isNext;

    if (isNext && !selectedNextState) {
      selectedNextState = estado;
      button.classList.add('selected');
    }

    button.addEventListener('click', () => {
      selectedNextState = estado;
      document.querySelectorAll('.state-button').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      saveButton.disabled = false;
      clearMessage();
    });

    stateGrid.appendChild(button);
  });

  saveButton.disabled = !selectedNextState;
}

function renderDetail(ticket) {
  document.getElementById('detail-code').textContent    = `Ticket #${ticketCode(ticket)}`;
  document.getElementById('equipment-name').textContent = productName(ticket);
  document.getElementById('equipment-serie').textContent = `Serie: ${ticket.numero_serie || '-'}`;
  document.getElementById('entry-date').textContent     = fmtFecha(ticket.fecha_ingreso);
  document.getElementById('assigned-tech').textContent  = ticket.tecnico_asignado || 'Jander Huamani';
  document.getElementById('customer-name').textContent  = ticket.cliente || '-';
  document.getElementById('observations').value         = ticket.observaciones_tecnicas || '';

  // HSPP89: chip de garantia dinamico en el detalle
  const chip = document.getElementById('warranty-chip');
  if (ticket.garantia === false || ticket.garantia === 'expirada') {
    chip.textContent = 'Sin Garantia / Expirado';
    chip.classList.add('expired');
  } else {
    chip.textContent = 'Con Garantia Activa';
    chip.classList.remove('expired');
  }

  renderStateButtons(ticket);
}

// ── HSPP88: Consulta de Repuestos ─────────────────────────────────────────────
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
        ? `<button class="solicitar-btn" type="button" data-id="${item.id || item.codigo}">Solicitar</button>`
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

// ── HSPP89: Verificacion de Garantia ─────────────────────────────────────────
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
    const items = (data.data || []).filter((item) => !state || item.estado === state);
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

// ── Carga inicial ─────────────────────────────────────────────────────────────
async function loadTickets() {
  const data = await apiJson('/api/tickets/tecnico/mis-tickets', {
    headers: authHeaders(),
  });

  tickets = data.data || [];
  showApp();
  showMain();
  renderTicketList();
}

// ── Eventos ───────────────────────────────────────────────────────────────────
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

  try {
    await apiJson(`/api/tickets/${selectedTicket.id_ticket}/estado`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        estado: selectedNextState,
        observaciones: document.getElementById('observations').value.trim(),
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
document.getElementById('clear-cache').addEventListener('click', () => {
  localStorage.removeItem('taller_preferences');
  preferences = {};
  document.body.dataset.fontSize = 'normal';
  showConfigView();
  showToast('Cache temporal limpiada.');
});
document.querySelectorAll('[name="font-size"]').forEach((option) => option.addEventListener('change', () => {
  document.body.dataset.fontSize = option.value;
}));
document.getElementById('historial-state').addEventListener('change', buscarHistorial);
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
