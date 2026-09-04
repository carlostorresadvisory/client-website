/* intel-geo.js — de dónde salen los lugares del radar del brief, sin IA y sin llamadas externas.
   ═══════════════════════════════════════════════════════════════════════════════
   El brief.json NO trae coordenadas: trae texto («Rusia», «Ormuz», «BCE»...). Este
   fichero resuelve la geografía con una tabla de lugares (nombre → lat/lon) y una
   búsqueda por mención en el propio texto — cero modelos de lenguaje, cero red.

   De dónde sale la lista: se leyeron 10 días reales del brief del Vigía en Postgres
   (tabla `briefs`, columna `contenido`, fechas 17-ago a 3-sep-2026) más el
   `intel/brief.json` publicado del 3-sep. Cada entrada de LUGARES está aquí porque
   apareció de verdad, con una excepción declarada: BCE / Unión Europea son
   instituciones sin país propio que Carlos pidió considerar explícitamente («puede
   tener sede, decide si tiene sentido pintarla») — aparecen en CASI TODOS los días
   muestreados, así que sí se pintan, con su sede real (Fráncfort / Bruselas).

   Regla de oro, la del encargo: «un lugar mal puesto es peor que un lugar ausente».
   Por eso:
     - Solo entran nombres inequívocos (países, capitales, estrechos con nombre
       propio). Nada de "Europa" o "Oriente Próximo": son regiones sin un punto
       correcto, cualquier coordenada que se les ponga sería inventada.
     - Ninguna sigla corta y ambigua (ni siquiera "UE"): solo formas completas o
       inequívocas ("Unión Europea", "Bruselas").
     - Sin geografía interna de España ni de Rusia/Ucrania (ciudades, provincias):
       un solo pin por país, para no fingir precisión que el texto no da. Kiev es la
       única excepción — se nombra tan a menudo y con tanta precisión que hace de
       pin de Ucrania (misma entrada, sin duplicar).
*/
(function (global) {
  'use strict';

  /* Centro del radar: Madrid, sede de CT Advisory. No es una decisión
     geográfica, es la del propio negocio. */
  var MADRID = { lat: 40.4168, lon: -3.7038 };

  /* Cada lugar: id, nombre para pintar, coordenadas de un punto real (capital o
     sede) y los patrones de texto que lo detectan. Los patrones van en minúsculas
     y se escriben con su forma correcta, con tilde -- así el código también
     documenta el idioma. `normalizar()` SOLO pasa a minúsculas, no quita tildes
     (corrección de comentario, ronda 2 de revisión, 4-sep-2026: la frase anterior
     decía lo contrario): "Iran" sin tilde no casa con el patrón "irán". Por eso
     cada entrada lista aparte, a mano, la forma con y sin tilde cuando puede
     aparecer así en prensa (ver 'irán'/'iran', 'baréin'/'barein'...) -- es la
     tabla la que cubre el caso, no el buscador. */
  var LUGARES = [
    // ── España: el mercado propio de CT Advisory, aparece en prácticamente
    //    todos los briefs (IPC, M&A, PIB). Se pinta siempre que se nombra, sin
    //    trato especial en la detección — el trato especial es solo visual.
    { id: 'espana', nombre: 'España', lat: 40.4168, lon: -3.7038, home: true,
      patrones: ['españa', 'español', 'española', 'madrid'] },

    // ── Guerra de Ucrania, presente en la práctica totalidad de los días
    //    muestreados. "Kiev" hace de pin: es la forma que el brief usa casi
    //    siempre, más que "Ucrania" a secas.
    { id: 'ucrania', nombre: 'Ucrania', lat: 50.4501, lon: 30.5234,
      patrones: ['ucrania', 'ucraniano', 'ucraniana', 'kiev', 'kyiv'] },
    { id: 'rusia', nombre: 'Rusia', lat: 55.7558, lon: 37.6173,
      patrones: ['rusia', 'ruso', 'rusa', 'rusos', 'moscú', 'moscu', 'rostov',
        'krasnodar', 'novorossiisk', 'novoshakhtinsk', 'gazprom'] },

    // ── Irán / estrecho de Ormuz: el otro foco geopolítico recurrente.
    { id: 'iran', nombre: 'Irán', lat: 35.6892, lon: 51.3890,
      patrones: ['irán', 'iran', 'iraní', 'iraníes', 'teherán', 'teheran',
        'guardia revolucionaria'] },
    { id: 'ormuz', nombre: 'Estrecho de Ormuz', nombreCorto: 'Ormuz', lat: 26.5667, lon: 56.2500,
      patrones: ['ormuz'] },
    { id: 'bab-el-mandeb', nombre: 'Estrecho de Bab el-Mandeb', nombreCorto: 'Bab el-Mandeb', lat: 12.5, lon: 43.3,
      patrones: ['bab el-mandeb', 'bab-el-mandeb', 'bab el mandeb'] },

    // ── Estados Unidos: Fed, aranceles, Casa Blanca. Washington como punto.
    { id: 'eeuu', nombre: 'Estados Unidos', nombreCorto: 'EEUU', lat: 38.9072, lon: -77.0369,
      patrones: ['eeuu', 'ee.uu', 'ee. uu', 'estados unidos', 'washington',
        'casa blanca', 'jackson hole', 'centcom', 'fed ', 'la fed',
        'reserva federal'] },

    // ── Europa, país a país (los que aparecieron de verdad).
    { id: 'alemania', nombre: 'Alemania', lat: 52.5200, lon: 13.4050,
      patrones: ['alemania', 'alemán', 'alemana', 'alemanes', 'berlín', 'berlin'] },
    { id: 'francia', nombre: 'Francia', lat: 48.8566, lon: 2.3522,
      patrones: ['francia', 'francés', 'francesa', 'franceses', 'parís', 'paris'] },
    { id: 'reino-unido', nombre: 'Reino Unido', lat: 51.5074, lon: -0.1278,
      patrones: ['reino unido', 'londres', 'británico', 'británica'] },
    { id: 'italia', nombre: 'Italia', lat: 41.9028, lon: 12.4964,
      patrones: ['italia', 'italiano', 'italiana', 'roma'] },
    { id: 'bulgaria', nombre: 'Bulgaria', lat: 42.6977, lon: 23.3219,
      patrones: ['bulgaria', 'búlgaro', 'bezmer'] },
    { id: 'luxemburgo', nombre: 'Luxemburgo', lat: 49.6116, lon: 6.1319,
      patrones: ['luxemburgo'] },

    // ── Norteamérica.
    { id: 'canada', nombre: 'Canadá', lat: 45.4215, lon: -75.6972,
      patrones: ['canadá', 'canada', 'canadiense', 'ottawa'] },

    // ── Oriente Medio y Golfo.
    { id: 'israel', nombre: 'Israel', lat: 31.7683, lon: 35.2137,
      patrones: ['israel', 'israelí', 'israelíes', 'jerusalén', 'jerusalen',
        'cisjordania', 'golán', 'golan'] },
    { id: 'libano', nombre: 'Líbano', lat: 33.8938, lon: 35.5018,
      patrones: ['líbano', 'libano', 'libanés', 'beirut', 'hizbulá', 'hizbula'] },
    { id: 'jordania', nombre: 'Jordania', lat: 31.9454, lon: 35.9284,
      patrones: ['jordania', 'jordano', 'al azraq', 'rey hussein', 'amán', 'aman'] },
    { id: 'catar', nombre: 'Catar', lat: 25.2854, lon: 51.5310,
      patrones: ['catar', 'qatar', 'doha'] },
    { id: 'eau', nombre: 'Emiratos Árabes Unidos', nombreCorto: 'EAU', lat: 24.4539, lon: 54.3773,
      patrones: ['emiratos árabes unidos', 'emiratos arabes unidos', 'abu dabi',
        'abu dhabi', 'dubái', 'dubai'] },
    { id: 'barein', nombre: 'Baréin', lat: 26.0667, lon: 50.5577,
      patrones: ['baréin', 'barein', 'bahréin', 'bahrein', 'manama', 'quinta flota'] },
    { id: 'egipto', nombre: 'Egipto', lat: 30.0444, lon: 31.2357,
      patrones: ['egipto', 'egipcio', 'el cairo'] },
    /* Kuwait: ausente de la muestra de 10 días que armó esta tabla la
       primera vez, pero aparece de verdad en el brief del 4-sep-2026 (el
       día real usado para verificar la integración) -- entra con la misma
       vara de medir que el resto: nombre inequívoco, capital real. */
    { id: 'kuwait', nombre: 'Kuwait', lat: 29.3759, lon: 47.9774,
      patrones: ['kuwait', 'kuwaití', 'kuwaitíes'] },

    // ── Asia y otros, con mención real en el histórico muestreado.
    { id: 'japon', nombre: 'Japón', lat: 35.6762, lon: 139.6503,
      patrones: ['japón', 'japon', 'japonés', 'japonesa', 'tokio'] },
    { id: 'vietnam', nombre: 'Vietnam', lat: 21.0278, lon: 105.8342,
      patrones: ['vietnam', 'vietnamita', 'hanói', 'hanoi'] },
    { id: 'colombia', nombre: 'Colombia', lat: 4.7110, lon: -74.0721,
      patrones: ['colombia', 'colombiano', 'bogotá', 'bogota'] },
    /* China: mismo caso que Kuwait, arriba -- ausente de la muestra
       original, presente en el brief real del 4-sep-2026. */
    { id: 'china', nombre: 'China', lat: 39.9042, lon: 116.4074,
      patrones: ['china', 'chino', 'chinos', 'chinas', 'pekín', 'pekin', 'beijing'] },

    // ── Instituciones con sede, no países: entran porque aparecen en casi
    //    todos los días muestreados y tienen un punto real donde pintarlas.
    { id: 'bce', nombre: 'BCE (Fráncfort)', nombreCorto: 'BCE', lat: 50.1109, lon: 8.6821, institucion: true,
      patrones: ['bce', 'banco central europeo', 'fráncfort', 'frankfurt'] },
    { id: 'ue', nombre: 'Unión Europea (Bruselas)', nombreCorto: 'UE (Bruselas)', lat: 50.8503, lon: 4.3517, institucion: true,
      patrones: ['unión europea', 'union europea', 'bruselas', 'comisión europea',
        'comision europea', 'parlamento europeo'] }
  ];

  /* ── Frentes: de qué va la noticia, no solo dónde pasa ──────────────────
     Pedido de Carlos (4-sep-2026) al elegir el radar: colorear cada pin
     según el frente de la noticia, no de forma decorativa. La lista de
     cinco frentes NO es inventada aquí -- es la que el propio prompt del
     Vigía ya usa para exigir cobertura repartida (`brief.js`, sección
     "COBERTURA DE FRENTES", texto real: "geopolítica, poder/liderazgo,
     comercio/sanciones, bancos centrales/mercados, regulación/IA, energía,
     España y M&A, tecnología"). Aquí se agrupa en los cinco que Carlos citó
     textualmente, plegando "poder/liderazgo" y "comercio/sanciones" dentro
     de Geopolítica y "tecnología" dentro de Regulación e IA -- son la misma
     idea con menos subdivisión, no una taxonomía distinta.

     El color de cada frente NO es un hex inventado: son los mismos tokens
     ya vigentes en `home.css` para las clases de activo de CT Intelligence
     (--c-rf, --c-oro, --c-inm, --c-mon) más el propio --accent y --ink-3 --
     "resolverlo dentro de la familia existente", como pide la skill
     `ctadvisory-ui`, nunca un color nuevo. A propósito NINGUNO es
     --verde/--ambar/--rojo: esos tres significan bien/ojo/mal en cualquier
     superficie de la casa, y un frente no es un estado de salud. */
  var FRENTES = [
    { id: 'geopolitica', nombre: 'Geopolítica', color: '--fr-geo',
      patrones: ['guerra', 'ataque', 'ataca', 'atacan', 'misil', 'misiles', 'dron', 'drones',
        'ofensiva', 'ejército', 'militar', 'sanciona', 'sanción', 'sanciones', 'tropas',
        'movilización', 'movilizar', 'conflicto', 'escalada', 'invasión', 'bombarde',
        'diplomát', 'asentamientos', 'soberanía', 'guardia revolucionaria', 'centcom',
        'kremlin', 'tregua', 'alto el fuego', 'rehenes', 'hizbulá', 'hizbula',
        'represalia', 'represalias', 'arancel', 'aranceles', 'base aérea', 'base militar'] },
    { id: 'bancos-centrales', nombre: 'Bancos centrales y mercados', color: '--fr-bancos',
      patrones: ['bce', 'fed ', 'la fed', 'tipos de interés', 'tipo de interés', 'euríbor',
        'euribor', 'inflación', 'ipc', 'depósito', 'fomc', 'powell', 'schnabel', 'lagarde',
        'warsh', 'bono', 'bonos', 'rendimiento', 'reserva federal', 'bolsa', 'bolsas',
        'dxy', 'dólar', 'euro '] },
    { id: 'energia', nombre: 'Energía', color: '--fr-energia',
      patrones: ['petróleo', 'petroleo', 'gas natural', ' gas ', 'ormuz', 'bab el-mandeb',
        'bab-el-mandeb', 'brent', 'gnl', 'energétic', 'energía', 'energia', 'refinería',
        'refineria', 'crudo', 'barril', 'barriles', 'opep'] },
    { id: 'regulacion-ia', nombre: 'Regulación e IA', color: '--fr-regulacion',
      patrones: ['ai act', 'inteligencia artificial', ' ia ', 'ia generativa', 'regulación',
        'regulacion', 'normativa', 'ley orgánica', 'ley organica', 'chatbot', 'transparencia',
        'sancionador', 'cumplimiento', 'compliance', 'verifactu', 'gpai', 'algoritmo'] },
    { id: 'ma-espana', nombre: 'M&A España', color: '--fr-ma',
      patrones: ['m&a', 'ttr data', 'private equity', ' pe ', 'ebitda', 'múltiplo', 'multiplo',
        'múltiplos', 'multiplos', 'fondo', 'fondos', 'family office', 'consultoría',
        'consultoria', 'roll-up', 'mandato', 'sucesión', 'sucesion', 'pyme', 'pymes',
        'due diligence', 'valoración', 'valoracion', 'adquiere', 'adquisición', 'adquisicion',
        'compra la mayoría', 'venta de', 'capital riesgo', 'desinversion', 'desinversión'] }
  ];
  /* Cuando una línea no casa ningún frente de la lista (pasa, hay líneas de
     puro dato de contexto): el lugar mencionado ahí sigue contando para el
     total de menciones, pero su reparto por frente cae aquí -- nunca se
     deja sin clasificar en silencio. */
  var FRENTE_GENERAL = { id: 'general', nombre: 'Sin frente claro', color: '--fr-general' };

  /* Letras válidas dentro de una "palabra" en español, para construir el propio
     límite de palabra a mano: \b de JS trata las vocales acentuadas como no-letra,
     así que un \b normal falla justo en los nombres que más nos importan (Irán,
     España, Ormuz no, pero "búlgaro" sí). Se compara siempre en minúsculas. */
  var LETRA = 'a-z0-9áéíóúñü';

  function escaparRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function normalizar(s) {
    return String(s || '').toLowerCase();
  }

  function compilarUno(patrones) {
    return patrones.map(function (p) {
      var esc = escaparRegex(normalizar(p));
      return new RegExp('(?:^|[^' + LETRA + '])' + esc + '(?:[^' + LETRA + ']|$)', 'g');
    });
  }
  /* Construye, una sola vez, la regex de cada patrón (lugares y frentes) con
     límite de palabra propio. */
  function compilarPatrones() {
    LUGARES.forEach(function (lugar) { lugar._regex = compilarUno(lugar.patrones); });
    FRENTES.forEach(function (fr) { fr._regex = compilarUno(fr.patrones); });
  }
  compilarPatrones();

  function cuentaCoincidencias(regexes, texto) {
    var n = 0;
    regexes.forEach(function (re) {
      re.lastIndex = 0;
      var m;
      while ((m = re.exec(texto))) {
        n++;
        if (m.index === re.lastIndex) re.lastIndex++; // guarda contra patrón vacío
      }
    });
    return n;
  }

  /* Recopila todo el texto del brief donde puede haber una mención de lugar:
     la lectura del día, las etiquetas de cifras, y el texto de cada línea de
     cada sección/subsección (incluidas las operaciones del radar de M&A). Es
     el mismo contenido que ya pinta intelligence.js, solo que aquí se lee en
     vez de pintarse.

     A propósito NO se lee el campo `fuente` de cifras/líneas/operaciones: ahí
     va el medio que publicó la noticia (`"El País"`, `"TTR Data"`...), no
     dónde ocurre lo que cuenta — mezclar las dos cosas pondría un pin por
     confundir "quién lo cuenta" con "dónde pasa". */
  /* Cada UNIDAD es un trozo de texto que el brief ya trata como una cosa (una
     línea, un titular, una cifra) -- se recorre unidad a unidad, no todo el
     brief pegado en una sola cadena, porque hace falta saber de qué FRENTE
     viene cada mención, y eso solo tiene sentido por línea ("BCE sube tipos"
     es bancos centrales; "Rusia ataca Kiev" es geopolítica).

     `paraFrente` marca si esa unidad cuenta para el reparto por frente.
     Decisión de diseño, probada contra el día real más cargado (21-ago-2026,
     16 lugares): la `lectura` y las secciones "Radar estratégico"/
     "Aprendizaje" son, por diseño del propio prompt del Vigía, PÁRRAFOS DE
     SÍNTESIS que conectan varios frentes a propósito en una sola frase ("el
     BCE sube tipos justo cuando el conflicto en Ormuz..."). Contarlas para
     el reparto por frente no es un error de esas líneas, es su función --
     pero el efecto práctico es que CASI CUALQUIER lugar mencionado ahí sale
     "multi-frente" solo por aparecer en el resumen del día, y eso vacía de
     contenido al color: con 12 de 16 lugares en multi, el color deja de
     decir nada. Por eso el reparto por frente se calcula SOLO con el
     material atómico -- una línea, un hecho -- de Cifras clave/Hoy/Esta
     semana/Este mes y las operaciones de `radar`; la lectura y el "Radar
     estratégico" siguen contando para SI se pinta el lugar (`menciones`),
     nunca para DE QUÉ COLOR. Un lugar que solo aparece en un párrafo de
     síntesis cae en el frente "Sin frente claro", no en un frente
     inventado. */
  var TITULOS_SINTESIS = ['radar estratégico', 'radar estrategico', 'aprendizaje'];
  /* Una línea de markdown que empieza por "Fuentes:" nombra medios, no
     lugares (hallazgo de la revisión externa MiniMax, ronda 2, 4-sep-2026):
     un medio con topónimo en el nombre -- "China Daily", "Times of Israel",
     "Kyiv Independent" -- crearía un pin fantasma por citar la fuente, no
     por contar lo que pasa allí. Mismo espíritu que ya declaraba el
     comentario de arriba sobre el campo `fuente` de cifras/líneas. */
  function esLineaDeFuentes(t) {
    return /^fuentes\s*:/i.test(t);
  }
  function unidadesDeTexto(brief) {
    var unidades = [];
    if (!brief || typeof brief !== 'object') return unidades;
    var cifras = Array.isArray(brief.cifras) ? brief.cifras : [];
    cifras.forEach(function (c) {
      if (c && typeof c.etiqueta === 'string') unidades.push({ texto: c.etiqueta, paraFrente: true, contarMenciones: true });
    });
    if (Array.isArray(brief.radar)) {
      brief.radar.forEach(function (op) {
        if (op && typeof op.titular === 'string') unidades.push({ texto: op.titular, paraFrente: true, contarMenciones: true });
      });
    } else if (typeof brief.radar === 'string' && brief.radar) {
      unidades.push({ texto: brief.radar, paraFrente: true, contarMenciones: true });
    }
    function leerLineas(lineas, paraFrente, contarMenciones) {
      var out = Array.isArray(lineas) ? lineas : [];
      out.forEach(function (l) {
        if (l && typeof l.texto === 'string') unidades.push({ texto: l.texto, paraFrente: paraFrente, contarMenciones: contarMenciones });
      });
    }
    /* `markdown` manda sobre `secciones`/`lectura` para CONTAR menciones --
       mismo criterio que ya usa intelligence.js#pintar para pintar el brief
       (`pintoMarkdown = texto(b.markdown,...) && pintarMarkdown(...)`, con
       `secciones` solo de respaldo). Antes se leían los dos A LA VEZ para
       menciones pensando que "sumar ambas nunca duplica una mención real"
       -- FALSO: el productor genera `markdown` como la redacción en prosa
       de los MISMOS hechos que ya están en `secciones`, así que con los
       dos campos presentes (el caso normal del brief real) cada mención
       salía contada dos veces (hallazgo de la revisión externa MiniMax,
       ronda 2, 4-sep-2026, sonda A-D: "Rusia · 10 menciones" cuando el
       recuento a mano sobre el markdown daba 5).

       PERO el markdown es prosa: sus líneas siempre van con
       `paraFrente:false` (no se pueden partir de forma fiable en "atómica
       o de síntesis", ver el comentario grande de más arriba), así que
       leer SOLO markdown deja a TODO lugar sin frente -- "Sin frente
       claro" para los once, verificado en captura real tras la primera
       versión de esta corrección: el color por frente, la mitad del
       encargo original, dejaba de decir nada. Por eso, cuando hay
       `markdown`, `secciones` SIGUE leyéndose en paralelo, pero con
       `contarMenciones:false`: aporta a `porFrente` (de qué color es cada
       punto) sin volver a sumar a `menciones` (que ya cuenta el markdown).
       Dos preguntas distintas -- "cuántas veces" y "de qué trata" -- cada
       una con su única fuente. */
    var markdown = typeof brief.markdown === 'string' ? brief.markdown.trim() : '';
    if (markdown) {
      brief.markdown.split('\n').forEach(function (linea) {
        var t = linea.trim();
        if (!t || t.charAt(0) === '#' || esLineaDeFuentes(t)) return;
        if (t.charAt(0) === '-' || t.charAt(0) === '*') t = t.slice(1).trim();
        if (t) unidades.push({ texto: t, paraFrente: false, contarMenciones: true });
      });
      var seccionesFrente = Array.isArray(brief.secciones) ? brief.secciones : [];
      seccionesFrente.forEach(function (s) {
        if (!s) return;
        var esSintesis = TITULOS_SINTESIS.indexOf(normalizar(s.titulo || '')) !== -1;
        leerLineas(s.lineas, !esSintesis, false);
        var subsecciones = Array.isArray(s.subsecciones) ? s.subsecciones : [];
        subsecciones.forEach(function (sub) { leerLineas(sub.lineas, !esSintesis, false); });
      });
    } else {
      if (typeof brief.lectura === 'string' && brief.lectura) unidades.push({ texto: brief.lectura, paraFrente: false, contarMenciones: true });
      var secciones = Array.isArray(brief.secciones) ? brief.secciones : [];
      secciones.forEach(function (s) {
        if (!s) return;
        var esSintesis = TITULOS_SINTESIS.indexOf(normalizar(s.titulo || '')) !== -1;
        leerLineas(s.lineas, !esSintesis, true);
        // Las subsecciones (hoy solo existen bajo "Radar estratégico") heredan
        // siempre su condición de síntesis del título del padre.
        var subsecciones = Array.isArray(s.subsecciones) ? s.subsecciones : [];
        subsecciones.forEach(function (sub) { leerLineas(sub.lineas, !esSintesis, true); });
      });
    }
    return unidades;
  }

  /* La función que importa: dado un brief (con la forma de brief.json), devuelve
     los lugares detectados, ordenados de más a menos mencionado. Cada resultado
     lleva:
       - `menciones`: total de veces que aparece el lugar (decide el tamaño del
         pin -- nunca decide SI se pinta, eso lo decide la propia tabla).
       - `porFrente`: cuántas de esas menciones vienen de cada frente.
       - `dominante`: el frente con más menciones para ese lugar (empate → el
         primero de FRENTES en aparecer, orden estable).
       - `multiFrente`: true si el lugar tiene menciones de dos o más frentes
         distintos el mismo día -- es un dato real («este sitio ha salido en
         más de un tipo de noticia hoy»), no un error a esconder. */
  function detectarLugares(brief) {
    var unidades = unidadesDeTexto(brief);
    if (!unidades.length) return [];

    var porLugar = {}; // id -> { lugar, menciones, porFrente:{id:n} }
    unidades.forEach(function (u) {
      var texto = normalizar(u.texto);
      if (!texto.trim()) return;
      // Frentes que casan en ESTA unidad (una línea puede tocar más de uno:
      // "el BCE sube tipos por la crisis de Ormuz" es bancos centrales Y
      // energía a la vez -- las dos cuentan). Si la unidad es de síntesis
      // (`u.paraFrente === false`), ni se calculan: ver el porqué arriba.
      var idFrentes = null;
      if (u.paraFrente) {
        var frentesDeLaLinea = FRENTES.filter(function (fr) { return cuentaCoincidencias(fr._regex, texto) > 0; });
        idFrentes = frentesDeLaLinea.length ? frentesDeLaLinea.map(function (f) { return f.id; }) : [FRENTE_GENERAL.id];
      }

      LUGARES.forEach(function (lugar) {
        var n = cuentaCoincidencias(lugar._regex, texto);
        if (!n) return;
        if (!porLugar[lugar.id]) porLugar[lugar.id] = { lugar: lugar, menciones: 0, porFrente: {} };
        var entrada = porLugar[lugar.id];
        // `contarMenciones:false` (las líneas de `secciones` que solo se
        // leen para recuperar el frente cuando ya hay `markdown`, ver
        // arriba) aportan a `porFrente` pero NO suman aquí -- si sumaran,
        // volvería el doble conteo que corrigió la ronda 2 de revisión.
        if (u.contarMenciones !== false) entrada.menciones += n;
        if (!idFrentes) return; // unidad de síntesis: no aporta al reparto por frente
        // El reparto por frente no multiplica por `n`: lo que importa es EN
        // CUÁNTAS LÍNEAS distintas ha salido cada frente para este lugar, no
        // cuántas veces se repite el nombre dentro de la misma línea.
        idFrentes.forEach(function (idFr) { entrada.porFrente[idFr] = (entrada.porFrente[idFr] || 0) + 1; });
      });
    });

    /* Un lugar que solo aparece en una unidad de `contarMenciones:false`
       (mencionado en `secciones` con una forma que el markdown no repite
       tal cual, p. ej. una variante de nombre) se queda en 0 menciones --
       no hay pin de tamaño 0 que pintar. Caso raro (las dos fuentes narran
       el mismo día) pero real de guardar: nunca se pinta un lugar sin al
       menos una mención contada de verdad. */
    Object.keys(porLugar).forEach(function (id) { if (porLugar[id].menciones <= 0) delete porLugar[id]; });

    var resultado = Object.keys(porLugar).map(function (id) {
      var e = porLugar[id];
      var frentesTocados = Object.keys(e.porFrente).filter(function (idFr) { return e.porFrente[idFr] > 0; });
      // "Sin frente claro" nunca gana un empate: es la ausencia de una
      // etiqueta, no una etiqueta más. Si CUALQUIER frente con nombre tiene
      // al menos una línea, manda uno de esos (el de más líneas, empate a
      // favor del primero de la lista FRENTES); "general" solo es dominante
      // cuando de verdad no hay ningún otro frente que lo dispute.
      var frentesConNombre = frentesTocados.filter(function (idFr) { return idFr !== FRENTE_GENERAL.id; });
      var candidatos = frentesConNombre.length ? frentesConNombre : frentesTocados;
      var dominante = candidatos.length
        ? candidatos.slice().sort(function (a, b) { return e.porFrente[b] - e.porFrente[a]; })[0]
        : FRENTE_GENERAL.id;
      return {
        lugar: e.lugar,
        menciones: e.menciones,
        porFrente: e.porFrente,
        dominante: dominante,
        // "Multi-frente" también se mide solo sobre frentes CON NOMBRE: una
        // línea sin frente reconocible más una línea de geopolítica es UN
        // frente, no dos -- "general" no cuenta como un segundo tema real.
        multiFrente: frentesConNombre.length >= 2
      };
    });
    resultado.sort(function (a, b) { return b.menciones - a.menciones; });
    return resultado;
  }

  /* Para pintar: el frente dominante como objeto completo (nombre + color),
     nunca solo el id. */
  function frentePorId(id) {
    if (id === FRENTE_GENERAL.id) return FRENTE_GENERAL;
    for (var i = 0; i < FRENTES.length; i++) if (FRENTES[i].id === id) return FRENTES[i];
    return FRENTE_GENERAL;
  }

  /* ── Geometría, la parte que sí es matemática de verdad (no búsqueda de texto) ── */
  function aRad(g) { return (g * Math.PI) / 180; }
  function aGrados(r) { return (r * 180) / Math.PI; }

  /* Distancia ortodrómica (haversine), en kilómetros. */
  function distanciaKm(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = aRad(lat2 - lat1);
    var dLon = aRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(aRad(lat1)) * Math.cos(aRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* Rumbo inicial desde (lat1,lon1) hacia (lat2,lon2), en grados 0-360 (0=norte,
     90=este) — el ángulo que usa el radar para colocar cada pin. */
  function rumboInicial(lat1, lon1, lat2, lon2) {
    var y = Math.sin(aRad(lon2 - lon1)) * Math.cos(aRad(lat2));
    var x = Math.cos(aRad(lat1)) * Math.sin(aRad(lat2)) -
      Math.sin(aRad(lat1)) * Math.cos(aRad(lat2)) * Math.cos(aRad(lon2 - lon1));
    return (aGrados(Math.atan2(y, x)) + 360) % 360;
  }

  global.CT_GEO = {
    MADRID: MADRID,
    LUGARES: LUGARES,
    FRENTES: FRENTES,
    FRENTE_GENERAL: FRENTE_GENERAL,
    frentePorId: frentePorId,
    detectarLugares: detectarLugares,
    distanciaKm: distanciaKm,
    rumboInicial: rumboInicial
  };
})(window);
