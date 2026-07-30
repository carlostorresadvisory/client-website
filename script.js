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
      '.section-head, .phase, .about-aside, .about-text, ' +
      '.statement-main, .statement-support, .tl-phase, .continuity, ' +
      '.track-step, .faq-item, .contact-intro, .contact-form, .contact-trust'
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
    // v23: cerrojo propio. El disabled del boton se ponia despues de
    // validar, asi que dos Intro seguidos disparaban dos peticiones.
    var sending = false;

    var setError = function (name, message) {
      var field = form.querySelector('#' + name);
      if (!field) return;
      var wrap = field.closest('.field');
      var errorEl = form.querySelector('.field-error[data-for="' + name + '"]');
      if (wrap) wrap.classList.toggle('has-error', Boolean(message));
      if (errorEl) errorEl.textContent = message || '';
      if (message) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
    };
    // v23: la anterior daba por buenos «a@b..c» y «a@-b.c». Esta exige
    // etiquetas de dominio que empiecen y acaben en alfanumerico y una
    // extension de dos letras o mas. Sigue siendo permisiva a proposito:
    // en un formulario de contacto vale mas dejar pasar una rareza valida
    // que rechazar a un cliente por una direccion poco comun.
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
      submitBtn.classList.toggle('is-loading', on);
      submitBtn.disabled = on;
    };

    var M = {
      email:  form.getAttribute('data-msg-email')  || 'Indique su correo electrónico.',
      email2: form.getAttribute('data-msg-email2') || 'Compruebe el correo electrónico.',
      msg:    form.getAttribute('data-msg-msg')    || 'Escriba unas líneas sobre su situación.',
      consent:form.getAttribute('data-msg-consent')|| 'Confirme que ha leído la política de privacidad.',
      review: form.getAttribute('data-msg-review') || 'Revise los campos marcados.',
      sending:form.getAttribute('data-msg-sending')|| 'Enviando su mensaje…',
      ok:     form.getAttribute('data-msg-ok')     || 'Gracias. He recibido su mensaje y le responderé personalmente.',
      error:  form.getAttribute('data-msg-error')  || 'No se pudo enviar. Escríbame a carlostorres@ctadvisory.es y lo resolvemos.'
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;

      // Honeypot: si está relleno, es un bot. Fingimos éxito y no enviamos.
      var honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) { setStatus(M.ok, 'ok'); form.reset(); return; }

      var data = {
        email: form.email.value.trim(),
        mensaje: form.mensaje.value.trim()
      };
      ['email', 'mensaje', 'consent'].forEach(function (n) { setError(n, ''); });
      setStatus('');

      var firstInvalid = null;
      if (!data.email) { setError('email', M.email); firstInvalid = firstInvalid || 'email'; }
      else if (!isEmail(data.email)) { setError('email', M.email2); firstInvalid = firstInvalid || 'email'; }
      if (!data.mensaje) { setError('mensaje', M.msg); firstInvalid = firstInvalid || 'mensaje'; }
      // Casilla informativa del art. 13 RGPD. No es consentimiento: la base
      // juridica sigue siendo el art. 6.1.b (medidas precontractuales).
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
          // v23: tras enviar, el foco se quedaba en el body. Se lleva al
          // mensaje de gracias, que es lo unico que ha cambiado en pantalla.
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

    ['email', 'mensaje', 'consent'].forEach(function (name) {
      var field = form.querySelector('#' + name);
      if (field) field.addEventListener('input', function () { setError(name, ''); });
    });
  });
})();

/* ============================================================
   Selector de perspectiva · Empresario (sell) / Inversor (buy)
   Intercambia el contenido [data-swap] a partir del JSON de
   #mode-data, sin recarga. El contenido "sell" vive en el HTML
   (accesible y para SEO); el "buy" se aplica al cambiar de modo.
   ============================================================ */
