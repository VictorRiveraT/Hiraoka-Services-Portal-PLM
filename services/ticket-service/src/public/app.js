const ESTADOS = ['Recibido', 'Diagnosticando', 'Reparando', 'Listo', 'Entregado'];

const ESTADO_LABELS = {
  Recibido: 'Recibido',
  Diagnosticando: 'En diagnostico',
  Reparando: 'En reparacion',
  Listo: 'Listo para retiro',
  Entregado: 'Entregado',
};

const ESTADO_COPY = {
  Recibido: {
    title: 'Equipo Recibido',
    card: 'Su equipo ingreso con exito a nuestros almacenes de Lima. Se ha documentado el estado fisico inicial y esta programado para ingresar a mesa de trabajo.',
    detail: 'Registrado en tienda de manera exitosa. Estado fisico inicial documentado detalladamente por nuestro equipo de atencion.',
  },
  Diagnosticando: {
    title: 'Revision Tecnica (Diagnostico)',
    card: 'Un especialista esta revisando los componentes internos de su equipo para identificar la causa exacta de la falla y verificar la cobertura de su garantia.',
    detail: 'El tecnico especializado reviso el equipo. Se validan componentes, garantia y condicion fisica antes de iniciar una reparacion.',
  },
  Reparando: {
    title: 'Reparacion en Proceso',
    card: 'El diagnostico fue aprobado. Nos encontramos instalando los repuestos originales autorizados de fabrica para garantizar la operatividad de su dispositivo.',
    detail: 'Instalando repuestos originales autorizados por la marca. Se estan realizando pruebas de hermeticidad y carga rapida.',
  },
  Listo: {
    title: 'Listo para Retiro',
    card: 'Buenas noticias. Su equipo supero con exito todas las pruebas de control de calidad y ya puede acercarse a la sede elegida para recogerlo.',
    detail: 'Reparacion solucionada con exito. Recuerde traer su DNI fisico y el numero de ticket para la entrega.',
  },
  Entregado: {
    title: 'Equipo Entregado',
    card: 'La orden de servicio ha sido cerrada y el equipo fue entregado conforme al titular. Agradecemos su confianza en el soporte post-venta.',
    detail: 'Servicio concluido y equipo entregado conforme al titular.',
  },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TICKET_CODE_RE = /^TK-\d{4}-\d{3,}$/i;
const DNI_RE = /^\d{8}$/;

let currentDni = '';
let currentNpsTicket = '';
let selectedNpsScore = 0;

function $(id) {
  return document.getElementById(id);
}

function ticketCode(ticket) {
  return ticket.codigo_ticket || String(ticket.id_ticket || '').slice(0, 8).toUpperCase();
}

function productName(ticket) {
  return [ticket.producto, ticket.marca, ticket.modelo].filter(Boolean).join(' ') || 'Equipo registrado';
}

function fmtFecha(value) {
  if (!value) return 'Por confirmar';
  return new Date(value).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function maskDni(dni) {
  if (!dni || dni.length < 8) return '--------';
  return `${dni.slice(0, 1)}XXXXX${dni.slice(-3)}`;
}

function setMode(viewId) {
  document.querySelectorAll('.view').forEach((view) => view.classList.remove('active'));
  $(viewId).classList.add('active');

  document.body.classList.remove('mode-search', 'mode-results', 'mode-detail', 'mode-empty');
  document.body.classList.add(`mode-${viewId.replace('view-', '')}`);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function clearValidation() {
  ['inp-dni', 'inp-ticket'].forEach((id) => $(id).classList.remove('error'));
  ['err-dni', 'err-ticket'].forEach((id) => $(id).classList.remove('visible'));
}

function setLoading(loading) {
  $('btn-consultar').disabled = loading;
  $('btn-text').hidden = loading;
  $('spinner').hidden = !loading;
}

function badge(estado) {
  const label = ESTADO_LABELS[estado] || estado || 'Sin estado';
  return `<span class="badge state-${estado}">${label}</span>`;
}

function showEmpty(message) {
  $('empty-message').textContent = message || 'Verifica el numero de DNI o codigo de ticket ingresado. Si acabas de dejar tu equipo en tienda, el registro puede tomar hasta 15 minutos.';
  setMode('view-empty');
}

function warrantyBadge(status) {
  if (!status) return '<span class="warranty-badge warranty-loading">Verificando...</span>';
  const map = {
    activa:     ['warranty-activa',     'Activa'],
    expirada:   ['warranty-expirada',   'Expirada'],
    por_vencer: ['warranty-por-vencer', 'Por vencer'],
  };
  const [cls, label] = map[status] || ['warranty-loading', status];
  return `<span class="warranty-badge ${cls}">${label}</span>`;
}

async function fetchWarranty(idTicket) {
  try {
    const res = await fetch(`/api/tickets/${idTicket}/garantia`);
    const data = await res.json();
    if (!res.ok || !data.success) return null;
    const g = data.data?.garantia;
    if (!g) return null;
    if (!g.tiene_garantia) return 'expirada';
    const diasRestantes = g.dias_restantes ?? 999;
    return diasRestantes <= 30 ? 'por_vencer' : 'activa';
  } catch {
    return null;
  }
}

function renderResults(tickets) {
  $('results-title').textContent = `Resultados de busqueda para el DNI: ${maskDni(currentDni)}`;
  $('results-count').textContent = `${tickets.length} orden${tickets.length === 1 ? '' : 'es'} encontrada${tickets.length === 1 ? '' : 's'}`;

  const list = $('tickets-list');
  const tbody = $('tickets-table-body');
  list.innerHTML = '';
  tbody.innerHTML = '';

  tickets.forEach((ticket) => {
    const estado = ticket.estado || 'Recibido';
    const copy = ESTADO_COPY[estado] || ESTADO_COPY.Recibido;
    const equipo = productName(ticket);
    const idTicket = ticket.id_ticket;
    const codigo = ticketCode(ticket);

    // ── Mobile card ──
    const card = document.createElement('article');
    card.className = 'ticket-result';
    card.tabIndex = 0;
    card.innerHTML = `
      <header>
        <h2>Ticket #${codigo}</h2>
        ${badge(estado)}
      </header>
      <p class="meta-equipo"><span>Equipo:</span> ${equipo}</p>
      <div class="meta-row">
        <span class="warranty-badge warranty-loading" data-warranty-card="${idTicket}">Garantia...</span>
      </div>
      <p>${copy.card}</p>
      <span class="action-copy">${estado === 'Entregado' ? 'Completar encuesta de satisfaccion (NPS)' : 'Ver detalle tecnico'} -></span>
    `;
    card.addEventListener('click', () => {
      if (estado === 'Entregado') openNps(idTicket || codigo);
      else loadDetail(idTicket || codigo);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (estado === 'Entregado') openNps(idTicket || codigo);
        else loadDetail(idTicket || codigo);
      }
    });
    list.appendChild(card);

    // ── Desktop table row ──
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-ticket">Ticket #${codigo}</td>
      <td>${badge(estado)}</td>
      <td>${equipo}</td>
      <td><span class="warranty-badge warranty-loading" data-warranty-row="${idTicket}">Verificando...</span></td>
      <td class="col-details"><span data-details-row="${idTicket}">—</span></td>
    `;
    tr.addEventListener('click', () => {
      if (estado === 'Entregado') openNps(idTicket || codigo);
      else loadDetail(idTicket || codigo);
    });
    tbody.appendChild(tr);

    // ── Cargar garantía de forma asíncrona ──
    fetchWarranty(idTicket).then((status) => {
      // actualizar card mobile
      const cardBadge = document.querySelector(`[data-warranty-card="${idTicket}"]`);
      if (cardBadge) cardBadge.outerHTML = warrantyBadge(status);
      // actualizar fila desktop
      const rowBadge = document.querySelector(`[data-warranty-row="${idTicket}"]`);
      if (rowBadge) rowBadge.outerHTML = warrantyBadge(status);
      // detalles: si tiene repuesto asignado (se puede extender con datos del ticket)
      const detailsCell = document.querySelector(`[data-details-row="${idTicket}"]`);
      if (detailsCell) {
        if (ticket.repuesto_asignado) {
          detailsCell.innerHTML = `<span class="detail-parts">🔧 ${ticket.repuesto_asignado}</span>`;
        } else if (estado === 'Listo' || estado === 'Entregado') {
          detailsCell.innerHTML = `<span class="detail-quality">✓ Control de calidad aprobado</span>`;
        } else {
          detailsCell.textContent = '—';
        }
      }
    });
  });

  setMode('view-results');
}

function iconForStep(estado) {
  if (estado === 'Reparando') {
    return '<svg viewBox="0 0 24 24"><path d="m14.7 6.3 3-3a4 4 0 0 1-5 5l-7.4 7.4a2.1 2.1 0 1 1-3-3l7.4-7.4a4 4 0 0 1 5-5Z"/></svg>';
  }
  return '<svg viewBox="0 0 24 24"><path d="m7 12 3 3 7-7"/></svg>';
}

function renderDetail(ticket) {
  const estado = ticket.estado || 'Recibido';
  const currentIndex = Math.max(0, ESTADOS.indexOf(estado));

  $('detail-title').textContent = `Ticket #${ticketCode(ticket)}`;
  $('det-equipo').textContent = productName(ticket);
  $('det-badge-wrap').innerHTML = badge(estado);
  $('nps-detail-action').hidden = estado !== 'Entregado';
  $('nps-detail-action').onclick = () => openNps(ticket.id_ticket || ticket.codigo_ticket);

  if (ticket.fecha_estimada_entrega && estado !== 'Entregado') {
    $('det-fecha-txt').textContent = `Fecha estimada de entrega: ${fmtFecha(ticket.fecha_estimada_entrega)}`;
    $('det-fecha').hidden = false;
  } else {
    $('det-fecha').hidden = true;
  }

  const timeline = $('timeline');
  timeline.innerHTML = '';

  ESTADOS.forEach((stepEstado, index) => {
    const copy = ESTADO_COPY[stepEstado] || ESTADO_COPY.Recibido;
    const done = index < currentIndex;
    const active = index === currentIndex;
    const pending = index > currentIndex;
    const step = document.createElement('section');
    step.className = `tl-step${active ? ' active' : ''}${pending ? ' pending' : ''}`;
    step.innerHTML = `
      <div class="tl-dot ${done ? 'done' : ''} ${active ? 'active' : ''} ${stepEstado === 'Reparando' ? 'repair' : ''}" aria-hidden="true">${done || active ? iconForStep(stepEstado) : ''}</div>
      <div class="tl-body">
        <h3 class="tl-title">${copy.title}</h3>
        <p class="tl-desc">${pending ? 'Pendiente de actualizacion.' : copy.detail}</p>
      </div>
    `;
    timeline.appendChild(step);
  });

  setMode('view-detail');
}

async function loadDetail(idTicket) {
  try {
    const response = await fetch('/api/tickets/consulta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni: currentDni, id_ticket: idTicket }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      showEmpty(data.message || 'No se pudo abrir el detalle de este ticket.');
      return;
    }
    renderDetail(data.data);
  } catch (error) {
    showEmpty('No se pudo conectar con el servidor. Intenta nuevamente.');
  }
}

async function consultar(event) {
  event.preventDefault();
  clearValidation();

  const dni = $('inp-dni').value.trim();
  const ticket = $('inp-ticket').value.trim().toUpperCase();

  if (!DNI_RE.test(dni)) {
    $('inp-dni').classList.add('error');
    $('err-dni').classList.add('visible');
    $('inp-dni').focus();
    return;
  }

  if (ticket && !UUID_RE.test(ticket) && !TICKET_CODE_RE.test(ticket)) {
    $('inp-ticket').classList.add('error');
    $('err-ticket').classList.add('visible');
    $('inp-ticket').focus();
    return;
  }

  currentDni = dni;
  setLoading(true);

  try {
    if (ticket) {
      const response = await fetch('/api/tickets/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, id_ticket: ticket }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        showEmpty(data.message || 'No encontramos un ticket con esos datos.');
      } else {
        renderDetail(data.data);
      }
      return;
    }

    const response = await fetch(`/api/tickets/dni/${encodeURIComponent(dni)}`);
    const data = await response.json();
    if (!response.ok || !data.success) {
      showEmpty(data.message || 'Hubo un problema al consultar. Intenta mas tarde.');
    } else if (!data.total) {
      showEmpty();
    } else {
      renderResults(data.data || []);
    }
  } catch (error) {
    showEmpty('No se pudo conectar con el servidor. Verifica tu conexion e intenta otra vez.');
  } finally {
    setLoading(false);
  }
}

function openNps(ticketId) {
  currentNpsTicket = ticketId;
  selectedNpsScore = 0;
  $('nps-comment').value = '';
  $('nps-message').hidden = true;
  document.querySelectorAll('.nps-score').forEach((button) => button.classList.remove('selected'));
  $('nps-dialog').showModal();
}

for (let score = 1; score <= 10; score += 1) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nps-score';
  button.textContent = score;
  button.addEventListener('click', () => {
    selectedNpsScore = score;
    document.querySelectorAll('.nps-score').forEach((item) => {
      item.classList.toggle('selected', Number(item.textContent) === score);
    });
  });
  $('nps-scale').appendChild(button);
}

$('nps-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = $('nps-message');
  if (!selectedNpsScore) {
    message.textContent = 'Selecciona una puntuacion del 1 al 10.';
    message.hidden = false;
    return;
  }

  $('nps-submit').disabled = true;
  try {
    const response = await fetch(`/api/tickets/${encodeURIComponent(currentNpsTicket)}/nps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puntuacion: selectedNpsScore,
        comentario: $('nps-comment').value.trim(),
      }),
    });
    const data = await response.json();
    message.textContent = data.message || 'Encuesta registrada.';
    message.classList.toggle('success', response.ok);
    message.hidden = false;
    if (response.ok) setTimeout(() => $('nps-dialog').close(), 1200);
  } catch {
    message.textContent = 'No se pudo enviar la encuesta. Intenta nuevamente.';
    message.hidden = false;
  } finally {
    $('nps-submit').disabled = false;
  }
});

$('nps-close').addEventListener('click', () => $('nps-dialog').close());
$('guide-close').addEventListener('click', () => {
  $('guide-dialog').close();
  sessionStorage.setItem('hiraoka_guide_seen', 'true');
});

function goSearch() {
  setMode('view-search');
}

$('query-form').addEventListener('submit', consultar);
$('btn-new-search').addEventListener('click', goSearch);
$('btn-empty-retry').addEventListener('click', goSearch);
$('btn-nueva-consulta').addEventListener('click', goSearch);
$('header-back').addEventListener('click', goSearch);
$('close-results').addEventListener('click', goSearch);

$('inp-dni').addEventListener('input', function onDniInput() {
  this.value = this.value.replace(/\D/g, '').slice(0, 8);
});

$('inp-ticket').addEventListener('input', function onTicketInput() {
  this.value = this.value.toUpperCase().replace(/\s/g, '').slice(0, 36);
});

setMode('view-search');

if (localStorage.getItem('hiraoka_public_guide_enabled') !== 'false' && !sessionStorage.getItem('hiraoka_guide_seen')) {
  window.setTimeout(() => $('guide-dialog').showModal(), 350);
}
