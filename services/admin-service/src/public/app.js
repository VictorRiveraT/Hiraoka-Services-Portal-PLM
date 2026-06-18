// ── REFERENCIAS DOM ────────────────────────────────────────────────────────────
const loginView   = document.getElementById('login-view');
const loginForm   = document.getElementById('login-form');
const loginError  = document.getElementById('login-error');
const appView     = document.getElementById('app-view');
const roleLabel   = document.getElementById('role-label');

// Vistas
const viewDashboard = document.getElementById('view-dashboard');
const viewUsuarios  = document.getElementById('view-usuarios');
const viewHistorial = document.getElementById('view-historial');
const viewConfig    = document.getElementById('view-config');

// Nav
const navDashboard = document.getElementById('nav-dashboard');
const navUsuarios  = document.getElementById('nav-usuarios');
const navHistorial = document.getElementById('nav-historial');
const navConfig    = document.getElementById('nav-config');

// Usuarios
const userSearch    = document.getElementById('user-search');
const filterRol     = document.getElementById('filter-rol');
const filterEstado  = document.getElementById('filter-estado');
const usersTbody    = document.getElementById('users-tbody');
const usersCountLbl = document.getElementById('users-count-label');
const pagePrev      = document.getElementById('page-prev');
const pageNext      = document.getElementById('page-next');
const pageInfo      = document.getElementById('page-info');

// Historial
const historialSerial  = document.getElementById('historial-serial');
const btnHistorialBuscar = document.getElementById('btn-historial-buscar');
const assetBanner      = document.getElementById('asset-banner');
const assetEquipo      = document.getElementById('asset-equipo');
const assetSN          = document.getElementById('asset-sn');
const assetCliente     = document.getElementById('asset-cliente');
const assetGarantia    = document.getElementById('asset-garantia');
const timelineSection  = document.getElementById('timeline-section');
const timelineList     = document.getElementById('timeline-list');
const emptyHistorial   = document.getElementById('empty-historial');

// ── ESTADO ─────────────────────────────────────────────────────────────────────
let token = sessionStorage.getItem('admin_token') || '';
let allUsers = [];
let usersPage = 1;
const PAGE_SIZE = 10;
const ROLE_LABELS = {
  Tecnico: 'Técnico Taller',
  Agente: 'Agente Call Center',
  Gerente: 'Gerente',
  Administrador: 'Administrador',
};
const ROLE_VALUES = Object.fromEntries(Object.entries(ROLE_LABELS).map(([value, label]) => [label, value]));
let adminPreferences = JSON.parse(localStorage.getItem('admin_preferences') || '{}');
let dashboardTimer = null;
let lastDashboardData = null;

// Estado de Notificaciones Inteligentes
let currentNotifications = [];

// DOM Notificaciones
const notifBtn   = document.getElementById('notif-btn');
const notifPanel = document.getElementById('notif-panel');
const notifDot   = document.getElementById('notif-dot');
const notifList  = document.getElementById('notif-list');
const notifCount = document.getElementById('notif-count');

// ── HELPERS ────────────────────────────────────────────────────────────────────
async function apiJson(url, options = {}) {
  const resp = await fetch(url, options);
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.message || data.error || 'Error en la solicitud');
  return data;
}