(function () {
  var opts = document.querySelectorAll('.mode-opt[data-set-mode]');
  var dataEl = document.getElementById('mode-data');
  if (!opts.length || !dataEl) return;

  var buy;
  try { buy = JSON.parse(dataEl.textContent); } catch (e) { return; }

  var sellCache = {};
  var nodes = document.querySelectorAll('[data-swap]');

  /* El revelado por scroll (bloque 5) marca los nodos con .reveal y solo les
     anade .is-visible cuando entran en pantalla, observandolos de uno en uno.
     Al reescribir innerHTML los nodos observados se quedan huerfanos: los
     nuevos no los mira nadie. Y si la cache se tomo ANTES de bajar a esa
     seccion, guarda .reveal sin .is-visible, asi que al volver al modo
     empresario Preguntas y El proceso se quedaban a opacidad 0 para siempre.
     Tras cada intercambio se dan por revelados: el visitante que ya ha
     tocado el selector no necesita que le aparezcan otra vez. */
  function revelar(el) {
    if (el.classList.contains('reveal')) el.classList.add('is-visible');
    var hijos = el.querySelectorAll('.reveal');
    for (var i = 0; i < hijos.length; i++) hijos[i].classList.add('is-visible');
    /* La cache tambien puede haber capturado una pregunta a medio abrir:
       .is-animating pendiente y una altura fija en linea. Sin limpiarlo, esa
       pregunta ya no vuelve a abrirse nunca. */
    var sucios = el.querySelectorAll('.faq-item.is-animating');
    for (var j = 0; j < sucios.length; j++) sucios[j].classList.remove('is-animating');
    var alturas = el.querySelectorAll('.faq-answer[style]');
    for (var k = 0; k < alturas.length; k++) alturas[k].style.height = '';
  }

  function apply(mode) {
    nodes.forEach(function (el) {
      var key = el.getAttribute('data-swap');
      if (mode === 'buy') {
        if (!(key in sellCache)) sellCache[key] = el.innerHTML;
        if (buy[key] != null) el.innerHTML = buy[key];
      } else if (key in sellCache) {
        el.innerHTML = sellCache[key];
      }
      revelar(el);
    });
    document.body.setAttribute('data-mode', mode);
    opts.forEach(function (o) {
      var active = o.getAttribute('data-set-mode') === mode;
      o.classList.toggle('is-active', active);
      o.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  /* v26 · Enlace directo al modo Inversor, para poder mandar una URL que
     aterrice ya en la version correcta:
       ES  ?modo=inversor      EN  ?mode=investor    FR  ?mode=investisseur
     Se aceptan tambien los valores antiguos (comprador/buyer/acquereur) por
     si algun enlace ya circula. Reutiliza apply(): no duplica logica. */
  var VALORES_BUY = ['inversor', 'investor', 'investisseur', 'comprador', 'buyer', 'acquereur'];
  var SLUG_BUY = { es: 'inversor', en: 'investor', fr: 'investisseur' };
  var idioma = document.documentElement.lang || 'es';
  var PARAM = idioma === 'es' ? 'modo' : 'mode';

  function sincronizarUrl(mode) {
    if (!window.history || !history.replaceState || typeof URL !== 'function') return;
    try {
      var url = new URL(window.location.href);
      // se limpian ambos nombres para no dejar el parametro del otro idioma
      url.searchParams.delete('modo');
      url.searchParams.delete('mode');
      if (mode === 'buy') url.searchParams.set(PARAM, SLUG_BUY[idioma] || 'investor');
      // replaceState, no pushState: no ensucia el boton Atras del navegador
      history.replaceState(null, '', url.toString());
    } catch (e) { /* URL no soportada: el modo funciona igual, solo no se refleja */ }
  }

  opts.forEach(function (o) {
    o.addEventListener('click', function () {
      var mode = o.getAttribute('data-set-mode');
      if (mode !== document.body.getAttribute('data-mode')) { apply(mode); sincronizarUrl(mode); }
    });
  });

  try {
    var q = new URLSearchParams(window.location.search);
    var pedido = (q.get('modo') || q.get('mode') || '').toLowerCase();
    if (VALORES_BUY.indexOf(pedido) !== -1) apply('buy');
  } catch (e) { /* navegador sin URLSearchParams: arranca en modo empresario */ }
})();

/* =====================================================================
   8. Fases de servicios (click/tap) · delegacion de eventos
   Los contenedores [data-swap] se reescriben al cambiar de modo, asi que
   no se pueden usar listeners directos sobre los botones.
   ===================================================================== */
(function () {
  function closest(el, sel) {
    while (el && el.nodeType === 1) { if (el.matches(sel)) return el; el = el.parentElement; }
    return null;
  }
  function activate(root, idx) {
    var tabs = root.querySelectorAll('.phase-tab');
    var i;
    for (i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-phase') === idx;
      tabs[i].classList.toggle('is-active', on);
      tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
      tabs[i].setAttribute('tabindex', on ? '0' : '-1');
    }
    var panels = root.querySelectorAll('.phase-panel');
    for (i = 0; i < panels.length; i++) {
      panels[i].classList.toggle('is-active', panels[i].getAttribute('data-phase') === idx);
    }
    // indicador deslizante de la linea de tiempo
    var nav = root.querySelector('.phase-nav');
    if (nav) nav.style.setProperty('--i', String(parseInt(idx, 10) || 0));
  }
  document.addEventListener('click', function (e) {
    var tab = closest(e.target, '.phase-tab');
    if (!tab) return;
    var root = closest(tab, '[data-phases]');
    if (!root) return;
    activate(root, tab.getAttribute('data-phase'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var tab = closest(e.target, '.phase-tab');
    if (!tab) return;
    var root = closest(tab, '[data-phases]');
    if (!root) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.phase-tab'));
    var i = tabs.indexOf(tab);
    var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    if (!next) return;
    e.preventDefault();
    activate(root, next.getAttribute('data-phase'));
    next.focus();
  });

  /* 9. FAQ: apertura y cierre animados -------------------------------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', function (e) {
    var sm = closest(e.target, '.faq-item > summary');
    if (!sm) return;
    var item = sm.parentElement;
    var ans = item.querySelector('.faq-answer');
    if (!ans || reduce) return;
    e.preventDefault();
    if (item.classList.contains('is-animating')) return;
    var opening = !item.hasAttribute('open');

    /* Si la transicion se cancela (cambio de modo, reflow, hoja de estilos
       vieja en cache) transitionend no llega nunca y la pregunta se queda
       bloqueada con .is-animating para siempre. Red de seguridad por tiempo. */
    var guard = null;
    var finish = function (ev) {
      if (ev && ev.propertyName !== 'height') return;
      if (guard) { clearTimeout(guard); guard = null; }
      ans.removeEventListener('transitionend', finish);
      ans.removeEventListener('transitioncancel', finish);
      item.classList.remove('is-animating');
      ans.style.height = '';
      if (!opening) item.removeAttribute('open');
    };
    guard = setTimeout(function () { finish(null); }, 700);

    if (opening) item.setAttribute('open', '');
    item.classList.add('is-animating');
    ans.style.height = (opening ? 0 : ans.scrollHeight) + 'px';
    ans.addEventListener('transitionend', finish);
    ans.addEventListener('transitioncancel', finish);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        ans.style.height = (opening ? ans.scrollHeight : 0) + 'px';
      });
    });
  });
})();

