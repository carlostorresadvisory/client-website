/* ── Conmutador Empresario / Inversor ────────────────────────────
   Los textos son los que ya viven en la home actual (bloque
   #mode-data de index.html). No hay copy inventado aquí. */
/* La frase queda fuera del intercambio: es marca, no segmento. El eyebrow
   sí entra, porque recupera el foco en a quién se le habla. */
/* Los nombres de las fases por modo. El resto del contenido de servicios
   vive en el HTML, en dos juegos de paneles. */
var FASES = {
  sell:[['Preparar','Cuánto vale y qué oportunidades tiene'],['Ejecutar','Vender, financiar o automatizar'],['Acompañar','Números y sistemas al día, cada mes']],
  buy: [['Encontrar','Llegar antes que el mercado'],['Decidir','Saber qué hay antes de pagar'],['Crear valor','Optimización operativa']]
};

var COPY = {
  sell:{
    eb:"Ingeniería financiera e inteligencia artificial para empresarios",
    title:'Ha dedicado muchos años a su empresa <span class="soft">Ahora es buen momento para pensar en su tiempo</span>',
    cta:"Hablemos de su empresa",
    procX:"Usted cuenta cómo está su empresa; yo le digo dónde veo valor que ganar.",
    procLi1:"Qué procesos podría hacer un sistema, y cuántas horas devolvería.",
    procLi2:"Qué impulsa hoy el valor de su negocio, y qué lo frena.",
    about1:"Las decisiones de su empresa merecen el rigor de las grandes operaciones. Por eso trabajo personalmente en cada encargo, con sistemas que me permiten analizar más, revisar mejor y ejecutar con precisión.",
    about2:"Cuando un proceso puede hacerse solo, construyo agentes a medida que trabajan por usted: hacen el trabajo que se repite, detectan lo importante y avisan cuando hace falta. Usted decide con la información delante, sin perder horas en prepararla.",
    ideaEm:"y el poder de decidir su futuro",
    ideaP:"Usted recupera tiempo para dirigir, con la tranquilidad de tener el control. De la complejidad me ocupo yo.",
    ideaFilas:'<li style="--k:.638;--barra:0ms"><div class="puente-c"><b class="puente-v">777.000 &euro;</b><span class="puente-e">El valor seg&uacute;n el beneficio del a&ntilde;o</span></div><div class="puente-r"><i class="puente-b"></i></div></li><li class="es-fin" style="--k:1;--barra:200ms"><div class="puente-c"><b class="puente-v">1.217.000 &euro;</b><span class="puente-e">La valoraci&oacute;n con m&eacute;todos ponderados</span></div><div class="puente-r"><i class="puente-b"></i></div></li>',
    ideaNota:"Las dos cifras proceden del mismo informe: una refleja el valor obtenido al considerar únicamente el beneficio del último año; la otra, la valoración final, pondera cuatro métodos y es la que figura en el documento, expresada en euros para el accionista. Las 41 horas al mes corresponden al tiempo que actualmente se dedica de forma manual a tareas que, según el diagnóstico, un sistema podría realizar."
  },
  buy:{
    eb:"Ingeniería financiera e inteligencia artificial para inversores",
    title:'Las grandes inversiones exigen claridad absoluta <span class="soft">Decida con la ventaja de haberlo visto todo</span>',
    cta:"Hablemos de su búsqueda",
    procX:"Usted cuenta qué busca; yo le digo dónde veo valor que ganar.",
    procLi1:"Qué podría hacer un sistema por su búsqueda y por sus participadas.",
    procLi2:"Qué impulsa el valor de la compañía que estudia, y qué lo frena.",
    about1:"Las decisiones de inversión merecen el rigor de las grandes operaciones. Por eso trabajo personalmente en cada encargo, con sistemas que me permiten analizar más, revisar mejor y ejecutar con precisión.",
    about2:"Cuando un proceso puede hacerse solo, construyo agentes a medida que trabajan por usted: rastrean el mercado, siguen sus participadas y avisan cuando hace falta. Usted decide con la información delante, sin perder horas en prepararla.",
    ideaEm:"y el precio que puede defender",
    ideaP:"Usted decide con la ventaja de haberlo visto todo, y paga por lo que realmente hay. De la complejidad me ocupo yo.",
    ideaFilas:'<li style="--k:1;--barra:0ms"><div class="puente-c"><b class="puente-v">1.424.891 €</b><span class="puente-e">Deudores según el balance</span></div><div class="puente-r"><i class="puente-b"></i></div></li><li class="es-fin" style="--k:.076;--barra:200ms"><div class="puente-c"><b class="puente-v">108.657 €</b><span class="puente-e">Cobrables de verdad, tras la revisión</span></div><div class="puente-r"><i class="puente-b"></i></div></li>',
    ideaNota:"Las dos cifras proceden del mismo informe: el balance recogía 1.424.891 € en deudores; la revisión de cobrabilidad dejó 108.657 € realmente recuperables, y el plazo medio de cobro pasó de 394 a 72 días. Las 41 horas al mes corresponden al tiempo que hoy se dedica a mano a tareas que, según el diagnóstico, un sistema podría realizar en la compañía."
  }
};

