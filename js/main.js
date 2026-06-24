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
const hamburguesa   = document.querySelector('.hamburguesa');
const navPrincipal  = document.querySelector('#menu-principal');
const navOverlay    = document.querySelector('#nav-overlay');

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

function cerrarMenu() {
  hamburguesa.setAttribute('aria-expanded', 'false');
  hamburguesa.setAttribute('aria-label', 'Abrir menú de navegación');
  navPrincipal.classList.remove('abierto');
  navPrincipal.setAttribute('inert', '');
  navOverlay.classList.remove('activo');
  navOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-abierto');
  hamburguesa.focus();
}

if (hamburguesa && navPrincipal && navOverlay) {
  /* Inicializar inert en móvil */
  const esMobil = () => getComputedStyle(hamburguesa).display !== 'none';
  if (esMobil()) navPrincipal.setAttribute('inert', '');

  hamburguesa.addEventListener('click', () => {
    hamburguesa.getAttribute('aria-expanded') === 'true' ? cerrarMenu() : abrirMenu();
  });

  /* Cerrar al pulsar el overlay */
  navOverlay.addEventListener('click', cerrarMenu);

  /* Cerrar con Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && hamburguesa.getAttribute('aria-expanded') === 'true') {
      cerrarMenu();
    }
  });

  /* Cerrar al navegar a una sección (en móvil) */
  navPrincipal.querySelectorAll('a').forEach(enlace =>
    enlace.addEventListener('click', () => {
      if (esMobil() && hamburguesa.getAttribute('aria-expanded') === 'true') {
        cerrarMenu();
      }
    })
  );

  /* Al pasar a escritorio (resize), quitar inert y limpiar estado */
  window.addEventListener('resize', () => {
    if (!esMobil()) {
      navPrincipal.removeAttribute('inert');
      document.body.classList.remove('menu-abierto');
    } else if (hamburguesa.getAttribute('aria-expanded') === 'false') {
      navPrincipal.setAttribute('inert', '');
    }
  }, { passive: true });
}


/* ─── Sección activa en la nav (IntersectionObserver) ───────────── */
const secciones  = document.querySelectorAll('main section[id]');
const navEnlaces = document.querySelectorAll('.nav-enlace');

if (secciones.length && navEnlaces.length) {
  function marcarActivo(id) {
    navEnlaces.forEach(enlace =>
      enlace.classList.toggle('activo', enlace.getAttribute('href') === `#${id}`)
    );
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) marcarActivo(entry.target.id);
    });
  }, {
    /* Activa cuando la sección entra en la mitad superior de la ventana,
       descontando el alto del header sticky */
    rootMargin: '-64px 0px -50% 0px',
    threshold: 0
  });

  secciones.forEach(s => observer.observe(s));
}


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