function authHeaders() {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function fmtFecha(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── NAVEGACION ──────────────────────────────────────────────────────────────────
function setActiveNav(btn) {
  [navDashboard, navUsuarios, navHistorial, navConfig].forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function hideAllViews() {
  viewDashboard.hidden = true;
  viewUsuarios.hidden  = true;
  viewHistorial.hidden = true;
  viewConfig.hidden = true;
}

function showLogin(msg) {
  loginView.hidden = false;
  appView.hidden   = true;
  if (msg) { loginError.textContent = msg; loginError.hidden = false; }
}

function showApp() {
  loginView.hidden = true;
  appView.hidden   = false;
}

function showDashboard() {
  hideAllViews();
  viewDashboard.hidden = false;
  setActiveNav(navDashboard);
  loadDashboard();
}

function showUsuarios() {
  hideAllViews();
  viewUsuarios.hidden = false;
  setActiveNav(navUsuarios);
  loadUsuarios();
}

function showHistorial() {
  hideAllViews();
  viewHistorial.hidden = false;
  setActiveNav(navHistorial);
}

// ── DASHBOARD KPI (HSPP108) ────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const response = await apiJson('/api/dashboard/metricas', { headers: authHeaders() });
    const data = response.data || {};
    lastDashboardData = data;
    
    const values = document.querySelectorAll('.kpi-value');
    const subs = document.querySelectorAll('.kpi-sub');
    const ticketsPorEstado = data.tickets_por_estado || [];
    const ticketsActivos = ticketsPorEstado
      .filter((row) => row.estado !== 'Entregado')
      .reduce((sum, row) => sum + Number(row.total || 0), 0);
    values[0].textContent = `${(Number(data.tiempo_promedio_resolucion_horas || 0) / 24).toFixed(1)} días`;
    values[1].textContent = data.satisfaccion_nps?.tasa_nps == null
      ? 'Sin respuestas'
      : `${Number(data.satisfaccion_nps.tasa_nps) >= 0 ? '+' : ''}${data.satisfaccion_nps.tasa_nps}`;
    values[2].textContent = String(ticketsActivos);
    values[3].textContent = data.tecnico_mas_tickets_cerrados?.tecnico || 'Sin datos';
    subs[1].textContent = data.satisfaccion_nps?.total_respuestas
      ? `${data.satisfaccion_nps.total_respuestas} respuesta${Number(data.satisfaccion_nps.total_respuestas) === 1 ? '' : 's'} registrada${Number(data.satisfaccion_nps.total_respuestas) === 1 ? '' : 's'}`
      : 'Sin respuestas NPS registradas';
    subs[2].textContent = `${ticketsActivos} ticket${ticketsActivos === 1 ? '' : 's'} sin entregar`;
    subs[3].textContent = data.tecnico_mas_tickets_cerrados?.tickets_cerrados
      ? `${data.tecnico_mas_tickets_cerrados.tickets_cerrados} ticket${Number(data.tecnico_mas_tickets_cerrados.tickets_cerrados) === 1 ? '' : 's'} cerrado${Number(data.tecnico_mas_tickets_cerrados.tickets_cerrados) === 1 ? '' : 's'} en el periodo`
      : 'Sin tickets cerrados en el periodo';
    
    renderEstadoDashboard(ticketsPorEstado);
    renderEficienciaRepuestos(data.eficiencia_repuestos || {});
    syncNotifications(data);
  } catch (error) {
    document.querySelector('.page-heading p').textContent =
      `No se pudieron cargar las métricas: ${error.message}`;
    renderNotifUI(error.message);
  }
}

function renderEstadoDashboard(rows) {
  const labels = {
    Listo: 'Listo para retiro',
    Reparando: 'En reparación',
    Diagnosticando: 'En diagnóstico',
    Recibido: 'Recibido',
    Entregado: 'Entregado',
  };
  const classes = {
    Listo: 'listo',
    Reparando: 'reparando',
    Diagnosticando: 'diagnosticando',
    Recibido: 'diagnosticando',
    Entregado: 'listo',
  };
  const activeRows = rows
    .filter((row) => row.estado !== 'Entregado')
    .sort((a, b) => Number(b.total || 0) - Number(a.total || 0));
  const total = activeRows.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const barList = document.querySelector('.bar-list');
  if (!barList) return;
  if (!activeRows.length || total === 0) {
    barList.innerHTML = '<p class="muted">No hay tickets activos registrados.</p>';
    return;
  }
  barList.innerHTML = activeRows.map((row) => {
    const percent = Math.round((Number(row.total || 0) / total) * 100);
    const cls = classes[row.estado] || 'diagnosticando';
    return `
      <div class="bar-item">
        <div class="bar-header">
          <span>${labels[row.estado] || row.estado}</span>
          <strong class="bar-percent percent-${cls}">${percent}%</strong>
        </div>
        <div class="bar-track">
          <div class="bar-fill ${cls}" style="width:${percent}%"></div>
        </div>
        <small class="muted">${row.total} ticket${Number(row.total) === 1 ? '' : 's'} en este estado</small>
      </div>
    `;
  }).join('');
}

function renderEficienciaRepuestos(data) {
  const hasData = data.porcentaje_stock != null;
  const percent = hasData ? Number(data.porcentaje_stock) : 0;
  const special = Math.max(0, 100 - percent);
  const circumference = 2 * Math.PI * 76;
  const stockDash = hasData ? (circumference * percent) / 100 : 0;
  const specialDash = hasData ? circumference - stockDash : 0;

  document.getElementById('donut-percent').textContent =
    hasData ? `${percent}%` : 'S/D';
  document.getElementById('donut-label').textContent =
    hasData ? 'Eficiencia' : 'Sin datos';
  document.getElementById('donut-stock').setAttribute('stroke-dasharray', `${stockDash} ${circumference - stockDash}`);
  document.getElementById('donut-special').setAttribute('stroke-dasharray', `${specialDash} ${circumference - specialDash}`);
  document.getElementById('donut-special').setAttribute('stroke-dashoffset', String(-stockDash));
  document.getElementById('legend-stock-label').textContent =
    `Repuestos en stock (${hasData ? `${percent}%` : 'sin datos'})`;
  document.getElementById('legend-special-label').textContent =
    `Pedidos especiales (${hasData ? `${special}%` : 'sin datos'})`;
}

// ── Lógica del ojito para la contraseña ──
const togglePwd = document.getElementById('toggle-pwd');
const pwdInput = document.getElementById('password');

if (togglePwd && pwdInput) {
  togglePwd.addEventListener('click', () => {
    const isText = pwdInput.type === 'text';
    
    // Cambiamos el tipo de input
    pwdInput.type = isText ? 'password' : 'text';
    
    // Cambiamos el ícono SVG
    togglePwd.innerHTML = isText 
      ? `<svg viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>` 
      : `<svg viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`;
  });
}

// ── NOTIFICACIONES INTELIGENTES ────────────────────────────────────────────────
const NOTIF_ICONS = {
  warning: '<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5M12 17h.01"/>',
  danger:  '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  info:    '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
};

function buildNotifications(data) {
  const items = [];
  const porEstado = {};
  (data?.tickets_por_estado || []).forEach(r => { porEstado[r.estado] = r.total; });

  if (porEstado['Listo']) {
    items.push({
      id: 'n-listo',
      severity: 'success',
      title: `${porEstado['Listo']} equipo${porEstado['Listo'] === 1 ? '' : 's'} listo${porEstado['Listo'] === 1 ? '' : 's'} para retiro`,
      detail: 'Clientes pendientes de recoger su equipo en tienda.',
      targetView: 'dashboard'
    });
  }

  if (porEstado['Reparando']) {
    items.push({
      id: 'n-reparando',
      severity: 'info',
      title: `${porEstado['Reparando']} ticket${porEstado['Reparando'] === 1 ? '' : 's'} en reparación`,
      detail: 'Equipos actualmente en proceso en el taller.',
      targetView: 'dashboard'
    });
  }

  const nps = data?.satisfaccion_nps;
  if (nps?.tasa_nps != null && Number(nps.tasa_nps) < 0) {
    items.push({
      id: 'n-nps',
      severity: 'danger',
      title: `Tasa NPS en ${nps.tasa_nps}`,
      detail: `${nps.detractores || 0} detractor(es) registrados. Revisa los comentarios.`,
      targetView: 'dashboard'
    });
  }

  const horas = Number(data?.tiempo_promedio_resolucion_horas || 0);
  if (horas > 0 && horas / 24 > 5) {
    items.push({
      id: 'n-tiempo',
      severity: 'warning',
      title: `Tiempo promedio de resolución: ${(horas / 24).toFixed(1)} días`,
      detail: 'Por encima del objetivo de 5 días. Revisa la carga del taller.',
      targetView: 'dashboard'
    });
  }

  return items;
}

function syncNotifications(data) {
  const newItems = buildNotifications(data);
  
  // Mantener estado de lectura de notificaciones previas
  newItems.forEach(newItem => {
    const existing = currentNotifications.find(n => n.id === newItem.id);
    newItem.read = existing ? existing.read : false;
  });

  currentNotifications = newItems;
  renderNotifUI();
}

function markAsReadAndNavigate(id, targetView) {
  const notif = currentNotifications.find(n => n.id === id);
  if (notif) notif.read = true;
  
  notifPanel.hidden = true;
  notifBtn.setAttribute('aria-expanded', 'false');
  renderNotifUI();

  if (targetView === 'dashboard') showDashboard();
}

function deleteNotification(e, id) {
  e.stopPropagation(); // Evitar que el clic abra la notificacion
  currentNotifications = currentNotifications.filter(n => n.id !== id);
  renderNotifUI();
}

function renderNotifUI(errorMsg) {
  notifList.innerHTML = '';

  if (errorMsg) {
    notifList.innerHTML = `<li class="notif-empty">No se pudieron cargar las alertas.</li>`;
    notifCount.textContent = '0 nuevas';
    notifDot.hidden = true;
    return;
  }

  if (currentNotifications.length === 0) {
    notifList.innerHTML = `<li class="notif-empty">No hay alertas por el momento.</li>`;
    notifCount.textContent = '0 nuevas';
    notifDot.hidden = true;
    return;
  }

  const unreadCount = currentNotifications.filter(n => !n.read).length;
  notifCount.textContent = `${unreadCount} nueva${unreadCount === 1 ? '' : 's'}`;
  notifDot.hidden = unreadCount === 0;

  currentNotifications.forEach(item => {
    const li = document.createElement('li');
    li.className = `notif-item severity-${item.severity} ${item.read ? 'read' : 'unread'}`;
    
    li.innerHTML = `
      <span class="notif-icon"><svg viewBox="0 0 24 24">${NOTIF_ICONS[item.severity] || NOTIF_ICONS.info}</svg></span>
      <div class="notif-text">
        <strong>${item.title}</strong>
        <span>${item.detail}</span>
      </div>
      <button class="notif-delete" title="Descartar alerta">
        <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    `;
    
    // Clic en toda la notificacion
    li.addEventListener('click', () => markAsReadAndNavigate(item.id, item.targetView));
    
    // Clic en la "X" para borrar
    li.querySelector('.notif-delete').addEventListener('click', (e) => deleteNotification(e, item.id));

    notifList.appendChild(li);
  });
}

notifBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isHidden = notifPanel.hidden;
  notifPanel.hidden = !isHidden;
  notifBtn.setAttribute('aria-expanded', String(isHidden));
});

