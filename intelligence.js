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
  function el(tag, cls, txt){
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function pintar(b){
    brf.querySelector('.brf-fecha').textContent = fechaLarga(b.fecha);
    var ulC = brf.querySelector('.brf-cifras'); ulC.textContent = '';
    b.cifras.slice(0, 4).forEach(function(c){
      var li = el('li'); li.appendChild(el('b', null, c.valor)); li.appendChild(el('span', null, c.etiqueta)); ulC.appendChild(li);
    });
    /* El largo de cada barra es el número de titulares de ese horizonte
       sobre el mayor de los tres: mide el dato, no rellena un hueco. */
    var ulH = brf.querySelector('.brf-hz'); ulH.textContent = '';
    var mayor = 1, total = 0;
    b.horizontes.forEach(function(h){ if (h.n > mayor) mayor = h.n; total += h.n; });
    b.horizontes.forEach(function(h){
      var li = el('li');
      li.appendChild(el('span', 'brf-hz-n', h.horizonte));
      li.appendChild(el('span', 'brf-hz-c', String(h.n)));
      var barra = el('span', 'brf-hz-b'); var i = document.createElement('i');
      i.style.setProperty('--p', (h.n / mayor).toFixed(3)); barra.appendChild(i); li.appendChild(barra);
      ulH.appendChild(li);
    });
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
    brf.querySelector('.brf-n').textContent = total + ' titulares de prensa económica, contrastados uno a uno. La lectura la prepara y la publica el agente, cada mañana.' + (fuentes.length ? ' Fuentes de hoy: ' + fuentes.join(', ') + '.' : '');
    /* Los tres puntos de directo de la página (menú, cabecera del panel y
       eyebrow del brief) siguen la misma regla: un fin de semana, el menú
       no puede seguir latiendo sobre la lectura del viernes (hallazgo de la
       pasada adversarial, 30-ago-2026). */
    var enDirecto = b.fecha === hoy();
    var puntos = document.querySelectorAll('.live');
    for (var k = 0; k < puntos.length; k++) puntos[k].hidden = !enDirecto;
    brf.hidden = false;
  }
  function apagar(){ brf.hidden = true; }
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