/* Menú compacto: mismo patrón que la web viva. El botón solo existe por
   debajo de 1000px, y el panel se cierra al elegir destino, con Escape y al
   ensanchar la ventana, para no dejarlo abierto cuando ya no hay botón. */
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
  /* En escritorio, con la cabecera ya convertida en `<a href>` real (CT
     Intelligence, desde que tiene página propia: 2-sep-2026), el clic navega
     sin más — nada que interceptar. El panel es solo un adelanto de lo que
     hay dentro, y ya se ve al pasar el ratón o al enfocar con teclado por CSS
     (`:hover`, `:focus-within`), sin necesitar este interruptor.

     En el menú compacto (móvil) SÍ hace falta seguir interceptando: ahí el
     panel no se abre por `:hover` — no hay ratón — sino por la clase
     `.is-open`, y «CT Intelligence» tiene que desplegar primero sus tres
     enlaces (Lectura de mercado, Guías, Herramienta), igual que hacía cuando
     la cabecera era un `<button>` sin destino propio. Condicionar todo el
     bloque a que la cabecera NO tuviera `href` (como antes) apagaba también
     esto: con el `<a href>` real puesto, el acordeón de móvil dejó de
     abrirse y sus tres enlaces quedaron inalcanzables desde la portada
     (hallazgo de la revisión adversarial del commit 7501c93, 3-sep-2026). */
  if (cabeza){
    cabeza.addEventListener('click', function(e){
      if (!movil.matches) return;               // escritorio: el enlace navega sin más
      e.preventDefault();
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

(function(){
  var opts  = document.querySelectorAll('.mode-opt');
  var nodes = document.querySelectorAll('[data-swap]');
  var current = 'sell';

  function apply(mode){
    if(mode === current) return;
    current = mode;
    var data = COPY[mode];
    /* La audiencia se anota en la raíz para que el CSS pueda retirar
       bloques que solo valen para una de las dos (hoy, la pregunta de
       gestoría y banco). "Una visión clara" se queda en los dos modos: el
       mismo caso, leído como vendedor o como comprador (Carlos, 30-ago-2026). */
    document.documentElement.setAttribute('data-audiencia', mode);

    opts.forEach(function(b){
      var on = b.getAttribute('data-mode') === mode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    /* Los servicios cambian con el heroe: hasta ahora el visitante pulsaba
       "Comprar" y seguia leyendo los servicios de quien vende su empresa. */
    var svc = document.querySelector('.svc');
    if (svc){
      svc.setAttribute('data-modo', mode);
      var fs = FASES[mode];
      document.querySelectorAll('[data-fase]').forEach(function(el){
        el.textContent = fs[+el.getAttribute('data-fase')][0];
      });
      document.querySelectorAll('[data-fase2]').forEach(function(el){
        el.textContent = fs[+el.getAttribute('data-fase2')][1];
      });
      /* Al cambiar de modo se vuelve a la primera fase: la tercera de un
         juego no tiene por que corresponderse con la del otro. */
      /* Se pulsa siempre, tambien si ya estaba activa. Antes se saltaba en
         ese caso, y por eso al cambiar de audiencia quedandose en la fase 1
         el cuadro seguia anunciando la escena de la otra. `ir` es
         idempotente, asi que volver a llamarla no cuesta nada. */
      /* Solo en escritorio: en el acordeon movil este clic sintetico se
         interpretaba como un toggle y abria la fase 01 sola al cambiar de
         audiencia (hallazgo del verificador, 31-ago-2026). En movil no hay
         nada que resetear: los dos juegos de paneles van sincronizados. */
      var t0 = document.getElementById('pht-0');
      if (t0 && !document.querySelector('.svc[data-acordeon]')) t0.click();
    }

    nodes.forEach(function(el){ el.classList.add('is-out'); });
    setTimeout(function(){
      nodes.forEach(function(el){
        el.innerHTML = data[el.getAttribute('data-swap')];
        el.classList.remove('is-out');
      });
    }, 280);
  }

  opts.forEach(function(b){
    b.addEventListener('click', function(){ apply(b.getAttribute('data-mode')); });
  });
})();

/* ── Onda de partículas ──────────────────────────────────────────
   Malla en perspectiva. Canvas, sin librerías. */
(function(){
  var cv = document.getElementById('wave');
  if(!cv) return;
  var ctx = cv.getContext('2d');
  var quiet = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  /* Puntero con inercia. El seguimiento directo se siente mecanico; el
     retardo de 0,08 por fotograma da la sensacion de masa que hace que
     responder resulte agradable en vez de nervioso. 'fuerza' sube al
     entrar y baja al salir, asi que el orden se deshace solo. */
  var pxr = -1, pyr = -1, px = -1, py = -1, fuerza = 0, quiere = 0;
  var RADIO = 190;                       // alcance del foco, en px de CSS
  var fino = window.matchMedia('(pointer: fine)').matches;

  /* Trama de datos. Cada partícula entra por la izquierda con su posición
     alterada (dato en bruto) y se va alineando a su carril conforme deriva
     a la derecha (decisión): el orden se gana con el recorrido. Deriva
     ~7 px/s, se percibe vivo y no animado. */
  var ROWS = 26, PER_ROW = 40, AMP = 0.17;   // más densidad: ahora cubre todo el ancho
  var pts = [];

  function seed(n){                       // ruido estable, sin Math.random
    var s = Math.sin(n * 127.1) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;   // -1 .. 1
  }

  function build(){
    pts = [];
    for(var r = 0; r < ROWS; r++){
      for(var c = 0; c < PER_ROW; c++){
        var k = r * PER_ROW + c;
        pts.push({
          row: r,
          u: c / PER_ROW,
          jit: seed(k),
          vx: 0.055 + (seed(k + 900) + 1) * 0.028,
          ph: (seed(k + 1700) + 1) * 3.14159
        });
      }
    }
  }

  function size(){
    var r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width  = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(t){
    ctx.clearRect(0, 0, W, H);
    if(W < 2 || H < 2) return;

    var rowH = H / (ROWS - 1);
    var prevX = 0, prevY = 0, prevRow = -1, prevA = 0;

    for(var i = 0; i < pts.length; i++){
      var p = pts[i];

      var u = (p.u + t * p.vx) % 1;
      var x = u * W;

      var chaos = Math.pow(1 - u, 1.5);
      var yBase = p.row * rowH;
      var y = yBase + p.jit * chaos * rowH * (AMP / 0.17) * 1.9;

      /* Foco: campana suave alrededor del puntero. Se calcula sobre la
         posicion SIN resolver, para que el punto no escape de su propio
         foco al ordenarse -- si se midiera sobre la ya resuelta, el
         efecto parpadearia en el borde. */
      var foco = 0;
      if (fuerza > 0.001 && px >= 0){
        var dx0 = x - px, dy0 = y - py;
        var d2 = (dx0 * dx0 + dy0 * dy0) / (RADIO * RADIO);
        if (d2 < 9) foco = Math.exp(-d2) * fuerza;
      }
      /* El punto se acerca a su carril en proporcion al foco: el desorden
         se resuelve donde se mira. Nunca del todo (0.88), para que siga
         pareciendo un dato y no una rejilla. */
      if (foco > 0.001) y = y + (yBase - y) * foco * 0.88;

      var lum = 0.5 + 0.5 * Math.sin(t * 1.6 + p.ph) + foco * 0.85;

      // Se apaga en los bordes: nada entra ni sale de golpe
      var edge = Math.min(1, u * 5) * Math.min(1, (1 - u) * 5);
      // Algo más de cuerpo que en la versión previa, para compensar que el
      // desvanecido nuevo es mucho más largo y se come parte de la trama
      var a = (0.09 + lum * 0.21) * edge * (1 + foco * 0.9);

      // Conexión con el vecino del mismo carril: el flujo del dato
      if(p.row === prevRow){
        var dx = x - prevX;
        if(dx > 0 && dx < 46){
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = 'rgba(56,189,248,' + (Math.min(a, prevA) * 0.4).toFixed(3) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      prevX = x; prevY = y; prevRow = p.row; prevA = a;

      ctx.beginPath();
      ctx.arc(x, y, 0.75 + lum * 0.5 + foco * 0.7, 0, 6.2832);
      ctx.fillStyle = 'rgba(56,189,248,' + a.toFixed(3) + ')';
      ctx.fill();
    }
  }

  build();

  var start = null;
  function loop(ts){
    if(start === null) start = ts;
    /* La inercia vive aqui, no en el oyente del raton: asi el retardo va
       ligado al fotograma y no a la frecuencia con que el navegador
       decida entregar eventos de puntero. */
    if (pxr >= 0){
      if (px < 0){ px = pxr; py = pyr; }        // primer contacto, sin barrido
      else { px += (pxr - px) * 0.08; py += (pyr - py) * 0.08; }
    }
    fuerza += (quiere - fuerza) * 0.055;
    draw((ts - start) * 0.000125);   // deriva ~7 px/s: vivo, no animado
    requestAnimationFrame(loop);
  }

  /* Solo con raton o lapiz: en tactil no hay puntero que seguir y el
     efecto se quedaria pegado donde el dedo toco por ultima vez. */
  if (fino && !quiet){
    var hero = cv.parentElement || cv;
    hero.addEventListener('pointermove', function(e){
      if (e.pointerType === 'touch') return;
      var r = cv.getBoundingClientRect();
      pxr = e.clientX - r.left;
      pyr = e.clientY - r.top;
      quiere = 1;
    }, { passive: true });
    hero.addEventListener('pointerleave', function(){ quiere = 0; });
  }

  size();
  if(quiet){ draw(0); } else { requestAnimationFrame(loop); }

  var to;
  window.addEventListener('resize', function(){
    clearTimeout(to);
    to = setTimeout(function(){ size(); if(quiet) draw(0); }, 120);
  });
})();

/* ── Servicios: fases, detalle y la visual sobre la imagen ─────────── */
(function(){
  var nav = document.querySelector('.svc .phase-nav');
  if (!nav) return;
  var tabs   = [].slice.call(nav.querySelectorAll('.phase-tab'));
  var panels = [].slice.call(document.querySelectorAll('.svc .phase-panel'));
  /* Los paneles vienen en dos juegos, uno por audiencia. Se agrupan para
     poder recorrer cada uno por su propia fase: con un indice global, pedir
     la fase 2 mostraba el segundo panel de la lista entera. */
  var juegos = {};
  panels.forEach(function(p){
    var m = p.getAttribute('data-modo') || 'sell';
    (juegos[m] = juegos[m] || []).push(p);
  });
  var lienzo = document.querySelector('.svc-canvas');
  var foto   = document.querySelector('.svc-foto');
  var MODOS  = ['agrupar', 'canalizar', 'sostener'];
  var ESCENAS = {
    sell: ['El propietario repasando las cuentas de su empresa, en su propia mesa',
           'Dos personas a un lado y otro de una mesa, con los papeles en medio',
           'El propietario hablando con alguien, dos cafés sobre la mesa'],
    buy:  ['Un inversor revisando una pila de expedientes, buscando algo concreto',
           'Dos juegos de cifras comparados bajo un flexo, a última hora',
           'Una carpeta de cuentas abierta por una página que alguien mira de cerca']
  };
  var activo = 0;

  function ir(i){
    nav.style.setProperty('--i', i);
    tabs.forEach(function(t, k){
      var on = k === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    /* Se sincronizan los dos juegos a la misma fase. El que no esta activo
       lo esconde el CSS por el modo de la seccion, asi que al cambiar de
       audiencia el panel correcto ya esta puesto. */
    Object.keys(juegos).forEach(function(m){
      juegos[m].forEach(function(p, k){ p.hidden = k !== i; });
    });
    if (foto) foto.dataset.foto = i;
    /* Y el cuadro dice que escena va en ESE hueco, que depende de la fase y
       tambien de la audiencia: el paso 2 de quien vende y el de quien compra
       no cuentan lo mismo. */
    var marca = document.getElementById('marca-esc');
    if (marca){
      var svcEl = document.querySelector('.svc');
      var mo = (svcEl && svcEl.getAttribute('data-modo')) || 'sell';
      marca.textContent = (ESCENAS[mo] || ESCENAS.sell)[i] || '';
    }
    /* Y el fondo de toda la ventana acompana a la fase. */
    if (window.CT_TRAMA) {
      window.CT_TRAMA.modo('.svc', ['orbita', 'embudo', 'onda'][i] || 'malla');
    }
    activo = i;
  }
  /* En movil manda el acordeon del final: alli las tres fases se abren y se
     cierran por separado, y `ir()` —que es exclusivo por definicion— cerraria
     las otras dos en cuanto se tocara una. */
  function enAcordeon(){ return document.querySelector('.svc[data-acordeon]') !== null; }
  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ if (enAcordeon()) return; ir(i); });
    t.addEventListener('keydown', function(e){
      if (enAcordeon()) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var j = (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      ir(j); tabs[j].focus();
    });
  });
  /* El acordeon necesita devolver la seccion a una sola fase activa cuando se
     cruza a escritorio, y eso es exactamente lo que hace ir(). */
  window.CT_FASES = { ir: ir };
  /* La sección arranca en "Ejecutar" (fase 1), que es donde conviven
     corporate finance e inteligencia artificial: decisión de Carlos del
     29-ago-2026. El marcado ya viene así; ir(1) sincroniza además el
     indicador deslizante (--i), la escena y el modo de la trama. */
  ir(1);
  document.querySelectorAll('.si-link a[data-ir]').forEach(function(a){
    a.addEventListener('click', function(e){ e.preventDefault(); ir(+a.dataset.ir); });
  });
  document.querySelectorAll('.si-more').forEach(function(b){
    b.addEventListener('click', function(){
      b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true'));
    });
  });

  /* Un único lienzo, encima de la imagen. Misma materia que el hero en tres
     estados: se agrupa, se canaliza, se sostiene. Discreta a propósito: la
     imagen manda y esto la acompaña. */
  var quieto  = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var visible = true;
  function sem(n){ var x = Math.sin(n * 127.1) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; }
  var puntos = [];
  for (var i = 0; i < 160; i++){
    puntos.push({
      u: (i % 40) / 40, v: (Math.floor(i / 40) + sem(i) * .5) / 3,
      j: sem(i * 3.3), ph: sem(i * 7.7) * Math.PI,
      vx: .04 + Math.abs(sem(i * 5.1)) * .05,
      /* Órbita de Preparar: ángulo de salida y radio. La raíz reparte los
         puntos por ÁREA y no por radio; sin ella se amontonan todos en el
         centro y el disco se ve hueco por fuera. */
      a: (sem(i * 2.1) + 1) * Math.PI,
      r: Math.sqrt((sem(i * 4.7) + 1) / 2) * .95 + .05,
      /* Altura de entrada del embudo, repartida para que no caigan todos
         a la vez desde el borde de arriba. */
      v0: (i % 40) / 40 + sem(i * 9.3) * .012
    });
  }

  function pinta(c, modo, t){
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    if (c.width !== Math.round(w * dpr)){ c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    var g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);

    if (modo === 'agrupar'){
      /* PREPARAR · las partículas dan vueltas.
         Preparar una empresa es rodearla: mirarla por un lado, por otro,
         volver. No hay avance todavía, hay reconocimiento. Así que aquí
         los puntos orbitan en vez de derivar, en un disco visto en ángulo
         -- achatado, nunca un círculo perfecto, que se leería como un
         reloj -- y con rotación diferencial: los de fuera tardan más que
         los de dentro, como un disco de materia real. Sin una sola línea
         de guía: el orden lo dibujan los propios puntos. */
      var cx = w * .5, cy = h * .5;
      var rx = w * .40, ry = h * .30;
      puntos.forEach(function(p, k){
        /* Cuanto más fuera, más lento: es lo que hace que el conjunto se
           lea como algo con volumen en vez de una rueda rígida. */
        var vel = .30 / (.45 + p.r * .9);
        var ang = p.a + t * vel;
        var x = cx + Math.cos(ang) * rx * p.r;
        var y = cy + Math.sin(ang) * ry * p.r;
        /* Los de delante del disco (parte baja del recorrido) brillan más:
           es la profundidad, y es lo que evita que parezca plano. */
        var frente = (Math.sin(ang) + 1) / 2;
        /* El lienzo entero va ya a opacity .62 por CSS, así que lo que se
           escribe aquí se ve casi a la mitad sobre la foto. Medido: con
           .10 las órbitas no llegaban a leerse. */
        var lat = .16 + frente * .42 + (1 - p.r) * .08;
        g.fillStyle = 'rgba(150,205,240,' + lat.toFixed(3) + ')';
        g.beginPath(); g.arc(x, y, 1 + frente, 0, 6.283); g.fill();
        /* Una estela corta hacia atrás en la órbita, no un rastro largo:
           basta para que se vea el giro sin que se convierta en un aro. */
        if (frente > .45){
          var a2 = ang - .085;
          g.strokeStyle = 'rgba(150,205,240,' + (lat * .38).toFixed(3) + ')';
          g.lineWidth = .6;
          g.beginPath();
          g.moveTo(cx + Math.cos(a2) * rx * p.r, cy + Math.sin(a2) * ry * p.r);
          g.lineTo(x, y); g.stroke();
        }
      });
    } else if (modo === 'canalizar'){
      /* EJECUTAR · el embudo, de arriba abajo.
         Iba de izquierda a derecha y con dos líneas que marcaban las
         paredes. Las paredes sobran: un embudo con el contorno pintado es
         un diagrama, y sin contorno es el propio material el que enseña
         la forma al concentrarse. Y va en vertical porque es como se lee
         un descarte -- de muchos arriba a uno abajo -- y porque así la
         forma sigue funcionando cuando el lienzo cubre la página entera.

         Las partículas entran ocupando TODO el ancho y bajan cerrándose
         hasta un hilo. No cambia el número de puntos: al caber en menos
         sitio se juntan solos, y eso es exactamente lo que hace un
         proceso de venta con la lista de compradores. */
      puntos.forEach(function(p){
        var v = (p.v0 + t * p.vx * .42) % 1;         // 0 arriba, 1 abajo
        /* La boca se cierra con curva, no en línea recta: recto es una V
           y se lee como un gráfico; con curva es un embudo. */
        var abre = 1 - Math.pow(v, .78) * .88;
        var x = w * .5 + p.j * (w * .5) * abre;
        var y = v * h;
        /* Se apaga al entrar y al salir, para que nada aparezca ni
           desaparezca de golpe en los bordes del lienzo. */
        var borde = Math.min(1, v * 7) * Math.min(1, (1 - v) * 5);
        /* Más brillo abajo: lo que sobrevive al descarte vale más. */
        var lat = (.17 + v * .50) * borde;
        g.fillStyle = 'rgba(150,205,240,' + lat.toFixed(3) + ')';
        g.beginPath(); g.arc(x, y, 1 + v * 1.3, 0, 6.283); g.fill();
      });
    } else {
      var mid = h * .5;
      g.strokeStyle = 'rgba(56,189,248,.3)'; g.lineWidth = 1.1;
      g.beginPath();
      for (var x2 = 0; x2 <= w; x2 += 3){
        var yy = mid + Math.sin(x2 * .02 + t * .8) * h * .11 * (.6 + .4 * Math.sin(t * .45));
        x2 === 0 ? g.moveTo(x2, yy) : g.lineTo(x2, yy);
      }
      g.stroke();
      for (var q = 0; q < 4; q++){
        var pu = ((t * .14 + q / 4) % 1), px = pu * w;
        var py = mid + Math.sin(px * .02 + t * .8) * h * .11 * (.6 + .4 * Math.sin(t * .45));
        g.fillStyle = 'rgba(56,189,248,' + (.42 * (1 - Math.abs(pu - .5) * 1.5)) + ')';
        g.beginPath(); g.arc(px, py, 2.4, 0, 6.283); g.fill();
      }
    }
  }

  var t0 = null;
  function bucle(ts){
    if (t0 === null) t0 = ts;
    if (lienzo && visible) pinta(lienzo, lienzo.dataset.modo, (ts - t0) * .001);
    requestAnimationFrame(bucle);
  }
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }, {threshold:0})
      .observe(document.querySelector('.svc'));
  }
  /* Sin lienzo no hay nada que pintar aqui: de las particulas de esta
     seccion se encarga ahora la trama global, que ademas cambia de modo
     con la fase. */
  if (lienzo){
    if (quieto){ pinta(lienzo, lienzo.dataset.modo, 3.2); }
    else { requestAnimationFrame(bucle); }
    window.addEventListener('resize', function(){ if (quieto) pinta(lienzo, lienzo.dataset.modo, 3.2); });
  }
})();

/* El pie usa el mismo archivo que la cabecera: se clona en vez de
     repetir el data URI, que pesa mas que el resto de la pagina junta. */
  (function(){
    var h = document.querySelector('.brand-logo');
    var p = document.querySelector('.pie-logo');
    if (h && p) { p.src = h.src; p.hidden = false; }
  })();

/* ── El momento de movimiento ────────────────────────────────────────────
   El atributo que oculta lo pone este script, nunca el HTML: si el
   JavaScript no llega a ejecutarse la pagina se ve entera, que es como
   tiene que fallar. Un solo observador para todo el documento.
   ─────────────────────────────────────────────────────────────────────── */
(function(){
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (quieto || !('IntersectionObserver' in window)) return;

  /* Grupos: cada entrada es [selector del contenedor, selector de los hijos
     que entran, paso de retardo en ms]. El escalonado es corto a proposito
     (60-90ms): por encima de eso deja de leerse como un gesto y empieza a
     leerse como una espera. */
  var GRUPOS = [
    ['.hero-inner',  ':scope > *', 70],
    ['.svc .wrap',   ':scope > *', 70],
    ['.idea-in',     ':scope > *', 90],
    ['.proc .wrap',  ':scope > *', 60],
    ['.proc-lista',  ':scope > *', 70],
    ['.about-in',    ':scope > *', 90],
    /* CT Intelligence entra de una pieza, no en cinco tiempos. Antes se
       revelaban el antetitulo, el titular, la franja y luego las tres
       tarjetas escalonadas, que es lo correcto cuando son cinco cosas
       sueltas; ahora son UNA, y escalonar por dentro lo que quiere leerse
       como un solo objeto lo vuelve a partir en trozos. */
    ['.intel .wrap',  ':scope > *', 70],
    ['.faq .wrap',   ':scope > *', 60],
    ['.faq-list',    ':scope > *', 55],
    ['.cont-in',     ':scope > *', 90],
    ['.pie .wrap',   ':scope > *', 60]
  ];

  var obs = new IntersectionObserver(function(entradas){
    entradas.forEach(function(e){
      if (!e.isIntersecting) return;
      e.target.classList.add('dentro');
      obs.unobserve(e.target);
    });
  }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });

  GRUPOS.forEach(function(g){
    var cont = document.querySelector(g[0]);
    if (!cont) return;
    var hijos = cont.querySelectorAll(g[1]);
    for (var i = 0; i < hijos.length; i++){
      var el = hijos[i];
      /* Un titular de seccion se descubre; el resto sube y enfoca. */
      var esTitular = el.matches('h1, h2, .idea-h, .hero-title, .svc-title');
      /* El recorte se aplica a un envoltorio, no al elemento: sobre el
         propio elemento su area de interseccion queda en cero y este mismo
         observador deja de verlo. Se salta cuando otro script reescribe el
         contenido (data-swap), que borraria el envoltorio. */
      if (esTitular && !el.hasAttribute('data-swap') && !el.querySelector(':scope > .rev')){
        var env = document.createElement('span');
        env.className = 'rev';
        while (el.firstChild) env.appendChild(el.firstChild);
        el.appendChild(env);
      }
      el.setAttribute('data-entra', esTitular ? 'titular' : '');
      el.style.setProperty('--retardo', (i * g[2]) + 'ms');
      obs.observe(el);
    }
  });

  /* Red de seguridad, y no es teorica: al abrir la pagina directamente en
     un ancla del final (un enlace compartido a ctadvisory.es/#contacto, o
     una recarga con el scroll restaurado) todo lo que queda por encima ya
     no llega a cruzar el viewport nunca, asi que el observador no dispara
     y la mitad de la pagina se queda en blanco de forma permanente. Medido
     antes de existir esto: 30 elementos invisibles para siempre.

     Corre despues del salto al fragmento, que ocurre mas tarde que este
     script, y sin retardo: el momento de esos elementos ya paso, revelarlos
     con la animacion seria animar algo que nadie esta mirando. */
  var rescatar = function(){
    /* Al tocar fondo ya no hay mas scroll que pueda meter nada en la franja
       util del observador, asi que lo que se vea en pantalla entra sin mas.
       Sin esto el pie de la pagina se queda invisible para siempre. */
    var alFondo = (window.innerHeight + window.pageYOffset)
      >= (document.documentElement.scrollHeight - 2);
    var pendientes = document.querySelectorAll('[data-entra]:not(.dentro)');
    for (var i = 0; i < pendientes.length; i++){
      var e = pendientes[i];
      var r = e.getBoundingClientRect();
      var pasado = r.bottom < 0;
      var atrapado = alFondo && r.top < window.innerHeight;
      if (!pasado && !atrapado) continue;
      /* Lo que ya paso de largo entra sin retardo; lo del fondo conserva el
         suyo, porque ese si lo esta mirando alguien. */
      if (pasado) e.style.setProperty('--retardo', '0ms');
      e.classList.add('dentro');
      obs.unobserve(e);
    }
  };
  window.addEventListener('load', rescatar);
  window.addEventListener('hashchange', rescatar);
  setTimeout(rescatar, 400);

  /* Un salto de menu se come las secciones intermedias por el mismo motivo.
     Se revisa durante el scroll, una vez por fotograma como mucho, y el
     listener se retira en cuanto no queda ningun elemento pendiente. */
  var pedido = false;
  var alRodar = function(){
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(function(){
      pedido = false;
      rescatar();
      if (!document.querySelector('[data-entra]:not(.dentro)')){
        window.removeEventListener('scroll', alRodar);
      }
    });
  };
  window.addEventListener('scroll', alRodar, { passive:true });

  /* El hero ya esta en pantalla al cargar: no espera al scroll, entra solo
     en cuanto la tipografia esta lista, para que no se vea el salto de la
     fuente de sistema a la real. */
  var arranca = function(){
    requestAnimationFrame(function(){
      var h = document.querySelectorAll('.hero-inner > *');
      for (var i = 0; i < h.length; i++) h[i].classList.add('dentro');
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(arranca);
  else window.addEventListener('load', arranca);
  /* Red de seguridad: si las fuentes no resuelven, la pagina no se queda
     en blanco esperandolas. */
  setTimeout(arranca, 1200);
})();

/* ── Respuesta al visitante ──────────────────────────────────────────────
   Dos cosas: cuanto se ha leido (que enciende el filete de la cabecera y
   la asienta) y donde esta el raton sobre la pila del informe. Las dos
   escriben una variable CSS y dejan que el estilo decida que hacer con
   ella; ningun estilo se escribe desde JavaScript.
   ─────────────────────────────────────────────────────────────────────── */
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
      if (cab) cab.classList.toggle('asentada', y > 2); /* antes 24: entre 1 y 24px la barra iba transparente con el hero ya debajo (medido 29-ago-2026) */
    });
  }
  window.addEventListener('scroll', alScroll, { passive: true });
  alScroll();

  /* La pila solo sigue al raton cuando hay raton de verdad. */
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
        /* -1 a 1 desde el centro. Se recorta para que salirse por una
           esquina no dispare el giro. */
        var mx = Math.max(-1, Math.min(1, (e.clientX - caja.left) / caja.width  * 2 - 1));
        var my = Math.max(-1, Math.min(1, (e.clientY - caja.top)  / caja.height * 2 - 1));
        pila.style.setProperty('--mx', mx.toFixed(3));
        pila.style.setProperty('--my', my.toFixed(3));
      });
    }, { passive: true });
    pila.addEventListener('pointerleave', function(){
      pila.classList.remove('sigue');       // vuelve al reposo con la curva larga
      pila.style.setProperty('--mx', '0');
      pila.style.setProperty('--my', '0');
      caja = null;
    });
    /* La caja cambia con el scroll y al redimensionar. */
    window.addEventListener('resize', function(){ caja = null; });
  }
})();