document.addEventListener('click', (e) => {
  if (!notifPanel.hidden && !notifPanel.contains(e.target) && e.target !== notifBtn && !notifBtn.contains(e.target)) {
    notifPanel.hidden = true;
    notifBtn.setAttribute('aria-expanded', 'false');
  }
});

// ── USUARIOS ──────────────────────────────────────────────────────────────────
const ROL_CLASES = {
  'Técnico Taller':    'role-tecnico',
  'Agente Call Center':'role-agente',
  'Técnico Externo':   'role-externo',
  'Gerente':           'role-gerente',
  'Administrador':     'role-admin',
};

async function loadUsuarios() {
  try {
    const data = await apiJson('/api/usuarios', { headers: authHeaders() });
    allUsers = (data.data || []).map((user) => ({
      id: user.id_usuario,
      nombre: user.nombre_completo,
      correo: user.username,
      rol: ROLE_LABELS[user.rol] || user.rol,
      estado: user.activo ? 'Activo' : 'Inactivo',
      ultimo_acceso: fmtFecha(user.fecha_creacion),
    }));
  } catch (error) {
    allUsers = [];
    usersCountLbl.textContent = `No se pudieron cargar usuarios: ${error.message}`;
  }
  usersPage = 1;
  renderUsuarios();
}

