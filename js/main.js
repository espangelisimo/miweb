/**
 * main.js — Lógica principal de Ángel Velarde Portfolio
 * Optimizado para rendimiento y accesibilidad (sin dependencias)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMenuMovil();
  initHeaderScroll();
  initScrollSpy();
  initFaqAccordion();
  initScrollReveal();
  initFormContacto();
});

/**
 * Gestión del Menú Móvil
 */
function initMenuMovil() {
  const btnAbrir = document.querySelector('.hamburguesa');
  const nav = document.querySelector('.nav-principal');
  const overlay = document.querySelector('.nav-overlay');
  const enlaces = document.querySelectorAll('.nav-enlace, .nav-cta');

  if (!btnAbrir || !nav || !overlay) return;

  const toggleMenu = (estado) => {
    const abriendo = estado !== undefined ? estado : !nav.classList.contains('activo');
    nav.classList.toggle('activo', abriendo);
    overlay.classList.toggle('activo', abriendo);
    btnAbrir.setAttribute('aria-expanded', abriendo);
    
    // Bloquear scroll del body si está abierto
    document.body.style.overflow = abriendo ? 'hidden' : '';
  };

  btnAbrir.addEventListener('click', () => toggleMenu());
  overlay.addEventListener('click', () => toggleMenu(false));

  // Cerrar al hacer clic en un enlace (para single-page)
  enlaces.forEach(enlace => {
    enlace.addEventListener('click', () => toggleMenu(false));
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('activo')) {
      toggleMenu(false);
    }
  });
}

/**
 * Efecto de scroll en la cabecera (Glassmorphism shadow)
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const checkScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll(); // Comprobación inicial
}

/**
 * ScrollSpy para resaltar el enlace activo
 */
function initScrollSpy() {
  const secciones = document.querySelectorAll('section[id]');
  const enlacesMenu = document.querySelectorAll('.nav-enlace');

  if (secciones.length === 0 || enlacesMenu.length === 0) return;

  const options = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        enlacesMenu.forEach(enlace => {
          enlace.classList.remove('activo');
          enlace.style.color = 'var(--text-muted)';
          
          if (enlace.getAttribute('href') === `#${id}`) {
            enlace.classList.add('activo');
            enlace.style.color = 'var(--accent)'; // Resaltar visualmente
          }
        });
      }
    });
  }, options);

  secciones.forEach(seccion => observer.observe(seccion));
}

/**
 * FAQ Accordion con soporte de accesibilidad (ARIA)
 */
function initFaqAccordion() {
  const botonesFaq = document.querySelectorAll('.faq-question');

  botonesFaq.forEach(boton => {
    boton.addEventListener('click', () => {
      const isExpanded = boton.getAttribute('aria-expanded') === 'true';
      
      // Opcional: Cerrar otros abiertos (accordion style)
      botonesFaq.forEach(b => {
        b.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      boton.setAttribute('aria-expanded', !isExpanded);
    });
  });
}

/**
 * Scroll Reveal Animations usando IntersectionObserver
 */
function initScrollReveal() {
  // Respetar prefers-reduced-motion
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) return;

  const elementos = document.querySelectorAll('.reveal');
  if (elementos.length === 0) return;

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Animamos solo una vez
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  });

  elementos.forEach(el => observer.observe(el));
}

/**
 * Manejo asíncrono del formulario (Formspree fallback)
 */
function initFormContacto() {
  const form = document.getElementById('formulario-contacto');
  const divEstado = document.getElementById('form-estado');

  if (!form || !divEstado) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const textoOriginal = btn.innerHTML;
    
    // UI state
    btn.innerHTML = 'Enviando...';
    btn.disabled = true;
    divEstado.textContent = '';
    divEstado.className = 'form-status';

    try {
      const data = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        divEstado.textContent = '¡Mensaje enviado con éxito! Te responderé pronto.';
        divEstado.classList.add('exito');
        form.reset();
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      divEstado.textContent = 'Hubo un problema al enviar el mensaje. Por favor, escríbeme por WhatsApp o email.';
      divEstado.classList.add('error');
    } finally {
      btn.innerHTML = textoOriginal;
      btn.disabled = false;
    }
  });
}
