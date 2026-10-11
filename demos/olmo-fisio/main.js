/* ============================================================
   Olmo Fisioterapia — main.js
   Funcionalidades: menú móvil, FAQ, reveal scroll,
   formulario Web3Forms, banner de cookies, año dinámico
   ============================================================ */

(function () {
  'use strict';

  /* ── AÑO DINÁMICO ──────────────────────────────────────── */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ── STICKY HEADER ─────────────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── MENÚ MÓVIL ─────────────────────────────────────────── */
  const btnMenu    = document.getElementById('btn-menu');
  const mobileNav  = document.getElementById('mobile-nav');
  const btnClose   = document.getElementById('mobile-nav-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function openMenu() {
    if (!mobileNav || !btnMenu) return;
    mobileNav.classList.add('open');
    btnMenu.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Foco al primer enlace
    const first = mobileNav.querySelector('.mobile-nav-link, .mobile-nav-close');
    if (first) first.focus();
  }

  function closeMenu() {
    if (!mobileNav || !btnMenu) return;
    mobileNav.classList.remove('open');
    btnMenu.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    btnMenu.focus();
  }

  if (btnMenu) btnMenu.addEventListener('click', openMenu);
  if (btnClose) btnClose.addEventListener('click', closeMenu);

  // Cerrar al pulsar un enlace
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Cerrar al pulsar fuera del panel
  if (mobileNav) {
    mobileNav.addEventListener('click', e => {
      if (e.target === mobileNav) closeMenu();
    });
  }

  // Cerrar con ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) {
      closeMenu();
    }
  });

  /* ── SCROLL SUAVE para anclas ───────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── FAQ ACORDEÓN ───────────────────────────────────────── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('open');

      // Cierra todos
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Abre el seleccionado si no estaba abierto
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── SERVICIOS: LEER MÁS ────────────────────────────────── */
  document.querySelectorAll('.servicio-expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.servicio-card');
      if (!card) return;
      const expanded = card.classList.toggle('expanded');
      btn.textContent = expanded ? 'Leer menos' : 'Leer más';
      btn.setAttribute('aria-expanded', expanded.toString());
    });
  });

  /* ── REVEAL ON SCROLL ───────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  } else {
    // Fallback sin IntersectionObserver
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  /* ── FORMULARIO: WEB3FORMS ──────────────────────────────── */
  const form = document.getElementById('form-contacto');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      // Validación cliente
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        const group = field.closest('.form-group');
        if (!group) return;
        const errorEl = group.querySelector('.form-error');
        let fieldValid = true;

        if (!field.value.trim()) {
          fieldValid = false;
          if (errorEl) errorEl.textContent = 'Este campo es obligatorio.';
        } else if (field.type === 'email') {
          const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRx.test(field.value.trim())) {
            fieldValid = false;
            if (errorEl) errorEl.textContent = 'Escribe un correo electrónico válido.';
          }
        } else if (field.type === 'tel') {
          const telRx = /^[+\d\s().-]{7,}$/;
          if (!telRx.test(field.value.trim())) {
            fieldValid = false;
            if (errorEl) errorEl.textContent = 'Escribe un teléfono de contacto válido.';
          }
        } else if (field.type === 'checkbox' && !field.checked) {
          fieldValid = false;
          if (errorEl) errorEl.textContent = 'Debes aceptar la política de privacidad.';
        }

        group.classList.toggle('has-error', !fieldValid);
        if (!fieldValid) valid = false;
      });

      if (!valid) return;

      // Envío
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';
      }

      try {
        const data = new FormData(form);
        const res  = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: data,
        });
        const json = await res.json();

        if (json.success) {
          // Redirige a gracias.html
          window.location.href = 'gracias.html';
        } else {
          throw new Error('Error en Web3Forms');
        }
      } catch {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar consulta';
        }
        const errMsg = form.querySelector('.form-send-error');
        if (errMsg) errMsg.style.display = 'block';
      }
    });

    // Limpia error al editar
    form.querySelectorAll('.form-control').forEach(field => {
      field.addEventListener('input', () => {
        const group = field.closest('.form-group');
        if (group) group.classList.remove('has-error');
      });
    });
    form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const group = cb.closest('.form-group');
        if (group) group.classList.remove('has-error');
      });
    });
  }

  /* ── BANNER DE COOKIES ──────────────────────────────────── */
  const COOKIE_KEY = 'fisiocookies';
  const cookieBanner = document.getElementById('cookie-banner');

  function showCookieBanner() {
    if (!cookieBanner) return;
    if (localStorage.getItem(COOKIE_KEY)) return;
    // Retardo mínimo para que no interrumpa la carga visual
    setTimeout(() => cookieBanner.classList.add('visible'), 800);
  }

  function hideCookieBanner(choice) {
    if (!cookieBanner) return;
    localStorage.setItem(COOKIE_KEY, choice);
    cookieBanner.classList.remove('visible');
  }

  const btnAccept = document.getElementById('cookie-accept');
  const btnReject = document.getElementById('cookie-reject');
  if (btnAccept) btnAccept.addEventListener('click', () => hideCookieBanner('accepted'));
  if (btnReject) btnReject.addEventListener('click', () => hideCookieBanner('rejected'));

  showCookieBanner();

})();
