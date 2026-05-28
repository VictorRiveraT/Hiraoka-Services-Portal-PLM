// ── CONSTANTES DE ESTADO (HSPP-24 guía visual) ──────────────
    const ESTADOS = ['Recibido', 'Diagnosticando', 'Reparando', 'Listo', 'Entregado'];

    const ESTADO_INFO = {
      Recibido:       { label: 'Recibido',            desc: 'Su equipo fue registrado en tienda. El estado físico inicial fue documentado por nuestro equipo.' },
      Diagnosticando: { label: 'Diagnosticando',       desc: 'Un técnico especializado está evaluando su equipo para identificar la causa del problema.' },
      Reparando:      { label: 'Reparando',            desc: 'Estamos realizando la reparación con repuestos autorizados. Le avisaremos cuando esté listo.' },
      Listo:          { label: 'Listo',                desc: 'Su equipo está reparado y listo para ser recogido en tienda. Traiga su DNI y este número de ticket.' },
      Entregado:      { label: 'Entregado',            desc: 'Su equipo fue entregado exitosamente. Gracias por confiar en Hiraoka Services.' },
    };

    const ESTADO_LABELS = {
      Recibido:       'Recibido',
      Diagnosticando: 'Diagnosticando',
      Reparando:      'Reparando',
      Listo:          'Listo',
      Entregado:      'Entregado',
    };

    // UUID regex simple
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const DNI_RE  = /^\d{8}$/;

    let dniBusqueda = '';  // guardamos el DNI para el POST /consulta

    // ── HELPERS ─────────────────────────────────────────────────
    function setLoading(on) {
      const btn  = document.getElementById('btn-consultar');
      const txt  = document.getElementById('btn-text');
      const spin = document.getElementById('spinner');
      btn.disabled       = on;
      txt.hidden = on;
      spin.hidden = !on;
    }

    function limpiarResultados() {
      document.getElementById('tickets-list').classList.remove('visible');
      document.getElementById('error-card').classList.remove('visible');
      document.getElementById('resultado-label').classList.remove('visible');
      document.getElementById('tickets-list').innerHTML = '';
    }

    function mostrarError(titulo, msg) {
      document.getElementById('resultado-label').classList.add('visible');
      document.getElementById('error-title').textContent = titulo;
      document.getElementById('error-msg').textContent   = msg;
      document.getElementById('error-card').classList.add('visible');
    }

    function fmtFecha(iso) {
      if (!iso) return 'Por confirmar';
      return new Date(iso).toLocaleDateString('es-PE', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    }

    function buildBadge(estado, small = false) {
      const div = document.createElement('span');
      div.className = `badge badge-${estado}${small ? ' badge-sm' : ''}`;
      div.textContent = ESTADO_LABELS[estado] || estado;
      return div;
    }

    // ── VISTAS ──────────────────────────────────────────────────
    function mostrarVista(id) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      window.scrollTo(0, 0);
    }

    function volverBusqueda() {
      mostrarVista('view-busqueda');
    }

    // ── DETALLE DE TICKET (HSPP-23) ──────────────────────────────
    function mostrarDetalle(t) {
      // Header
      const ticketId = t.id_ticket ? t.id_ticket.toString() : '—';
      document.getElementById('det-id').textContent      = `Ticket #${ticketId}`;
      document.getElementById('det-equipo').textContent  = `${t.producto || 'Equipo'} ${t.marca ? '- ' + t.marca : ''} ${t.modelo ? t.modelo : ''}`.trim();
      document.getElementById('det-cliente').textContent = t.cliente || '—';
      document.getElementById('det-ingreso').textContent = fmtFecha(t.fecha_ingreso);
      document.getElementById('det-serie').textContent   = t.numero_serie || '—';
      document.getElementById('det-problema').textContent= t.descripcion_problema || '—';

      // Badge de estado
      const badgeWrap = document.getElementById('det-badge-wrap');
      badgeWrap.innerHTML = '';
      badgeWrap.appendChild(buildBadge(t.estado));

      // Fecha estimada
      const fechaBox = document.getElementById('det-fecha');
      if (t.fecha_estimada_entrega && t.estado !== 'Entregado') {
        document.getElementById('det-fecha-txt').textContent =
          `Fecha estimada de entrega: ${fmtFecha(t.fecha_estimada_entrega)}`;
        fechaBox.hidden = false;
      } else {
        fechaBox.hidden = true;
      }

      // Timeline (HSPP-23)
      const idxActual = ESTADOS.indexOf(t.estado);
      const timeline  = document.getElementById('timeline');
      timeline.innerHTML = '';

      ESTADOS.forEach((estado, i) => {
        const info = ESTADO_INFO[estado];
        const done   = i < idxActual;
        const active = i === idxActual;
        const pend   = i > idxActual;

        const step = document.createElement('div');
        step.className = `tl-step${active ? ' active-step' : ''}`;

        const dot = document.createElement('div');
        dot.className = `tl-dot${done ? ' done' : active ? ' active' : ''}`;
        if (done || active) {
          dot.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
        }

        const nombre = document.createElement('div');
        nombre.className = `tl-nombre${pend ? ' pendiente' : ''}`;
        nombre.textContent = info.label;

        const desc = document.createElement('div');
        desc.className = 'tl-desc';
        desc.textContent = (done || active) ? info.desc : '';

        step.appendChild(dot);
        step.appendChild(nombre);
        if (!pend) step.appendChild(desc);
        timeline.appendChild(step);
      });

      mostrarVista('view-detalle');
    }

    // ── LISTA DE TICKETS (múltiples) ─────────────────────────────
    function mostrarLista(tickets) {
      document.getElementById('resultado-label').classList.add('visible');
      const lista = document.getElementById('tickets-list');

      lista.innerHTML = '';
      const summary = document.createElement('p');
      summary.className = 'tickets-summary';
      summary.textContent =
        `Encontramos ${tickets.length} ticket(s) asociados a tu DNI. Toca uno para ver el detalle.`;
      lista.appendChild(summary);

      tickets.forEach(t => {
        const item = document.createElement('div');
        item.className = 'ticket-item';
        const info = document.createElement('div');
        info.className = 'ticket-item-info';

        const ticketId = document.createElement('div');
        ticketId.className = 'id';
        ticketId.textContent = `Ticket #${(t.id_ticket || '').toString()}`;

        const product = document.createElement('div');
        product.className = 'prod';
        product.textContent = t.producto || 'Equipo registrado';

        info.appendChild(ticketId);
        info.appendChild(product);
        item.appendChild(info);
        item.appendChild(buildBadge(t.estado, true));
        // Al hacer clic en un ticket de la lista, ir al detalle seguro (POST /consulta)
        item.addEventListener('click', () => verDetalleDesde(t.id_ticket));
        lista.appendChild(item);
      });

      lista.classList.add('visible');
    }

    // Consulta segura del detalle desde la lista (usa POST /consulta con el DNI guardado)
    async function verDetalleDesde(id_ticket) {
      try {
        const res = await fetch('/api/tickets/consulta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dni: dniBusqueda, id_ticket }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          mostrarDetalle(data.data);
        }
      } catch (_) {
        // silencioso — ya están en la lista, el detalle falló por red
      }
    }

    // ── CONSULTA PRINCIPAL ───────────────────────────────────────
    async function consultar() {
      const dni    = document.getElementById('inp-dni').value.trim();
      const ticket = document.getElementById('inp-ticket').value.trim();

      // Resetear errores
      ['inp-dni','inp-ticket'].forEach(id => {
        document.getElementById(id).classList.remove('error');
      });
      ['err-dni','err-ticket'].forEach(id => {
        document.getElementById(id).classList.remove('visible');
      });

      // Validar DNI
      if (!DNI_RE.test(dni)) {
        document.getElementById('inp-dni').classList.add('error');
        document.getElementById('err-dni').classList.add('visible');
        document.getElementById('inp-dni').focus();
        return;
      }

      // Validar formato UUID si se ingresó ticket
      if (ticket && !UUID_RE.test(ticket)) {
        document.getElementById('inp-ticket').classList.add('error');
        document.getElementById('err-ticket').classList.add('visible');
        document.getElementById('inp-ticket').focus();
        return;
      }

      limpiarResultados();
      setLoading(true);
      dniBusqueda = dni;

      try {
        if (ticket) {
          // ── POST /consulta: FEAT01 seguridad — valida DNI + ticket juntos
          const res  = await fetch('/api/tickets/consulta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni, id_ticket: ticket }),
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            mostrarError(
              'No encontramos tu ticket',
              data.message || 'Verifica tu DNI y número de ticket.'
            );
          } else {
            mostrarDetalle(data.data);
          }

        } else {
          // ── GET /dni/:dni: lista todos los tickets de ese DNI
          const res  = await fetch(`/api/tickets/dni/${encodeURIComponent(dni)}`);
          const data = await res.json();

          if (!res.ok || !data.success) {
            mostrarError('Error al consultar', 'Hubo un problema. Intenta más tarde.');
          } else if (data.total === 0) {
            mostrarError(
              'No encontramos tickets',
              'No hay tickets asociados a tu DNI. Si dejaste un equipo recientemente, consulta en tienda.'
            );
          } else if (data.total === 1) {
            // Un solo ticket — ir directo al detalle seguro
            verDetalleDesde(data.data[0].id_ticket);
          } else {
            mostrarLista(data.data);
          }
        }

      } catch (_) {
        mostrarError('Sin conexión', 'No se pudo conectar con el servidor. Verifica tu internet.');
      } finally {
        setLoading(false);
      }
    }

    // ── EVENTOS ──────────────────────────────────────────────────
    document.getElementById('btn-consultar').addEventListener('click', consultar);
    document.getElementById('btn-volver-detalle').addEventListener('click', volverBusqueda);
    document.getElementById('btn-nueva-consulta').addEventListener('click', volverBusqueda);
    document.getElementById('btn-volver-detalle').addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        volverBusqueda();
      }
    });

    // Enter para consultar
    ['inp-dni','inp-ticket'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') consultar();
      });
    });

    // Solo dígitos en DNI
    document.getElementById('inp-dni').addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 8);
    });
