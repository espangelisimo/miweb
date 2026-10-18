/* Nudo Salud — JS vanilla, sin dependencias. Trazos generados + selector + tablero + reserva por WhatsApp */
/* Generador de trazos de pincel. Devuelve [[d, multiplicadorGrosor], ...] */
function tzRng(seed) { let s = ((seed * 2654435761) >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function tzF(n) { return Math.round(n * 10) / 10; }
function tzSmooth(p) {
  let d = 'M' + tzF(p[0][0]) + ' ' + tzF(p[0][1]);
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
    d += 'C' + tzF(b[0] + (c[0] - a[0]) / 6) + ' ' + tzF(b[1] + (c[1] - a[1]) / 6) + ' ' + tzF(c[0] - (e[0] - b[0]) / 6) + ' ' + tzF(c[1] - (e[1] - b[1]) / 6) + ' ' + tzF(c[0]) + ' ' + tzF(c[1]);
  }
  return d;
}
function genTrazo(kind, w, h, seed, sw) {
  const out = [];
  for (let pass = 0; pass < 2; pass++) {
    const r = tzRng(seed * 7 + pass * 13 + 1), p1 = r() * 6.28, p2 = r() * 6.28, m = sw * 0.7 + 1, pts = [];
    if (kind === 'ring') {
      const cx = w / 2, cy = h / 2, rx = Math.max(w / 2 - m, 4), ry = Math.max(h / 2 - m, 4);
      const a0 = -2.3 + pass * 0.3 + r() * 0.3, sweep = Math.PI * 2 * 1.08;
      for (let i = 0; i <= 72; i++) {
        const t = i / 72, a = a0 + sweep * t;
        const k = 1 + 0.035 * Math.sin(a * 2 + p1) + 0.025 * Math.sin(a * 5 + p2) + t * 0.075 - (pass ? 0.025 : 0);
        const ca = Math.cos(a), sa = Math.sin(a), ex = 2 / 3.2; pts.push([cx + rx * k * Math.sign(ca) * Math.pow(Math.abs(ca), ex), cy + ry * k * Math.sign(sa) * Math.pow(Math.abs(sa), ex)]);
      }
      out.push([tzSmooth(pts), pass ? 0.5 : 1]);
    } else if (kind === 'underline') {
      const n = 14, y0 = h * 0.82 + (pass ? sw * 0.9 : 0), x0 = m + (pass ? w * 0.06 : 0), x1 = w - m - (pass ? w * 0.1 : 0);
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        pts.push([x0 + (x1 - x0) * t, y0 + Math.sin(t * 5 + p1) * h * 0.05 - t * h * 0.08 + (r() - 0.5) * h * 0.05]);
      }
      out.push([tzSmooth(pts), pass ? 0.5 : 1]);
    } else if (kind === 'strike') {
      const n = pass ? 4 : 6;
      for (let i = 0; i <= n; i++) {
        const t = i / n, up = i % 2 === 0;
        pts.push([m + (w - 2 * m) * t + (r() - 0.5) * w * 0.03, (up ? h * 0.22 : h * 0.78) + (r() - 0.5) * h * 0.1]);
      }
      out.push([tzSmooth(pts), pass ? 0.55 : 1]);
    } else if (kind === 'arrow') {
      if (pass === 0) {
        const n = 12;
        for (let i = 0; i <= n; i++) { const t = i / n; pts.push([m + (w - 2 * m - sw * 3) * t, h * 0.72 - h * 0.42 * Math.pow(t, 1.4) + Math.sin(t * 6 + p1) * h * 0.04]); }
        out.push([tzSmooth(pts), 1]);
      } else {
        const tx = w - m - sw, ty = h * 0.3;
        out.push(['M' + tzF(tx - w * 0.16) + ' ' + tzF(ty - h * 0.02) + 'L' + tzF(tx) + ' ' + tzF(ty) + 'L' + tzF(tx - w * 0.07) + ' ' + tzF(ty + h * 0.36), 1]);
      }
    }
  }
  return out;
}

