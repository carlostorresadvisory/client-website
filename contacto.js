/* contacto.js: formulario de contacto de la home (FormSubmit). Portado de
   `script.js` (bloque 6, "Formulario de contacto") a la estructura de
   campos del taller Medianoche: `<label class="campo">` en vez de
   `<div class="field">`, `<label class="consent">` en vez de
   `.field-consent`. Mismo comportamiento: validación con foco al primer
   error, cerrojo anti doble envío, honeypot, mensajes en `data-msg-*`.
   Sin dependencias. Respeta 'prefers-reduced-motion' (no anima nada aquí,
   así que no hay nada que respetar salvo no romper si falta el motor). */
'use strict';

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var statusEl = document.getElementById('form-status');
    var submitBtn = document.getElementById('submit-btn');
    var sending = false;

    var setError = function (name, message) {
      var field = form.querySelector('#' + name);
      if (!field) return;
      // El taller envuelve el campo en <label class="campo"> o
      // <label class="consent"> según el tipo — a diferencia de la web
      // vieja, aquí no hay un <div class="field"> intermedio.
      var wrap = field.closest('.campo, .consent');
      var errorEl = form.querySelector('.field-error[data-for="' + name + '"]');
      if (wrap) wrap.classList.toggle('has-error', Boolean(message));
      if (errorEl) errorEl.textContent = message || '';
      if (message) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
    };

    // Permisiva a propósito: en un formulario de contacto vale más dejar
    // pasar una rareza válida que rechazar a un cliente por una dirección
    // poco común.
    var isEmail = function (v) {
      return /^[^\s@]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/.test(v);
    };

    var setStatus = function (msg, kind) {
      if (!statusEl) return;
      statusEl.textContent = msg || '';
      statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
    };

    var setLoading = function (on) {
      if (!submitBtn) return;
      submitBtn.disabled = on;
    };

    var M = {
      nombre: form.getAttribute('data-msg-nombre') || 'Escriba su nombre.',
      email: form.getAttribute('data-msg-email') || 'Indique su correo electrónico.',
      email2: form.getAttribute('data-msg-email2') || 'Compruebe el correo electrónico.',
      msg: form.getAttribute('data-msg-msg') || 'Escriba unas líneas sobre su situación.',
      consent: form.getAttribute('data-msg-consent') || 'Confirme que ha leído la política de privacidad.',
      review: form.getAttribute('data-msg-review') || 'Revise los campos marcados.',
      sending: form.getAttribute('data-msg-sending') || 'Enviando su mensaje…',
      ok: form.getAttribute('data-msg-ok') || 'Gracias. He recibido su mensaje y le responderé personalmente.',
      error: form.getAttribute('data-msg-error') || 'No se pudo enviar. Escríbame a carlostorres@ctadvisory.es y lo resolvemos.'
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;

      // Honeypot: si está relleno, es un bot. Fingimos éxito y no enviamos.
      var honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) { setStatus(M.ok, 'ok'); form.reset(); return; }

      var nombreEl = form.querySelector('#nombre');
      var data = {
        nombre: nombreEl ? nombreEl.value.trim() : '',
        email: form.email.value.trim(),
        mensaje: form.mensaje.value.trim()
      };
      ['nombre', 'email', 'mensaje', 'consent'].forEach(function (n) { setError(n, ''); });
      setStatus('');

      var firstInvalid = null;
      if (nombreEl && !data.nombre) { setError('nombre', M.nombre); firstInvalid = firstInvalid || 'nombre'; }
      if (!data.email) { setError('email', M.email); firstInvalid = firstInvalid || 'email'; }
      else if (!isEmail(data.email)) { setError('email', M.email2); firstInvalid = firstInvalid || 'email'; }
      if (!data.mensaje) { setError('mensaje', M.msg); firstInvalid = firstInvalid || 'mensaje'; }

      // Casilla informativa del art. 13 RGPD. No es consentimiento: la base
      // jurídica sigue siendo el art. 6.1.b (medidas precontractuales).
      var consentEl = form.querySelector('#consent');
      if (consentEl && !consentEl.checked) { setError('consent', M.consent); firstInvalid = firstInvalid || 'consent'; }

      if (firstInvalid) {
        var el = form.querySelector('#' + firstInvalid);
        if (el) el.focus();
        setStatus(M.review, 'error');
        return;
      }

      sending = true;
      setLoading(true);
      setStatus(M.sending);

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) { return { ok: res.ok, json: json }; });
      }).then(function (r) {
        sending = false;
        setLoading(false);
        if (r.ok) {
          setStatus(M.ok, 'ok');
          form.reset();
          if (statusEl) { statusEl.setAttribute('tabindex', '-1'); statusEl.focus(); }
        } else {
          setStatus(M.error, 'error');
        }
      }).catch(function () {
        sending = false;
        setLoading(false);
        setStatus(M.error, 'error');
      });
    });

    ['nombre', 'email', 'mensaje', 'consent'].forEach(function (name) {
      var field = form.querySelector('#' + name);
      if (field) field.addEventListener('input', function () { setError(name, ''); });
    });
  });
})();
