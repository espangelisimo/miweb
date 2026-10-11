/* websinlio — calculadora de clientes perdidos */
(() => {
  const calc = document.querySelector('[data-calc]');
  if (!calc) return;
  const nf = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0, useGrouping: 'always' });
  const fmt = n => nf.format(Math.round(n));
  const inputs = Object.fromEntries([...calc.querySelectorAll('[data-in]')].map(i => [i.dataset.in, i]));
  const out = Object.fromEntries([...calc.querySelectorAll('[data-out]')].map(o => [o.dataset.out, o]));

  const update = () => {
    const visits = +inputs.visits.value;
    const ticket = +inputs.ticket.value;
    const gain = +inputs.gain.value;
    Object.values(inputs).forEach(i => i.style.setProperty('--p', `${((i.value - i.min) / (i.max - i.min)) * 100}%`));
    const clients = visits * gain / 100;
    const month = clients * ticket;
    out.visits.textContent = fmt(visits);
    out.ticket.textContent = `${fmt(ticket)} €`;
    out.gain.textContent = `+${String(gain).replace('.', ',')} %`;
    out.month.innerHTML = `${fmt(month)} € <small>/ mes</small>`;
    out.year.textContent = `${fmt(month * 12)} € al año`;
    out.clients.textContent = `${fmt(clients)} clientes/mes`;
  };
  Object.values(inputs).forEach(i => i.addEventListener('input', update));
  update();
})();
