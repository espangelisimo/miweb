/* ============================================================
   VELIA CLÍNICA DENTAL — Contact Form Validation & Submission
   ============================================================ */

(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successEl = document.getElementById('formSuccess');

  function validate(field) {
    const group = field.closest('.form-group');
    if (!group) return true;
    const errMsg = group.querySelector('.form-error-msg');
    let valid = true;

    field.classList.remove('error', 'success');
    group.classList.remove('has-error');

    if (field.required && !field.value.trim()) {
      valid = false;
      if (errMsg) errMsg.textContent = 'Este campo es obligatorio.';
    } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      valid = false;
      if (errMsg) errMsg.textContent = 'Introduce un email válido.';
    } else if (field.type === 'tel' && field.value && !/^[+\d\s\-()]{7,}$/.test(field.value)) {
      valid = false;
      if (errMsg) errMsg.textContent = 'Introduce un teléfono válido.';
    }

    if (!valid) {
      field.classList.add('error');
      group.classList.add('has-error');
    } else if (field.value.trim()) {
      field.classList.add('success');
    }
    return valid;
  }

  // Live validation on blur
  form.querySelectorAll('.form-control').forEach(field => {
    field.addEventListener('blur', () => validate(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validate(field);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let allValid = true;
    form.querySelectorAll('.form-control').forEach(f => { if (!validate(f)) allValid = false; });

    const privacyCheck = form.querySelector('#privacidad');
    if (privacyCheck && !privacyCheck.checked) {
      privacyCheck.closest('.form-check')?.classList.add('has-error');
      allValid = false;
    }

    if (!allValid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    // ── ENDPOINT: conecta aquí tu servicio de formulario ──────────────
    // DEMO: el formulario no envía datos a ningún sitio. Clave: [[DEMO]]
    // Por ahora simulamos éxito:
    await new Promise(r => setTimeout(r, 800));
    // ──────────────────────────────────────────────────────────────────

    form.style.display = 'none';
    if (successEl) successEl.style.display = 'block';
  });
})();