function filteredUsers() {
  const q      = (userSearch.value || '').toLowerCase();
  const rol    = filterRol.value;
  const estado = filterEstado.value;
  return allUsers.filter(u => {
    const match = (!q    || (u.nombre + ' ' + u.correo).toLowerCase().includes(q));
    const mRol  = (!rol  || u.rol === rol);
    const mEst  = (!estado || u.estado === estado);
    return match && mRol && mEst;
  });
}

function renderUsuarios() {
  const users = filteredUsers();
  const total = users.length;
  const start = (usersPage - 1) * PAGE_SIZE;
  const page  = users.slice(start, start + PAGE_SIZE);

  usersCountLbl.textContent = `Mostrando ${start + 1}–${Math.min(start + page.length, total)} de ${total} usuarios`;
  pageInfo.textContent      = `Pág. ${usersPage}`;
  pagePrev.disabled         = usersPage <= 1;
  pageNext.disabled         = start + PAGE_SIZE >= total;

  usersTbody.innerHTML = page.map(u => {
    const rolClass  = ROL_CLASES[u.rol] || 'role-admin';
    const estClass  = u.estado === 'Activo' ? 'status-activo' : 'status-inactivo';
    const accionBtn = u.estado === 'Activo'
      ? `<button class="action-link deactivate" data-id="${u.id}" data-action="desactivar">Desactivar Cuenta</button>`
      : `<button class="action-link activate"   data-id="${u.id}" data-action="activar">Activar Cuenta</button>`;
    return `
      <tr>
        <td class="muted" title="${u.id}">${u.id}</td>
        <td><strong>${u.nombre}</strong></td>
        <td class="muted">${u.correo}</td>
        <td><span class="role-badge ${rolClass}">${u.rol}</span></td>
        <td><span class="status-badge ${estClass}">${u.estado}</span></td>
        <td class="muted">${u.ultimo_acceso || '-'}</td>
        <td>
          <div class="actions-cell">
            <button class="action-link edit" data-id="${u.id}" data-action="editar">Editar Rol</button>
            <span class="action-sep">|</span>
            ${accionBtn}
          </div>
        </td>
      </tr>`;
  }).join('');

  usersTbody.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => handleUserAction(btn.dataset.id, btn.dataset.action));
  });
}

