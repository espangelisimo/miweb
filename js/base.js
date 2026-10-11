/* websinlio — JS base (vanilla, sin dependencias) */
(() => {
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Cabecera con sombra al hacer scroll
  const header = $('[data-header]');
  const onScroll = () => header?.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menú móvil
  const toggle = $('[data-nav-toggle]');
  const nav = $('[data-nav]');
  const setNav = (open) => {
    toggle?.setAttribute('aria-expanded', open);
    toggle?.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav?.classList.toggle('is-open', open);
  };
  toggle?.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setNav(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });

  // Aparición al hacer scroll
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach(el => io.observe(el));

  // Barra de acción móvil: se oculta al llegar al pie
  const bar = $('[data-actionbar]');
  const footer = $('[data-footer]');
  if (bar && footer) {
    new IntersectionObserver(([e]) => bar.classList.toggle('is-hidden', e.isIntersecting)).observe(footer);
  }

  // Horario: resalta hoy y muestra "Abierto ahora / Cerrado"
  const hoursEl = $('[data-hours]');
  if (hoursEl) {
    try {
      const hours = JSON.parse(hoursEl.dataset.hours);
      const now = new Date();
      const day = now.getDay();
      const mins = now.getHours() * 60 + now.getMinutes();
      const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      $(`tr[data-day="${day}"]`, hoursEl)?.classList.add('is-today');
      const open = (hours[day] || []).some(([a, b]) => mins >= toMin(a) && mins < toMin(b));
      const badge = $('[data-open-now]');
      if (badge) {
        badge.textContent = open ? 'Abierto ahora' : 'Cerrado ahora';
        badge.classList.toggle('is-closed', !open);
        badge.hidden = false;
      }
    } catch { /* horario mal formado: no mostrar estado */ }
  }

  // Mapa con consentimiento (no carga Google hasta que el usuario lo pide)
  $$('[data-map]').forEach(map => {
    $('[data-map-load]', map)?.addEventListener('click', () => {
      map.innerHTML = `<iframe src="${map.dataset.map}" title="Mapa de ubicación" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
    });
  });

  // Formulario: validación + envío AJAX (Web3Forms / Formspree)
  $$('[data-form]').forEach(form => {
    const msgs = { valueMissing: 'Este campo es obligatorio.', typeMismatch: 'Revisa el formato.', tel: 'Introduce un teléfono válido.' };
    const check = (field) => {
      const wrap = field.closest('.field');
      if (!wrap) return field.checkValidity();
      let error = '';
      if (field.validity.valueMissing) error = msgs.valueMissing;
      else if (field.type === 'tel' && field.value && !/^[+\d\s().-]{9,}$/.test(field.value)) error = msgs.tel;
      else if (!field.checkValidity()) error = msgs.typeMismatch;
      wrap.classList.toggle('has-error', !!error);
      field.setAttribute('aria-invalid', !!error);
      const out = $('.field__error', wrap);
      if (out) out.textContent = error;
      return !error;
    };
    $$('input, textarea, select', form).forEach(f => f.addEventListener('blur', () => check(f)));

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if ($('[name="botcheck"]', form)?.value) return;
      const fields = $$('input:not([type=hidden]):not([name=botcheck]), textarea, select', form);
      const ok = fields.map(check).every(Boolean);
      if (!ok) { fields.find(f => f.getAttribute('aria-invalid') === 'true' || !f.checkValidity())?.focus(); return; }

      const btn = $('button[type=submit]', form);
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Enviando…';
      try {
        const data = new FormData(form);
        if (form.action.includes('[[') || [...data.values()].some(v => String(v).includes('[['))) throw new Error('Falta configurar el endpoint/clave del formulario');
        const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.status);
        form.classList.add('is-sent');
        track('formulario');
      } catch (err) {
        console.warn('[form]', err.message);
        btn.disabled = false; btn.textContent = label;
        alert('No se ha podido enviar. Llámanos o escríbenos por WhatsApp, por favor.');
      }
    });
  });

  // Medición de clics en botones de contacto (GA4 / Plausible si existen)
  function track(name) {
    if (typeof window.gtag === 'function') window.gtag('event', 'contacto', { metodo: name });
    if (typeof window.plausible === 'function') window.plausible('Contacto', { props: { metodo: name } });
  }
  $$('[data-track]').forEach(el => el.addEventListener('click', () => track(el.dataset.track)));

  // Año del copyright
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
