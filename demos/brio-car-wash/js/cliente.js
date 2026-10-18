/* Brío Car Wash v2 — JS vanilla. Todo el contenido ya está en el HTML; esto solo mejora la experiencia. */
(() => {
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = 'https://wa.me/34600000000?text=';

  /* Menú móvil */
  const burger = $('[data-burger]'), nav = $('[data-nav]');
  const setNav = o => {
    burger?.setAttribute('aria-expanded', o);
    burger?.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú');
    nav?.classList.toggle('is-open', o);
    document.body.style.overflow = o ? 'hidden' : '';
  };
  burger?.addEventListener('click', () => setNav(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setNav(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });

  /* Pompas: se posan una vez al entrar en pantalla */
  const ioP = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); ioP.unobserve(e.target); }
  }), { threshold: .3 });
  $$('.pompas').forEach(p => (reduce ? p.classList.add('is-in') : ioP.observe(p)));

  /* Barra móvil: se oculta al llegar al pie */
  const bar = $('[data-bar]'), foot = $('[data-footer]');
  if (bar && foot) new IntersectionObserver(([e]) => bar.classList.toggle('is-hidden', e.isIntersecting)).observe(foot);

  /* Comparador "Pasa la bayeta" */
  $$('[data-cmp]').forEach(cmp => {
    const h = $('.cmp__h', cmp);
    let raf = 0;
    const set = v => {
      v = Math.max(0, Math.min(100, v));
      cmp.style.setProperty('--p', v + '%'); cmp.style.setProperty('--f', v / 100);
      h.setAttribute('aria-valuenow', Math.round(v));
    };
    const stop = () => cancelAnimationFrame(raf);
    const fromEvent = e => { const r = cmp.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
    let drag = false;
    // Con el dedo no salta al tocar: arrastra en relativo desde donde estaba (si el gesto es vertical, el navegador hace scroll y lanza pointercancel)
    let sx = 0, sp = 50, touch = false;
    cmp.addEventListener('pointerdown', e => {
      stop(); drag = true; touch = e.pointerType === 'touch'; cmp.setPointerCapture(e.pointerId);
      if (touch) { sx = e.clientX; sp = +h.getAttribute('aria-valuenow'); } else fromEvent(e);
    });
    cmp.addEventListener('pointermove', e => {
      if (!drag) return;
      if (touch) set(sp + (e.clientX - sx) / cmp.getBoundingClientRect().width * 100); else fromEvent(e);
    });
    const end = () => { drag = false; };
    cmp.addEventListener('pointerup', end); cmp.addEventListener('pointercancel', end);
    h.addEventListener('keydown', e => {
      const v = +h.getAttribute('aria-valuenow'), k = e.key;
      const m = { ArrowLeft: v - 5, ArrowDown: v - 5, ArrowRight: v + 5, ArrowUp: v + 5, Home: 0, End: 100, PageDown: v - 20, PageUp: v + 20 };
      if (k in m) { e.preventDefault(); stop(); set(m[k]); }
    });
    set(50);
    if (!reduce) {
      // una pasada sola al entrar en pantalla y se detiene al 50 %
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now(), D = 1900;
        const tick = t => {
          const k = Math.min(1, (t - t0) / D);
          const e = k < .5 ? 50 + (k / .5) * 42 : 92 - ((k - .5) / .5) * 42; // 50 → 92 → 50
          set(e);
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }, { threshold: .6 });
      io.observe(cmp);
    }
  });

  /* Filtros de la galería */
  $$('[data-filtros]').forEach(f => {
    const items = $$('[data-cat]');
    $$('button', f).forEach(b => b.addEventListener('click', () => {
      $$('button', f).forEach(x => x.setAttribute('aria-pressed', x === b));
      const c = b.dataset.filter;
      items.forEach(i => { i.hidden = !(c === 'todo' || i.dataset.cat.split(' ').includes(c)); });
    }));
  });

  /* Monta tu lavado: suma y prepara el WhatsApp */
  const cfg = $('[data-cfg]');
  if (cfg) {
    const bandas = $$('.banda', cfg), extras = $$('.extra input', cfg);
    const nombre = $('[name=nombre]', cfg), franja = $('[name=franja]', cfg);
    const lista = $('[data-lista]'), tot = $('[data-total]'), btn = $('[data-wa]'), pend = $('[data-pend]');
    const fmt = n => n.toLocaleString('es-ES') + ' €';
    let nivel = $('.banda[aria-pressed=true]', cfg);
    const render = () => {
      const lines = [[nivel.dataset.n, nivel.dataset.p]];
      let total = +nivel.dataset.p, pendientes = 0;
      const names = [nivel.dataset.n];
      extras.filter(x => x.checked).forEach(x => {
        const p = x.dataset.p;
        lines.push([x.dataset.n, p ? '+' + fmt(+p) : 'a consultar']);
        names.push(x.dataset.m);
        if (p) total += +p; else pendientes++;
      });
      lista.innerHTML = '';
      lines.forEach((l, i) => {
        const li = document.createElement('li');
        const a = document.createElement('span'), b = document.createElement('span');
        a.textContent = l[0]; b.textContent = i === 0 ? 'desde ' + fmt(+l[1]) : l[1];
        li.append(a, b); lista.append(li);
      });
      tot.textContent = fmt(total);
      pend.hidden = !pendientes;
      const quien = nombre.value.trim();
      const fr = franja.value ? ` Me viene mejor por la ${franja.value}.` : '';
      const lista2 = names.length > 1 ? names.slice(0, -1).join(', ') + ' + ' + names.slice(-1) : names[0];
      const msg = `Hola Nico, quiero un ${lista2}. Total orientativo desde ${fmt(total)}${pendientes ? ' (más extras a consultar)' : ''}. ¿Cuándo puedes?${fr}${quien ? ' Soy ' + quien + '.' : ''}`;
      btn.href = WA + encodeURIComponent(msg);
    };
    bandas.forEach(b => b.addEventListener('click', () => {
      bandas.forEach(x => x.setAttribute('aria-pressed', x === b));
      nivel = b; render();
    }));
    [...extras, nombre, franja].forEach(x => x.addEventListener('input', render));
    render();
  }

  /* Horario: marca el día de hoy */
  const hoy = $(`[data-hours] tr[data-day="${new Date().getDay()}"]`);
  hoy?.classList.add('is-today');

  /* Mapa con consentimiento */
  $$('[data-map]').forEach(map => {
    $('[data-map-load]', map)?.addEventListener('click', () => {
      map.innerHTML = `<iframe src="${map.dataset.map}" title="Mapa: Brío Car Wash, C. de la Muestra 12, Sevilla" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
      map.classList.add('is-loaded');
    });
  });

  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
