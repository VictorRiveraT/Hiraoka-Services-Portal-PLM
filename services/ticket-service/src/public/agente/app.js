// ── REFERENCIAS DOM ───────────────────────────────────────────────────────────
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

// ── ESTADO ────────────────────────────────────────────────────────────────────
let token = sessionStorage.getItem('agente_token') || '';

// ── HELPERS ───────────────────────────────────────────────────────────────────
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
  return new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
}

function val(id) { return document.getElementById(id).value.trim(); }
function setVal(id, v) { document.getElementById(id).value = v; }

function showFormError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}

function clearFormError() { formError.hidden = true; }

// ── LOGIN ─────────────────────────────────────────────────────────────────────
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

// ── BUSCAR CLIENTE POR DNI ────────────────────────────────────────────────────
document.getElementById('btn-buscar-cliente').addEventListener('click', async () => {
  const dni = val('dni');
  if (!/^\d{8}$/.test(dni)) {
    dniHint.style.color = '#CC0000';
    dniHint.textContent = 'El DNI debe tener 8 dígitos.';
    return;
  }
  try {
    const data = await apiJson(`/api/tickets/dni/${dni}`);
    const tickets = data.data || [];
    if (tickets.length > 0) {
      const ultimo = tickets[0];
      setVal('nombre',   ultimo.cliente || '');
      setVal('telefono', ultimo.telefono || '');
      setVal('email',    ultimo.email || '');
      dniHint.style.color = '#1B5E20';
      dniHint.textContent = `✓ Cliente encontrado: ${ultimo.cliente}`;
    } else {
      dniHint.style.color = '#E65100';
      dniHint.textContent = 'Cliente nuevo — complete los datos manualmente.';
    }
  } catch (_) {
    dniHint.style.color = '#E65100';
    dniHint.textContent = 'Cliente nuevo — complete los datos manualmente.';
  }
});

// ── CARGAR TECNICOS ───────────────────────────────────────────────────────────
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

// ── REGISTRAR EQUIPO ──────────────────────────────────────────────────────────
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

// ── REGISTRAR OTRO ────────────────────────────────────────────────────────────
document.getElementById('btn-nuevo').addEventListener('click', () => {
  registroForm.reset();
  dniHint.textContent = '';
  clearFormError();
  formSection.hidden   = false;
  confirmSection.hidden = true;
});

// ── IMPRIMIR ──────────────────────────────────────────────────────────────────
document.getElementById('btn-imprimir').addEventListener('click', () => {
  window.print();
});

// ── ARRANQUE ──────────────────────────────────────────────────────────────────
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
