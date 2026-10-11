/* ============================================================
   VELIA CLÍNICA DENTAL — Main JS v2
   ============================================================ */

/* ── Navbar: transparente en hero, sólido al hacer scroll ── */
const navbar = document.querySelector('.navbar');
const hasFullHero = !!document.querySelector('.hero');

function updateNavbar() {
  if (!navbar) return;
  if (!hasFullHero || window.scrollY > 60) {
    navbar.classList.add('navbar--solid');
    navbar.classList.remove('navbar--transparent');
  } else {
    navbar.classList.remove('navbar--solid');
    navbar.classList.add('navbar--transparent');
  }
}
window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

/* ── Menú móvil ── */
const toggle = document.querySelector('.navbar__toggle');
if (toggle) {
  function closeMenu() {
    navbar.classList.remove('navbar--open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openMenu() {
    navbar.classList.add('navbar--open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  toggle.addEventListener('click', () => {
    navbar.classList.contains('navbar--open') ? closeMenu() : openMenu();
  });

  /* Cerrar al pulsar el overlay */
  const overlay = navbar.querySelector('.navbar__overlay');
  if (overlay) overlay.addEventListener('click', closeMenu);

  /* Cerrar al pulsar un enlace del panel móvil */
  navbar.querySelectorAll('.navbar__mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ── Enlace activo en la navbar ── */
(function markActiveLink() {
  const path = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('.navbar__link, .navbar__dropdown-link, .navbar__mobile-link').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href && href !== '#' && path.includes(href.replace(/^\./, '').replace('.html', ''))) {
      a.classList.add('active');
    }
  });
})();

/* ── Scroll reveal ── */
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ── FAQ accordion ── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    /* Cierra todos */
    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    /* Abre el actual si estaba cerrado */
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ── Cookie banner ── */
(function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  if (!localStorage.getItem('cookiesAccepted')) {
    setTimeout(() => banner.classList.add('visible'), 1400);
  }
  document.getElementById('cookieAccept')?.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', '1');
    banner.classList.remove('visible');
  });
  document.getElementById('cookieReject')?.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', '0');
    banner.classList.remove('visible');
  });
})();

/* ── Mini-formulario captación ── */
(function initMiniForm() {
  const form = document.getElementById('mini-form');
  if (!form) return;
  const successDiv = document.getElementById('mini-form-success');

  function validateField(input, testFn) {
    const group = input.closest('.form-group') || input.closest('.form-check');
    const errorEl = document.getElementById(input.id + '-error');
    const ok = testFn(input.value.trim());
    input.classList.toggle('error', !ok);
    input.classList.toggle('success', ok);
    if (group) group.classList.toggle('has-error', !ok);
    if (errorEl) errorEl.style.display = ok ? 'none' : 'block';
    return ok;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre   = form.querySelector('#mini-nombre');
    const telefono = form.querySelector('#mini-telefono');
    const rgpd     = form.querySelector('#mini-rgpd');
    const rgpdErr  = document.getElementById('mini-rgpd-error');

    const v1 = validateField(nombre,   v => v.length >= 2);
    const v2 = validateField(telefono, v => /^[\d\s+\-()٠-٩]{9,}$/.test(v));
    const v3 = rgpd.checked;
    if (rgpdErr) rgpdErr.style.display = v3 ? 'none' : 'block';

    if (v1 && v2 && v3 && successDiv) {
      form.style.display = 'none';
      successDiv.style.display = 'block';
    }
  });

  ['#mini-nombre', '#mini-telefono'].forEach(sel => {
    const el = form.querySelector(sel);
    if (el) el.addEventListener('blur', () => el.dispatchEvent(new Event('change')));
  });
})();

/* ── Anchor scroll con offset de navbar ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
      10
    ) || 72;
    window.scrollTo({ top: target.offsetTop - offset - 16, behavior: 'smooth' });
  });
});
