/* intel-radar.js — el radar de lugares del brief, desde Madrid, dentro de la
   tarjeta del brief (sustituye a las barras Hoy/Esta semana/Este mes,
   Carlos, 4-sep-2026: «sustituir la visual de hoy esta semana y este mes
   por el radar que ideamos ayer»).

   Variante «solo al pasar o tocar» (elegida por Carlos, 4-sep-2026, porque
   «no se overlapee el texto y los puntos» -- es la única de las dos formas
   probadas que lo garantiza sea cual sea el día): sin texto fijo en el
   lienzo, cada punto revela su etiqueta (lugar + frente) al pasar el
   ratón, enfocarlo con teclado o tocarlo. Con esto el solape deja de ser
   un problema que resolver -- nunca hay dos etiquetas a la vez. La lista
   "Lugares de hoy" (pintarLista, más abajo) es la misma información en
   texto siempre visible, la vía accesible para quien no pasa el ratón.

   Sin librerías: toda la proyección y el rumbo/distancia es la matemática
   de intel-geo.js. */
(function () {
  'use strict';
  var GEO = window.CT_GEO;
  var NS = 'http://www.w3.org/2000/svg';
  var reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function crear(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* Radio de un pin según el número de menciones, en raíz cuadrada (10
     menciones no se ve 10 veces más grande que 1). Carlos pidió puntos
     pequeños (4-sep-2026); aquí van algo mayores que en el boceto de
     comparación (que se veía a ~600px) porque este radar vive en el hueco
     que antes ocupaban las barras, unos 150-190px -- sin el ajuste, un
     punto de 1,7 unidades sobre un lienzo tan pequeño deja de verse. */
  function radioPin(menciones) {
    return Math.max(2.3, Math.min(5.4, 2.3 + Math.sqrt(menciones) * 1.0));
  }
  /* El área de toque/hover es más grande que el punto visible a propósito --
     un punto de pocos píxeles es casi imposible de acertar con el dedo. Es
     invisible (fill transparent) y es la que lleva el foco de teclado. */
  function radioToque(radioVisible) { return Math.max(8.5, radioVisible + 4.5); }

  function colorDeFrente(idFrente) {
    var fr = GEO.frentePorId(idFrente);
    return 'var(' + fr.color + ')';
  }
  /* Nombre corto de frente SOLO para la etiqueta flotante (el lienzo mide
     150-190px de lado): "Bancos centrales y mercados" es el único de los
     cinco lo bastante largo como para, combinado con el nombre del lugar,
     desbordar el lienzo -- verificado con medición real en el navegador
     (ver informe de integración). La lista "Lugares de hoy" del panel
     ampliado, con todo el ancho de la página, sigue usando el nombre
     completo (GEO.frentePorId(id).nombre directamente, en pintarLista). */
  var FRENTE_CORTO_FLOTANTE = { 'bancos-centrales': 'Bancos centrales' };
  function nombreFrenteFlotante(idFrente) {
    var fr = GEO.frentePorId(idFrente);
    return FRENTE_CORTO_FLOTANTE[fr.id] || fr.nombre;
  }

  /* La lista "Lugares de hoy": la misma información que los pines, en texto,
     siempre en DOM real (no solo para lector de pantalla) -- vive en el
     panel ampliado del brief. Lleva el frente dominante siempre en texto
     (nunca solo color) y, si el lugar tocó más de un frente el mismo día,
     lo dice explícitamente. */
  function pintarLista(ul, resultados) {
    ul.textContent = '';
    resultados.forEach(function (r) {
      var li = document.createElement('li');
      if (r.lugar.home) li.className = 'brf-lugares-home';
      var sw = document.createElement('span');
      sw.className = 'brf-lugares-sw';
      sw.style.background = r.lugar.home ? 'var(--ink)' : colorDeFrente(r.dominante);
      sw.setAttribute('aria-hidden', 'true');
      li.appendChild(sw);
      var b = document.createElement('b');
      b.textContent = r.lugar.nombre;
      li.appendChild(b);
      var resto = ' · ' + r.menciones + (r.menciones === 1 ? ' mención' : ' menciones');
      if (!r.lugar.home) {
        resto += ' · ' + GEO.frentePorId(r.dominante).nombre;
        if (r.multiFrente) {
          var otros = Object.keys(r.porFrente)
            .filter(function (id) { return id !== r.dominante && id !== GEO.FRENTE_GENERAL.id && r.porFrente[id] > 0; })
            .map(function (id) { return GEO.frentePorId(id).nombre; });
          if (otros.length) resto += ' (también ' + otros.join(', ') + ')';
        }
      }
      li.appendChild(document.createTextNode(resto));
      ul.appendChild(li);
    });
  }

  /* ═══════════ El radar ═══════════ */
  var CX = 100, CY = 100, RMAX = 82;
  var ANILLOS = [1500, 6000, 13000]; // km, rótulos de referencia
  var DMAX = 20015; // medio meridiano terrestre: la distancia máxima posible
  function radioDe(km) { return RMAX * Math.sqrt(Math.min(km, DMAX) / DMAX); }

  function trazarBase(svg) {
    // Los anillos se dibujan sin rótulo de distancia (Carlos, 4-sep-2026: "los
    // indicadores de distancia no son necesarios"): el radar dice DÓNDE pasa
    // algo respecto a Madrid, no a cuántos kilómetros.
    ANILLOS.forEach(function (km) {
      svg.appendChild(crear('circle', { cx: CX, cy: CY, r: radioDe(km).toFixed(1), class: 'brf-rad-tenue' }));
    });
    svg.appendChild(crear('circle', { cx: CX, cy: CY, r: RMAX, class: 'brf-rad-borde' }));
    for (var a = 0; a < 360; a += 45) {
      var rad = a * Math.PI / 180;
      svg.appendChild(crear('line', {
        x1: CX, y1: CY,
        x2: (CX + RMAX * Math.sin(rad)).toFixed(1), y2: (CY - RMAX * Math.cos(rad)).toFixed(1),
        class: 'brf-rad-tenue'
      }));
    }
  }

  function cuñaPath(a0, a1) {
    var r0 = a0 * Math.PI / 180, r1 = a1 * Math.PI / 180;
    var x0 = CX + RMAX * Math.sin(r0), y0 = CY - RMAX * Math.cos(r0);
    var x1 = CX + RMAX * Math.sin(r1), y1 = CY - RMAX * Math.cos(r1);
    return 'M' + CX + ',' + CY + ' L' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' A' + RMAX + ',' + RMAX + ' 0 0 1 ' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' Z';
  }
  function trazarBarrido(g, angulo) {
    g.textContent = '';
    var pasos = 7, ancho = 26;
    for (var i = pasos - 1; i >= 0; i--) {
      var a0 = angulo - (ancho / pasos) * (i + 1), a1 = angulo - (ancho / pasos) * i;
      var op = (0.14 * (pasos - i) / pasos).toFixed(3);
      g.appendChild(crear('path', { d: cuñaPath(a0, a1), fill: 'rgba(56,189,248,' + op + ')', stroke: 'none' }));
    }
    var rad = angulo * Math.PI / 180;
    g.appendChild(crear('line', {
      x1: CX, y1: CY,
      x2: (CX + RMAX * Math.sin(rad)).toFixed(1), y2: (CY - RMAX * Math.cos(rad)).toFixed(1),
      stroke: 'var(--accent)', 'stroke-width': 1
    }));
  }

  /* La etiqueta flotante: UNA sola, compartida por todos los puntos del
     radar, que se mueve y cambia de texto según qué punto está enfocado o
     tocado. Nunca compite por sitio con OTRA etiqueta -- solo hay una
     activa a la vez -- pero sí puede competir por sitio con OTRO PUNTO: en
     un lienzo tan pequeño (150-190px, el hueco que antes ocupaban las
     barras) con hasta 17 lugares, varios caen cerca unos de otros (Oriente
     Medio, sobre todo), y una etiqueta de ancho fijo hacia la derecha podía
     taparle el punto al vecino. Por eso prueba varias posiciones alrededor
     del punto activo (mismo principio que el colocador de la primera
     vuelta del boceto, aplicado aquí a un solo elemento en vez de a
     todos) y elige la primera que no pisa ningún OTRO punto; si ninguna
     queda perfectamente libre, se queda con la que menos pisa -- sigue
     teniendo que mostrar algo, a diferencia de una etiqueta fija que se
     podía omitir. */
  function crearEtiquetaFlotante(svg) {
    var g = crear('g', { class: 'brf-rad-flot', hidden: 'hidden' });
    var fondo = crear('rect', { class: 'brf-rad-flot-fondo', rx: 2, ry: 2 });
    var t1 = crear('text', { class: 'brf-rad-flot-t1' });
    var t2 = crear('text', { class: 'brf-rad-flot-t2' });
    g.appendChild(fondo); g.appendChild(t1); g.appendChild(t2);
    svg.appendChild(g);
    var elementoFijado = null; // qué círculo de toque tiene la etiqueta "clavada" (clic/toque), o null
    var funcionFijada = null; // su propio `mostrar()`, para poder recuperarla tras un simple paso por otro punto

    function colocarTexto(lx, ly, anchor) {
      t1.setAttribute('x', lx); t1.setAttribute('y', (ly - 3).toFixed(1)); t1.setAttribute('text-anchor', anchor);
      t2.setAttribute('x', lx); t2.setAttribute('y', (ly + 9).toFixed(1)); t2.setAttribute('text-anchor', anchor);
      // Fondo de contraste, medido sobre el texto real ya puesto en el DOM
      // -- así el ancho es el que es, no una estimación por caracteres.
      var b1 = t1.getBBox(), b2 = t2.getBBox();
      return {
        left: Math.min(b1.x, b2.x) - 3, right: Math.max(b1.x + b1.width, b2.x + b2.width) + 3,
        top: b1.y - 2, bottom: b2.y + b2.height + 2
      };
    }
    function chocaConPin(bb, pin) {
      return !(bb.right < pin.x - pin.radio - 1 || bb.left > pin.x + pin.radio + 1 ||
        bb.bottom < pin.y - pin.radio - 1 || bb.top > pin.y + pin.radio + 1);
    }
    // Cuánto se sale del lienzo (0 = dentro del todo): mismo espíritu que
    // `dentro()` del colocador de la primera vuelta, pero como penalización
    // graduada en vez de sí/no -- así el candidato "un poco fuera" sigue
    // pudiendo ganar si es la única opción sin ningún punto pisado.
    function fueraDelLienzo(bb) {
      var m = 3;
      return Math.max(0, m - bb.left) + Math.max(0, bb.right - (200 - m)) +
        Math.max(0, m - bb.top) + Math.max(0, bb.bottom - (200 - m));
    }
    return {
      /* SOLO 'start'/'end' -- nunca 'middle': un ancla centrada hace que el
         texto crezca en las DOS direcciones a la vez, y con una etiqueta
         larga eso basta para cruzar el lienzo entero (medido: 239 unidades
         de ancho en un lienzo de 200, la causa real del solape con un punto
         a 55 unidades de distancia). 'start'/'end' crece en una sola
         dirección desde el punto, mucho más fácil de mantener a raya. */
      mostrar: function (item, otrosPines, nombre, detalle) {
        // F5 (revisión externa, ronda 2): quitar `hidden` ANTES de medir, no
        // después. Con el <g> todavía oculto (`display:none` por CSS),
        // `getBBox()` puede devolver un rectángulo vacío en algunos
        // motores -- Chromium mide bien de todos modos y por eso no se vio
        // en las capturas, pero no es el comportamiento garantizado por la
        // especificación. El texto vale '' hasta la línea de abajo, así que
        // no hay ningún parpadeo visible al quitar `hidden` primero.
        g.removeAttribute('hidden');
        t1.textContent = nombre; t2.textContent = detalle;
        var r = item.radio;
        var candidatos = [
          { dx: r + 4, dy: -3, anchor: 'start' },
          { dx: -(r + 4), dy: -3, anchor: 'end' },
          { dx: r + 4, dy: 12, anchor: 'start' },
          { dx: -(r + 4), dy: 12, anchor: 'end' },
          { dx: r + 4, dy: -18, anchor: 'start' },
          { dx: -(r + 4), dy: -18, anchor: 'end' },
          { dx: r + 4, dy: 24, anchor: 'start' },
          { dx: -(r + 4), dy: 24, anchor: 'end' },
          { dx: r + 4, dy: -32, anchor: 'start' },
          { dx: -(r + 4), dy: -32, anchor: 'end' },
          { dx: r + 4, dy: 38, anchor: 'start' },
          { dx: -(r + 4), dy: 38, anchor: 'end' }
        ];
        var mejor = null, mejorPuntaje = Infinity;
        for (var i = 0; i < candidatos.length && mejorPuntaje > 0; i++) {
          var c = candidatos[i];
          var lx = item.x + c.dx, ly = item.y + c.dy;
          var bb = colocarTexto(lx, ly, c.anchor);
          var choques = 0;
          for (var j = 0; j < otrosPines.length; j++) if (chocaConPin(bb, otrosPines[j])) choques++;
          // Un solape con un punto pesa mucho más que sobresalir un poco del
          // borde: preferir "se sale 2 unidades del lienzo" a "tapa a Rusia".
          var puntaje = choques * 100 + fueraDelLienzo(bb);
          if (puntaje < mejorPuntaje) { mejorPuntaje = puntaje; mejor = { lx: lx, ly: ly, anchor: c.anchor }; }
        }
        var bbFinal = colocarTexto(mejor.lx, mejor.ly, mejor.anchor);
        fondo.setAttribute('x', bbFinal.left.toFixed(1)); fondo.setAttribute('y', bbFinal.top.toFixed(1));
        fondo.setAttribute('width', (bbFinal.right - bbFinal.left).toFixed(1)); fondo.setAttribute('height', (bbFinal.bottom - bbFinal.top).toFixed(1));
      },
      ocultar: function () { g.setAttribute('hidden', 'hidden'); },
      /* F4 (revisión externa, ronda 2): la etiqueta "clavada" con un clic o
         un toque solo se soltaba clavando OTRA -- tocar fuera del radar, o
         en una zona vacía del propio lienzo, la dejaba pegada para siempre.
         En táctil (sin :hover que la sustituya de forma natural) es un
         bloqueo real. `elementoFijado` vive aquí, no en cada pin, para que
         UN solo listener de `document` (añadido una vez por radar, ver
         `crearRadar`) pueda soltarla sin tener que enterarse de cuántos
         pines hay ni recorrerlos. */
      fijar: function (el, mostrarDeNuevo) { elementoFijado = el; funcionFijada = mostrarDeNuevo; },
      estaFijado: function (el) { return elementoFijado === el; },
      haySujetoFijado: function () { return elementoFijado !== null; },
      // Cuando el ratón sale de un pin SIN fijar mientras otro sigue
      // fijado, la etiqueta vuelve a mostrar la del fijado en vez de
      // esconderse (antes se perdía la fijación en cuanto se pasaba por
      // cualquier otro punto, aunque `fijado` siguiera "true" por dentro).
      remostrarFijado: function () { if (funcionFijada) funcionFijada(); },
      soltarFijado: function () {
        if (elementoFijado === null) return;
        elementoFijado = null; funcionFijada = null;
        g.setAttribute('hidden', 'hidden');
      }
    };
  }

  /* Construye la lista de pines (posición, radio, color de frente) a partir
     del resultado de CT_GEO.detectarLugares. */
  function construirPines(resultados) {
    var otros = resultados.filter(function (r) { return !r.lugar.home; });
    var home = resultados.filter(function (r) { return r.lugar.home; })[0];
    var radHome = radioPin(home ? home.menciones : 1);
    var itemHome = {
      x: CX, y: CY, radio: radHome, radioToque: radioToque(radHome),
      texto: 'Madrid', detalle: home ? ('España · ' + home.menciones + (home.menciones === 1 ? ' mención' : ' menciones')) : 'Sede de CT Advisory',
      prioridad: Infinity, home: true, color: 'var(--ink)'
    };
    var itemsOtros = otros.map(function (r) {
      var d = GEO.distanciaKm(GEO.MADRID.lat, GEO.MADRID.lon, r.lugar.lat, r.lugar.lon);
      var brng = GEO.rumboInicial(GEO.MADRID.lat, GEO.MADRID.lon, r.lugar.lat, r.lugar.lon);
      var rad = radioDe(d);
      var a = brng * Math.PI / 180;
      var radio = radioPin(r.menciones);
      var frDom = GEO.frentePorId(r.dominante);
      // `detalle`: completo, para aria-label/title (sin límite de espacio,
      // el lector de pantalla no tiene lienzo que desbordar).
      var detalle = r.menciones + (r.menciones === 1 ? ' mención · ' : ' menciones · ') + frDom.nombre;
      if (r.multiFrente) detalle += ' y otros';
      // `detalleFlot`: el frente solo, abreviado si hace falta -- lo que de
      // verdad cabe en la etiqueta flotante del lienzo pequeño. El número
      // de menciones ya lo dice el TAMAÑO del punto; no hace falta repetirlo
      // aquí para que la etiqueta quepa.
      return {
        x: CX + rad * Math.sin(a), y: CY - rad * Math.cos(a), radio: radio, radioToque: radioToque(radio),
        texto: r.lugar.nombreCorto || r.lugar.nombre, detalle: detalle, detalleFlot: nombreFrenteFlotante(r.dominante),
        prioridad: r.menciones, home: false, color: colorDeFrente(r.dominante), multiFrente: r.multiFrente
      };
    });
    return { home: itemHome, otros: itemsOtros, todos: [itemHome].concat(itemsOtros) };
  }

  /* Cablea la interacción (foco de teclado, ratón, toque) de un pin contra
     la etiqueta flotante compartida. `elHit` es el círculo grande e
     invisible -- el de verdad, el visible, puede ser más pequeño que un
     dedo.

     El "fijado" (clic o toque, para poder leer la etiqueta sin mantener el
     dedo encima) vive en `flotante`, compartido por todos los pines, no en
     una variable local de cada uno -- corrección de la ronda 2 de revisión:
     la versión anterior guardaba `fijado` por pin y "avisaba" a los demás
     con un evento (`elHit.dispatchEvent(..., {bubbles:true})`) que SOLO
     sube por los ANCESTROS de `elHit`, nunca llega a un pin hermano -- así
     que "solo un pin fijado a la vez" nunca funcionó de verdad, y tocar
     fuera del radar tampoco soltaba nada (F4, revisión externa MiniMax). */
  function cablearInteraccion(elHit, item, otrosPines, flotante) {
    elHit.setAttribute('tabindex', '0');
    elHit.setAttribute('role', 'img');
    elHit.setAttribute('aria-label', item.texto + (item.home ? '' : ', ' + item.detalle));
    var titulo = crear('title', {});
    titulo.textContent = item.texto + (item.home ? '' : ' · ' + item.detalle);
    elHit.appendChild(titulo);

    function mostrar() { flotante.mostrar(item, otrosPines, item.texto, item.detalleFlot || item.detalle); }
    function alSalir() {
      if (flotante.estaFijado(elHit)) return; // sigue clavada: no se oculta solo por salir
      if (flotante.haySujetoFijado()) flotante.remostrarFijado(); // vuelve a la que sí sigue fijada
      else flotante.ocultar();
    }
    elHit.addEventListener('pointerenter', mostrar);
    elHit.addEventListener('pointerleave', alSalir);
    elHit.addEventListener('focus', mostrar);
    elHit.addEventListener('blur', alSalir);
    elHit.addEventListener('click', function (e) {
      e.stopPropagation();
      if (flotante.estaFijado(elHit)) { flotante.soltarFijado(); return; }
      flotante.fijar(elHit, mostrar);
      mostrar();
    });
  }

  /* Recorta el círculo de TOQUE (invisible) de cada pin a como mucho la
     mitad de la distancia real a su vecino más próximo -- nunca invadiendo
     al vecino, aunque eso deje un círculo más pequeño de lo cómodo para un
     dedo. Sin esto, en un grupo de lugares muy juntos (el Golfo, ese día:
     Rusia, Irán, Ormuz, Jordania, EAU y Baréin) los círculos de toque se
     montaban unos sobre otros y el último pintado se quedaba con el clic
     de todos los de abajo -- 6 de 11 puntos devolvían OTRO pin al tocar su
     propio centro (hallazgo de la revisión externa MiniMax, ronda 2,
     4-sep-2026, sonda D-a, verificado con `elementFromPoint`). */
  function limitarRadiosToque(items) {
    items.forEach(function (a) {
      var distMin = Infinity;
      items.forEach(function (b) {
        if (b === a) return;
        var dx = a.x - b.x, dy = a.y - b.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < distMin) distMin = d;
      });
      // El límite del vecino manda SIEMPRE, aunque deje un círculo incómodo
      // para el dedo -- primer intento (ronda 2) ponía `Math.max(2, ...)` como
      // mínimo "razonable", y ese suelo GANABA a un vecino a menos de ~4
      // unidades (media distancia < 2), devolviendo justo el solape que
      // pretendía evitar: EAU y Baréin, a 1,77 unidades entre sí, seguían
      // pisándose porque el suelo de 2 los inflaba por encima de esa mitad.
      // El único suelo que queda (0,5) es una guarda contra radio 0/negativo
      // en un caso extremo de coordenadas casi duplicadas, no una comodidad.
      if (isFinite(distMin)) a.radioToque = Math.min(a.radioToque, Math.max(0.5, distMin / 2 - 0.4));
    });
  }

  /* Crea el radar sobre un <svg> dado y devuelve `{ actualizar(resultados) }`. */
  function crearRadar(svg) {
    var estado = { resultados: [] };
    var rafId = null, activo = false, ultimo = 0, angulo = 0, gBarrido = null;
    var flotanteActual = null; // la instancia viva tras el último repintar(), para el listener de "tocar fuera" de abajo

    function repintar() {
      svg.textContent = '';
      svg.setAttribute('viewBox', '0 0 200 200');
      /* `role="group"`, no `role="img"` (corrección de la ronda 2 de
         revisión, F6): un `role="img"` en el contenedor saca a sus
         descendientes del árbol de accesibilidad en algunos lectores de
         pantalla, así que los `tabindex`/`aria-label` de cada pin dejaban
         de anunciarse aunque siguieran siendo alcanzables con el tabulador.
         El texto largo (lista de nombres + instrucciones) ya no hace falta
         aquí: cada pin anuncia su propio nombre y frente, y la lista
         "Lugares de hoy" (visible en /intelligence/, oculta pero presente
         en la home) es la vía sin ratón para verlos todos de una vez. */
      svg.setAttribute('role', 'group');
      var nombres = estado.resultados.map(function (r) { return r.lugar.nombre; }).join(', ');
      svg.setAttribute('aria-label', nombres ? 'Radar de lugares del brief de hoy, centrado en Madrid' : 'Radar de lugares del brief, centrado en Madrid, sin lugares que mostrar hoy');
      var p = construirPines(estado.resultados);
      limitarRadiosToque(p.todos);
      trazarBase(svg);
      gBarrido = crear('g', {});
      trazarBarrido(gBarrido, angulo);
      svg.appendChild(gBarrido);

      var flotante = crearEtiquetaFlotante(svg);
      flotanteActual = flotante;

      /* Dos pasadas, a propósito: primero TODO lo visual (radios, anillos,
         puntos) de los `p.todos.length` lugares, luego TODOS los círculos
         de toque encima. Con Madrid en el centro, el radio de cada uno de
         los demás lugares nace justo en su mismo punto (100,100) -- si se
         pintaran pin a pin (línea, punto, toque; línea, punto, toque...),
         la línea del ÚLTIMO lugar quedaba por encima del círculo de toque
         de Madrid en ESE punto exacto, y un clic o un hover justo en el
         centro (el caso más obvio de probar) recaía sobre la línea en vez
         de sobre Madrid -- verificado con medición real (`elementFromPoint`
         devolvía la línea, no el círculo). Con la capa de toque siempre
         encima de todo lo demás, esto no puede volver a pasar. */
      function pintarVisual(it) {
        svg.appendChild(crear('line', { x1: CX, y1: CY, x2: it.x.toFixed(1), y2: it.y.toFixed(1), class: 'brf-rad-radio' }));
        if (it.home) svg.appendChild(crear('circle', { cx: it.x.toFixed(1), cy: it.y.toFixed(1), r: (it.radio + 3).toFixed(1), class: 'brf-rad-anillo' }));
        else if (it.multiFrente) svg.appendChild(crear('circle', { cx: it.x.toFixed(1), cy: it.y.toFixed(1), r: (it.radio + 1.8).toFixed(1), class: 'brf-rad-multi' }));
        svg.appendChild(crear('circle', { cx: it.x.toFixed(1), cy: it.y.toFixed(1), r: it.radio.toFixed(1), fill: it.color, 'data-pin': '1' }));
      }
      function pintarToque(it) {
        var hit = crear('circle', { cx: it.x.toFixed(1), cy: it.y.toFixed(1), r: it.radioToque.toFixed(1), fill: 'transparent', stroke: 'none', style: 'cursor:pointer' });
        svg.appendChild(hit);
        // Los "otros puntos" contra los que la etiqueta flotante de ESTE pin
        // comprueba solape son todos los demás -- el suyo propio ya lo evita
        // el desplazamiento (dx/dy) de cada candidato en crearEtiquetaFlotante.
        var otrosPines = p.todos.filter(function (x) { return x !== it; });
        cablearInteraccion(hit, it, otrosPines, flotante);
      }
      pintarVisual(p.home);
      p.otros.forEach(pintarVisual);
      pintarToque(p.home);
      p.otros.forEach(pintarToque);
    }

    /* F4 (revisión externa, ronda 2): tocar o clicar FUERA de cualquier pin
       -- en el resto del lienzo, en el resto de la página, donde sea --
       suelta la etiqueta clavada. Un único listener por radar (no uno por
       pin ni uno por repintado, que se irían acumulando cada vez que llega
       un brief nuevo): si el objetivo del `pointerdown` no es uno de los
       círculos de toque de ESTE radar, se suelta lo que hubiera fijado. El
       clic en un pin lo sigue gestionando su propio manejador de `click`
       (más abajo en el orden de eventos, `pointerdown` va antes) -- este
       listener no interfiere con eso, solo cubre el "fuera". */
    document.addEventListener('pointerdown', function (e) {
      if (!flotanteActual || !flotanteActual.haySujetoFijado()) return;
      var t = e.target;
      if (t && t.tagName === 'circle' && t.hasAttribute('tabindex') && svg.contains(t)) return;
      flotanteActual.soltarFijado();
    }, true);

    function tick(t) {
      if (!activo) return;
      if (!ultimo) ultimo = t;
      var dt = (t - ultimo) / 1000; ultimo = t;
      angulo = (angulo + dt * 10) % 360;
      if (gBarrido) trazarBarrido(gBarrido, angulo);
      rafId = requestAnimationFrame(tick);
    }
    function arrancar() { if (reducirMovimiento || activo) return; activo = true; ultimo = 0; rafId = requestAnimationFrame(tick); }
    function parar() { activo = false; if (rafId) cancelAnimationFrame(rafId); }
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) arrancar(); else parar(); }); }, { threshold: 0.1 });
      obs.observe(svg);
    } else if (!reducirMovimiento) arrancar();
    document.addEventListener('visibilitychange', function () { if (document.hidden) parar(); else if (!reducirMovimiento) arrancar(); });

    return {
      actualizar: function (resultados) {
        estado.resultados = resultados || [];
        var otros = estado.resultados.filter(function (r) { return !r.lugar.home; });
        if (otros.length) {
          var sx = 0, sy = 0;
          otros.forEach(function (r) {
            var brng = GEO.rumboInicial(GEO.MADRID.lat, GEO.MADRID.lon, r.lugar.lat, r.lugar.lon);
            var a = brng * Math.PI / 180;
            sx += Math.sin(a) * r.menciones; sy += -Math.cos(a) * r.menciones;
          });
          angulo = (Math.atan2(sx, -sy) * 180 / Math.PI + 360) % 360;
        } else angulo = 0;
        repintar();
      }
    };
  }

  window.CT_RADAR = { crear: crearRadar, pintarLista: pintarLista };
})();