async function handleUserAction(id, action) {
  if (action === 'editar') {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;
    const nuevoRol = prompt(`Rol actual: "${user.rol}"\nIngrese el nuevo rol:`, user.rol);
    if (!nuevoRol || nuevoRol.trim() === user.rol) return;
    try {
      await apiJson(`/api/usuarios/${id}/rol`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ rol: ROLE_VALUES[nuevoRol.trim()] || nuevoRol.trim() }),
      });
      user.rol = ROLE_LABELS[ROLE_VALUES[nuevoRol.trim()] || nuevoRol.trim()] || nuevoRol.trim();
    } catch (error) {
      alert(error.message);
      return;
    }
    renderUsuarios();
    return;
  }

  const nuevoEstado = action === 'activar' ? 'Activo' : 'Inactivo';
  const user = allUsers.find(u => u.id === id);
  if (!user) return;
  try {
    await apiJson(`/api/usuarios/${id}/estado`, {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({ activo: nuevoEstado === 'Activo' }),
    });
  } catch (error) {
    alert(error.message);
    return;
  }
  user.estado = nuevoEstado;
  renderUsuarios();
}

// ── HISTORIAL DE PRODUCTO (HSPP110) ───────────────────────────────────────────
const TIMELINE_ICONS = {
  CheckCircle: `<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  Wrench:      `<svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  Package:     `<svg viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
};

async function buscarHistorial() {
  const serial = historialSerial.value.trim();
  if (!serial) { historialSerial.focus(); return; }

  assetBanner.hidden    = true;
  timelineSection.hidden = true;
  emptyHistorial.hidden  = true;

  let data = null;
  try {
    const response = await apiJson(`/api/tickets/historial/${encodeURIComponent(serial)}`, { headers: authHeaders() });
    const tickets = response.data || [];
    const first = tickets[0] || {};
    data = {
      equipo: [first.producto, first.marca, first.modelo].filter(Boolean).join(' '),
      serie: response.numero_serie,
      cliente: first.cliente,
      tickets,
    };
  } catch (error) {
    emptyHistorial.hidden = false;
    emptyHistorial.querySelector('p').textContent = error.message;
    return;
  }

  if (!data || (!data.intervenciones && !data.tickets)) {
    emptyHistorial.hidden = false;
    emptyHistorial.querySelector('p').textContent = 'No se encontró historial para el número de serie ingresado.';
    return;
  }

  assetEquipo.textContent  = data.equipo   || data.producto || '-';
  assetSN.textContent      = data.serie    || serial;
  assetCliente.textContent = data.cliente  || '-';
  if (data.garantia === false) {
    assetGarantia.textContent = 'Sin Garantía / Expirado';
    assetGarantia.style.background = '#FFEBEE';
    assetGarantia.style.color      = '#CC0000';
    assetGarantia.style.borderColor= '#FFCDD2';
  } else {
    assetGarantia.textContent = 'Garantía de Fábrica: Activa';
    assetGarantia.style.background = '';
    assetGarantia.style.color      = '';
    assetGarantia.style.borderColor= '';
  }
  assetBanner.hidden = false;

  const items = (data.intervenciones || data.tickets || []).map((item) => ({
    ...item,
    titulo: item.titulo || `Ticket ${item.codigo_ticket || item.id_ticket}`,
    fecha: item.fecha || fmtFecha(item.fecha_ingreso),
    descripcion: item.descripcion || item.descripcion_problema,
    estado_key: item.estado_key || String(item.estado || 'Recibido').toLowerCase(),
    meta: item.meta || [
      { label: 'Técnico', valor: item.tecnico || 'Sin asignar' },
      { label: 'Repuestos', valor: item.repuestos_usados?.length || 0 },
    ],
  }));
  timelineList.innerHTML = items.map(item => {
    const key  = item.estado_key || 'recibido';
    const meta = (item.meta || []).map(m =>
      `<span><strong>${m.label}:</strong> ${m.valor}</span>`
    ).join('');
    return `
      <div class="timeline-node">
        <div class="timeline-icon icon-${key}">${TIMELINE_ICONS[item.icon] || TIMELINE_ICONS.Package}</div>
        <div class="timeline-card border-${key}">
          <div class="timeline-card-top">
            <h3>${item.titulo}</h3>
            <span class="timeline-date">${item.fecha}</span>
          </div>
          <p class="timeline-desc">${item.descripcion}</p>
          <div class="timeline-footer">
            <div class="timeline-meta">${meta}</div>
            <span class="state-chip chip-${key}">Estado: ${item.estado}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  timelineSection.hidden = false;
}