/* =====================================================================
   10. El proceso: linea de tiempo interactiva
   El raton dibuja la linea al entrar en pantalla y cada paso se puede
   fijar con un clic. La geometria del hilo se mide en pixeles porque los
   pasos no tienen la misma altura en movil: si se calculara en
   porcentajes el relleno no acabaria nunca sobre un punto.
   .track-wrap vive FUERA de [data-swap], asi que sobrevive al cambio de
   modo; solo los <li> del <ol> se reescriben.
   ===================================================================== */
(function () {
  var wrap = document.querySelector('.track-wrap[data-track]');
  if (!wrap) return;
  var ol = wrap.querySelector('.track');
  if (!ol) return;

  var drawn = false;
  var wide = window.matchMedia ? window.matchMedia('(min-width:900px)') : null;

  function closest(el, sel) {
    while (el && el.nodeType === 1) { if (el.matches(sel)) return el; el = el.parentElement; }
    return null;
  }

  /* Los numeros son los nodos de la linea. Se mide en pixeles porque los
     pasos no tienen la misma altura en movil y un porcentaje nunca caeria
     justo encima de un numero. --rail-c es el eje transversal: donde pasa
     el hilo, para que el CSS no tenga que adivinarlo. */
  function measure() {
    var nodes = wrap.querySelectorAll('.track-n');
    if (!nodes.length) return;
    var box = wrap.getBoundingClientRect();
    var horiz = wide ? wide.matches : window.innerWidth >= 900;
    var pos = [], cross = [];
    for (var i = 0; i < nodes.length; i++) {
      var r = nodes[i].getBoundingClientRect();
      pos.push(horiz ? (r.left + r.width / 2) - box.left
                     : (r.top + r.height / 2) - box.top);
      cross.push(horiz ? (r.top + r.height / 2) - box.top
                       : (r.left + r.width / 2) - box.left);
    }
    var first = pos[0];
    var last = pos[pos.length - 1];
    var act = wrap.querySelector('.track-step.is-active .track-n');
    var to = first;
    if (act) {
      var ar = act.getBoundingClientRect();
      to = horiz ? (ar.left + ar.width / 2) - box.left : (ar.top + ar.height / 2) - box.top;
    }
    wrap.style.setProperty('--rail-o', first.toFixed(2) + 'px');
    wrap.style.setProperty('--rail-c', cross[0].toFixed(2) + 'px');
    wrap.style.setProperty('--rail-len', Math.max(0, last - first).toFixed(2) + 'px');
    wrap.style.setProperty('--fill', drawn ? Math.max(0, to - first).toFixed(2) + 'px' : '0px');
  }

  function activate(idx) {
    var steps = wrap.querySelectorAll('.track-step');
    for (var i = 0; i < steps.length; i++) {
      var on = steps[i].getAttribute('data-step') === idx;
      steps[i].classList.toggle('is-active', on);
      var b = steps[i].querySelector('.track-btn');
      if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    wrap.style.setProperty('--i', String(parseInt(idx, 10) || 0));
    measure();
  }

  document.addEventListener('click', function (e) {
    var btn = closest(e.target, '.track-btn');
    if (!btn || !wrap.contains(btn)) return;
    activate(btn.getAttribute('data-step'));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' &&
        e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    var btn = closest(e.target, '.track-btn');
    if (!btn || !wrap.contains(btn)) return;
    var btns = Array.prototype.slice.call(wrap.querySelectorAll('.track-btn'));
    var i = btns.indexOf(btn);
    var fwd = (e.key === 'ArrowRight' || e.key === 'ArrowDown');
    var next = btns[(i + (fwd ? 1 : btns.length - 1)) % btns.length];
    if (!next) return;
    e.preventDefault();
    activate(next.getAttribute('data-step'));
    next.focus();
  });

  /* La animacion de trazado se activa por clase: si el JS no llegara a
     ejecutarse, el rail se ve entero en vez de quedarse a escala 0. */
  wrap.classList.add('tw-anim');
  measure();

  function draw() {
    if (drawn) return;
    drawn = true;
    wrap.classList.add('is-drawn');
    measure();
  }

  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) { draw(); io.disconnect(); }
      }
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    io.observe(wrap);
  } else {
    draw();
  }

  var raf = 0;
  function relayout() {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; measure(); });
  }
  window.addEventListener('resize', relayout);
  if (wide && wide.addEventListener) wide.addEventListener('change', relayout);
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(ol);
  if (window.MutationObserver) {
    new MutationObserver(function () {
      wrap.style.setProperty('--i', '0');
      relayout();
    }).observe(ol, { childList: true });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  window.addEventListener('load', relayout);
})();