/* ═══════════════════════════════════════════════════════════════════════
   EL PROCESO · qué paso está mirando el visitante
   ───────────────────────────────────────────────────────────────────────
   Una sola banda de observación en el centro de la ventana. El paso que la
   cruza manda, y el panel de al lado enseña lo que se lleva el cliente en
   esa parada. Se queda con el último que entró: entre paso y paso no hay
   hueco muerto, así que nunca se apagan los cuatro a la vez.

   Sin IntersectionObserver el paso 01 se queda activo con su panel, que es
   lo que ya viene escrito en el HTML. Nada depende de que este script
   corra para que la sección se entienda.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  var botones = document.querySelectorAll('.proc-b');
  var paneles = document.querySelectorAll('.pp');
  if (!botones.length || !paneles.length) return;

  function activar(n){
    for (var i = 0; i < botones.length; i++){
      var act = botones[i].getAttribute('data-paso') === n;
      botones[i].setAttribute('aria-selected', act ? 'true' : 'false');
      /* Un solo botón entra en el orden de tabulación; dentro del grupo se
         navega con las flechas. Es el patrón de pestañas de siempre, y
         evita que el teclado tenga que pasar por las cuatro para salir. */
      botones[i].tabIndex = act ? 0 : -1;
      botones[i].parentNode.parentNode.classList.toggle('es-act', act);
    }
    for (var j = 0; j < paneles.length; j++){
      var vis = paneles[j].getAttribute('data-panel') === n;
      paneles[j].classList.toggle('es-act', vis);
    }
    /* Y la trama del fondo se ordena con el recorrido: revuelta en la
       primera conversación, resuelta al llegar a las decisiones. El
       visitante no tiene por qué darse cuenta; el efecto es que la
       sección se calma sola conforme la lee. */
    if (window.CT_TRAMA) {
      var i = parseInt(n, 10) - 1;
      window.CT_TRAMA.ordenar('.proc', i / (botones.length - 1));
      /* Y cada parada tiene su forma: la conversacion llega revuelta, la
         propuesta se encarrila, el trabajo orbita alrededor de una pieza y
         la decision se aplana. Es el mismo recurso que ya usa Servicios al
         cambiar de fase. */
      window.CT_TRAMA.modo('.proc', ['malla','carriles','orbita','onda'][i] || 'malla');
    }
  }

  for (var k = 0; k < botones.length; k++){
    botones[k].addEventListener('click', function(){
      activar(this.getAttribute('data-paso'));
    });
  }

  /* Flechas para moverse dentro del grupo, Inicio y Fin para los extremos.
     El foco va al botón nuevo porque quien navega con teclado necesita
     saber dónde ha aterrizado. */
  var lista = document.querySelector('.proc-lista');
  if (lista) lista.addEventListener('keydown', function(e){
    var b = e.target.closest ? e.target.closest('.proc-b') : null;
    if (!b) return;
    var i = Array.prototype.indexOf.call(botones, b), d = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') d = (i + 1) % botones.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') d = (i - 1 + botones.length) % botones.length;
    else if (e.key === 'Home') d = 0;
    else if (e.key === 'End') d = botones.length - 1;
    if (d < 0) return;
    e.preventDefault();
    activar(botones[d].getAttribute('data-paso'));
    botones[d].focus();
  });
})();

