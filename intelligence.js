/* intelligence.js: CT Intelligence. Generado por medianoche/intel-gen.js a partir del guion de la home; no editar a mano. */
(function(){
  var toggle = document.querySelector('.nav-toggle');
  var nav    = document.getElementById('nav-menu');
  if (!toggle || !nav) return;
  var cerrar = function(){
    toggle.setAttribute('aria-expanded','false');
    nav.classList.remove('is-open');
    var p = nav.querySelector('li.has-panel');
    if (p){
      p.classList.remove('is-open');
      var c = p.querySelector('.np-cab');
      if (c) c.setAttribute('aria-expanded','false');
    }
  };
  toggle.addEventListener('click', function(){
    var abierto = toggle.getAttribute('aria-expanded') === 'true';
    /* Al cerrar se llama a `cerrar()` entero y no solo se quita la clase del
       menú: antes el submenú de CT Intelligence conservaba su `is-open`, así
       que la siguiente vez que se abría el menú aparecía ya desplegado, sin
       que nadie lo hubiera pedido. */
    if (abierto) { cerrar(); return; }
    toggle.setAttribute('aria-expanded','true');
    nav.classList.add('is-open');
  });
  var padre  = nav.querySelector('li.has-panel');
  var cabeza = padre ? padre.querySelector('.np-cab') : null;
  var movil  = window.matchMedia('(max-width:1000px)');
  /* Donde no hay ratón de verdad, el hover no sirve para abrir ni —lo que
     importa— para cerrar. Ahí el clic manda a cualquier ancho. */
  var conRaton = window.matchMedia('(hover:hover)');
  /* Código muerto hoy: ninguna página de CT Intelligence lleva `li.has-panel` en su menú, así que
     `cabeza` siempre es null aquí y este `preventDefault()` nunca llega a engancharse -- si algún
     día una subpágina añade su propio submenú, revisa este bloque contra el de `home.js` (ahí SÍ
     hace falta distinguir escritorio de menú compacto, ver su comentario). */
  if (cabeza){
    cabeza.addEventListener('click', function(e){
      e.preventDefault();
      if (!movil.matches && conRaton.matches) { cabeza.blur(); return; }
      var abierto = padre.classList.toggle('is-open');
      cabeza.setAttribute('aria-expanded', String(abierto));
    });
  }
  nav.querySelectorAll('a').forEach(function(a){
    if (a === cabeza) return;              // esta abre el submenu, no cierra el menu
    a.addEventListener('click', cerrar);
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') cerrar(); });
  /* Un toque fuera lo cierra. Sin esto, en una pantalla táctil el
     desplegable se quedaba tapando el contenido sin salida evidente. */
  document.addEventListener('click', function(e){
    if (padre && padre.classList.contains('is-open') && !padre.contains(e.target)) cerrar();
  });
  window.matchMedia('(min-width:1001px)').addEventListener('change', cerrar);
  /* Y cualquier cambio de tamaño, no solo el que cruza el punto de ruptura:
     el desplegable de escritorio mide medio millar de píxeles y al estrechar
     la ventana se come la página entera. */
  var reloj;
  window.addEventListener('resize', function(){
    clearTimeout(reloj);
    reloj = setTimeout(cerrar, 120);
  });
})();

/* ── Cabecera que se oscurece al bajar ───────────────────────────────────
   El mismo mecanismo de home.js, tal cual (Carlos, 3-sep-2026: que sea el
   que ya existe, no uno nuevo): al pasar los primeros píxeles de scroll la
   cabecera pasa de transparente sobre el héroe a su fondo oscuro con
   desenfoque, y el filete inferior marca cuánto se ha leído de la página.
   La parte de «la pila» no hace nada aquí: en CT Intelligence no hay
   ningún `.pila`, así que ese bloque queda guardián y nunca se dispara. */
(function(){
  var cab = document.querySelector('.site-header');
  var raiz = document.documentElement;
  var pend = false;

  function alScroll(){
    if (pend) return;
    pend = true;
    requestAnimationFrame(function(){
      pend = false;
      var y = window.scrollY || raiz.scrollTop;
      var alto = raiz.scrollHeight - window.innerHeight;
      raiz.style.setProperty('--leido', alto > 0 ? Math.min(1, y / alto).toFixed(4) : '0');
      if (cab) cab.classList.toggle('asentada', y > 2);
    });
  }
  window.addEventListener('scroll', alScroll, { passive: true });
  alScroll();

  var pila = document.querySelector('.pila');
  if (pila && window.matchMedia('(pointer: fine)').matches
          && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
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
})();

/* Iconos por clase de activo, los mismos que dibuja intel-gen.js, para los guiones que pintan chips, tabla y repartos */
window.CT_ICONOS = {"rv":"<svg class=\"ico\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M3 16.5h14\"/><path d=\"M4 12.5l4-4.5 3 3 5-6.5\"/><path d=\"M13 4.5h3v3\"/></svg>","rf":"<svg class=\"ico\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><rect x=\"3\" y=\"4\" width=\"14\" height=\"12\" rx=\"1.5\"/><path d=\"M6 8h8M6 11h5\"/><circle cx=\"13.5\" cy=\"12.5\" r=\"1.3\"/></svg>","mon":"<svg class=\"ico\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><circle cx=\"10\" cy=\"10\" r=\"7\"/><path d=\"M12.6 7.6a3.2 3.2 0 1 0 0 4.8\"/><path d=\"M6.5 9.2h4.2M6.5 10.8h4.2\"/></svg>","inm":"<svg class=\"ico\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M4 17V5.5A1.5 1.5 0 0 1 5.5 4h6A1.5 1.5 0 0 1 13 5.5V17\"/><path d=\"M13 9h2.5A1.5 1.5 0 0 1 17 10.5V17\"/><path d=\"M3 17h14M7 7.5h2M7 10.5h2M7 13.5h2\"/></svg>","mat":"<svg class=\"ico\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><ellipse cx=\"10\" cy=\"5.5\" rx=\"5\" ry=\"2\"/><path d=\"M5 5.5v9c0 1.1 2.2 2 5 2s5-.9 5-2v-9\"/><path d=\"M5 10c0 1.1 2.2 2 5 2s5-.9 5-2\"/></svg>","nc":"<svg class=\"ico\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><rect x=\"5\" y=\"9\" width=\"10\" height=\"8\" rx=\"1.5\"/><path d=\"M7 9V6.5a3 3 0 0 1 6 0V9\"/><path d=\"M10 12.5v1.5\"/></svg>"};

/* Entrada de secciones, misma coreografía que la home (home.js): cada .it-entra revela sus
   hijos escalonados y los titulares se descubren con clip-path. Con red de seguridad para
   llegadas por ancla y para el fondo de la página. */
(function(){
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (quieto || !('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function(entradas){
    entradas.forEach(function(e){
      if (!e.isIntersecting) return;
      e.target.classList.add('dentro');
      obs.unobserve(e.target);
    });
  }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
  var conts = document.querySelectorAll('.it-entra');
  for (var c = 0; c < conts.length; c++){
    var hijos = conts[c].children;
    for (var i = 0; i < hijos.length; i++){
      var el = hijos[i];
      var esTitular = el.matches('h1, h2, .svc-title');
      if (esTitular && !el.querySelector(':scope > .rev')){
        var env = document.createElement('span');
        env.className = 'rev';
        while (el.firstChild) env.appendChild(el.firstChild);
        el.appendChild(env);
      }
      el.setAttribute('data-entra', esTitular ? 'titular' : '');
      el.style.setProperty('--retardo', (i * 70) + 'ms');
      obs.observe(el);
    }
  }
  var rescatar = function(){
    var alFondo = (window.innerHeight + window.pageYOffset) >= (document.documentElement.scrollHeight - 2);
    var pendientes = document.querySelectorAll('[data-entra]:not(.dentro)');
    for (var i = 0; i < pendientes.length; i++){
      var e = pendientes[i];
      var r = e.getBoundingClientRect();
      var pasado = r.bottom < 0;
      var atrapado = alFondo && r.top < window.innerHeight;
      if (!pasado && !atrapado) continue;
      if (pasado) e.style.setProperty('--retardo', '0ms');
      e.classList.add('dentro');
      obs.unobserve(e);
    }
  };
  window.addEventListener('load', rescatar);
  window.addEventListener('hashchange', rescatar);
  setTimeout(rescatar, 400);
  var pedido = false;
  var alRodar = function(){
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(function(){
      pedido = false;
      rescatar();
      if (!document.querySelector('[data-entra]:not(.dentro)')) window.removeEventListener('scroll', alRodar);
    });
  };
  window.addEventListener('scroll', alRodar, { passive:true });
  /* La cabecera de la página ya está en pantalla al cargar: entra en cuanto la tipografía está lista. */
  var arranca = function(){
    requestAnimationFrame(function(){
      var h = document.querySelectorAll('.it-hero .it-entra > *');
      for (var i = 0; i < h.length; i++) h[i].classList.add('dentro');
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(arranca);
  else window.addEventListener('load', arranca);
  setTimeout(arranca, 1200);
})();

(function(){
  var brf = document.querySelector('.intel-panel .brf');
  if (!brf || !window.fetch) return;
  var DIAS  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  function dos(n){ return (n < 10 ? '0' : '') + n; }
  function hoy(){ var d = new Date(); return d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate()); }
  function fechaLarga(iso){
    var p = iso.split('-').map(Number);
    /* Por componentes, sin pasar por UTC: con new Date(iso) la fecha cae un
       día antes en cualquier zona por detrás de Greenwich. */
    var dt = new Date(p[0], p[1] - 1, p[2]);
    return DIAS[dt.getDay()] + ' ' + p[2] + ' de ' + MESES[p[1] - 1] + ' de ' + p[0];
  }
  function texto(s, max){ return typeof s === 'string' && s.length > 0 && s.length <= max && !/<|https?:\/\//i.test(s); }
  function valido(b){
    if (!b || typeof b !== 'object') return false;
    if (typeof b.fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(b.fecha)) return false;
    if (!Array.isArray(b.cifras) || !b.cifras.length || b.cifras.length > 8) return false;
    for (var i = 0; i < b.cifras.length; i++) {
      if (!b.cifras[i] || !texto(b.cifras[i].etiqueta, 60) || !texto(b.cifras[i].valor, 30)) return false;
      /* Fuente opcional por cifra (productor nuevo, 2-sep-2026): nombre del medio, nunca URL. */
      if (b.cifras[i].fuente !== null && b.cifras[i].fuente !== undefined && !texto(b.cifras[i].fuente, 60)) return false;
    }
    if (!Array.isArray(b.horizontes) || !b.horizontes.length || b.horizontes.length > 3) return false;
    for (var j = 0; j < b.horizontes.length; j++) {
      var h = b.horizontes[j];
      if (!h || !texto(h.horizonte, 20) || typeof h.n !== 'number' || h.n < 0 || h.n !== Math.floor(h.n)) return false;
    }
    /* Radar: hasta el 2-sep-2026 era un texto; el productor nuevo manda null
       o una lista de hasta 6 operaciones {titular, fuente|null}. Se aceptan
       las dos formas mientras convivan; null es el estado normal de un día
       sin operaciones. */
    if (b.radar !== null && b.radar !== undefined) {
      if (Array.isArray(b.radar)) {
        if (b.radar.length > 6) return false;
        for (var r = 0; r < b.radar.length; r++) {
          var op = b.radar[r];
          if (!op || !texto(op.titular, 200)) return false;
          if (op.fuente !== null && op.fuente !== undefined && !texto(op.fuente, 60)) return false;
        }
      } else if (!texto(b.radar, 600)) return false;
    }
    /* La lectura del dia (Carlos, 30-ago-2026, 20:55: la queria escrita, no
       solo cifras). Opcional: si falta o llega vacia el panel sale como
       siempre; si llega con etiquetas o con un enlace, el brief entero se
       rechaza, que es la senal de que el productor ha fallado. */
    if (b.lectura !== null && b.lectura !== undefined && b.lectura !== '' && !texto(b.lectura, 700)) return false;
    return true;
  }
  /* Campo nuevo `secciones` (3-sep-2026): el brief entero, para el
     desplegable. A propósito NO entra en `valido()` de arriba: si el
     productor manda algo roto aquí, el resto del panel (fecha, cifras,
     horizontes, lectura, radar) tiene que seguir viéndose exactamente
     igual que hoy — solo se resiente el desplegable, nunca el brief
     entero.

     Degradado parcial, no todo-o-nada (corregido por Carlos, 3-sep-2026,
     tras la primera versión: «el reparto de daño» — este JSON lo escribe
     un proceso automático sin nadie mirando, así que un fallo puntual en
     UNA línea es lo más probable que pase, y no se puede llevar por
     delante las otras veinte que llegaron bien). Cada nivel se sanea por
     separado y solo se descarta LO ROTO, nunca el contenedor entero:
       - una línea sin `texto` válido, fuera; con `texto` pero `fuente`
         inválida, se queda la línea y se cae solo la fuente.
       - una sección o subsección sin `titulo` válido, fuera entera (no
         hay título que ponerle).
       - una sección que se quede sin ninguna línea buena, ni en ella ni
         en sus subsecciones, no pinta nada: nunca un título huérfano.
     El único fallo que sí se trata como si `secciones` no hubiera
     llegado es que el campo no sea ni siquiera una lista — eso no es
     «una línea rota», es que no hay nada que salvar. */
  function lineaSaneada(l){
    if (!l || typeof l !== 'object' || !texto(l.texto, 600)) return null;
    var out = { texto: l.texto };
    if (l.fuente !== null && l.fuente !== undefined && texto(l.fuente, 60)) out.fuente = l.fuente;
    return out;
  }
  function lineasSaneadas(lineas){
    if (!Array.isArray(lineas)) return [];
    var out = [];
    for (var i = 0; i < lineas.length && out.length < 30; i++) {
      var l = lineaSaneada(lineas[i]);
      if (l) out.push(l);
    }
    return out;
  }
  function subseccionSaneada(s){
    if (!s || typeof s !== 'object' || !texto(s.titulo, 80)) return null;
    var lineas = lineasSaneadas(s.lineas);
    if (!lineas.length) return null; // sin una línea buena, no hay subsección que pintar
    return { titulo: s.titulo, lineas: lineas };
  }
  function seccionSaneada(s){
    if (!s || typeof s !== 'object' || !texto(s.titulo, 80)) return null;
    var lineas = lineasSaneadas(s.lineas), subsecciones = [];
    if (Array.isArray(s.subsecciones)) {
      for (var i = 0; i < s.subsecciones.length && subsecciones.length < 10; i++) {
        var sub = subseccionSaneada(s.subsecciones[i]);
        if (sub) subsecciones.push(sub);
      }
    }
    if (!lineas.length && !subsecciones.length) return null; // vacía tras sanear: sin título huérfano
    return { titulo: s.titulo, lineas: lineas, subsecciones: subsecciones };
  }
  function seccionesSaneadas(sec){
    if (!Array.isArray(sec)) return [];
    var out = [];
    for (var i = 0; i < sec.length && out.length < 20; i++) {
      var s = seccionSaneada(sec[i]);
      if (s) out.push(s);
    }
    return out;
  }
  function el(tag, cls, txt){
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  /* Una línea de una sección o subsección: el texto y, si viene, su fuente. */
  function pintarLineas(ul, lineas){
    lineas.forEach(function(l){
      var li = el('li'); li.appendChild(el('span', 'brf-sec-tx', l.texto));
      if (l.fuente) li.appendChild(el('small', 'brf-sec-f', l.fuente));
      ul.appendChild(li);
    });
  }
  /* El brief entero, dentro del desplegable. `secciones` ya llega saneada
     (seccionesSaneadas): cada sección y subsección que sobrevive tiene, como
     mínimo, una línea buena, así que aquí ya no hace falta comprobar nada,
     solo colgar las subsecciones bajo la suya con su propio título más
     pequeño (hoy solo «Radar estratégico» trae una). */
  function pintarSecciones(cont, secciones){
    cont.textContent = '';
    secciones.forEach(function(s){
      var bloque = el('div', 'brf-sec');
      bloque.appendChild(el('p', 'brf-sec-t', s.titulo));
      if (s.lineas.length) {
        var ul = el('ul', 'brf-sec-l');
        pintarLineas(ul, s.lineas);
        bloque.appendChild(ul);
      }
      s.subsecciones.forEach(function(sub){
        var subBloque = el('div', 'brf-sub');
        subBloque.appendChild(el('p', 'brf-sub-t', sub.titulo));
        var ulSub = el('ul', 'brf-sec-l');
        pintarLineas(ulSub, sub.lineas);
        subBloque.appendChild(ulSub);
        bloque.appendChild(subBloque);
      });
      cont.appendChild(bloque);
    });
  }
  // Tope de forma, no de contenido (mismo motivo y mismo valor que
  // brief-publico.js#LIMITE_MARKDOWN_TOTAL): un brief real ronda unos pocos
  // miles de caracteres, esto es solo un límite defensivo por si el JSON
  // llega corrupto.
  var LIMITE_MARKDOWN = 20000;

  /* Convierte una línea de markdown-lite en su elemento (párrafo, cabecera o bullet), con la
     única sintaxis inline que sobrevive al filtrado del motor: negrita `**texto**`. Nunca se
     construye una cadena de HTML -- se reparte el texto en fragmentos y cada uno se cuelga como
     nodo de texto real o como un <b> con su propio textContent, así que no hay forma de que algo
     que venga en el texto (aunque lo haya escrito un modelo) se convierta en una etiqueta. Mismo
     criterio que hud-server.js#lineaBrief() (comentario "Markdown-lite del brief del Vigía", ~línea
     126), sin la parte de enlaces: `markdown` nunca trae ninguno -- brief-publico.js#proyectarMarkdown
     le quita la URL a cada `[Medio](url)` antes de publicar, y validarBriefPublico rechaza el campo
     entero si queda un "<" o un "http" (ver `texto()`, arriba, que hace la misma comprobación aquí
     antes de intentar pintar nada). */
  function lineaMD(tag, cls, texto){
    var p = el(tag, cls);
    var partes = texto.split(/(\*\*[^*]+\*\*)/);
    for (var i = 0; i < partes.length; i++){
      var frag = partes[i];
      if (!frag) continue;
      if (frag.length > 4 && frag.slice(0, 2) === '**' && frag.slice(-2) === '**') {
        p.appendChild(el('b', null, frag.slice(2, -2)));
      } else {
        p.appendChild(document.createTextNode(frag));
      }
    }
    return p;
  }
  /* El brief entero, redactado -- Carlos, 4-sep-2026: "en mi HUD está redactado [...] quiero ver
     exactamente lo mismo en noticias y bien redactado". A diferencia de pintarSecciones() (que
     trocea el brief en hechos sueltos con su fuente aparte), aquí cada línea del markdown se
     cuelga tal cual, en el mismo orden: cabeceras `##`/`###` aparte, líneas con guion como lista
     (hoy solo las trae "Cifras clave") y el resto como párrafo corrido -- así se lee como el
     documento que es, no como una lista de notas. Devuelve si pintó algo de verdad: un markdown
     que sobrevive a `texto()` pero que tras trocear en líneas se queda en blanco no debe dejar el
     desplegable con un panel vacío -- quien llama cae entonces a `secciones`. */
  function pintarMarkdown(cont, md){
    var doc = el('div', 'brf-md');
    var lineas = md.split('\n');
    for (var i = 0; i < lineas.length; i++){
      var t = lineas[i].trim();
      if (!t) continue;
      if (t.slice(0, 4) === '### ') { doc.appendChild(lineaMD('p', 'brf-md-h3', t.slice(4))); continue; }
      if (t.slice(0, 3) === '## ')  { doc.appendChild(lineaMD('p', 'brf-md-h2', t.slice(3))); continue; }
      if (t.slice(0, 2) === '# ')   { doc.appendChild(lineaMD('p', 'brf-md-h2', t.slice(2))); continue; }
      if (t.slice(0, 2) === '- ' || t.slice(0, 2) === '* ') {
        doc.appendChild(lineaMD('p', 'brf-md-p brf-md-li', t.slice(2))); continue;
      }
      doc.appendChild(lineaMD('p', 'brf-md-p', t));
    }
    if (!doc.children.length) { cont.textContent = ''; return false; }
    cont.textContent = '';
    cont.appendChild(doc);
    return true;
  }
  function pintar(b){
    brf.querySelector('.brf-fecha').textContent = fechaLarga(b.fecha);
    var ulC = brf.querySelector('.brf-cifras'); ulC.textContent = '';
    /* Cuatro cifras a la vista, ni una más: decisión de Carlos del
       4-sep-2026 ("déjalo en 4 cifras clave, tanto en mi HUD como en el de
       la web, de forma permanente"). El brief ya no escribe más de 4; si
       llegara un JSON antiguo con más, las de más quedan en el DOM ocultas
       (.brf-cx) hasta que se despliegue el panel. */
    b.cifras.forEach(function(c, i){
      var li = el('li'); li.appendChild(el('b', null, c.valor)); li.appendChild(el('span', null, c.etiqueta));
      if (i >= 4) { li.className = 'brf-cx'; li.hidden = true; }
      ulC.appendChild(li);
    });
    /* El radar de lugares reemplaza las barras Hoy/Esta semana/Este mes
       (Carlos, 4-sep-2026: "sustituir la visual de hoy esta semana y este
       mes por el radar que ideamos ayer" -- el reparto por horizonte no
       decía DÓNDE pasa nada). intel-geo.js resuelve los lugares del propio
       texto del brief (markdown y/o secciones), sin IA ni red; el color de
       cada punto es el frente dominante, nunca la única forma de saberlo
       (cada punto lleva su aria-label/title en texto, ver intel-radar.js).
       La lista "Lugares de hoy" de más abajo es la misma resolución en
       texto, siempre visible dentro del desplegable -- la vía accesible
       para quien no pasa el ratón sobre el radar. `total` se sigue
       necesitando para el pie ("N titulares..."), aunque ya no se pinte
       ninguna barra. */
    var total = 0;
    b.horizontes.forEach(function(h){ total += h.n; });
    /* Un campo roto (p. ej. `secciones` o `markdown` con un tipo raro que
       intel-geo.js no esperara) no puede tirar la tarjeta entera -- regla
       de la casa, reforzada tras la ronda 2 de revisión (F1: un
       `.forEach is not a function` a mitad de `pintar()` dejaba la tarjeta
       oculta para siempre, porque abortaba antes de `brf.hidden = false`
       al final). intel-geo.js ya se defiende con `Array.isArray` en cada
       recorrido; este try/catch es la segunda red, por si algo asoma que
       ninguna de las dos previó -- sin radar ni lista, el resto de la
       tarjeta (cifras, lectura, desplegable) sigue exactamente igual. */
    var lugares = [];
    var radarSvg = brf.querySelector('.brf-radar-svg');
    var lugaresWrap = brf.querySelector('.brf-lugares-wrap'), ulLugares = brf.querySelector('.brf-lugares');
    try {
      lugares = (window.CT_GEO && window.CT_GEO.detectarLugares(b)) || [];
      if (radarSvg && window.CT_RADAR) {
        if (!radarSvg._ctRadar) radarSvg._ctRadar = window.CT_RADAR.crear(radarSvg);
        radarSvg._ctRadar.actualizar(lugares);
      }
    } catch (e) { lugares = []; }
    var hayLugares = lugares.length > 0;
    if (lugaresWrap && ulLugares) {
      try {
        if (hayLugares && window.CT_RADAR) window.CT_RADAR.pintarLista(ulLugares, lugares);
        else ulLugares.textContent = '';
      } catch (e) { ulLugares.textContent = ''; }
      lugaresWrap.dataset.tiene = hayLugares ? '1' : '';
    }
    var lectura = brf.querySelector('.brf-lectura');
    if (b.lectura) { lectura.textContent = b.lectura; lectura.hidden = false; }
    else { lectura.textContent = ''; lectura.hidden = true; }
    /* Operaciones y mercado de empresas, separadas de la lectura general
       (Carlos, 2-sep-2026): lista con titular y fuente; el texto suelto solo
       para briefs del formato viejo. */
    var radar = brf.querySelector('.brf-radar');
    var radarTxt = radar.querySelector('.brf-radar-txt'), radarL = radar.querySelector('.brf-radar-l');
    radarTxt.textContent = ''; radarL.textContent = '';
    if (Array.isArray(b.radar) && b.radar.length) {
      b.radar.forEach(function(op){
        var li = el('li'); li.appendChild(el('span', 'brf-op', op.titular));
        if (op.fuente) li.appendChild(el('small', 'brf-op-f', op.fuente));
        radarL.appendChild(li);
      });
      radarTxt.hidden = true; radarL.hidden = false; radar.hidden = false;
    } else if (typeof b.radar === 'string' && b.radar.replace(/\s+/g, '')) {
      radarTxt.textContent = b.radar.length > 230 ? b.radar.slice(0, 227).replace(/[\s,;.]+$/, '') + '…' : b.radar;
      radarTxt.hidden = false; radarL.hidden = true; radar.hidden = false;
    } else {
      radar.hidden = true;
    }
    /* Las fuentes del día, si el productor las manda (cifras y operaciones):
       así «contrastados uno a uno» lleva nombres detrás, no una promesa. */
    var fuentes = [];
    function anotar(f){
      if (typeof f !== 'string') return;
      f = f.replace(/^\s+|[\s.]+$/g, '');
      if (f && fuentes.indexOf(f) === -1) fuentes.push(f);
    }
    b.cifras.forEach(function(c){ anotar(c.fuente); });
    if (Array.isArray(b.radar)) b.radar.forEach(function(op){ anotar(op.fuente); });
    brf.querySelector('.brf-n').textContent = total + ' hallazgos de prensa económica, contrastados uno a uno. La lectura la prepara y la publica el agente, cada mañana.' + (fuentes.length ? ' Fuentes de hoy: ' + fuentes.join(', ') + '.' : '')
      /* Quién lo ha escrito, si el brief lo dice (Carlos, 3-sep-2026: «que indique el modelo»).
         Va aquí y no en un bloque aparte porque es de la misma naturaleza que las fuentes: de
         dónde sale lo que se lee. El texto lo compone el motor (brief-publico.js#elaboracionDesde),
         así que la web no decide cómo se nombra ningún modelo, solo lo pinta si viene. */
      + (b.elaboracion && b.elaboracion.texto ? ' ' + b.elaboracion.texto + '.' : '');
    /* Los tres puntos de directo de la página (menú, cabecera del panel y
       eyebrow del brief) siguen la misma regla: un fin de semana, el menú
       no puede seguir latiendo sobre la lectura del viernes (hallazgo de la
       pasada adversarial, 30-ago-2026). */
    var enDirecto = b.fecha === hoy();
    var puntos = document.querySelectorAll('.live');
    for (var k = 0; k < puntos.length; k++) puntos[k].hidden = !enDirecto;
    /* El desplegable: solo aparece si hay algo real que enseñar de más
       (secciones con contenido tras sanear, o una 5ª/6ª cifra). Si
       `secciones` falta o no es ni siquiera una lista, sale vacío del
       saneado y el panel se queda exactamente como hoy — ver la nota junto
       a `seccionesSaneadas`. Siempre arranca plegado: el panel cerrado no
       puede notar el cambio (Carlos, 3-sep-2026).

       Corrección tras la pasada adversarial del 3-sep-2026: el control
       tiene que existir SOLO si desplegarlo enseña contenido de verdad, y
       lo que se despliega tiene que incluir SIEMPRE lo que haya de sobra —
       nunca "todo o nada" a nivel de control. Con 6 cifras y `secciones`
       roto ese día, el botón sigue existiendo (las cifras 5ª/6ª son
       contenido real) pero `.brf-secciones` se queda oculto para siempre:
       antes se enseñaba igual, vacío, y el usuario se encontraba un hueco
       en blanco con su propio filete bajo las cifras. `cont.dataset.tiene`
       guarda si hay algo que enseñar ahí, y el click de abajo lo respeta. */
    var mas = brf.querySelector('.brf-mas'), toggle = brf.querySelector('.brf-toggle'),
        cont = brf.querySelector('.brf-secciones');
    if (mas && toggle && cont) {
      /* `markdown` manda sobre `secciones` (4-sep-2026, Carlos: "en mi HUD está redactado,
         quiero ver lo mismo en la web"). Es el MISMO brief que `secciones`, sin desmontar en
         hechos sueltos -- se lee como un documento porque lo es. `secciones` sigue viva solo
         para el día en que `markdown` falte, venga vacío (cadena vacía es el "nada sobrevivió
         al filtro" de brief-publico.js) o no sea una cadena: entonces el panel se comporta
         exactamente como hasta ayer. */
      var pintoMarkdown = texto(b.markdown, LIMITE_MARKDOWN) && pintarMarkdown(cont, b.markdown);
      if (!pintoMarkdown) {
        var secciones = seccionesSaneadas(b.secciones);
        if (secciones.length) pintarSecciones(cont, secciones); else cont.textContent = '';
      }
      var haySecciones = cont.children.length > 0, hayCifrasExtra = b.cifras.length > 4;
      cont.dataset.tiene = haySecciones ? '1' : '';
      mas.hidden = !(haySecciones || hayCifrasExtra || hayLugares);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('span').textContent = 'Ver el brief completo';
      cont.hidden = true;
      if (lugaresWrap) lugaresWrap.hidden = true;
    }
    brf.hidden = false;
  }
  function apagar(){ brf.hidden = true; }
  /* Un único interruptor para todo lo que el desplegable revela: las
     secciones y las cifras 5ª/6ª que hoy se cortan por `.slice`-equivalente
     arriba. Delegado sobre `.brf` (no sobre `document`) porque este botón
     es propio de este panel, no un patrón compartido como `.it-saber`. */
  brf.addEventListener('click', function(e){
    var t = e.target.closest('.brf-toggle');
    if (!t) return;
    var abrir = t.getAttribute('aria-expanded') !== 'true';
    t.setAttribute('aria-expanded', String(abrir));
    var cont = document.getElementById(t.getAttribute('aria-controls'));
    /* `cont` solo se enseña si de verdad tiene contenido (`dataset.tiene`,
       fijado en `pintar`): el botón puede existir solo por las cifras
       5ª/6ª aunque `secciones` no trajera nada aprovechable ese día. */
    if (cont) cont.hidden = !(abrir && cont.dataset.tiene === '1');
    /* La lista de lugares ("pastillas" con menciones) ya no se enseña al
       desplegar: Carlos la quitó el 4-sep-2026 ("quita las pastillas de
       menciones a los sitios"). Sigue en el DOM solo para lector de
       pantalla (`sr-only`, igual que en la home), así que aquí no se toca. */
    var extra = brf.querySelectorAll('.brf-cx');
    for (var i = 0; i < extra.length; i++) extra[i].hidden = !abrir;
    t.querySelector('span').textContent = abrir ? 'Mostrar menos' : 'Ver el brief completo';
  });
  fetch('/intel/brief.json', { cache: 'no-store' })
    .then(function(r){ if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function(b){ if (valido(b)) pintar(b); else apagar(); })
    .catch(apagar);
})();

/* ── Preguntar a un asistente de IA y tarjetas plegables ──
   Cada página deja en CT_IA_COLA pares [clave, función que devuelve el prompt]; aquí se rellenan los
   enlaces (ChatGPT y Claude aceptan el texto en la URL) y el botón de copiar. Prompt neutro, sin
   instrucciones al asistente sobre qué puede o no responder (Carlos, 2-sep-2026, 18:19). */
(function(){
  var cola = window.CT_IA_COLA = window.CT_IA_COLA || [];
  var ctx = {};
  var bases = { chatgpt: 'https://chatgpt.com/?q=', claude: 'https://claude.ai/new?q=' };
  function pintar(){
    var bloques = document.querySelectorAll('.it-ia');
    for (var i = 0; i < bloques.length; i++){
      var b = bloques[i], fn = ctx[b.getAttribute('data-ia')];
      if (!fn) continue;
      var texto = fn(), enlaces = b.querySelectorAll('[data-ia-ir]');
      for (var j = 0; j < enlaces.length; j++) enlaces[j].href = bases[enlaces[j].getAttribute('data-ia-ir')] + encodeURIComponent(texto);
    }
  }
  function registrar(par){ ctx[par[0]] = par[1]; pintar(); }
  for (var i = 0; i < cola.length; i++) registrar(cola[i]);
  cola.push = function(par){ registrar(par); return cola.length; };
  document.addEventListener('click', function(e){
    var c = e.target.closest('[data-ia-copiar]');
    if (c){
      var b = c.closest('.it-ia'), fn = ctx[b.getAttribute('data-ia')];
      if (!fn) return;
      var s = c.querySelector('span');
      var vuelve = function(t){ s.textContent = t; setTimeout(function(){ s.textContent = 'Copiar la pregunta'; }, 2400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(fn()).then(function(){ vuelve('Pregunta copiada'); }, function(){ vuelve('No se ha podido copiar'); });
      else vuelve('No se ha podido copiar');
      return;
    }
    var t = e.target.closest('.it-saber');
    if (t){
      var m = document.getElementById(t.getAttribute('aria-controls'));
      var abierto = t.getAttribute('aria-expanded') === 'true';
      t.setAttribute('aria-expanded', String(!abierto));
      if (m) m.hidden = abierto;
      t.querySelector('span').textContent = abierto ? 'Saber más' : 'Mostrar menos';
    }
  });
})();
