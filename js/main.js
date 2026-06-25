'use strict';

/* ─── Año automático en el footer ───────────────────────────────── */
const footerAnio = document.querySelector('.footer-anio');
if (footerAnio) footerAnio.textContent = new Date().getFullYear();


/* ─── Sombra del header al hacer scroll ─────────────────────────── */
const header = document.querySelector('.site-header');

if (header) {
  const actualizarHeader = () =>
    header.classList.toggle('con-sombra', window.scrollY > 10);
  window.addEventListener('scroll', actualizarHeader, { passive: true });
  actualizarHeader();
}


/* ─── Menú móvil ─────────────────────────────────────────────────── */
const hamburguesa  = document.querySelector('.hamburguesa');
const navPrincipal = document.querySelector('#menu-principal');
const navOverlay   = document.querySelector('#nav-overlay');

function abrirMenu() {
  hamburguesa.setAttribute('aria-expanded', 'true');
  hamburguesa.setAttribute('aria-label', 'Cerrar menú de navegación');
  navPrincipal.classList.add('abierto');
  navPrincipal.removeAttribute('inert');
  navOverlay.classList.add('activo');
  navOverlay.removeAttribute('aria-hidden');
  document.body.classList.add('menu-abierto');
  navPrincipal.querySelector('.nav-enlace')?.focus();
}

/* enfocarBoton: true cuando se cierra via Escape/overlay (el foco vuelve al disparador)
   false cuando se cierra via clic en enlace (el foco sigue al destino del ancla) */
function cerrarMenu(enfocarBoton = true) {
  hamburguesa.setAttribute('aria-expanded', 'false');
  hamburguesa.setAttribute('aria-label', 'Abrir menú de navegación');
  navPrincipal.classList.remove('abierto');
  navPrincipal.setAttribute('inert', '');
  navOverlay.classList.remove('activo');
  navOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-abierto');
  if (enfocarBoton) hamburguesa.focus();
}

if (hamburguesa && navPrincipal && navOverlay) {
  const esMobil = () => getComputedStyle(hamburguesa).display !== 'none';
  if (esMobil()) navPrincipal.setAttribute('inert', '');

  hamburguesa.addEventListener('click', () => {
    hamburguesa.getAttribute('aria-expanded') === 'true' ? cerrarMenu() : abrirMenu();
  });

  /* Botón cerrar dentro del drawer */
  const navCerrar = navPrincipal.querySelector('.nav-cerrar');
  if (navCerrar) navCerrar.addEventListener('click', () => cerrarMenu());

  navOverlay.addEventListener('click', () => cerrarMenu());

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && hamburguesa.getAttribute('aria-expanded') === 'true') cerrarMenu();
  });

  /* Cerrar al hacer clic en un enlace. */
  navPrincipal.querySelectorAll('a').forEach(enlace =>
    enlace.addEventListener('click', e => {
      if (!esMobil() || hamburguesa.getAttribute('aria-expanded') !== 'true') return;

      const href = enlace.getAttribute('href');

      /* Cerramos el menú sin devolver el foco al botón (el foco sigue al ancla) */
      cerrarMenu(false);

      /* Solo para anclas internas reales: prevenimos el salto y hacemos scroll suave.
         Enlaces externos o a otra página navegan de forma nativa. */
      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        const destino = document.querySelector(href);
        if (destino) {
          requestAnimationFrame(() => {
            destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, '', href);
          });
        }
      }
    })
  );

  window.addEventListener('resize', () => {
    if (!esMobil()) {
      navPrincipal.removeAttribute('inert');
      document.body.classList.remove('menu-abierto');
    } else if (hamburguesa.getAttribute('aria-expanded') === 'false') {
      navPrincipal.setAttribute('inert', '');
    }
  }, { passive: true });
}


/* ─── Sección activa en la nav ───────────────────────────────────── */
/* Scroll listener en lugar de IntersectionObserver para evitar race
   conditions con la detección de la sección más cercana. */
(function initNavActiva() {
  const secciones  = [...document.querySelectorAll('main section[id]')];
  const navEnlaces = document.querySelectorAll('.nav-enlace');
  if (!secciones.length || !navEnlaces.length) return;

  function actualizar() {
    const umbral = (header?.offsetHeight ?? 64) + 10;
    let activa = null;
    /* Recorre en orden DOM: la última sección cuyo top ha pasado el umbral gana */
    for (const s of secciones) {
      if (s.getBoundingClientRect().top <= umbral) activa = s;
    }
    navEnlaces.forEach(e =>
      e.classList.toggle('activo', !!activa && e.getAttribute('href') === `#${activa.id}`)
    );
  }

  window.addEventListener('scroll', actualizar, { passive: true });
  actualizar();
})();


