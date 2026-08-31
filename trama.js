/* ═══════════════════════════════════════════════════════════════════════
   LA TRAMA · una sola, continua, en toda la web
   ───────────────────────────────────────────────────────────────────────
   ESTE FICHERO ES LA ÚNICA COPIA. `inyectar-trama.js` lo mete dentro del
   <script> de home-medianoche.html y de trama-motor.html, y de ahí pasa a
   las landings, a Wealth, a los legales y al brief. Antes vivía duplicado
   a mano en los dos sitios y se dieron veinticuatro horas en que la home
   tenía una versión y todo lo demás otra sin que nadie lo notara.

   Un único lienzo fijo detrás de todo el documento. No es un fondo por
   sección: es una sola materia que cubre la ventana de extremo a extremo
   y que va cambiando de comportamiento según por dónde se está leyendo.
   Nunca desaparece, nunca vuelve a aparecer, y no hay un solo borde donde
   empiece o acabe.

   LA MARCA NO ES UN PUNTO, ES UN TRAZO. Un campo de puntos redondos con
   hilos entre ellos es un cielo estrellado, y un cielo estrellado no dice
   nada de una firma que lee datos financieros: dice "fondo animado de
   plantilla". Cada partícula se pinta como un renglón horizontal corto,
   de largo variable, que deriva de izquierda a derecha. Eso es una serie
   temporal, una cinta de cotización, una línea de registro — el
   vocabulario del oficio, no el del planetario.

   El largo va al cuadrado y multiplicado por la velocidad de deriva: la
   mayoría son marcas cortas, unas pocas son tiradas largas, y lo que va
   más rápido deja más rastro. Es lo que separa una serie de datos de una
   regla graduada.

   Y EL ENLACE ES UNA COINCIDENCIA, NO UNA MALLA. Solo aparece un trazo
   vertical cuando dos renglones de filas contiguas se solapan de verdad
   en la misma vertical, y su fuerza es cuánto se solapan. No hay enlaces
   horizontales: los renglones YA son horizontales, unirlos entre sí solo
   daría una línea más larga. Así que lo único que se dibuja de más, y muy
   de vez en cuando, es el momento en que dos series se alinean. Que es
   exactamente lo que este negocio busca en una pantalla.

   La transición entre secciones no es un corte. Cada sección declara un
   modo, y el punto de lectura (el centro de la ventana) se mueve entre el
   centro de una sección y el de la siguiente: en ese tramo cada partícula
   calcula su sitio en los DOS modos y viaja de uno a otro.

   Los modos, y lo que dice cada uno:

     malla     el dato en bruto que se ordena al recorrer. Es el hero, y
               es el negocio entero en un gesto.
     orbita    preparar: rodear un negocio antes de tocarlo.
     embudo    ejecutar: de muchos arriba a uno abajo.
     onda      acompañar: sostener algo que ya funciona.
     carriles  la idea: todo converge a las tres cifras.

   Y tres parámetros que cualquier sección mueve sobre el modo que tenga:
   `orden` (cuánto se ha resuelto ya), `alfa` (cuánto pesa aquí) y `reac`
   (cuánto responde al puntero: 1 en el hero, casi nada en el resto).
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  var cv = document.querySelector('.trama-global');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino   = window.matchMedia('(pointer: fine)').matches;
  var dpr    = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;

  var CIAN = ['56,189,248'];

  /* ── Las cifras ───────────────────────────────────────────────────────
     De vez en cuando un renglón se abre y resulta que era un dato. Es lo
     que separa este fondo de una textura bonita: la materia que cruza la
     pantalla es la misma con la que se trabaja.

     NO SON COTIZACIONES A PROPÓSITO. Un ticker con una cifra inventada es
     un dato falso sobre un valor real, y esta casa no puede permitirse
     escribir eso ni de adorno.

     Y DESDE EL 26-AGO YA NO SON INVENTADAS. Las de antes eran verosímiles
     y nada más: 'MARGEN 14,2%' no salía de ningún sitio. Estas veinte
     están copiadas del informe de valoración de muestra que la firma
     publica en su web, cifra por cifra y con la página de la que sale cada
     una anotada en el commit. Un fondo que dice "aquí se hace análisis
     financiero" con números que nadie calculó es exactamente el gesto que
     el posicionamiento de la casa prohíbe, y encima es el más fácil de no
     hacer: el informe ya estaba escrito.

     Dos que sí están en el informe se han dejado fuera: un ROIC del 95,4%
     y una cobertura de intereses de 153x. Son ciertas y son excepcionales,
     y una cifra excepcional en un fondo decorativo se lee como
     fanfarronada o como errata. Lo que tiene que sugerir el fondo es el
     oficio, no el mejor número del oficio.

     Sobre la confidencialidad: el informe es material de marketing ya
     publicado y ya anonimizado, así que estas cifras no son nuevas ahí
     fuera. Ninguna arrastra sector, provincia ni tamaño de plantilla, que
     es lo que en ese documento sí permitiría estrechar el cerco. */
  var DATOS = [
    'EV/EBITDA  4,0x', 'EV/EBITDA COMPS  5,33x', 'TRANSACCIONES  11,5x',
    'WACC  17,75%', 'MARGEN EBITDA  38,7%', 'MARGEN NETO  27,4%',
    'CRECIMIENTO ING.  5,6%', 'DEUDA/EBITDA  -0,2x', 'DSCR  4,1x',
    'DÍAS COBRO  72 d', 'CIRCULANTE/ING.  20%', 'TIPO IMPOSITIVO  25%',
    'CREC. PERPETUO  2%', 'PRIMA TAMAÑO  6,0%', 'PRIMA ESPECÍFICA  3,0%',
    'CONVERSIÓN FCFF  73,6%', 'ROE  18,4%', 'ROA  29,5%',
    'DESCUENTO TAMAÑO  25%', 'PRIMA CONTROL  29%'
  ];
  var ANCHOS = new Float32Array(DATOS.length), FUENTE = '';
  /* Hasta que la tipografía de verdad no ha cargado, NO se abre ninguna
     cifra. Remedir los anchos cuando llegue —que es lo que se hacía— acorta
     la ventana de error pero no la cierra: durante esos cientos de
     milisegundos las cifras se dimensionan con la fuente de reserva, así
     que la comprobación de si caben y el hueco que reservan se calculan con
     un ancho que no es el que se pinta. Media docena de cifras mal puestas
     al abrir la página, justo cuando alguien la ve por primera vez. Es más
     barato callarlas un momento que ponerlas mal. */
  var fuenteLista = false;

  /* El reloj del motor avanza .125 por cada segundo real (ver `bucle`).
     Las dos constantes se escriben en segundos porque es en segundos como
     se decidieron mirándolas, y se convierten aquí una sola vez. */
  var T_SEG   = .125;
  var CICLO   = 24 * T_SEG;     // cada cuánto le vuelve a tocar a un renglón
  var VENTANA = 1.85 * T_SEG;   // cuánto dura la apertura
  /* Qué fracción de renglones llega a abrirse alguna vez. Sale de querer
     unas dos cifras y media abiertas a la vez en escritorio: con 680
     renglones y una ventana que ocupa el 7,7% del ciclo, .048 las da. En
     móvil hay 260 renglones y el mismo número da una, que es lo que cabe. */
  var DENS = .048;
  /* Alfa media de una cifra en su pico de apertura. Ver la nota larga en
     `pintar`: va aparte del alfa de la materia a propósito. */
  var A_CIFRA = .125;

  /* ── El degradado y la zona de respeto ────────────────────────────────
     El texto de esta web vive en la mitad izquierda de la pantalla. Así
     que la materia baja donde se lee y sube donde no hay nada, en vez de
     repartirse plana y competir con el titular justo donde importa.

     VA COMO FACTOR DE MEDIA 1, no como alfa absoluto: redistribuye cuánta
     materia hay a cada altura sin cambiar cuánta hay en total, así que
     las ocho alfas que ya declara el HTML siguen valiendo tal cual y no
     hubo que reescalar ninguna.

     La curva importa. Con una recta, a media pantalla ya hay medio peso, y
     media pantalla es justo donde el titular del hero todavía está: llega
     al 65% del ancho. Con exponente 1,9 la subida se retrasa hasta pasado
     ese punto sin bajar el máximo del borde derecho. */
  var A_IZQ = .028, A_DER = .135, CURVA = 1.9;
  var GRAD = new Float32Array(257);
  (function(){
    /* Tabla en vez de `Math.pow` por partícula y por fotograma: medido,
       costaba 7 fps de 53. La precisión no se resiente porque el alfa se
       cuantiza después a pasos de .006 al agrupar por tono. */
    var media = A_IZQ + (A_DER - A_IZQ) / (CURVA + 1);
    for (var i = 0; i <= 256; i++)
      GRAD[i] = (A_IZQ + (A_DER - A_IZQ) * Math.pow(i / 256, CURVA)) / media;
  })();
  /* Cuánto se aparta una cifra de una caja de texto antes de encenderse.
     Por debajo de eso se atenúa, y si la pisa no sale. */
  var MARGEN = 18;

  /* Ruido estable: la misma trama en cada carga. Con Math.random la
     página sería distinta cada vez, que es lo que hace que algo parezca
     generado en vez de diseñado. */
  function seed(n){
    var s = Math.sin(n * 127.1) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  }

  var FILAS = 16, PTS = 0, pts = [], POR_FILA = 34;
  /* Buffers de la fila anterior y la actual, para poder mirar si el
     renglón de arriba se solapa con este sin recorrer los puntos dos
     veces. Se reservan una vez por construcción, no por fotograma. */
  var pfX, pfY, pfA, pfL, cfX, cfY, cfA, cfL;
  function construir(){
    var estrecho = window.innerWidth < 760;
    FILAS = estrecho ? 13 : 20;
    var porFila = estrecho ? 20 : 34;
    pts = [];
    for (var r = 0; r < FILAS; r++){
      for (var c = 0; c < porFila; c++){
        var k = r * porFila + c;
        var vx = 0.055 + (seed(k + 900) + 1) * 0.028;
        pts.push({
          fila: r, filas: FILAS, col: c,
          /* La columna se desordena de salida. Con `c / porFila` limpio,
             los renglones de una misma columna arrancan exactamente en la
             misma vertical, así que durante el primer minuto de vida de la
             página TODOS se alinean con el de arriba y la trama se ve como
             una reja. La deriva los separa, pero tarda: a la velocidad de
             deriva de la casa hacen falta minutos para abrir cuarenta
             píxeles, y la primera impresión ya se ha dado. */
          u:   (c + seed(k + 7700) * .42) / porFila,
          jit: seed(k),
          vx:  vx,
          ph:  (seed(k + 1700) + 1) * 3.14159,
          /* Órbita: ángulo de salida y radio. La raíz reparte por ÁREA y
             no por radio; sin ella el disco sale hueco por fuera. */
          ang: (seed(k + 2100) + 1) * Math.PI,
          rad: Math.sqrt((seed(k + 4700) + 1) / 2) * .95 + .05,
          /* Altura de entrada del embudo, para que no caigan a la vez. */
          v0:  c / porFila + seed(k + 9300) * .012,
          /* El largo del renglón, en píxeles. Ver la nota de cabecera. */
          lar: (4.5 + Math.pow((seed(k + 3300) + 1) / 2, 1.7) * 34) * (.7 + vx * 3.4),
          /* Cuánto tiende este renglón a reconocer una alineación. Al
             cubo, así que la mayoría no la marca nunca y unos pocos sí:
             es lo que separa una coincidencia de una cuadrícula. */
          soc: Math.pow((seed(k + 5500) + 1) / 2, 3),
          /* Las tres tiradas de la cifra, guardadas y no sorteadas en cada
             fotograma: si este renglón llega a abrirse alguna vez, cuándo
             le toca dentro del ciclo, y qué dato dice. Que estén guardadas
             es lo que hace que cambiar la densidad mueva el umbral y no los
             dados: el mismo renglón sigue diciendo lo mismo. */
          sRev:  (seed(k + 6100) + 1) / 2,
          sFase: (seed(k + 8800) + 1) / 2,
          di:    Math.min(DATOS.length - 1,
                   ((seed(k + 2900) + 1) / 2 * DATOS.length) | 0),
          /* Sitio pintado, que persigue al calculado. Ver `pintar`. */
          px: 0, py: 0, on: 0
        });
      }
    }
    PTS = pts.length;
    POR_FILA = porFila;
    pfX = new Float32Array(porFila); pfY = new Float32Array(porFila);
    pfA = new Float32Array(porFila); pfL = new Float32Array(porFila);
    cfX = new Float32Array(porFila); cfY = new Float32Array(porFila);
    cfA = new Float32Array(porFila); cfL = new Float32Array(porFila);
  }

  /* ── Los modos ────────────────────────────────────────────────────────
     Cada uno devuelve la posición y el brillo de UNA partícula. Se llaman
     dos veces por fotograma durante una transición, una por modo, y el
     resultado se mezcla. Por eso son funciones puras y baratas. */
  var MODOS = {
    malla: function(p, t, o, out){
      var u = (p.u + t * p.vx) % 1;
      var rowH = H / (p.filas - 1);
      var caos = Math.pow(1 - u, 1.5) * (1 - o);
      out[0] = u * W;
      out[1] = p.fila * rowH + p.jit * caos * rowH * 1.9;
      out[2] = Math.min(1, u * 5) * Math.min(1, (1 - u) * 5);
      return out;
    },
    carriles: function(p, t, o, out){
      /* Tres corrientes, una por cifra del puente. El resto del cálculo
         es el de la malla: lo único que cambia es a cuántos sitios se
         puede ordenar. */
      var u = (p.u + t * p.vx) % 1;
      var carril = p.fila % 3;
      var sep = H / 4;
      var base = sep * (carril + 1);
      var caos = Math.pow(1 - u, 1.5) * (1 - o);
      out[0] = u * W;
      out[1] = base + p.jit * caos * sep * 1.5;
      out[2] = Math.min(1, u * 5) * Math.min(1, (1 - u) * 5);
      return out;
    },
    orbita: function(p, t, o, out){
      var cx = W * .5, cy = H * .5;
      var rx = W * .34, ry = H * .34;
      /* Rotación diferencial: los de fuera tardan más. Es lo que hace que
         el conjunto se lea con volumen y no como una rueda rígida. */
      var vel = .30 / (.45 + p.rad * .9);
      var a = p.ang + t * vel * 8;
      out[0] = cx + Math.cos(a) * rx * p.rad;
      out[1] = cy + Math.sin(a) * ry * p.rad;
      /* Los de delante del disco brillan algo más: eso es la profundidad.
         El rango va comprimido a propósito: la trama tiene que pesar lo
         mismo en toda la web, lo que cambia es la forma, no el ruido. */
      out[2] = .66 + (Math.sin(a) + 1) / 2 * .34;
      return out;
    },
    embudo: function(p, t, o, out){
      var v = (p.v0 + t * p.vx * .42) % 1;
      /* La boca se cierra con curva y no en recta: recto es una V y se
         lee como un gráfico; con curva es un embudo. */
      var abre = 1 - Math.pow(v, .78) * .88;
      out[0] = W * .5 + p.jit * (W * .5) * abre;
      out[1] = v * H;
      out[2] = Math.min(1, v * 7) * Math.min(1, (1 - v) * 5) * (.72 + v * .28);
      return out;
    },
    onda: function(p, t, o, out){
      /* Cada fila es una onda con su propia fase: sostener algo no es una
         línea plana, es un movimiento que se mantiene. */
      var u = (p.u + t * p.vx * .6) % 1;
      var rowH = H / (p.filas - 1);
      var base = p.fila * rowH;
      var amp = rowH * .55 * (1 - o * .4);
      out[0] = u * W;
      out[1] = base + Math.sin(u * 6.2832 * 1.5 + t * 1.1 + p.ph) * amp;
      out[2] = Math.min(1, u * 5) * Math.min(1, (1 - u) * 5);
      return out;
    }
  };

  /* ── Las secciones y el punto de lectura ──────────────────────────────
     Cada sección con data-trama declara su modo y sus parámetros. La
     interpolación va de CENTRO a CENTRO: mientras el punto de lectura
     está entre el centro de una sección y el de la siguiente, la trama
     viaja de un modo al otro. Así no hay ningún salto y la sección no
     tiene bordes visibles en el fondo. */
  var secs = [];
  /* Lo que una sección cambia en caliente (el proceso su orden, servicios
     su modo) tiene que sobrevivir a una remedición. Sin esto, cualquier
     clic en la página volvía a leer los atributos del HTML y borraba el
     cambio: la fase de Ejecutar dejaba el fondo orbitando. */
  var puesto = new WeakMap();
  function medirSecciones(){
    secs = [];
    var nodos = document.querySelectorAll('[data-trama]');
    for (var i = 0; i < nodos.length; i++){
      var el = nodos[i];
      if (el.offsetParent === null && el.getClientRects().length === 0) continue;
      var op = {};
      try { op = JSON.parse(el.getAttribute('data-trama') || '{}'); }
      catch (e) {
        op = {};
        if (window.console && console.warn){
          console.warn('[trama] data-trama no es JSON válido, se usan los valores por defecto:',
            el.getAttribute('data-trama'));
        }
      }
      var r = el.getBoundingClientRect();
      var yaPuesto = puesto.get(el) || {};
      secs.push({
        el: el,
        centro: r.top + window.pageYOffset + r.height / 2,
        modo:   yaPuesto.modo || (MODOS[op.modo] ? op.modo : 'malla'),
        orden:  yaPuesto.orden != null ? yaPuesto.orden
                : (op.orden != null ? op.orden : 0),
        alfa:   op.alfa   != null ? op.alfa   : 0.30,
        /* Cuánto responde al puntero. Por defecto casi nada: la reacción
           acentuada es del hero, donde el visitante todavía está
           decidiendo si esto lo ha hecho alguien que sabe. Repetirla en
           las ocho secciones la convierte en un tic. */
        reac:   op.reac   != null ? op.reac   : 0.14,
        /* Si en esta sección los renglones llegan a abrirse en cifras.
           Solo donde el texto habla de análisis: el hero, la idea y CT
           Intelligence. En Sobre mí una cifra de fondo competiría con lo
           único de la página que no es un dato. */
        datos:  op.datos  != null ? op.datos  : 0,
        colores: op.colores || CIAN
      });
    }
    secs.sort(function(a, b){ return a.centro - b.centro; });
    medirZonas();
  }

  /* ── Dónde NO puede salir una cifra ───────────────────────────────────
     Las cajas de las líneas de texto de las secciones que llevan cifras,
     en coordenadas de documento para que sobrevivan al scroll. Se miden
     con un rango sobre el contenido y no con el rect del bloque: un
     párrafo de una línea dentro de un contenedor ancho tiene el bloque
     ancho y el texto corto, y reservar el bloque entero apagaría media
     pantalla sin motivo.

     SE MIDE LA PÁGINA ENTERA, no solo las tres secciones que llevan
     cifras, y la primera versión se equivocó justo ahí. Una cifra nace
     dentro de su sección pero se pinta en toda la ventana, y la ventana
     alcanza la cabecera, el pie y la sección siguiente durante la
     transición. Medido: vigilando solo las tres secciones se colaban 127
     de cada 1.158 cifras, la mayoría encima del menú. El ahorro no valía
     el agujero, y el recorrido por fotograma no depende de este total —
     se acota antes a lo que cabe en la ventana. */
  var zonas = [], zonasCortadas = 0, TOPE_ZONAS = 1600;
  var SIN_TEXTO = { SCRIPT:1, STYLE:1, NOSCRIPT:1, TEMPLATE:1, CANVAS:1 };

  /* ── Lo que no está anclado al documento ──────────────────────────────
     Una cabecera pegajosa, o un panel que se queda quieto mientras su
     sección pasa por debajo, NO tiene una posición de documento estable:
     guardarla como `top + scroll` la clava donde estuviera al medir y deja
     de proteger su sitio real en cuanto la página se mueve. Medido en la
     home: 51 de las 295 cajas de texto cuelgan de algo pegajoso —la
     cabecera y el panel del proceso— y eran la mayor parte de las cifras
     que se colaban encima del menú.

     Se guarda el ELEMENTO pegajoso, no sus renglones, y se lee su caja una
     vez por fotograma. Son dos o tres, así que sale más barato que remedir
     51 renglones, y a cambio reserva el bloque entero en vez de sus
     líneas: en una cabecera y en un panel de proceso eso es exactamente
     lo que se quiere. */
  var fijos = [], zonasFijas = [], fijasEnormes = 0;
  /* Sube por los ancestros una sola vez y contesta las dos preguntas a la
     vez: de qué bloque pegajoso cuelga esto, y si se ve.

     LO INVISIBLE NO RESERVA SITIO, y esto costó una acusación falsa. El
     menú desplegable de la cabecera está cerrado con `visibility:hidden`,
     y eso NO le quita su caja: sigue midiendo 549×263 px justo debajo del
     menú. Contarla apagaría las cifras de un cuarto del hero por un texto
     que nadie ve; no contarla hacía que una auditoría marcara 33 solapes
     donde en pantalla no hay ni uno. */
  function analizar(el, cache){
    var cadena = [], n = el, q, fijo = null;
    while (n && n !== document.body && n.nodeType === 1){
      if (cache.has(n)){
        var v = cache.get(n);
        /* Lo heredado se combina con lo ya visto en esta subida: un fijo
           encontrado abajo sigue valiendo aunque el caché de arriba no lo
           conozca. */
        var r = { fijo: fijo || v.fijo, oculto: v.oculto };
        for (q = 0; q < cadena.length; q++) cache.set(cadena[q], r);
        return r;
      }
      cadena.push(n);
      var s;
      try { s = getComputedStyle(n); } catch (e) { s = null; }
      if (s){
        /* SOLO `visibility` y `display`, NUNCA la opacidad, y la primera
           versión se equivocó justo ahí. La opacidad se anima: media
           página entra revelándose desde 0, así que al medir en carga todo
           lo que estaba bajo el pliegue valía 0 y se descartaba PARA
           SIEMPRE. Medido: las zonas vigiladas cayeron de 399 a 231 y CT
           Intelligence pasó de 0 solapes a 168. Los otros dos son estados
           discretos, no se animan, y son los que el menú usa de verdad. */
        if (s.visibility === 'hidden' || s.display === 'none'){
          var oc = { fijo: fijo, oculto: true };
          for (q = 0; q < cadena.length; q++) cache.set(cadena[q], oc);
          return oc;
        }
        /* No se para aquí: por encima de un bloque pegajoso todavía puede
           haber algo oculto, y esa respuesta manda sobre la otra. */
        if (!fijo && (s.position === 'fixed' || s.position === 'sticky')) fijo = n;
      }
      n = n.parentElement;
    }
    var fin = { fijo: fijo, oculto: false };
    for (q = 0; q < cadena.length; q++) cache.set(cadena[q], fin);
    return fin;
  }
  /* Las cajas pegajosas de este fotograma, ya en coordenadas de ventana.
     Se descartan las que no la tocan para no comprobarlas después. */
  function leerFijas(){
    zonasFijas.length = 0; fijasEnormes = 0;
    var area = W * H;
    for (var i = 0; i < fijos.length; i++){
      var r = fijos[i].getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      if (r.bottom < -MARGEN || r.top > H + MARGEN) continue;
      /* Un bloque pegajoso que cubre media ventana no es una cabecera, es
         un contenedor de fondo. Reservarlo entero apagaría las cifras de
         toda la página de una vez, que es un fallo mucho peor que el que
         evita — así que se descarta y se deja constancia en `estado()`
         en lugar de callarlo.

         RIESGO ASUMIDO, no pasado por alto: un modal a pantalla completa
         quedaría sin proteger. Se acepta porque el lienzo está DETRÁS de
         todo, así que un modal opaco tapa el fondo y sus cifras no se ven;
         solo daría problema uno translúcido, que hoy no existe en esta
         web. Si alguna vez lo hay, la salida no es quitar esta guarda
         —volvería el fallo grande— sino medir los renglones de ese bloque
         como zonas de ventana, igual que se hace con los de documento. */
      if (r.width * r.height > area * .5){ fijasEnormes++; continue; }
      zonasFijas.push(r);
    }
  }

  function medirZonas(){
    zonas = []; zonasCortadas = 0; fijos = [];
    var rango = document.createRange();
    /* El caché propaga el resultado a toda la cadena de ancestros, así que
       el segundo hermano de un mismo bloque se resuelve en un paso. Sin
       él, subir por el árbol desde cada una de las 295 cajas costaría
       miles de consultas de estilo en cada remedición. */
    var cache = new Map();
    /* SE RECORREN LOS NODOS DE TEXTO, NO LOS BLOQUES, y las dos primeras
       versiones se estrellaron aquí. Medir el contenido de un contenedor
       arrastra a sus descendientes: el `li` del menú que dice «CT
       Intelligence» es visible y mide 16 px de alto, pero su contenido
       incluye el submenú cerrado que cuelga debajo, así que su caja salía
       de 549×263 px. Filtrar por visibilidad no lo arreglaba —el padre SÍ
       se ve—, y el resultado era una zona prohibida enorme donde en
       pantalla no hay más que una palabra.

       Recorriendo el texto, cada caja es un renglón de verdad, lo anidado
       no se cuenta dos veces, y entra también el texto de etiquetas que
       una lista de selectores se dejaba fuera. */
    var sy = window.pageYOffset;
    var tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodo;
    while ((nodo = tw.nextNode())){
      var v = nodo.nodeValue;
      if (!v || !/\S/.test(v)) continue;
      var el = nodo.parentElement;
      if (!el || SIN_TEXTO[el.tagName]) continue;
      var an = analizar(el, cache);
      if (an.oculto) continue;
      if (an.fijo){
        if (fijos.indexOf(an.fijo) < 0) fijos.push(an.fijo);
        continue;
      }
      var rs;
      try { rango.selectNodeContents(nodo); rs = rango.getClientRects(); }
      catch (e) { continue; }
      for (var k = 0; k < rs.length; k++){
        var r = rs[k];
        if (r.width < 8 || r.height < 4) continue;
        if (zonas.length >= TOPE_ZONAS){ zonasCortadas++; continue; }
        zonas.push({ l: r.left, r: r.right, t: r.top + sy, b: r.bottom + sy });
      }
    }
    zonas.sort(function(a, b){ return a.t - b.t; });
    /* Avisa a `acotarZonas` de que su tramo cacheado ya no sirve, aunque
       el scroll esté exactamente donde estaba. */
    versionZonas++;
  }

  /* Estado pintado, que persigue al estado objetivo con retardo. El
     retardo es lo que convierte un cambio en un reacomodo. */
  var vA = 'malla', vB = 'malla', vMez = 0;
  var vOrden = 0, vAlfa = .30, vReac = 1, vCol = CIAN, vColB = CIAN, vDatos = 0;
  /* Posición continua dentro de la lista de secciones (índice + mezcla),
     perseguida con retardo en vez de tomada tal cual del scroll. Sin esto
     la mezcla entre modos iba pegada a la velocidad del dedo: bajar
     rápido lanzaba las partículas de un lado a otro de la pantalla, y eso
     es justo lo que se lee como "raro según bajas". Ahora el scroll dice
     a dónde va la trama y la trama tarda lo suyo en llegar. */
  var vPos = -1;
  /* Cuánto le falta a la trama para llegar a donde el scroll dice. Se
     publica en `estado()` porque desde fuera no hay otra forma de saber si
     una captura está mirando el destino o el viaje, y una medición tomada a
     medio viaje se lee exactamente como un motor mal configurado. */
  var vDeriva = 0;

  function resolver(){
    if (!secs.length) return;
    var lectura = window.pageYOffset + window.innerHeight / 2;
    var i = 0;
    while (i < secs.length - 1 && secs[i + 1].centro <= lectura) i++;
    var mez = 0;
    if (i < secs.length - 1 && secs[i + 1].centro > secs[i].centro){
      mez = (lectura - secs[i].centro) / (secs[i + 1].centro - secs[i].centro);
      mez = Math.max(0, Math.min(1, mez));
    }
    var obj = i + mez;
    /* La persecución es exponencial, así que se acerca al objetivo sin
       llegar nunca. Parece inofensivo y no lo es: parado en el centro de una
       sección, vPos se queda una millonésima por debajo de su índice, el
       suelo cae a la sección anterior y la mezcla se queda clavada en 0,999.
       Con eso `mismos` es falso SIEMPRE, y cada partícula calcula su sitio en
       los dos modos en todos los fotogramas de toda la web — el doble de
       trabajo, de forma permanente, para una diferencia invisible. El pellizco
       final cierra el viaje de verdad. */
    vDeriva = vPos < 0 ? 0 : Math.abs(obj - vPos);
    if (vPos < 0) vPos = obj;
    else if (vDeriva < .0015) vPos = obj;
    else vPos += (obj - vPos) * .055;

    var ii = Math.max(0, Math.min(secs.length - 1, Math.floor(vPos)));
    var f = Math.max(0, Math.min(1, vPos - ii));
    /* Suavizado en los extremos: sin esto la mezcla arranca y termina
       con un tirón justo al cruzar un centro. */
    f = f * f * (3 - 2 * f);
    var a = secs[ii], b = secs[Math.min(ii + 1, secs.length - 1)];
    vA = a.modo; vB = b.modo; vMez = (b === a) ? 0 : f;
    /* El orden conserva su propio retardo porque es el único parámetro
       que además se cambia en caliente (el proceso, al recorrer sus
       pasos): sin él ese cambio sería un salto y no un reacomodo. */
    var objOrden = a.orden + (b.orden - a.orden) * f;
    vOrden += (objOrden - vOrden) * .06;
    vAlfa = a.alfa + (b.alfa - a.alfa) * f;
    vReac = a.reac + (b.reac - a.reac) * f;
    /* Las cifras se van apagando al salir de su sección igual que el
       peso, así que dejan de salir antes de llegar a la siguiente en vez
       de cortarse en el borde. */
    vDatos = a.datos + (b.datos - a.datos) * f;
    vCol = a.colores; vColB = b.colores;
  }

  /* Una sección puede corregir su propio orden en caliente: es lo que
     usa el proceso para resolverse conforme se recorren los pasos. */
  function buscar(sel){
    var el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return null;
    for (var i = 0; i < secs.length; i++) if (secs[i].el === el) return secs[i];
    return null;
  }
  window.CT_TRAMA = {
    ordenar: function(sel, v){
      var s = buscar(sel);
      if (!s) return;
      s.orden = Math.max(0, Math.min(1, v));
      var g = puesto.get(s.el) || {}; g.orden = s.orden; puesto.set(s.el, g);
    },
    /* Servicios cambia de modo sin cambiar de sección: al pasar de
       Preparar a Ejecutar la trama del fondo pasa de orbitar a caer. El
       viaje lo hace ahora cada partícula por su cuenta (ver `pintar`),
       así que el cambio se ve como un reacomodo y no como un corte. */
    modo: function(sel, m){
      var s = buscar(sel);
      if (!s || !MODOS[m]) return;
      s.modo = m;
      var g = puesto.get(s.el) || {}; g.modo = m; puesto.set(s.el, g);
    },
    remedir: medirSecciones,
    /* Para poder comprobar desde fuera qué está haciendo la trama en cada
       punto del scroll, en vez de juzgarlo a ojo sobre una captura. */
    estado: function(){
      /* `renglones` y `alineaciones` son del último fotograma pintado. La
         proporción entre los dos es la única forma honesta de comprobar
         que la materia sigue siendo horizontal: a ojo, y sobre una
         captura fija, una reja tenue y una serie de marcas se parecen. */
      return { modoA: vA, modoB: vB, mezcla: +vMez.toFixed(3),
               orden: +vOrden.toFixed(3), alfa: +vAlfa.toFixed(3),
               reac: +vReac.toFixed(3), colores: vCol.length,
               secciones: secs.length, puntos: PTS, deriva: +vDeriva.toFixed(4),
               fotograma: fotograma,
               renglones: nR, alineaciones: nH, w: W, h: H,
               /* Las cifras del último fotograma: cuántas se han pintado,
                  cuántas ha atenuado o apagado la zona de respeto, y sobre
                  cuántas cajas de texto se comprueba. `zonasCortadas` sale
                  de cero solo si se alcanzó el tope: cobertura parcial que
                  hay que poder ver, no callar. */
               datos: +vDatos.toFixed(3), cifras: nCif, tapados: nTap,
               zonas: zonas.length, zonasCortadas: zonasCortadas,
               fijas: zonasFijas.length, fijasEnormes: fijasEnormes };
    }
  };

  /* ── Puntero ──────────────────────────────────────────────────────── */
  var pxr = -1, pyr = -1, px = -1, py = -1, fuerza = 0, quiere = 0;
  if (fino && !quieto){
    window.addEventListener('pointermove', function(e){
      if (e.pointerType === 'touch') return;
      pxr = e.clientX; pyr = e.clientY; quiere = 1;
    }, { passive:true });
    document.addEventListener('pointerleave', function(){ quiere = 0; });
  }

  /* ── Pintar ───────────────────────────────────────────────────────── */
  var pa = [0,0,0], pb = [0,0,0];
  /* Sobreviven al fotograma a propósito: reasignarlos cada vez daría
     basura para el recolector sesenta veces por segundo. Cambiar de color
     es lo caro de este bucle, no dibujar, así que ni los renglones ni las
     alineaciones se pintan según salen: se reparten en cubos por tono y
     cada cubo se pinta de una vez al final. */
  var cubosR = Object.create(null), cubosH = Object.create(null);
  var CUBO = .006;
  var nR = 0, nH = 0;
  /* Las cifras no se pueden agrupar por tono como los renglones —cada
     `fillText` es su propia llamada— así que van a una lista plana
     [alfa, color, texto, x, y, …] y se descargan al final, después de los
     renglones: una cifra que se está abriendo tiene que quedar POR ENCIMA
     de la materia, no debajo. */
  var txt = [], nTxt = 0, nCif = 0, nTap = 0;

  /* Las tres van FUERA del bucle de pintado a propósito. Definidas dentro,
     se creaban de nuevo sesenta veces por segundo, cada una con su entorno,
     para nada: no capturan ni una variable del fotograma, todo lo que usan
     vive aquí arriba. */
  function alTexto(v, c, s, x, y){
    if (v < .012) return;
    txt[nTxt] = v; txt[nTxt+1] = c; txt[nTxt+2] = s;
    txt[nTxt+3] = x; txt[nTxt+4] = y;
    nTxt += 5; nCif++;
  }
  function alCubo(tabla, v, c, a1, b1, c1, d1){
    if (v < CUBO) return;
    if (tabla === cubosR) nR++; else nH++;
    var nivel = (v / CUBO) | 0;
    var clave = c + '|' + nivel;
    var cu = tabla[clave];
    if (!cu) cu = tabla[clave] = { n: 0, v: [], a: (nivel + .5) * CUBO, c: c };
    var n = cu.n;
    cu.v[n] = a1; cu.v[n + 1] = b1; cu.v[n + 2] = c1; cu.v[n + 3] = d1;
    cu.n = n + 4;
  }
  function descargar(){
    var k, cu, j;
    for (k in cubosR){
      cu = cubosR[k];
      if (!cu.n) continue;
      ctx.fillStyle = 'rgba(' + cu.c + ',' + cu.a.toFixed(3) + ')';
      for (j = 0; j < cu.n; j += 4) ctx.fillRect(cu.v[j], cu.v[j+1], cu.v[j+2], cu.v[j+3]);
    }
    for (k in cubosH){
      cu = cubosH[k];
      if (!cu.n) continue;
      ctx.strokeStyle = 'rgba(' + cu.c + ',' + cu.a.toFixed(3) + ')';
      ctx.beginPath();
      for (j = 0; j < cu.n; j += 4){
        ctx.moveTo(cu.v[j], cu.v[j+1]);
        ctx.lineTo(cu.v[j+2], cu.v[j+3]);
      }
      ctx.stroke();
    }
    /* Las cifras al final, después de la materia: una que se está abriendo
       tiene que quedar por encima de los renglones, no debajo. */
    if (nTxt && FUENTE){
      ctx.font = FUENTE;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (j = 0; j < nTxt; j += 5){
        ctx.fillStyle = 'rgba(' + txt[j+1] + ',' + txt[j].toFixed(3) + ')';
        ctx.fillText(txt[j+2], txt[j+3], txt[j+4]);
      }
    }
  }
  /* Qué tramo del array de zonas cae en la ventana ahora mismo. Se acota
     una vez por fotograma con dos búsquedas binarias, no por partícula. */
  var zIni = 0, zFin = 0, syUlt = -1e9, versionZonas = 0, versionUlt = -1;
  function acotarZonas(sy){
    /* SOLO SI ALGO HA CAMBIADO, y esto vale 12 fps de 49 en escritorio.
       `getBoundingClientRect` dentro del bucle de pintado fuerza al
       navegador a recalcular la maquetación en ese instante, y esta página
       tiene animaciones vivas que la invalidan constantemente, así que
       cada fotograma pagaba un recálculo entero. Pero un bloque pegajoso
       solo se mueve cuando se mueve el scroll: en reposo no hay nada que
       releer. Medido aislando pieza a pieza — ni el degradado ni las
       cifras costaban nada, era esto. */
    /* Con una red de seguridad cada 15 fotogramas —cuatro veces por
       segundo— porque «solo se mueve con el scroll» no es cierto del todo:
       una cabecera que se contrae con una transición, o un panel que se
       despliega, cambian de sitio sin que nadie haya bajado. Releer cuatro
       veces por segundo cuesta la quinceava parte de lo que costaba
       hacerlo siempre, y una cifra tarda casi dos segundos en abrirse: no
       hay forma de que a nadie le dé tiempo a ver el desfase. */
    if (sy === syUlt && versionZonas === versionUlt && (fotograma % 15)) return;
    syUlt = sy; versionUlt = versionZonas;
    /* 160 px de holgura hacia arriba: el array está ordenado por el borde
       superior, y una caja alta que empieza antes del viewport todavía
       puede alcanzarlo. */
    zIni = bajo(sy - 160);
    zFin = bajo(sy + H + MARGEN);
    leerFijas();
  }
  function bajo(v){
    var a = 0, b = zonas.length;
    while (a < b){ var m = (a + b) >> 1; if (zonas[m].t < v) a = m + 1; else b = m; }
    return a;
  }
  /* Cuánto de libre está el hueco donde va a salir una cifra: 1 si no roza
     ninguna caja de texto, 0 si la pisa, y el degradado intermedio dentro
     del margen para que no se encienda de golpe justo al lado de una
     palabra. */
  function libre(x1, y1, x2, y2, sy){
    var f = 1;
    for (var i = zIni; i < zFin; i++){
      var z = zonas[i], zt = z.t - sy, zb = z.b - sy;
      var dx = Math.max(z.l - MARGEN - x2, x1 - (z.r + MARGEN));
      var dy = Math.max(zt - MARGEN - y2, y1 - (zb + MARGEN));
      var d = dx > dy ? dx : dy;
      if (d < 0){
        var pr = -d / MARGEN; if (pr > 1) pr = 1;
        if (1 - pr < f) f = 1 - pr;
        if (f <= 0) return 0;
      }
    }
    /* Las pegajosas van sin restar el scroll: su caja YA está en
       coordenadas de ventana, que es donde de verdad están. */
    for (var q = 0; q < zonasFijas.length; q++){
      var zf = zonasFijas[q];
      var fdx = Math.max(zf.left - MARGEN - x2, x1 - (zf.right + MARGEN));
      var fdy = Math.max(zf.top - MARGEN - y2, y1 - (zf.bottom + MARGEN));
      var fd = fdx > fdy ? fdx : fdy;
      if (fd < 0){
        var fpr = -fd / MARGEN; if (fpr > 1) fpr = 1;
        if (1 - fpr < f) f = 1 - fpr;
        if (f <= 0) return 0;
      }
    }
    return f;
  }
  function pintar(t){
    ctx.clearRect(0, 0, W, H);
    if (W < 2 || H < 2) return;
    var fa = MODOS[vA], fb = MODOS[vB];
    var mismos = (vA === vB) || vMez === 0;
    var hayFilaPrev = false, tmp, filaBuf = -1;
    var rowH = H / (FILAS - 1);
    /* Dos renglones cuentan como alineados si además están a distancia de
       vecino: uno de la fila de arriba que se ha ido muy lejos no es un
       vecino aunque comparta vertical. */
    var maxDY2 = (rowH * 1.35) * (rowH * 1.35);

    var sy = window.pageYOffset;
    acotarZonas(sy);

    for (var kk in cubosR) cubosR[kk].n = 0;
    for (var kh in cubosH) cubosH[kh].n = 0;
    nR = 0; nH = 0; nTxt = 0; nCif = 0; nTap = 0;
    var nA = vCol.length, nB = vColB.length;
    var saltoX = W * .5, saltoY = H * .5;

    for (var i = 0; i < PTS; i++){
      var p = pts[i];
      fa(p, t, vOrden, pa);
      var tx, ty, borde;
      if (mismos){
        tx = pa[0]; ty = pa[1]; borde = pa[2];
      } else {
        fb(p, t, vOrden, pb);
        /* Aquí ocurre la transición: la misma partícula viaja de su sitio
           en un modo a su sitio en el otro. */
        tx = pa[0] + (pb[0] - pa[0]) * vMez;
        ty = pa[1] + (pb[1] - pa[1]) * vMez;
        borde = pa[2] + (pb[2] - pa[2]) * vMez;
      }

      /* Y aquí es donde el movimiento se vuelve suyo. Cada renglón
         persigue el sitio que le toca en vez de aparecer en él, así que
         cualquier discontinuidad —un scroll de golpe, un cambio de modo
         al pulsar una fase, una remedición tras desplegar algo— se ve
         como un reacomodo y no como un corte. La excepción es el salto de
         vuelta al borde: cuando un renglón sale por la derecha y reentra
         por la izquierda, perseguirlo lo arrastraría de vuelta cruzando
         toda la pantalla. Ahí se le deja aparecer. */
      var x, y;
      if (!p.on){ x = p.px = tx; y = p.py = ty; p.on = 1; }
      else if (Math.abs(tx - p.px) > saltoX || Math.abs(ty - p.py) > saltoY){
        x = p.px = tx; y = p.py = ty;
      } else {
        x = p.px += (tx - p.px) * .10;
        y = p.py += (ty - p.py) * .10;
      }

      var foco = 0;
      if (vReac > .01 && fuerza > 0.001 && px >= 0){
        var dx0 = x - px, dy0 = y - py;
        var d2 = (dx0 * dx0 + dy0 * dy0) / 36100;
        if (d2 < 9) foco = Math.exp(-d2) * fuerza * vReac;
      }
      if (foco > 0.001 && (vA === 'malla' || vA === 'carriles')){
        /* El desorden se resuelve donde se mira. Nunca del todo: una
           rejilla perfecta deja de parecer un dato. */
        y = y + (p.fila * rowH - y) * foco * .55;
      }

      /* El latido de cada renglón va muy comprimido: la trama tiene que
         percibirse como una materia quieta en la que algo se mueve, no
         como un fondo que late. */
      var lum = .5 + .5 * Math.sin(t * 1.6 + p.ph);
      /* El degradado se toma de la x PINTADA, no de la calculada: lo que
         pesa es dónde está el renglón en la pantalla, no dónde debería
         estar. Durante un reacomodo son sitios distintos. */
      var g = x / W; if (g < 0) g = 0; else if (g > 1) g = 1;
      var a = vAlfa * GRAD[(g * 256) | 0] * (.72 + lum * .3) * borde * (1 + foco * 1.6);
      var lar = p.lar * (.62 + borde * .48) * (1 + foco * .55);

      /* El renglón que acaba de pintarse pasa a ser la referencia de la
         fila de abajo. Va ANTES del descarte por alfa: uno invisible
         sigue ocupando su vertical. */
      if (p.fila !== filaBuf){
        if (filaBuf !== -1){
          tmp = pfX; pfX = cfX; cfX = tmp;
          tmp = pfY; pfY = cfY; cfY = tmp;
          tmp = pfA; pfA = cfA; cfA = tmp;
          tmp = pfL; pfL = cfL; cfL = tmp;
          hayFilaPrev = true;
        }
        cfA.fill(0);
        filaBuf = p.fila;
      }
      cfX[p.col] = x; cfY[p.col] = y; cfA[p.col] = a; cfL[p.col] = lar;

      if (a <= .002) continue;

      /* El color también se mezcla entre secciones: al entrar en Wealth
         la trama no cambia de golpe a seis colores, los va tomando. */
      var col = vCol[p.fila % nA];
      if (!mismos && nB && vColB !== vCol) col = vMez < .5 ? col : vColB[p.fila % nB];

      /* La alineación: dos renglones de filas contiguas que se solapan de
         verdad en la misma vertical. La fuerza es cuánto se solapan sobre
         el más corto de los dos, así que rozarse no cuenta y cruzarse
         entero sí. Con la sociabilidad al cubo delante, la mayoría de las
         coincidencias no llega a marcarse: se marca la que importa. */
      if (hayFilaPrev){
        var qa = pfA[p.col];
        if (qa > .002){
          var qx = pfX[p.col], qy = pfY[p.col], ql = pfL[p.col];
          var vdy = y - qy;
          if (vdy * vdy < maxDY2){
            var sol = Math.min(x + lar * .5, qx + ql * .5) - Math.max(x - lar * .5, qx - ql * .5);
            if (sol > 0){
              var g = sol / Math.min(lar, ql);
              if (g > 1) g = 1;
              /* Al cubo y con el factor corto: la vertical cruza toda la
                 separación entre filas, así que a igual alfa pinta tres o
                 cuatro veces más superficie que el renglón que la produce.
                 Con el ajuste anterior la trama se leía como una reja con
                 marcas, cuando tiene que leerse como marcas con alguna
                 reja. La materia son los renglones. */
              alCubo(cubosH, Math.min(a, qa) * g * g * g * p.soc * 1.9, col,
                     (x + qx) * .5, y, (x + qx) * .5, qy);
            }
          }
        }
      }

      /* ── El renglón se abre y resulta que era un dato ────────────────
         La apertura es medio seno, así que la cifra crece y se retira sin
         un solo borde. Y el renglón se apaga en la misma proporción en
         que ella aparece: no hay dos cosas encima, hay una que se
         convierte en la otra. */
      var abre = 0;
      if (fuenteLista && vDatos > .01 && p.sRev < DENS * vDatos){
        var d = ((p.sFase + t / CICLO) % 1) * CICLO;
        if (d < VENTANA) abre = Math.sin(d / VENTANA * 3.14159);
      }
      if (abre > .01){
        var an = ANCHOS[p.di];
        /* Una cifra cortada por el borde de la ventana es un defecto, no
           una textura: si no cabe entera, este ciclo se queda en renglón. */
        if (an > 0 && x - an * .5 > 2 && x + an * .5 < W - 2){
          var lib = libre(x - an * .5, y - 7, x + an * .5, y + 7, sy);
          if (lib < 1) nTap++;
          /* EL ALFA DE LA CIFRA NO CUELGA DEL DE LA MATERIA, y no es un
             descuido: las ocho alfas del HTML están calibradas para cuánta
             materia pesa en cada sección, no para que un texto se lea. Con
             ellas la cifra saldría al 0,67 en el hero —muy por encima de lo
             que se aprobó mirándolo— y al 0,04 en la idea, invisible. Una
             cifra es prueba, y la prueba dice lo mismo en toda la web
             aunque el fondo pese menos. Lo que sí conserva es el degradado
             izquierda-derecha, que es lo que la aparta del texto.

             .125 de media con el factor puesto da de 0,054 a la izquierda a
             0,26 en el borde derecho: el mismo rango que en el banco de
             pruebas. Y sin el latido de la materia: una cifra que parpadea
             se lee peor, y esta ya aparece y se va. */
          alTexto(A_CIFRA * GRAD[(g * 256) | 0] * vDatos * abre * lib,
                  col, DATOS[p.di], x, y);
        } else {
          abre = 0;
        }
      }

      var gr = 1 + foco * 1.3;
      alCubo(cubosR, a * (1 - abre), col, x - lar * .5, y - gr * .5, lar, gr);
    }
    descargar();
  }

  function medir(){
    W = window.innerWidth; H = window.innerHeight;
    cv.width  = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    /* El grosor no cambia nunca, así que se fija una vez y no en cada
       una de las líneas de cada fotograma. */
    ctx.lineWidth = .5;
    armarFuente();
  }

  /* Las cifras van en la tipografía que la web ya carga. Una fuente
     monoespaciada quedaría mejor y costaría una descarga más por un
     fondo: exactamente el gasto que el criterio de animación de la casa
     rechaza. Compartir tipografía además las hace parte de la casa en vez
     de un injerto.

     Y HAY QUE MEDIR CON LA FUENTE DE VERDAD, no con la de reserva. Medir
     antes de que cargue da un ancho que no es el que se va a pintar —en
     la prueba, 90,7 px donde la real da 99— y ese error no se corrige
     solo: la zona de respeto reservaría un hueco más estrecho que la
     cifra durante toda la vida de la página, para cualquiera con la
     conexión lenta. De ahí la remedida en `document.fonts.ready`. */
  function armarFuente(){
    var fam = 'sans-serif';
    try { fam = getComputedStyle(document.body).fontFamily || fam; } catch (e) {}
    FUENTE = '500 11px ' + fam;
    ctx.font = FUENTE;
    for (var i = 0; i < DATOS.length; i++) ANCHOS[i] = ctx.measureText(DATOS[i]).width;
  }

  /* Cuántos fotogramas lleva pintados. Solo existe para que quien mida
     desde fuera pueda exigir que hayan pasado unos cuantos DESDE que movió
     el scroll: sin eso, la primera lectura devuelve el estado anterior,
     todavía asentado, y la tabla sale entera con los valores del hero. */
  var fotograma = 0;
  var arranque = null;
  function bucle(ts){
    if (arranque === null) arranque = ts;
    if (pxr >= 0){
      if (px < 0){ px = pxr; py = pyr; }
      else { px += (pxr - px) * .08; py += (pyr - py) * .08; }
    }
    fuerza += (quiere - fuerza) * .055;
    fotograma++;
    resolver();
    pintar((ts - arranque) * 0.000125);   // deriva ~7 px/s: vivo, no animado
    requestAnimationFrame(bucle);
  }

  /* Deja la trama de esta sección puesta de una vez y la pinta. Es el modo
     sin movimiento: todo lo que normalmente es un viaje —la mezcla entre
     modos, el orden, el sitio de cada renglón— se salta y se planta en su
     destino, porque el viaje ES la animación que esa preferencia rechaza.

     Los tres retardos hay que anularlos por separado: `vPos` a -1 hace que
     `resolver` tome el destino en vez de perseguirlo, `vOrden` se fija a
     resuelto, y `p.on` a 0 hace que cada renglón aparezca en su sitio en
     lugar de acercarse un 10% por pasada. */
  function asentar(){
    vPos = -1;
    resolver();
    vOrden = 1;
    for (var i = 0; i < PTS; i++) pts[i].on = 0;
    pintar(0);
  }

  function arrancar(){
    construir(); medir(); medirSecciones();
    if (secs.length){ vA = vB = secs[0].modo; vOrden = secs[0].orden;
      vAlfa = secs[0].alfa; vReac = secs[0].reac; vCol = vColB = secs[0].colores;
      vDatos = secs[0].datos; }
    /* La tipografía llega después del primer pintado. Cuando llegue hay
       que volver a medir los anchos —y, sin movimiento, repintar, porque
       ahí solo se pinta una vez y esa vez ya pasó. */
    if (document.fonts && document.fonts.ready && document.fonts.ready.then){
      document.fonts.ready.then(function(){
        armarFuente(); fuenteLista = true; medirZonas();
        if (quieto) asentar();
      });
    } else {
      /* Sin API de fuentes no hay forma de saberlo, y callar las cifras
         para siempre sería peor que arriesgarse a un ancho aproximado. */
      fuenteLista = true;
    }
    if (quieto){
      /* Sin movimiento se pinta ya resuelta, y se vuelve a pintar cada vez
         que se para de bajar. Sigue diciendo lo mismo, solo que sin
         contarlo. */
      asentar();
    } else {
      requestAnimationFrame(bucle);
    }
    var to;
    window.addEventListener('resize', function(){
      clearTimeout(to);
      to = setTimeout(function(){
        construir(); medir(); medirSecciones();
        vPos = -1;
        if (quieto) asentar();
      }, 140);
    });
    /* Las secciones cambian de sitio cuando algo se despliega o cuando se
       cambia de pestaña dentro de la página. */
    window.addEventListener('load', medirSecciones);
    document.addEventListener('click', function(){ setTimeout(medirSecciones, 420); }, true);
    /* Y LAS CAJAS DE TEXTO CAMBIAN AL BAJAR, que es el fallo que costó más
       de encontrar. De los 352 trozos de texto de la home, 141 están
       ocultos con el scroll arriba —paneles de pestaña inactivos, texto
       que entra al llegar— y se descartaban PARA SIEMPRE por haber medido
       una sola vez en carga. Luego se volvían visibles y las cifras caían
       encima sin que nada lo impidiera.

       Medido: la remedición completa cuesta 4 ms, así que se hace al parar
       de bajar, no durante. Quien baja rápido no está leyendo el fondo, y
       una cifra tarda casi dos segundos en abrirse. */
    var toScroll;
    window.addEventListener('scroll', function(){
      clearTimeout(toScroll);
      toScroll = setTimeout(function(){
        medirZonas();
        /* SIN MOVIMIENTO TAMBIÉN HAY QUE VOLVER A PINTAR, y esto estaba
           roto desde antes de las cifras. Con `prefers-reduced-motion` no
           se lanza el bucle, así que solo se pintaba al arrancar: quien
           tiene esa preferencia bajaba por toda la web viendo el fondo del
           hero, porque `resolver()` —que es quien lee por dónde va la
           lectura— solo corre dentro del bucle. Las cifras lo hacían más
           visible al quedarse congeladas donde ya no tocaban.

           Pintar al parar de bajar da lo que esa preferencia pide: la
           trama de cada sección, sin animación ninguna. */
        if (quieto) asentar();
      }, 220);
    }, { passive:true });

    /* Y OTRA VEZ CUANDO EL REVELADO TERMINA DE MOVERSE, que es un fallo
       distinto del de arriba y estuvo latente hasta que un cambio de
       espaciado lo destapó.

       El de arriba remide 220 ms después de parar de bajar. El revelado de
       entrada dura `--dur`, 720 ms, y desplaza el bloque con un
       `transform`. Un transform no cambia el flujo, pero SÍ mueve la caja
       que devuelve `getClientRects`. Así que a los 220 ms el motor mide
       media pantalla a mitad de camino, guarda esas posiciones falsas, y
       no vuelve a mirar: la zona de respeto queda medio renglón por debajo
       del texto al que protege, y una cifra se cuela por el hueco.

       Se veía como algo peor de lo que era: 22 a 55 solapes según la
       ejecución, sin ser reproducible dos veces igual, porque depende de
       qué bloque estuviera animándose en el instante de medir. Medido
       después: cero en las tres pasadas.

       Se escucha `transitionend` en vez de esperar un tiempo fijo porque
       el tiempo fijo vuelve a romperse el día que alguien cambie `--dur`.
       El coste es la remedición de 4 ms, y con el rebote solo se paga una
       vez por tanda aunque entren doce bloques a la vez. */
    var toTrans;
    document.addEventListener('transitionend', function(e){
      if (e.propertyName !== 'transform' && e.propertyName !== 'opacity') return;
      clearTimeout(toTrans);
      toTrans = setTimeout(function(){
        medirZonas();
        if (quieto) asentar();
      }, 90);
    }, true);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', arrancar, { once:true });
  } else { arrancar(); }
})();
