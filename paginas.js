/* paginas.js — comportamiento compartido de las landings de CT Advisory.
   Generado por medianoche/exportar.js a partir de medianoche/landings-gen.js
   (el guion en línea del taller, sin el conmutador de pestañas). No editar
   a mano: se pisa en la siguiente exportación. */
(function(){
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var obs = (!quieto && 'IntersectionObserver' in window)
    ? new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (!e.isIntersecting) return;
          e.target.classList.add('dentro');
          obs.unobserve(e.target);
        });
      }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' })
    : null;

  function entrar(pag){
    if (!obs || !pag) return;
    var GRUPOS = ['.lp-hero', '.lp-card', '.lp-dest', '.lp-tabla', '.lp-caso', '.lp-cifras', '.lp-prueba-in', '.lp-ben', '.lp-contacto'];
    GRUPOS.forEach(function(sel){
      var cont = pag.querySelector(sel);
      if (!cont) return;
      var hijos = cont.children;
      for (var i = 0; i < hijos.length; i++){
        var el = hijos[i];
        if (el.hasAttribute('data-entra')) continue;
        el.setAttribute('data-entra', el.matches('h1,h2,h3') ? 'titular' : '');
        el.style.setProperty('--retardo', (i * 65) + 'ms');
        obs.observe(el);
      }
    });
    /* El heroe de la pagina visible no espera al scroll. */
    requestAnimationFrame(function(){
      var h = pag.querySelectorAll('.lp-hero > *');
      for (var i = 0; i < h.length; i++) h[i].classList.add('dentro');
    });
  }

  var finoR = window.matchMedia('(pointer: fine)').matches
           && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function engancharPila(pag){
    if (!finoR || !pag) return;
    var pila = pag.querySelector('.pila');
    if (!pila || pila.dataset.enganchada) return;
    pila.dataset.enganchada = '1';
    var caja = null, tick = false;
    pila.addEventListener('pointerenter', function(){
      caja = pila.getBoundingClientRect();
      pila.classList.add('sigue');
    });
    pila.addEventListener('pointermove', function(e){
      if (!caja || tick) return;
      tick = true;
      requestAnimationFrame(function(){
        tick = false;
        var mx = Math.max(-1, Math.min(1, (e.clientX - caja.left) / caja.width  * 2 - 1));
        var my = Math.max(-1, Math.min(1, (e.clientY - caja.top)  / caja.height * 2 - 1));
        pila.style.setProperty('--mx', mx.toFixed(3));
        pila.style.setProperty('--my', my.toFixed(3));
      });
    }, { passive: true });
    pila.addEventListener('pointerleave', function(){
      pila.classList.remove('sigue');
      pila.style.setProperty('--mx', '0');
      pila.style.setProperty('--my', '0');
      caja = null;
    });
    window.addEventListener('resize', function(){ caja = null; });
  }

  var pag = document.querySelector('.lp');
  entrar(pag);
  engancharPila(pag);
})();

/* La cabecera se asienta (fondo, filete y altura compacta) en cuanto hay
   scroll: sin esto, la regla de comunes.js que la deja transparente en
   reposo (.site-header:not(.asentada)) la dejaba transparente SIEMPRE en
   las landings, porque solo la home traía este activador. Mismo umbral que
   la home (2px; con 24px la barra iba transparente con el contenido ya
   debajo, medido el 29-ago-2026). */
(function(){
  var cab = document.querySelector('.site-header');
  if (!cab) return;
  var pend = false;
  function alScroll(){
    if (pend) return;
    pend = true;
    requestAnimationFrame(function(){
      pend = false;
      cab.classList.toggle('asentada', (window.scrollY || document.documentElement.scrollTop) > 2);
    });
  }
  window.addEventListener('scroll', alScroll, { passive: true });
  alScroll();
})();