// ── LOGIN ───────────────────────────────────────────────────────────────────────
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.hidden = true;
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  try {
    const data = await apiJson('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    token = data.token;
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.rol !== 'Administrador') throw new Error('Este portal es exclusivo para Administradores.');
    sessionStorage.setItem('admin_token', token);
    roleLabel.textContent = `Rol: ${payload.rol || 'Administrador'}`;
    showApp();
    showDashboard();
  } catch (err) {
    loginError.textContent = err.message;
    loginError.hidden = false;
  }
});

// ── EVENTOS DE NAVEGACION ──────────────────────────────────────────────────────
navDashboard.addEventListener('click', showDashboard);
navUsuarios.addEventListener('click', showUsuarios);
navHistorial.addEventListener('click', showHistorial);
navConfig.addEventListener('click', showConfig);

document.getElementById('logout-btn').addEventListener('click', () => {
  token = '';
  sessionStorage.removeItem('admin_token');
  allUsers = [];
  showLogin();
});

// ── FILTROS DE USUARIOS ────────────────────────────────────────────────────────
userSearch.addEventListener('input',   () => { usersPage = 1; renderUsuarios(); });
filterRol.addEventListener('change',   () => { usersPage = 1; renderUsuarios(); });
filterEstado.addEventListener('change',() => { usersPage = 1; renderUsuarios(); });
pagePrev.addEventListener('click', () => { usersPage--; renderUsuarios(); });
pageNext.addEventListener('click', () => { usersPage++; renderUsuarios(); });

