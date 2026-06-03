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

function renderResults(tickets) {
  $('results-title').textContent = `Resultados de busqueda para el DNI: ${maskDni(currentDni)}`;
  $('results-count').textContent = `${tickets.length} orden${tickets.length === 1 ? '' : 'es'} encontrada${tickets.length === 1 ? '' : 's'}`;

  const list = $('tickets-list');
  list.innerHTML = '';

  tickets.forEach((ticket) => {
    const estado = ticket.estado || 'Recibido';
    const copy = ESTADO_COPY[estado] || ESTADO_COPY.Recibido;
    const card = document.createElement('article');
    card.className = 'ticket-result';
    card.tabIndex = 0;
    card.innerHTML = `
      <header>
        <h2>Ticket #${ticketCode(ticket)}</h2>
        ${badge(estado)}
      </header>
      <p>${copy.card}</p>
      <span class="action-copy">${estado === 'Entregado' ? 'Completar encuesta de satisfaccion (NPS)' : 'Ver detalle tecnico'} -></span>
    `;
    card.addEventListener('click', () => loadDetail(ticket.id_ticket || ticketCode(ticket)));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        loadDetail(ticket.id_ticket || ticketCode(ticket));
      }
    });
    list.appendChild(card);
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