(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* Menú móvil */
  const toggle = $('[data-nav-toggle]'), nav = $('[data-nav]');
  const setNav = (open) => { toggle?.setAttribute('aria-expanded', open); toggle && (toggle.textContent = open ? 'Cerrar' : 'Menú'); nav?.classList.toggle('is-open', open); document.body.style.overflow = open ? 'hidden' : ''; };
  toggle?.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setNav(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  /* Aparición */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  $$('.sec-head, .zero, .programa, .rev').forEach((el) => { el.classList.add('reveal'); io.observe(el); });

  /* Barra móvil: se oculta al llegar al pie */
  const bar = $('[data-actionbar]'), foot = $('[data-footer]');
  if (bar && foot) new IntersectionObserver(([e]) => bar.classList.toggle('is-hidden', e.isIntersecting)).observe(foot);

  /* Horario: abierto ahora (solo si hay data-hours) */
  const hoursEl = $('[data-hours]');
  if (hoursEl) {
    try {
      const hours = JSON.parse(hoursEl.dataset.hours), now = new Date(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
      const tm = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      $(`tr[data-day="${day}"]`, hoursEl)?.classList.add('is-today');
      const open = (hours[day] || []).some(([a, b]) => mins >= tm(a) && mins < tm(b));
      const badge = $('[data-open-now]');
      if (badge) { badge.textContent = open ? 'Abierto ahora' : 'Cerrado ahora'; badge.hidden = false; if (open) { badge.classList.add('tz'); badge.dataset.tz = 'underline'; } }
    } catch { /* sin estado */ }
  }

  /* Mapa con consentimiento */
  $$('[data-map]').forEach((map) => $('[data-map-load]', map)?.addEventListener('click', () => {
    map.innerHTML = `<iframe src="${map.dataset.map}" title="Mapa de Nudo Salud" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
  }));

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* Cuenta atrás de la prueba gratis */
  $$('[data-countdown]').forEach((el) => {
    const end = new Date(el.dataset.countdown + 'T23:59:59'), days = Math.ceil((end - new Date()) / 864e5);
    if (days > 1) el.innerHTML = `<b class="num">${days}</b> días para tu clase gratis`;
    else if (days === 1) el.innerHTML = '<b>1</b> día: último para tu clase gratis';
    else if (days === 0) el.textContent = 'Hoy es el último día de la prueba gratis';
    else el.textContent = 'Pregúntanos si sigue la prueba gratuita';
  });

  /* Medición (GA4 / Plausible si existen) */
  const track = (n) => { if (typeof window.gtag === 'function') window.gtag('event', 'contacto', { metodo: n }); if (typeof window.plausible === 'function') window.plausible('Contacto', { props: { metodo: n } }); };
  $$('[data-track]').forEach((el) => el.addEventListener('click', () => track(el.dataset.track)));

  /* ---------- TRAZOS ---------- */
  const TZ = $$('[data-tz]');
  function buildTz(el, i) {
    let svg = el.querySelector(':scope > .tz__svg');
    if (!svg) { svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'tz__svg'); svg.setAttribute('aria-hidden', 'true'); el.appendChild(svg); }
    const r = svg.getBoundingClientRect(), w = Math.round(r.width), h = Math.round(r.height);
    if (w < 4 || h < 4) return;
    const key = w + 'x' + h; if (svg.dataset.k === key) return; svg.dataset.k = key;
    const fs = parseFloat(getComputedStyle(el).fontSize) || 16, sw = Math.max(2.5, Math.min(fs * 0.075, 11));
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.setAttribute('preserveAspectRatio', 'none'); svg.textContent = '';
    genTrazo(el.dataset.tz, w, h, i * 3 + 1, sw).forEach(([d, m]) => {
      const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('stroke-width', (sw * m).toFixed(1)); svg.appendChild(p);
      p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 2);
    });
  }
  const buildAll = () => TZ.forEach(buildTz);
  const tzIo = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { const d = +(e.target.dataset.tzDelay || 0); setTimeout(() => e.target.classList.add('is-in'), reduced ? 0 : d); tzIo.unobserve(e.target); }
  }), { threshold: 0.6 });
  const arrow = $('[data-tz-static]');
  const start = () => {
    buildAll();
    TZ.forEach((el) => { if (el.hasAttribute('data-tz-manual')) return; tzIo.observe(el); });
    if (arrow) {
      const sw = 4; genTrazo('arrow', 150, 60, 11, sw).forEach(([d, m]) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('stroke-width', sw * m); arrow.appendChild(p); p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 2); });
      new IntersectionObserver(([e], o) => { if (e.isIntersecting) { arrow.classList.add('is-in'); o.disconnect(); } }, { threshold: 0.6 }).observe(arrow);
    }
    // Filas de áreas: el trazo subraya al pasar o enfocar
    $$('.area').forEach((a) => {
      const t = $('.tz', a); if (!t) return;
      const on = () => t.classList.add('is-in'), off = () => t.classList.remove('is-in');
      a.addEventListener('mouseenter', on); a.addEventListener('focus', on); a.addEventListener('mouseleave', off); a.addEventListener('blur', off);
    });
    heroInit();
    // Estados iniciales de chips/filtros ya activos
    $$('.filtro[aria-pressed=true] .tz').forEach((t) => t.classList.add('is-in'));
  };
  document.fonts?.addEventListener?.('loadingdone', buildAll); addEventListener('load', () => { setTimeout(buildAll, 400); setTimeout(buildAll, 1500); });
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(buildAll, 200); });

  /* ---------- HERO: el nudo se ordena ---------- */
  function heroInit() {
    const hero = $('[data-hero]'), list = $('[data-nudo-list]'), ring = $('[data-tz-hero]');
    if (!hero || !list) return;
    const draw = () => ring?.classList.add('is-in');
    if (reduced) { draw(); return; }
    const hr = hero.getBoundingClientRect(), items = [...list.children], rnd = (a, b) => a + Math.random() * (b - a);
    items.forEach((li) => {
      const r = li.getBoundingClientRect();
      const dx = rnd(hr.left + 10, hr.right - r.width - 10) - r.left, dy = rnd(hr.top + 10, hr.bottom - r.height - 10) - r.top;
      li.style.transform = `translate(${dx}px,${dy}px) rotate(${rnd(-38, 38)}deg) scale(${rnd(0.7, 1.9)})`;
      li.style.color = '#6d6a62';
    });
    setTimeout(() => {
      list.classList.add('is-settling');
      items.forEach((li) => { li.style.transform = 'none'; li.style.color = ''; });
      setTimeout(draw, 1300);
    }, 650);
  }

  /* ---------- SELECTOR "¿Cuál es tu nudo?" ---------- */
  const dataEl = $('#nudo-data');
  const DATA = dataEl ? JSON.parse(dataEl.textContent) : null;
  const fmtDate = new Date().toLocaleDateString('es-ES');
  let recetaN = 0;
  $$('[data-chips]').forEach((chips) => {
    const sec = chips.closest('.selector'), receta = $('[data-receta]', sec);
    chips.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-situ]'); if (!btn || !DATA) return;
      const s = DATA.situ.find((x) => x.id === btn.dataset.situ);
      $$('[data-situ]', chips).forEach((b) => { const on = b === btn; b.setAttribute('aria-pressed', on); $('.tz', b)?.classList.toggle('is-in', on); });
      recetaN++;
      receta.classList.remove('receta--vacia');
      receta.innerHTML = `<div class="receta__h"><span class="lbl">Receta Nudo nº ${String(recetaN).padStart(2, '0')}</span><span class="lbl">${fmtDate}</span></div>
<dl><dt>Tu nudo</dt><dd class="big">${s.t}</dd><dt>Servicio</dt><dd><a href="${s.url}">${s.area}</a></dd><dt>Por qué</dt><dd>${s.why}</dd><dt>Bono</dt><dd>${s.bonoTxt}${s.alt ? `<br><small class="mute">${s.alt}</small>` : ''}</dd><dt>Precio</dt><dd class="precio">${s.price}</dd></dl>
<div class="receta__f"><a class="btn btn--y arrow" href="https://wa.me/${DATA.wa}?text=${encodeURIComponent(s.msg)}" data-track="whatsapp">Reservar por WhatsApp</a><a class="tlink" href="${s.url}">Ver ${s.area}</a></div>`;
      const r = receta.getBoundingClientRect();
      if (r.top > innerHeight - 120 || r.bottom < 0) receta.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- TABLERO: filtros ---------- */
  $$('[data-filtros]').forEach((f) => {
    const board = $('[data-tablero]', f.parentElement);
    f.addEventListener('click', (e) => {
      const b = e.target.closest('.filtro'); if (!b) return;
      $$('.filtro', f).forEach((x) => { const on = x === b; x.setAttribute('aria-pressed', on); $('.tz', x)?.classList.toggle('is-in', on); });
      $$('.grupo', board).forEach((g) => { g.hidden = b.dataset.g !== 'todo' && g.dataset.g !== b.dataset.g; });
      // En móvil la fila de filtros se desplaza: centra el filtro elegido
      if (f.scrollWidth > f.clientWidth) { const fr = f.getBoundingClientRect(), br = b.getBoundingClientRect(); f.scrollTo({ left: f.scrollLeft + br.left - fr.left - (f.clientWidth - br.width) / 2, behavior: reduced ? 'auto' : 'smooth' }); }
    });
  });

  /* ---------- RESERVAR en 4 pasos (sin app, cualquier navegador) ---------- */
  const form = $('[data-rsv]');
  if (form && DATA) {
    const steps = $$('[data-paso]', form), prog = $$('.rsv__prog li', form), prev = $('[data-prev]', form), next = $('[data-next]', form), err = $('[data-err]', form), res = $('[data-res]', form);
    const S = { area: '', bono: '', franja: '' }; let cur = 0;
    const opt = (name, val, label, small = '') => `<label class="opt"><input type="radio" name="${name}" value="${val}"><span>${label}${small ? `<small>${small}</small>` : ''}</span></label>`;
    const areas = [...DATA.groups, { id: 'podologia', t: 'Podología' }];
    $('[data-opts=area]', form).innerHTML = areas.map((g) => opt('area', g.id, g.t)).join('');
    $('[data-opts=franja]', form).innerHTML = [['manana', 'Mañana'], ['tarde', 'Tarde'], ['igual', 'Me da igual']].map(([v, l]) => opt('franja', v, l)).join('');
    const fillBonos = () => {
      const box = $('[data-opts=bono]', form);
      box.innerHTML = S.area === 'podologia' ? opt('bono', 'consulta', 'Consultar servicios y precios') : DATA.items.filter((i) => i.g === S.area).map((i) => opt('bono', i.id, i.n, `${i.s} · ${i.p}`)).join('');
    };
    const show = (n, user) => {
      cur = n;
      if (user && form.getBoundingClientRect().top < 70) form.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
      steps.forEach((s, i) => { s.hidden = i !== n; });
      prog.forEach((p, i) => { p.classList.toggle('is-on', i === n); p.classList.toggle('is-done', i < n); });
      prev.hidden = n === 0; next.textContent = n === 3 ? 'Preparar WhatsApp' : 'Siguiente →'; err.textContent = ''; res.hidden = true;
      const f = $('input:checked', steps[n]) || $('input', steps[n]); f?.focus({ preventScroll: true });
    };
    form.addEventListener('change', (e) => { if (e.target.name in S) { S[e.target.name] = e.target.value; if (e.target.name === 'area') { S.bono = ''; fillBonos(); } } });
    prev.addEventListener('click', () => show(Math.max(0, cur - 1), true));
    next.addEventListener('click', () => {
      const need = [S.area, S.bono, S.franja][cur];
      if (cur < 3) { if (!need) { err.textContent = ''; res.hidden = false; res.textContent = 'Elige una opción para seguir.'; return; } res.hidden = true; show(cur + 1, true); return; }
      const name = $('#r-nombre').value.trim();
      if (!name) { err.textContent = 'Dinos cómo te llamas.'; $('#r-nombre').focus(); return; }
      const it = DATA.items.find((i) => i.id === S.bono);
      const what = S.bono === 'consulta' ? 'podología (servicios y precios)' : it.g === 'prueba' ? it.n.toLowerCase().replace('prueba gratuita · ', 'la prueba gratuita de ') : `el bono ${it.n} (${it.s}, ${it.p})`;
      const fr = { manana: 'por la mañana', tarde: 'por la tarde', igual: 'a cualquier hora' }[S.franja];
      const url = `https://wa.me/${DATA.wa}?text=${encodeURIComponent(`Hola, soy ${name}. Quiero reservar ${what}. Me viene mejor ${fr}. ¿Qué plazas hay?`)}`;
      res.hidden = false; res.innerHTML = `Listo, ${name.replace(/[<>&]/g, '')}. Se abre WhatsApp con tu mensaje. Si no se abre, <a href="${url}" target="_blank" rel="noopener"><strong>pulsa aquí</strong></a>.`;
      track('reserva-whatsapp'); window.open(url, '_blank', 'noopener');
    });
    form.addEventListener('submit', (e) => e.preventDefault());
    const pre = new URLSearchParams(location.search).get('area');
    if (pre && areas.some((a) => a.id === pre)) { const r = $(`input[name=area][value=${pre}]`, form); r.checked = true; S.area = pre; fillBonos(); show(1); } else show(0);
    // en show(0) el foco no debe saltar al cargar la página
    if (document.activeElement && document.activeElement.matches('.opt input')) document.activeElement.blur();
  }

  (document.fonts?.ready || Promise.resolve()).then(() => setTimeout(start, 30));
})();
