/* =====================================================================
   Carlos Torres Advisory · script.js
   Vanilla JS, sin dependencias. Respeta 'prefers-reduced-motion'.
     1. Año en el pie
     2. Cabecera con fondo al hacer scroll
     3. Navegación móvil
     4. Sección activa en la navegación
     5. Revelado suave al hacer scroll
     6. Formulario de contacto (FormSubmit · validación, carga, éxito, honeypot)
   ===================================================================== */
(function () {
  'use strict';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {

    /* 1. Año -------------------------------------------------------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* 2. Cabecera al hacer scroll ---------------------------------- */
    var header = document.querySelector('.site-header');
    var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 20); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* 3. Navegación móvil ------------------------------------------ */
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('nav-menu');
    var closeMenu = function () {
      if (!toggle || !nav) return;
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    };
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        nav.classList.toggle('is-open', !open);
      });
      nav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeMenu); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
      window.matchMedia('(min-width: 721px)').addEventListener('change', closeMenu);
    }

    /* 4. Sección activa -------------------------------------------- */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-menu a[href^="#"]'));
    var sections = navLinks.map(function (l) { return document.getElementById(l.getAttribute('href').slice(1)); }).filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navLinks.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }

    /* 5. Revelado suave -------------------------------------------- */
    var revealTargets = document.querySelectorAll(
      '.section-head, .card, .about-aside, .about-text, .case-aside, .case-steps li, ' +
      '.statement-main, .statement-support, .proc-aside, .timeline-v li, .continuity, ' +
      '.faq-item, .contact-intro, .contact-form'
    );
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach(function (el) { el.classList.add('reveal', 'is-visible'); });
    } else {
      revealTargets.forEach(function (el, i) {
        el.classList.add('reveal');
        el.setAttribute('data-delay', String(((i % 5) + 1)));
      });
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
      revealTargets.forEach(function (el) { io.observe(el); });
    }

    /* 6. Formulario de contacto (FormSubmit) ----------------------- */
    var form = document.getElementById('contact-form');
    if (!form) return;
    var statusEl = document.getElementById('form-status');
    var submitBtn = document.getElementById('submit-btn');

    var setError = function (name, message) {
      var field = form.querySelector('#' + name);
      if (!field) return;
      var wrap = field.closest('.field');
      var errorEl = form.querySelector('.field-error[data-for="' + name + '"]');
      if (wrap) wrap.classList.toggle('has-error', Boolean(message));
      if (errorEl) errorEl.textContent = message || '';
      if (message) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
    };
    var isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
    var setStatus = function (msg, kind) {
      if (!statusEl) return;
      statusEl.textContent = msg || '';
      statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
    };
    var setLoading = function (on) {
      if (!submitBtn) return;
      submitBtn.classList.toggle('is-loading', on);
      submitBtn.disabled = on;
    };

    var M = {
      name:   form.getAttribute('data-msg-name')   || 'Indique su nombre.',
      email:  form.getAttribute('data-msg-email')  || 'Indique su correo electrónico.',
      email2: form.getAttribute('data-msg-email2') || 'Compruebe el correo electrónico.',
      msg:    form.getAttribute('data-msg-msg')    || 'Escriba unas líneas sobre su situación.',
      review: form.getAttribute('data-msg-review') || 'Revise los campos marcados.',
      sending:form.getAttribute('data-msg-sending')|| 'Enviando su mensaje…',
      ok:     form.getAttribute('data-msg-ok')     || 'Gracias. He recibido su mensaje y le responderé personalmente.',
      error:  form.getAttribute('data-msg-error')  || 'No se pudo enviar. Escríbame a carlostorresadvisory@gmail.com y lo resolvemos.'
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot: si está relleno, es un bot. Fingimos éxito y no enviamos.
      var honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) { setStatus(M.ok, 'ok'); form.reset(); return; }

      var data = {
        nombre: form.nombre.value.trim(),
        email: form.email.value.trim(),
        mensaje: form.mensaje.value.trim()
      };
      ['nombre', 'email', 'mensaje'].forEach(function (n) { setError(n, ''); });
      setStatus('');

      var firstInvalid = null;
      if (!data.nombre) { setError('nombre', M.name); firstInvalid = firstInvalid || 'nombre'; }
      if (!data.email) { setError('email', M.email); firstInvalid = firstInvalid || 'email'; }
      else if (!isEmail(data.email)) { setError('email', M.email2); firstInvalid = firstInvalid || 'email'; }
      if (!data.mensaje) { setError('mensaje', M.msg); firstInvalid = firstInvalid || 'mensaje'; }
      if (firstInvalid) {
        var el = form.querySelector('#' + firstInvalid);
        if (el) el.focus();
        setStatus(M.review, 'error');
        return;
      }

      setLoading(true);
      setStatus(M.sending);

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) { return { ok: res.ok, json: json }; });
      }).then(function (r) {
        setLoading(false);
        if (r.ok) {
          setStatus(M.ok, 'ok');
          form.reset();
        } else {
          setStatus(M.error, 'error');
        }
      }).catch(function () {
        setLoading(false);
        setStatus(M.error, 'error');
      });
    });

    ['nombre', 'email', 'mensaje'].forEach(function (name) {
      var field = form.querySelector('#' + name);
      if (field) field.addEventListener('input', function () { setError(name, ''); });
    });
  });
})();
