const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const mainView = document.getElementById('main-view');
const detailView = document.getElementById('detail-view');
const assignedList = document.getElementById('assigned-list');
const stateGrid = document.getElementById('state-grid');
const updateForm = document.getElementById('update-form');
const saveButton = document.getElementById('save-button');
const panelMessage = document.getElementById('panel-message');
const searchInput = document.getElementById('search-input');
const stateFilter = document.getElementById('state-filter');

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

function fmtFecha(value) {
  if (!value) return 'Por confirmar';
  return new Date(value).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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
  if (!response.ok) {
    throw new Error(data.message || data.error || 'No se pudo completar la solicitud.');
  }
  return data;
}

function updateConnectionState() {
  const online = navigator.onLine;
  document.getElementById('sync-banner').hidden = online;
  document.getElementById('sync-pill').textContent = online ? 'Sincronizado' : 'Sin sincronizar';
}

function showLogin(message) {
  loginView.hidden = false;
  appView.hidden = true;
  if (message) {
    loginError.textContent = message;
    loginError.hidden = false;
  }
}

function showApp() {
  loginView.hidden = true;
  appView.hidden = false;
}

function showMain() {
  mainView.hidden = false;
  detailView.hidden = true;
  selectedNextState = '';
  clearMessage();
}

function showDetail(ticket) {
  selectedTicket = ticket;
  mainView.hidden = true;
  detailView.hidden = false;
  selectedNextState = '';
  renderDetail(ticket);
  clearMessage();
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

function visibleTickets() {
  const search = searchInput.value.trim().toLowerCase();
  const estado = stateFilter.value;
  return tickets.filter((ticket) => {
    const haystack = [
      ticketCode(ticket),
      ticket.cliente,
      productName(ticket),
      ticket.estado,
    ].join(' ').toLowerCase();
    return (!estado || ticket.estado === estado) && (!search || haystack.includes(search));
  });
}

function renderTicketList() {
  const filtered = visibleTickets();
  document.getElementById('assignment-count').textContent = `${filtered.length} orden${filtered.length === 1 ? '' : 'es'} activa${filtered.length === 1 ? '' : 's'}`;
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
    row.className = 'ticket-row';
    const action = ticket.estado === 'Recibido' ? 'Iniciar' : ticket.estado === 'Entregado' ? 'Servicio concluido' : 'Actualizar';
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
  document.getElementById('detail-code').textContent = `Ticket #${ticketCode(ticket)}`;
  document.getElementById('equipment-name').textContent = productName(ticket);
  document.getElementById('equipment-serie').textContent = `Serie: ${ticket.numero_serie || '-'}`;
  document.getElementById('entry-date').textContent = fmtFecha(ticket.fecha_ingreso);
  document.getElementById('assigned-tech').textContent = ticket.tecnico_asignado || 'Jander Huamani';
  document.getElementById('customer-name').textContent = ticket.cliente || '-';
  document.getElementById('observations').value = ticket.descripcion_problema || '';
  renderStateButtons(ticket);
}

async function loadTickets() {
  const data = await apiJson('/api/tickets/tecnico/mis-tickets', {
    headers: authHeaders(),
  });

  tickets = data.data || [];
  showApp();
  showMain();
  renderTicketList();
}

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
    await loadTickets();
  } catch (error) {
    setMessage(error.message);
  } finally {
    saveButton.disabled = !selectedNextState;
  }
});

document.getElementById('back-to-list').addEventListener('click', showMain);

document.getElementById('logout-button').addEventListener('click', () => {
  token = '';
  sessionStorage.removeItem('taller_token');
  showLogin();
});

searchInput.addEventListener('input', renderTicketList);
stateFilter.addEventListener('change', renderTicketList);

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
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
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
  loadTickets().catch(() => {
    sessionStorage.removeItem('taller_token');
    token = '';
    showLogin('Sesion expirada. Inicia sesion nuevamente.');
  });
} else {
  showLogin();
}