document.getElementById('btn-crear-usuario').addEventListener('click', async () => {
  const nombre_completo = prompt('Nombre completo del nuevo usuario:');
  if (!nombre_completo) return;
  const username = prompt('Nombre de usuario:');
  if (!username) return;
  const password = prompt('Contraseña temporal (mínimo 8 caracteres):');
  if (!password) return;
  const rol = prompt('Rol: Técnico Taller, Agente Call Center, Gerente o Administrador:', 'Técnico Taller');
  if (!rol) return;

  try {
    await apiJson('/api/usuarios', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ nombre_completo, username, password, rol: ROLE_VALUES[rol] || rol }),
    });
    await loadUsuarios();
  } catch (error) {
    alert(error.message);
  }
});

// ── HISTORIAL ──────────────────────────────────────────────────────────────────
btnHistorialBuscar.addEventListener('click', buscarHistorial);
historialSerial.addEventListener('keydown', e => { if (e.key === 'Enter') buscarHistorial(); });
document.getElementById('admin-config-form').addEventListener('submit', (event) => {
  event.preventDefault();
  adminPreferences = {
    autoRefresh: document.getElementById('admin-auto-refresh').checked,
    alerts: document.getElementById('admin-alerts').checked,
    publicGuide: document.getElementById('admin-public-guide').checked,
    fontSize: document.getElementById('admin-font-size').value,
  };
  localStorage.setItem('admin_preferences', JSON.stringify(adminPreferences));
  localStorage.setItem('hiraoka_public_guide_enabled', String(adminPreferences.publicGuide));
  applyAdminPreferences();
  const message = document.getElementById('admin-config-message');
  message.textContent = 'Configuración guardada en este navegador.';
  message.hidden = false;
});

// ── ARRANQUE ───────────────────────────────────────────────────────────────────
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.rol !== 'Administrador') throw new Error('Rol inválido');
    roleLabel.textContent = `Rol: ${payload.rol || 'Administrador'}`;
    showApp();
    showDashboard();
  } catch (_) {
    sessionStorage.removeItem('admin_token');
    token = '';
    showLogin();
  }
} else {
  showLogin();
}
applyAdminPreferences();

function applyAdminPreferences() {
  document.body.dataset.fontSize = adminPreferences.fontSize || 'normal';
  window.clearInterval(dashboardTimer);
  dashboardTimer = adminPreferences.autoRefresh ? window.setInterval(loadDashboard, 60000) : null;
}

function showConfig() {
  hideAllViews();
  viewConfig.hidden = false;
  setActiveNav(navConfig);
  document.getElementById('admin-auto-refresh').checked = Boolean(adminPreferences.autoRefresh);
  document.getElementById('admin-alerts').checked = adminPreferences.alerts !== false;
  document.getElementById('admin-public-guide').checked = adminPreferences.publicGuide !== false;
  document.getElementById('admin-font-size').value = adminPreferences.fontSize || 'normal';
 }
