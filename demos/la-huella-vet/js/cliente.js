/* Clínica Veterinaria La Huella · v3 · JS vanilla, sin dependencias. Todo el contenido está también en el HTML. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = 'https://wa.me/34600000000';
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const tel = (el) => el.dataset;

  /* ---------- Estado de la mascota (solo en este navegador) ---------- */
  const store = { get() { try { return JSON.parse(sessionStorage.getItem('sj-mascota') || '{}'); } catch { return {}; } }, set(v) { try { sessionStorage.setItem('sj-mascota', JSON.stringify(v)); } catch { /* sin almacenamiento */ } } };
  let S = Object.assign({ nombre: '', especie: 'perro' }, store.get());
  const hooks = [];
  const subj = () => (S.especie === 'gato' ? 'mi gato' : S.especie === 'otro' || !S.especie ? 'mi mascota' : 'mi perro') + (S.nombre ? ' ' + S.nombre : '');
  const fill = (t) => t.replace(/\{M\}/g, cap(subj())).replace(/\{m\}/g, subj()).replace(/\{N\}/g, S.nombre || 'mi mascota');
  const waUrl = (t) => WA + '?text=' + encodeURIComponent(t);
  const track = (n) => { if (typeof window.gtag === 'function') window.gtag('event', 'contacto', { metodo: n }); if (typeof window.plausible === 'function') window.plausible('Contacto', { props: { metodo: n } }); };
  $$('[data-track]').forEach((el) => el.addEventListener('click', () => track(el.dataset.track)));

  function applyName(retrigger) {
    $$('[data-nombre]').forEach((el) => { if (!el.dataset.def) el.dataset.def = el.textContent; el.textContent = S.nombre || el.dataset.def; });
    $$('[data-para]').forEach((el) => { el.textContent = S.nombre ? ' · ' + S.nombre : ''; });
    $$('a[data-wa]').forEach((a) => { a.href = waUrl(fill(a.dataset.wa)); });
    const ini = S.nombre ? S.nombre.trim().charAt(0).toUpperCase() : '?';
    $$('.placa__t').forEach((t) => { t.textContent = ini; });
    $$('svg.perro').forEach((s) => {
      const had = s.classList.contains('is-named');
      s.classList.toggle('is-named', !!S.nombre);
      if (retrigger && S.nombre) { s.classList.remove('is-named'); void s.getBoundingClientRect(); s.classList.add('is-named'); } else if (!S.nombre && had) s.classList.remove('is-named');
    });
    $$('[data-mascota]').forEach((m) => { if ($$('svg.perro', m).length > 1) m.dataset.especie = S.especie === 'gato' ? 'gato' : 'perro'; });
    hooks.forEach((h) => h());
  }

  /* ---------- Menú móvil ---------- */
  const toggle = $('[data-nav-toggle]'), nav = $('[data-nav]');
  const setNav = (open) => { toggle?.setAttribute('aria-expanded', open); if (toggle) toggle.textContent = open ? 'Cerrar' : 'Menú'; nav?.classList.toggle('is-open', open); document.body.style.overflow = open ? 'hidden' : ''; };
  toggle?.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setNav(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });
  matchMedia('(min-width:1100px)').addEventListener?.('change', (e) => { if (e.matches) setNav(false); });

  /* ---------- Horario: abierto ahora (zona Madrid) ---------- */
  function madrid() {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    const dow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday];
    return { dow, h: +p.hour % 24, m: +p.minute, ymd: `${p.year}-${p.month}-${p.day}` };
  }
  function horario() {
    let H; try { H = JSON.parse(document.body.dataset.hours); } catch { return; }
    const t = madrid(), mins = t.h * 60 + t.m, tm = (s) => { const [a, b] = s.split(':').map(Number); return a * 60 + b; };
    const today = H[t.dow] || [];
    const cur = today.find(([a, b]) => mins >= tm(a) && mins < tm(b));
    const open = !!cur;
    let next = '';
    if (!open) {
      const later = today.find(([a]) => mins < tm(a));
      if (later) next = `abrimos hoy a las ${later[0]}`;
      else {
        for (let i = 1; i <= 7; i++) {
          const d = (t.dow + i) % 7, r = H[d];
          if (r && r.length) { next = `abrimos ${i === 1 ? 'mañana' : 'el ' + ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][d]} a las ${r[0][0]}`; break; }
        }
      }
    }
    $$('[data-estado]').forEach((el) => {
      const sp = $('span', el), corto = el.dataset.v === 'corto';
      el.classList.toggle('is-open', open);
      if (!sp) return;
      sp.textContent = corto ? (open ? 'Abierto' : 'Cerrado') : (open ? `Abierto ahora · hasta las ${cur[1]}` : `Cerrado · ${next}`);
    });
    $$('.parrilla .dia').forEach((d) => {
      const hoy = +d.dataset.day === t.dow;
      d.classList.toggle('is-hoy', hoy);
      if (hoy && open) { d.classList.add('is-ahora'); $(`i[data-h="${t.h}"]`, d)?.classList.add('is-now'); }
    });
  }

  /* ---------- Halloween: caduca solo ---------- */
  function halloween() {
    const t = madrid().ymd;
    $$('[data-halloween]').forEach((c) => {
      const d = c.dataset.desde, h = c.dataset.hasta, pre = $('[data-cinta-pre]', c);
      if (t > h) { c.hidden = true; return; }
      if (t < d && pre) pre.textContent = 'Pronto: ';
    });
    const on = t >= '2026-10-19' && t <= '2026-10-30';
    $$('[data-sombrero]').forEach((g) => g.setAttribute('display', on ? 'inline' : 'none'));
  }

  /* ---------- Perro de facetas: se monta ---------- */
  const build = (s) => requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add('is-built')));
  const dogs = $$('svg.perro');
  const dogIo = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { build(e.target); dogIo.unobserve(e.target); } }), { threshold: 0.35 }) : null;
  dogs.forEach((s) => {
    if (reduced || !dogIo) s.classList.add('is-built');
    else if (s.classList.contains('is-hero')) setTimeout(() => build(s), 250);
    else dogIo.observe(s);
  });

  /* ---------- Campo "¿Cómo se llama?" ---------- */
  const inp = $('[data-nombre-input]'), msg = $('[data-nombre-msg]');
  const setEsp = () => $$('[data-esp]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.esp === S.especie));
  if (inp) {
    inp.value = S.nombre;
    let prev = (S.nombre || '').charAt(0).toLowerCase();
    inp.addEventListener('input', () => {
      S.nombre = inp.value.replace(/[<>]/g, '').trim().slice(0, 24); store.set(S);
      const first = S.nombre.charAt(0).toLowerCase();
      applyName(first !== prev); prev = first;
      if (msg) msg.textContent = S.nombre ? `${S.nombre} ya es una pieza más de la familia.` : 'Se encaja en el perro como una pieza más. Solo se queda en tu móvil.';
    });
    inp.closest('form')?.addEventListener('submit', (e) => e.preventDefault());
    $$('[data-esp]').forEach((b) => b.addEventListener('click', () => {
      S.especie = b.dataset.esp; store.set(S); setEsp();
      const m = b.closest('.hero__g')?.querySelector('[data-mascota]');
      applyName(false);
      if (m && !reduced) { const vis = $$('svg.perro', m).find((x) => getComputedStyle(x).display !== 'none'); if (vis) { vis.classList.remove('is-built'); void vis.getBoundingClientRect(); build(vis); } }
    }));
    setEsp();
  }

  /* ---------- Reveal y barra ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    $$('.rv').forEach((el, i) => { el.style.transitionDelay = reduced ? '0s' : `${(i % 4) * 70}ms`; io.observe(el); });
    const hio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); hio.unobserve(e.target); } }), { threshold: 0.25 });
    $$('[data-hilo]').forEach((h) => hio.observe(h));
    const bar = $('[data-actionbar]'), foot = $('[data-footer]');
    if (bar && foot) new IntersectionObserver(([e]) => bar.classList.toggle('is-hidden', e.isIntersecting)).observe(foot);
  } else { $$('.rv,[data-hilo]').forEach((e) => e.classList.add('is-in')); }

  /* ---------- Mapa con consentimiento ---------- */
  $$('[data-map]').forEach((m) => $('[data-map-load]', m)?.addEventListener('click', () => {
    m.innerHTML = `<iframe src="${m.dataset.map}" title="Mapa de la Clínica Veterinaria La Huella" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
  }));
  $$('[data-year]').forEach((e) => { e.textContent = new Date().getFullYear(); });

  /* ---------- Tarifas: filtros ---------- */
  $$('[data-tarifas]').forEach((box) => {
    const f = $('[data-filtros]', box), bodies = $$('tbody', box);
    f?.addEventListener('click', (e) => {
      const b = e.target.closest('.filtro'); if (!b) return;
      $$('.filtro', f).forEach((x) => x.setAttribute('aria-pressed', x === b));
      bodies.forEach((tb) => { tb.hidden = !(b.dataset.g === 'todo' || tb.dataset.g === b.dataset.g); });
    });
  });

  /* ---------- Peluquería: tablero tamaño x servicio ---------- */
  const pelu = $('[data-pelu]');
  if (pelu) {
    const cells = $$('.celda', pelu), tot = $('[data-total]', pelu), det = $('[data-total-det]', pelu), link = $('[data-pelu-wa]', pelu);
    let sel = null;
    const upd = () => {
      if (!sel) { link.href = waUrl(fill('Hola, quiero pedir cita de peluquería para {m}. ¿Qué hueco tenéis?')); return; }
      const xs = $$('[data-x]:checked', pelu), total = +sel.dataset.p + xs.reduce((a, x) => a + +x.dataset.xp, 0), d = sel.dataset.d === '1' ? 'desde ' : '';
      const ex = xs.map((x) => x.dataset.x.toLowerCase());
      tot.textContent = `${d}${total} €`;
      det.textContent = `${cap(sel.dataset.s)} · ${sel.dataset.t} (${sel.dataset.kg})${ex.length ? ' + ' + ex.join(', ') : ''}. Orientativo.`;
      link.href = waUrl(fill(`Hola, quiero pedir cita de peluquería para {m}: ${sel.dataset.s}, tamaño ${sel.dataset.t.toLowerCase()} (${sel.dataset.kg})${ex.length ? ', con ' + ex.join(' y ') : ''}. Total orientativo: ${d}${total} €. ¿Qué hueco tenéis?`));
    };
    cells.forEach((c) => c.addEventListener('click', () => { sel = c; cells.forEach((x) => x.setAttribute('aria-pressed', x === c)); upd(); }));
    pelu.addEventListener('change', (e) => { if (e.target.matches('[data-x]')) upd(); });
    hooks.push(upd);
  }

  /* ---------- Castración: especie x peso ---------- */
  const cas = $('[data-cas]');
  if (cas) {
    const tot = $('[data-total]', cas), det = $('[data-total-det]', cas), link = $('[data-cas-wa]', cas);
    const upd = () => {
      const r = $('input[name=cas]:checked', cas);
      if (!r) { link.href = waUrl(fill('Hola, quiero pedir valoración previa para castrar a {m}. ¿Qué día os viene bien?')); return; }
      const d = r.dataset.d === '1' ? 'desde ' : '';
      tot.textContent = `${d}${r.dataset.p} €`;
      det.textContent = `${r.dataset.e}, ${r.dataset.kg}. Precio orientativo; el definitivo, tras la valoración.`;
      link.href = waUrl(fill(`Hola, quiero pedir valoración previa para castrar a {m} (${r.dataset.e.toLowerCase()}, ${r.dataset.kg}). Precio orientativo: ${d}${r.dataset.p} €. ¿Qué día os viene bien?`));
    };
    cas.addEventListener('change', upd); hooks.push(upd);
  }

  /* ---------- Vacunas: línea de edades ---------- */
  $$('[data-edades]').forEach((box) => {
    const tabs = $$('[data-edad]', box), panels = $$('[data-panel]', box);
    const show = (k, focus) => {
      tabs.forEach((t) => { const on = t.dataset.edad === k; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
      panels.forEach((p) => { p.hidden = p.dataset.panel !== k; });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t.dataset.edad));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
        e.preventDefault(); show(tabs[(i + d + tabs.length) % tabs.length].dataset.edad, true);
      });
    });
    show(tabs[0].dataset.edad);
  });

  /* ---------- Antes y después ---------- */
  $$('[data-comp]').forEach((c) => {
    const r = $('.comp__r', c), set = () => c.style.setProperty('--pos', r.value + '%');
    r.addEventListener('input', set); set();
  });

  /* ---------- Contacto ---------- */
  const form = $('[data-contacto]');
  if (form) {
    const nm = $('#c-m'), q = $('#c-q'), go = $('[data-contacto-go]', form), m = $('[data-contacto-msg]', form);
    nm.value = S.nombre;
    nm.addEventListener('input', () => { S.nombre = nm.value.replace(/[<>]/g, '').trim().slice(0, 24); store.set(S); if (inp) inp.value = S.nombre; applyName(false); });
    go.addEventListener('click', () => {
      const t = q.value.trim();
      const text = t ? `Hola, ${subj()}: ${t} ¿Podéis atenderle? Gracias.` : fill('Hola, tengo una duda sobre {m}. ¿Podéis ayudarme?');
      const url = waUrl(text);
      m.innerHTML = `Listo. Se abre WhatsApp con tu mensaje. Si no se abre, <a class="tlink" href="${url}" target="_blank" rel="noopener">pulsa aquí</a>.`;
      track('contacto-form'); window.open(url, '_blank', 'noopener');
    });
    form.addEventListener('submit', (e) => e.preventDefault());
  }

  horario(); halloween(); applyName(false);
  setInterval(horario, 60000);
})();
