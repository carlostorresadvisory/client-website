/* =====================================================================
   Carlos Torres Advisory · script.js
   JavaScript sin dependencias. Todo se activa cuando el DOM está listo.
   Bloques:
     1. Año en el pie
     2. Cabecera: cambia de estado al hacer scroll
     3. Navegación móvil (abrir/cerrar menú)
     4. Sección activa en la navegación
     5. Revelado suave al hacer scroll
     6. Formulario de contacto (validación + confirmación)
   Todo respeta 'prefers-reduced-motion'.
   ===================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  document.addEventListener('DOMContentLoaded', function () {

    /* --------------------------------------------------------------- */
    /* 1. Año actual en el pie                                         */
    /* --------------------------------------------------------------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* --------------------------------------------------------------- */
    /* 2. Cabecera con fondo al hacer scroll                           */
    /* --------------------------------------------------------------- */
    const header = document.querySelector('.site-header');
    const onScroll = function () {
      if (!header) return;
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* --------------------------------------------------------------- */
    /* 3. Navegación móvil                                             */
    /* --------------------------------------------------------------- */
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');

    const closeMenu = function () {
      if (!toggle || !menu) return;
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    };

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        menu.classList.toggle('is-open', !open);
      });

      // Cerrar al pulsar un enlace del menú
      menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });

      // Cerrar con Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });

      // Cerrar si se amplía la ventana a escritorio
      window.matchMedia('(min-width: 721px)').addEventListener('change', closeMenu);
    }

    /* --------------------------------------------------------------- */
    /* 4. Sección activa en la navegación                             */
    /*    Resalta el enlace de la sección visible.                    */
    /* --------------------------------------------------------------- */
    const navLinks = Array.prototype.slice.call(
      document.querySelectorAll('.nav-menu a[href^="#"]')
    );
    const sections = navLinks
      .map(function (link) {
        const id = link.getAttribute('href').slice(1);
        return document.getElementById(id);
      })
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      const spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            navLinks.forEach(function (link) {
              link.classList.toggle(
                'is-active',
                link.getAttribute('href') === '#' + id
              );
            });
          });
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
      );
      sections.forEach(function (section) { spy.observe(section); });
    }

    /* --------------------------------------------------------------- */
    /* 5. Revelado suave al hacer scroll                              */
    /*    Se marcan como .reveal los bloques principales y se les     */
    /*    añade .is-visible al entrar en pantalla.                    */
    /* --------------------------------------------------------------- */
    const revealTargets = document.querySelectorAll(
      '.section-head, .prose, .reto-figure, .pull-quote, .service, ' +
      '.buyer-grid li, .audience-list, .audience-note, .about-side, ' +
      '.step, .faq-item, .contact-form, .contact-intro'
    );

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      // Sin animación: mostrar todo directamente
      revealTargets.forEach(function (el) { el.classList.add('reveal', 'is-visible'); });
    } else {
      revealTargets.forEach(function (el, i) {
        el.classList.add('reveal');
        // pequeño escalonado dentro de cada rejilla
        const delay = (i % 5) + 1;
        el.setAttribute('data-delay', String(delay % 6));
      });

      const io = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
      );
      revealTargets.forEach(function (el) { io.observe(el); });
    }

    /* --------------------------------------------------------------- */
    /* 6. Formulario de contacto                                      */
    /*    Validación en cliente + mensaje de confirmación.            */
    /*    Como no hay backend, tras validar se abre el correo del     */
    /*    usuario (mailto) con el mensaje ya redactado. Para          */
    /*    producción, conecte el 'action' del formulario a su         */
    /*    servicio y elimine el bloque mailto.                        */
    /* --------------------------------------------------------------- */
    const form = document.getElementById('contact-form');
    if (!form) return;

    const status = document.getElementById('form-status');

    const setError = function (name, message) {
      const field = form.querySelector('#' + name);
      if (!field) return;
      const wrap = field.closest('.field');
      const errorEl = form.querySelector('.field-error[data-for="' + name + '"]');
      if (wrap) wrap.classList.toggle('has-error', Boolean(message));
      if (errorEl) errorEl.textContent = message || '';
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    };

    const isEmail = function (value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const data = {
        nombre: form.nombre.value.trim(),
        empresa: form.empresa.value.trim(),
        email: form.email.value.trim(),
        telefono: form.telefono.value.trim(),
        mensaje: form.mensaje.value.trim(),
      };

      // Limpiar estados previos
      ['nombre', 'email', 'mensaje'].forEach(function (n) { setError(n, ''); });
      if (status) { status.textContent = ''; status.className = 'form-status'; }

      // Validación
      let firstInvalid = null;
      if (!data.nombre) { setError('nombre', 'Indique su nombre.'); firstInvalid = firstInvalid || 'nombre'; }
      if (!data.email) { setError('email', 'Indique su correo electrónico.'); firstInvalid = firstInvalid || 'email'; }
      else if (!isEmail(data.email)) { setError('email', 'Compruebe el correo electrónico.'); firstInvalid = firstInvalid || 'email'; }
      if (!data.mensaje) { setError('mensaje', 'Escriba unas líneas sobre su situación.'); firstInvalid = firstInvalid || 'mensaje'; }

      if (firstInvalid) {
        const el = form.querySelector('#' + firstInvalid);
        if (el) el.focus();
        if (status) {
          status.textContent = 'Revise los campos marcados.';
          status.className = 'form-status is-error';
        }
        return;
      }

      // Sin backend: preparar un correo con el contenido del formulario.
      const to = form.getAttribute('data-email') || '';
      const subject = 'Solicitud de conversación confidencial';
      const bodyLines = [
        'Nombre: ' + data.nombre,
        data.empresa ? 'Empresa: ' + data.empresa : null,
        'Correo: ' + data.email,
        data.telefono ? 'Teléfono: ' + data.telefono : null,
        '',
        data.mensaje,
      ].filter(function (line) { return line !== null; });

      if (status) {
        status.textContent = 'Gracias. Abriendo su correo para enviar el mensaje…';
        status.className = 'form-status is-ok';
      }

      const mailto =
        'mailto:' + encodeURIComponent(to) +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(bodyLines.join('\n'));

      // Pequeña espera para que se lea la confirmación
      window.setTimeout(function () { window.location.href = mailto; }, 400);

      form.reset();
    });

    // Limpiar el error de un campo al empezar a corregirlo
    ['nombre', 'email', 'mensaje'].forEach(function (name) {
      const field = form.querySelector('#' + name);
      if (field) field.addEventListener('input', function () { setError(name, ''); });
    });
  });
})();
