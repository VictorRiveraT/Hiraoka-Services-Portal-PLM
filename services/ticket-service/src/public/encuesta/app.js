const form = document.getElementById('nps-page-form');
const ticketInput = document.getElementById('nps-ticket');
const dniInput = document.getElementById('nps-dni');
const scale = document.getElementById('nps-page-scale');
const message = document.getElementById('nps-page-message');
const submit = document.getElementById('nps-page-submit');
const success = document.getElementById('nps-page-success');
let selectedScore = 0;

const ticketFromUrl = new URLSearchParams(window.location.search).get('ticket');
if (ticketFromUrl) ticketInput.value = ticketFromUrl.trim().toUpperCase();

for (let score = 1; score <= 10; score += 1) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'score-button';
  button.textContent = score;
  button.setAttribute('aria-label', `Puntuación ${score} de 10`);
  button.addEventListener('click', () => {
    selectedScore = score;
    scale.querySelectorAll('button').forEach((item) => {
      const selected = Number(item.textContent) === score;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  });
  scale.appendChild(button);
}

dniInput.addEventListener('input', () => {
  dniInput.value = dniInput.value.replace(/\D/g, '').slice(0, 8);
});
ticketInput.addEventListener('input', () => {
  ticketInput.value = ticketInput.value.toUpperCase().replace(/\s/g, '').slice(0, 36);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.hidden = true;
  const ticket = ticketInput.value.trim();
  const dni = dniInput.value.trim();

  if (!/^\d{8}$/.test(dni)) {
    message.textContent = 'Ingrese el DNI de 8 dígitos del titular.';
    message.hidden = false;
    dniInput.focus();
    return;
  }
  if (!selectedScore) {
    message.textContent = 'Seleccione una puntuación del 1 al 10.';
    message.hidden = false;
    return;
  }

  submit.disabled = true;
  try {
    const response = await fetch(`/api/tickets/${encodeURIComponent(ticket)}/nps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dni,
        puntuacion: selectedScore,
        comentario: document.getElementById('nps-page-comment').value.trim(),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'No se pudo registrar la encuesta.');
    form.hidden = true;
    success.hidden = false;
  } catch (error) {
    message.textContent = error.message;
    message.hidden = false;
  } finally {
    submit.disabled = false;
  }
});