/* ── CT Intelligence: el brief se lee de /intel/brief.json ──────────────
   Lo escribe el motor después del brief matinal (hoy, un fichero de muestra
   cortado de un brief real con brief-lector.js). Tres reglas, fijadas el
   30-ago-2026 con Carlos y la sesión orquestadora: la fecha es la del
   brief, nunca «hoy»; el punto de directo solo si el brief es de hoy (el
   fin de semana se ve el del viernes, sin punto); y si el fichero falta,
   no carga o no valida, el bloque del brief no se enseña: nunca una
   lectura vieja con punto de directo. `cache:'no-store'` porque GitHub
   Pages cachea unos minutos y el primer visitante tras la publicación
   vería el de ayer con la fecha de hoy. Todo se pinta con textContent: el
   texto viene de un modelo, y aunque el lector ya rechaza HTML y URL antes
   de escribir el fichero, aquí se escapa otra vez. */
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
    /* El radar de lugares reemplaza las barras Hoy/Esta semana/Este mes
       (Carlos, 4-sep-2026: "sustituir la visual de hoy esta semana y este
       mes por el radar que ideamos ayer" -- el reparto por horizonte no
       decía DÓNDE pasa nada). intel-geo.js resuelve los lugares del propio
       texto del brief, sin IA ni red; el color de cada punto es el frente
       dominante, nunca la única forma de saberlo (cada punto lleva su
       aria-label/title en texto, ver intel-radar.js). `total` se sigue
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
       ninguna de las dos previó. Sin radar (o sin lista, en la home la
       lista es solo para lector de pantalla) el resto de la tarjeta sigue
       exactamente igual que hoy. */
    var radarSvg = brf.querySelector('.brf-radar-svg');
    var ulLugares = brf.querySelector('.brf-lugares');
    try {
      var lugares = (window.CT_GEO && window.CT_RADAR) ? window.CT_GEO.detectarLugares(b) : [];
      if (radarSvg && window.CT_RADAR) {
        if (!radarSvg._ctRadar) radarSvg._ctRadar = window.CT_RADAR.crear(radarSvg);
        radarSvg._ctRadar.actualizar(lugares);
      }
      /* La home no tiene panel ampliado (es un teaser con enlace a
         /intelligence/, ver el informe de integración) -- pero SÍ necesita
         una vía sin ratón a la misma información que da el radar, no solo
         "pase el ratón por los puntos" (F6, revisión externa, ronda 2):
         `.brf-lugares` existe aquí oculta a la vista (clase `sr-only` en
         home.css) y sigue en el DOM real para lector de pantalla y
         búsqueda en página, con el mismo lugar + frente que ya pinta
         intelligence.js en su lista visible. */
      if (ulLugares && window.CT_RADAR) window.CT_RADAR.pintarLista(ulLugares, lugares);
    } catch (e) { /* ver comentario de arriba: el radar es opcional, la tarjeta no */ }
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
    brf.querySelector('.brf-n').textContent = total + ' hallazgos de prensa económica, contrastados uno a uno. La lectura la prepara y la publica el agente, cada mañana.' + (fuentes.length ? ' Fuentes de hoy: ' + fuentes.join(', ') + '.' : '');
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

