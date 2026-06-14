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
let adminPreferences = JSON.parse(localStorage.getItem('admin_preferences') || '{}');
let dashboardTimer = null;

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
    // Si la API responde, actualizar valores dinamicamente
    const values = document.querySelectorAll('.kpi-value');
    values[0].textContent = `${(Number(data.tiempo_promedio_resolucion_horas || 0) / 24).toFixed(1)} dias`;
    values[1].textContent = data.satisfaccion_nps?.tasa_nps == null
      ? 'Sin respuestas'
      : `${Number(data.satisfaccion_nps.tasa_nps) >= 0 ? '+' : ''}${data.satisfaccion_nps.tasa_nps}`;
    values[3].textContent = data.tecnico_mas_tickets_cerrados?.tecnico || 'Sin datos';
  } catch (error) {
    document.querySelector('.page-heading p').textContent =
      `No se pudieron cargar las metricas: ${error.message}`;
  }
}

// ── GESTION DE USUARIOS (HSPP109) ─────────────────────────────────────────────
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
      rol: user.rol,
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
  pageInfo.textContent      = `Pag. ${usersPage}`;
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
        <td class="muted">${u.id}</td>
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

  // Eventos en filas de la tabla
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
        body: JSON.stringify({ rol: nuevoRol.trim() }),
      });
      user.rol = nuevoRol.trim();
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
    emptyHistorial.querySelector('p').textContent = 'No se encontro historial para el numero de serie ingresado.';
    return;
  }

  // Asset banner
  assetEquipo.textContent  = data.equipo   || data.producto || '-';
  assetSN.textContent      = data.serie    || serial;
  assetCliente.textContent = data.cliente  || '-';
  if (data.garantia === false) {
    assetGarantia.textContent = 'Sin Garantia / Expirado';
    assetGarantia.style.background = '#FFEBEE';
    assetGarantia.style.color      = '#CC0000';
    assetGarantia.style.borderColor= '#FFCDD2';
  } else {
    assetGarantia.textContent = 'Garantia de Fabrica: Activa';
    assetGarantia.style.background = '';
    assetGarantia.style.color      = '';
    assetGarantia.style.borderColor= '';
  }
  assetBanner.hidden = false;

  // Timeline
  const items = (data.intervenciones || data.tickets || []).map((item) => ({
    ...item,
    titulo: item.titulo || `Ticket ${item.codigo_ticket || item.id_ticket}`,
    fecha: item.fecha || fmtFecha(item.fecha_ingreso),
    descripcion: item.descripcion || item.descripcion_problema,
    estado_key: item.estado_key || String(item.estado || 'Recibido').toLowerCase(),
    meta: item.meta || [
      { label: 'Tecnico', valor: item.tecnico || 'Sin asignar' },
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
document.getElementById('nav-tickets').addEventListener('click', () => {
  window.location.href = '/'; // redirige al portal principal
});

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
  const password = prompt('Contrasena temporal (minimo 8 caracteres):');
  if (!password) return;
  const rol = prompt('Rol: Tecnico, Agente, Gerente o Administrador:', 'Tecnico');
  if (!rol) return;

  try {
    await apiJson('/api/usuarios', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ nombre_completo, username, password, rol }),
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
  message.textContent = 'Configuracion guardada en este navegador.';
  message.hidden = false;
});

// ── ARRANQUE ───────────────────────────────────────────────────────────────────
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.rol !== 'Administrador') throw new Error('Rol invalido');
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