/* ─── FAQ: acordeón animado con cierre automático ───────────────── */
/* CSS controla la animación (grid-template-rows: 0fr ↔ 1fr).
   JS solo gestiona la clase .abierto (no <details>/<summary> para
   evitar interferencias con el UA de Chrome). */
(function initFaq() {
  const lista = document.querySelector('.faq-lista');
  if (!lista) return;

  lista.setAttribute('data-faq-anim', '');
  const items = Array.from(lista.querySelectorAll('.faq-item'));

  items.forEach(item => {
    const btn = item.querySelector('.faq-pregunta');
    btn.setAttribute('aria-expanded', item.classList.contains('abierto') ? 'true' : 'false');
  });

  items.forEach(item => {
    item.querySelector('.faq-pregunta').addEventListener('click', () => {
      const estaAbierto = item.classList.contains('abierto');

      /* Cerrar todos */
      items.forEach(otro => {
        otro.classList.remove('abierto');
        otro.querySelector('.faq-pregunta').setAttribute('aria-expanded', 'false');
      });

      /* Abrir el pulsado si estaba cerrado */
      if (!estaAbierto) {
        item.classList.add('abierto');
        item.querySelector('.faq-pregunta').setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


/* ─── Animaciones de aparición al hacer scroll ───────────────────── */
(function initScrollAnim() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll([
    '.seccion-cabecera',
    '.proceso-paso',
    '.sobre-mi-inner',
    '.faq-item',
    '.contacto-info',
    '.contacto-formulario'
  ].join(', ')).forEach(el => {
    el.classList.add('aparece');
    observer.observe(el);
  });

  document.querySelectorAll(
    '.servicios-grid > *, .portafolio-grid > *, .testimonios-grid > *'
  ).forEach(el => {
    const idx = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = (idx * 70) + 'ms';
    el.classList.add('aparece');
    observer.observe(el);
  });
})();


/* ─── Banner de cookies ──────────────────────────────────────────── */
(function initCookies() {
  if (localStorage.getItem('cookies-ok')) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Aviso de cookies');
  banner.innerHTML =
    '<p class="cookie-texto">' +
      'Esta web usa únicamente cookies técnicas necesarias para su funcionamiento. ' +
      'No rastreamos tu actividad ni compartimos datos con terceros.' +
    '</p>' +
    '<div class="cookie-acciones">' +
      '<button class="btn btn--cta cookie-btn-aceptar">Entendido</button>' +
    '</div>';

  banner.querySelector('.cookie-btn-aceptar').addEventListener('click', () => {
    localStorage.setItem('cookies-ok', '1');
    banner.classList.remove('cookie-banner--visible');
    banner.classList.add('cookie-banner--oculto');
    banner.addEventListener('transitionend', () => banner.remove(), { once: true });
  });

  document.body.appendChild(banner);

  /* Pequeño retraso para que la transición de entrada sea visible */
  requestAnimationFrame(() => requestAnimationFrame(() =>
    banner.classList.add('cookie-banner--visible')
  ));
})();


/* ─── Formulario de contacto (Formspree via fetch) ──────────────── */
const form       = document.getElementById('formulario-contacto');
const formEstado = document.getElementById('form-estado');

if (form && formEstado) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const boton = form.querySelector('[type="submit"]');
    const textoOriginal = boton.textContent.trim();
    boton.disabled = true;
    boton.textContent = 'Enviando…';
    formEstado.className = 'form-estado';
    formEstado.textContent = '';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        formEstado.className = 'form-estado form-estado--ok';
        formEstado.textContent = '¡Mensaje enviado! Te respondo en menos de 24 h.';
        form.reset();
      } else {
        throw new Error();
      }
    } catch {
      formEstado.className = 'form-estado form-estado--err';
      formEstado.textContent = 'Algo salió mal. Escríbeme directamente por WhatsApp o al correo.';
    } finally {
      boton.disabled = false;
      boton.innerHTML = textoOriginal +
        '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
    }
  });
}