/* ── Servicios en móvil como acordeón de fases independientes ─────────
   Carlos, 30-ago-2026, 17:26: «que sean desplegables desde el botón: cuando
   pinches 1 se abra debajo la imagen y el contenido de esa sección y luego
   los otros dos se queden debajo». Y a las 20:01: que se puedan abrir y
   cerrar «todas a la vez».

   La primera versión movía UN bloque foto+texto detrás de la tarjeta activa,
   así que solo cabía una fase abierta: la estructura misma lo impedía, no el
   guion. Ahora cada panel lleva su propia foto dentro (.ph-foto, que es una
   .svc-foto y hereda sus reglas tal cual) y hasta 1000 px los seis se colocan
   detrás de SU tarjeta. Cada tarjeta abre y cierra solo lo suyo: tres
   abiertas y ninguna abierta son estados válidos.

   Se colocan los seis, no solo los del modo visible, para que cambiar de
   audiencia no mueva un solo nodo. Al cruzar a escritorio vuelven a
   .svc-text y la sección recupera una única fase activa. El orden del DOM es
   el orden de lectura y el de foco (con `order` de CSS no coincidían), y el
   CSS de ≤1000 pone .phase-bar y .phase-nav en display:contents para que
   tarjetas y paneles sean hijos de la misma columna flex. */
(function(){
  var svc = document.querySelector('.svc'); if (!svc) return;
  var texto = svc.querySelector('.svc-text');
  var nav = svc.querySelector('.phase-nav');
  var bar = svc.querySelector('.phase-bar');
  if (!texto || !nav) return;
  var tabs = [].slice.call(nav.querySelectorAll('.phase-tab'));
  if (!tabs.length) return;
  var mq = window.matchMedia('(max-width:1000px)');
  var TRAMAS = ['orbita', 'embudo', 'onda'];

  /* Que fases estan abiertas. En movil, ninguna: Carlos, 31-ago-2026, «no
     quiero nada abierto por defecto en movil», que sustituye a su decision
     del 29-ago de arrancar en "Ejecutar". En escritorio se copia el marcado
     (ir(1) ya ha dejado la fase 1 activa): un tablist sin seleccion no es
     un estado valido. */
  var abierta = tabs.map(function(t){ return mq.matches ? false : t.classList.contains('is-active'); });
  /* Los roles de pestana solo valen en escritorio: en el acordeon varias
     fases pueden estar abiertas a la vez y un tablist con dos seleccionadas
     es marcado invalido. Se guardan para poder devolverlos al cruzar. */
  var rolesTab = tabs.map(function(t){ return t.getAttribute('role'); });
  var rolNav = nav.getAttribute('role');

  function panelesDe(modo){
    return [].slice.call(svc.querySelectorAll('.phase-panel[data-modo="' + modo + '"]'));
  }

  function pintar(){
    var s = panelesDe('sell'), b = panelesDe('buy');
    tabs.forEach(function(t, i){
      var on = !!abierta[i];
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-expanded', on ? 'true' : 'false');
      /* Los dos juegos se mantienen sincronizados: el del modo que no se ve
         lo esconde el CSS, asi que al cambiar de audiencia la fase ya esta
         abierta o cerrada como corresponde, sin tocar nada. */
      if (s[i]) s[i].hidden = !on;
      if (b[i]) b[i].hidden = !on;
    });
  }

  function aMovil(){
    /* Los seis paneles se colocan detras de SU tarjeta, no solo los del modo
       visible: asi cambiar de audiencia no mueve ni un nodo. */
    var s = panelesDe('sell'), b = panelesDe('buy');
    tabs.forEach(function(t, i){ if (s[i] && b[i]) t.after(s[i], b[i]); });
    if (rolNav) nav.removeAttribute('role');
    if (bar) bar.removeAttribute('role');
    tabs.forEach(function(t){
      t.removeAttribute('role');
      t.removeAttribute('aria-selected');
      t.tabIndex = 0;
    });
    svc.setAttribute('data-acordeon', '');
    pintar();
  }

  function aEscritorio(){
    /* Vuelven a .svc-text en su orden original (los tres de vender y despues
       los tres de comprar), que es como los espera la retícula. */
    panelesDe('sell').forEach(function(p){ texto.appendChild(p); });
    panelesDe('buy').forEach(function(p){ texto.appendChild(p); });
    if (rolNav) nav.setAttribute('role', rolNav);
    if (bar) bar.setAttribute('role', 'presentation');
    tabs.forEach(function(t, i){
      if (rolesTab[i]) t.setAttribute('role', rolesTab[i]);
      t.removeAttribute('aria-expanded');
    });
    svc.removeAttribute('data-acordeon');
    /* Una sola activa: la ultima que quedara abierta, y la primera si no
       habia ninguna. ir() sincroniza ademas el indicador, la escena y la trama. */
    var i = abierta.lastIndexOf(true);
    if (i < 0) { i = 0; abierta[0] = true; }
    if (window.CT_FASES) window.CT_FASES.ir(i);
  }

  function colocar(){ if (mq.matches) aMovil(); else aEscritorio(); }
  colocar();
  if (mq.addEventListener) mq.addEventListener('change', colocar); else mq.addListener(colocar);

  svc.addEventListener('click', function(e){
    var t = e.target.closest('.phase-tab');
    if (!t || !mq.matches) return;
    var i = tabs.indexOf(t);
    if (i < 0) return;
    abierta[i] = !abierta[i];
    pintar();
    if (!abierta[i]) return;            // al cerrar no se mueve la pagina
    if (window.CT_TRAMA) window.CT_TRAMA.modo('.svc', TRAMAS[i] || 'malla');
    /* Solo si al abrir la tarjeta se ha ido por encima de la ventana: el
       salto al cerrar era lo que desorientaba. */
    if (t.getBoundingClientRect().top < 0) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
