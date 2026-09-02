'use strict';
// ============================================================================
// CT Advisory Wealth · motor de perfil · fase W1 · pieza A
// ct-wealth-ambito: pieza-a
// ============================================================================
//
// LA REGLA QUE DEFINE ESTE FICHERO: aquí no hay ningún modelo de lenguaje.
// Entrada = las respuestas del cuestionario. Salida = un perfil y unos pesos por
// clase de activo. Misma entrada, misma salida, siempre, sin red y sin estado.
//
// El motivo está escrito en ampliacion.md 3.1: un modelo redactando libremente
// acaba escribiendo el nombre de un fondo o un "lo mejor para ti", y eso es
// exactamente la infracción. Un modelo tampoco es reproducible, y un supervisor
// que pregunte por qué a un usuario le salió esta mezcla merece una respuesta
// aritmética, no una conversación.
//
// Este fichero se carga EN EL NAVEGADOR y se ejecuta EN NODE desde los tests.
// Los mismos bytes en los dos sitios. Si los tests probaran una copia, probarían
// otra cosa distinta de la que ve el usuario, que es la clase de divergencia que
// no se detecta hasta que ya ha pasado.
//
// --- Cómo se llega del cuestionario a los pesos -----------------------------
//
//   respuestas
//     -> capacidad (0-100)    circunstancias objetivas: si puede o no aguantar
//     -> tolerancia (0-100)   comportamiento: si va a aguantar de verdad
//     -> perfil = banda( min(capacidad, tolerancia) )     nunca la media
//     -> gates                límites duros que solo bajan el perfil, nunca lo suben
//     -> peso de crecimiento = min( el del perfil, el techo que impone el plazo )
//     -> reparto dentro de crecimiento y dentro de estabilidad, por reglas fijas
//     -> redondeo a enteros que suman 100 exactos
//
// El MÍNIMO de capacidad y tolerancia, y no la media, es la decisión de diseño
// más importante del motor. Son dos restricciones distintas y la cartera tiene
// que cumplir las dos: quien tiene capacidad alta y tolerancia baja vende en la
// caída, y quien tiene tolerancia alta y capacidad baja se ve obligado a vender.
// Promediar deja que una tape a la otra, y la que queda tapada es justo la que
// muerde.
//
// --- Qué NO hace ------------------------------------------------------------
//
// No nombra ningún instrumento, ninguna gestora, ningún ISIN. No ordena, no
// puntúa productos, no recomienda momento de entrada. No guarda nada, no envía
// nada y no lee nada de ninguna red. La salida se expresa en clases de activo y
// pesos, que es asesoramiento genérico (ampliacion.md 1.1).
// ============================================================================

(function (raiz) {

  // Subir esta versión cuando cambie cualquier puntuación, gate o regla de
  // reparto. ampliacion.md 1.5 punto 3: si algún día hay una pregunta del
  // supervisor, la respuesta es un commit con fecha, y el número de versión es
  // lo que ata una salida concreta a un commit concreto.
  var VERSION = '1.1.0'; // 2-sep-2026: el oro deja de ser clase propia; el satélite pasa a ser materias primas (Carlos)

  // ==========================================================================
  // 1 · Las cinco clases de activo
  // ==========================================================================
  //
  // Son las mismas cinco de la guía de W0, en el mismo orden, a propósito.
  //
  // `caidaMaxima` sale de la guía, donde cada cifra lleva su fuente y su fecha.
  // Ninguna se ha recalculado ni redondeado aquí: se toma la peor caída
  // documentada de cada clase tal como está publicada.
  //
  // `volatilidad` es un SUPUESTO. La guía de W0 no documenta la volatilidad
  // anual de ninguna clase, así que estos cinco números no tienen detrás una
  // fuente primaria como sí la tienen las caídas. Quedan marcados como supuesto
  // en la propia página, en ámbar, con la misma convención que W0 usa para los
  // datos que no ha podido verificar. Rellenarlos de memoria y presentarlos como
  // hechos sería peor que dejarlos visiblemente pendientes.

  var CLASES = [
    {
      id: 'rentaVariableGlobal',
      nombre: 'Renta variable global',
      volatilidad: 15.0,
      caidaMaxima: 58,
      notaCaida: 'MSCI World entre octubre de 2007 y marzo de 2009. La guía documenta un rango entre el 54% y el 58%, y aquí se toma el extremo alto.',
    },
    {
      id: 'inmobiliarioCotizado',
      nombre: 'Inmobiliario cotizado',
      volatilidad: 19.0,
      caidaMaxima: 67,
      notaCaida: 'Índice Nareit All Equity REITs de Estados Unidos, de enero de 2007 a febrero de 2009. La guía advierte de que no es el índice global.',
    },
    {
      id: 'materiasPrimas',
      nombre: 'Materias primas',
      volatilidad: 15.0,
      caidaMaxima: 48,
      notaCaida: 'Bloomberg Commodity Index Total Return, en euros, de 2005 a 2020 con cierres anuales (guía de clases de activo). Incluye el oro.',
    },
    {
      id: 'rentaFija',
      nombre: 'Renta fija',
      volatilidad: 5.0,
      caidaMaxima: 20,
      notaCaida: 'Bloomberg Global Aggregate sin cobertura de divisa, desde su máximo de 2021. La mayor desde que el índice existe.',
    },
    {
      id: 'monetario',
      nombre: 'Monetario',
      volatilidad: 0.5,
      caidaMaxima: 0,
      notaCaida: 'El saldo apenas baja en términos nominales. El riesgo de esta clase está en que el tipo quede por debajo de la inflación, que no se ve como una caída.',
    },
  ];

  var CLASES_CRECIMIENTO = ['rentaVariableGlobal', 'inmobiliarioCotizado', 'materiasPrimas'];
  var CLASES_ESTABILIDAD = ['rentaFija', 'monetario'];

  // ==========================================================================
  // 2 · El cuestionario
  // ==========================================================================
  //
  // Diez preguntas. El texto vive AQUÍ y en ningún otro sitio: la página se
  // dibuja desde estos datos. Tener el enunciado en el HTML y su significado en
  // el motor son dos verdades que se desincronizan a la primera edición.
  //
  // El orden es deliberado. Primero las circunstancias, que son fáciles de
  // contestar y no comprometen a nada, y al final las dos de comportamiento,
  // cuando el usuario ya lleva rato pensando en su propio dinero.

  var PREGUNTAS = [
    {
      id: 'horizonte',
      dimension: 'capacidad',
      texto: '¿Cuándo prevé necesitar la mayor parte de este dinero?',
      ayuda: 'El plazo decide cuánto tiempo hay para recuperarse de una caída. En la guía de clases de activo, la renta variable tardó hasta 2013 en recuperar, en euros, el valor que tenía a comienzos de 2000.',
      opciones: [
        { codigo: 'menos2', texto: 'Antes de 2 años' },
        { codigo: 'de2a5', texto: 'Entre 2 y 5 años' },
        { codigo: 'de5a10', texto: 'Entre 5 y 10 años' },
        { codigo: 'de10a20', texto: 'Entre 10 y 20 años' },
        { codigo: 'mas20', texto: 'Dentro de más de 20 años' },
      ],
    },
    {
      id: 'objetivo',
      dimension: 'tolerancia',
      texto: '¿Para qué es este dinero?',
      opciones: [
        { codigo: 'preservar', texto: 'Conservar el valor de lo que ya tengo' },
        { codigo: 'compra', texto: 'Una compra concreta que ya tengo prevista' },
        { codigo: 'crecer', texto: 'Que crezca, sin una fecha fija' },
        { codigo: 'ingresos', texto: 'Complementar mis ingresos dentro de muchos años' },
      ],
    },
    {
      id: 'emergencia',
      dimension: 'capacidad',
      texto: 'Sin contar este dinero, ¿cuántos meses de gastos tiene cubiertos en efectivo?',
      ayuda: 'Quien no tiene colchón acaba vendiendo la inversión cuando llega un imprevisto, y los imprevistos no eligen el momento.',
      opciones: [
        { codigo: 'ninguno', texto: 'No tengo nada reservado' },
        { codigo: 'menos3', texto: 'Menos de 3 meses' },
        { codigo: 'de3a6', texto: 'Entre 3 y 6 meses' },
        { codigo: 'mas6', texto: 'Más de 6 meses' },
      ],
    },
    {
      id: 'ahorro',
      dimension: 'capacidad',
      texto: 'De media, ¿qué parte de sus ingresos le sobra cada mes?',
      ayuda: 'Poder seguir aportando después de una caída cambia mucho el resultado. Una cartera sin aportaciones nuevas se recupera sola o no se recupera.',
      opciones: [
        { codigo: 'nada', texto: 'Nada, o gasto más de lo que ingreso' },
        { codigo: 'hasta10', texto: 'Hasta un 10%' },
        { codigo: 'de10a25', texto: 'Entre un 10% y un 25%' },
        { codigo: 'mas25', texto: 'Más de un 25%' },
      ],
    },
    {
      id: 'ingresos',
      dimension: 'capacidad',
      texto: '¿Cómo de previsibles son sus ingresos en los próximos años?',
      opciones: [
        { codigo: 'inestables', texto: 'Varían mucho, no puedo darlos por seguros' },
        { codigo: 'variables', texto: 'Varían algo, con una parte fija' },
        { codigo: 'estables', texto: 'Estables y previsibles' },
      ],
    },
    {
      id: 'proporcion',
      dimension: 'capacidad',
      texto: '¿Qué parte de todo su dinero financiero representa esta cantidad?',
      ayuda: 'Una caída del 40% sobre todo lo que alguien tiene y una caída del 40% sobre la quinta parte son dos situaciones distintas, aunque el porcentaje sea el mismo.',
      opciones: [
        { codigo: 'casitodo', texto: 'Casi todo lo que tengo' },
        { codigo: 'masmitad', texto: 'Más de la mitad' },
        { codigo: 'entrecuarto', texto: 'Entre un cuarto y la mitad' },
        { codigo: 'menoscuarto', texto: 'Menos de un cuarto' },
      ],
    },
    {
      id: 'liquidez',
      dimension: 'capacidad',
      texto: '¿Qué probabilidad hay de que necesite sacar una parte importante antes de ese plazo?',
      opciones: [
        { codigo: 'alta', texto: 'Bastante probable' },
        { codigo: 'media', texto: 'Podría pasar' },
        { codigo: 'baja', texto: 'Poco probable' },
        { codigo: 'ninguna', texto: 'Ninguna, este dinero no se toca hasta el plazo' },
      ],
    },
    {
      id: 'reaccion',
      dimension: 'tolerancia',
      texto: 'Si esta cantidad cayera un 30 % en pocos meses, ¿qué haría?',
      ayuda: 'Una caída del 30 % no es un escenario extremo: en la guía de clases de activo, dos de las cinco clases perdieron casi la mitad desde su máximo.',
      opciones: [
        { codigo: 'vendertodo', texto: 'Vender todo para no perder más' },
        { codigo: 'venderparte', texto: 'Vender una parte y bajar el riesgo' },
        { codigo: 'esperar', texto: 'No tocar nada y esperar' },
        { codigo: 'aportar', texto: 'Aportar más a esos precios' },
      ],
    },
    {
      id: 'comportamiento',
      dimension: 'tolerancia',
      texto: '¿Ha tenido dinero suyo invertido durante una caída de más del 20 %?',
      ayuda: 'Esta pregunta va de lo que hizo, no de lo que haría. Si las dos respuestas se contradicen, el motor se queda con esta.',
      opciones: [
        { codigo: 'sinvivirlo', texto: 'No he pasado por una caída así con dinero mío' },
        { codigo: 'vendi', texto: 'Sí, y vendí una parte o todo' },
        { codigo: 'aguante', texto: 'Sí, y no toqué nada' },
        { codigo: 'aporte', texto: 'Sí, y aproveché para aportar más' },
      ],
    },
    {
      id: 'experiencia',
      dimension: 'tolerancia',
      texto: '¿Con qué ha ahorrado o invertido hasta ahora?',
      opciones: [
        { codigo: 'ninguna', texto: 'Con nada, esto sería lo primero' },
        { codigo: 'depositos', texto: 'Depósitos y cuentas remuneradas' },
        { codigo: 'fondosbanco', texto: 'Productos que me ofrecieron en mi banco' },
        // Esta opción decía "Fondos indexados o ETF que elegí yo" y llevaba un
        // marcador de exclusión, con el argumento de que una pregunta sobre el
        // pasado del usuario no propone ningún vehículo. El argumento era
        // correcto y la conclusión no: al comprobar la pantalla montada en el
        // navegador apareció que el desglose de puntuación REPITE la respuesta
        // elegida, así que esos dos nombres acababan impresos en la salida
        // personalizada, que es la superficie con el perímetro más estrecho de
        // todo el producto. Reescrita para decir exactamente lo mismo sin
        // nombrar ningún vehículo: distingue igual a quien ya ha convivido con
        // la volatilidad de un índice por decisión propia. Quitar la excepción
        // es mejor que documentarla cuando reescribir no cuesta nada.
        { codigo: 'indexados', texto: 'Invertí por mi cuenta, siguiendo índices de mercado' },
      ],
    },
  ];

  // ==========================================================================
  // 3 · Capacidad de asumir riesgo (0-100)
  // ==========================================================================
  //
  // Todo lo que puntúa aquí responde a la misma pregunta: ¿puede esta persona
  // evitar vender en el peor momento, y puede el tiempo o el ahorro futuro
  // reparar la pérdida? Nada de esto depende del carácter.
  //
  // Reparto de los 100 puntos, y por qué cada uno pesa lo que pesa:
  //
  //   30  horizonte      Decide si una caída tiene tiempo de recuperarse. Es el
  //                      único factor que ningún otro puede sustituir.
  //   20  emergencia     Decide si un imprevisto obliga a vender. Sin colchón,
  //                      la cartera ES el colchón.
  //   15  liquidez       El mismo mecanismo que el colchón, aplicado al dinero
  //                      que se está invirtiendo.
  //   15  proporción     Una caída sobre todo el patrimonio y una caída sobre
  //                      una parte pequeña no obligan a lo mismo.
  //   10  ingresos       Unos ingresos que fallan convierten la cartera en la
  //                      cuenta corriente.
  //   10  ahorro         Las aportaciones nuevas reparan una caída. Su ausencia
  //                      deja la recuperación entera en manos del mercado.

  var PUNTOS_CAPACIDAD = {
    horizonte: { menos2: 0, de2a5: 8, de5a10: 17, de10a20: 25, mas20: 30 },
    emergencia: { ninguno: 0, menos3: 7, de3a6: 16, mas6: 20 },
    liquidez: { alta: 0, media: 6, baja: 12, ninguna: 15 },
    proporcion: { casitodo: 2, masmitad: 6, entrecuarto: 11, menoscuarto: 15 },
    ingresos: { inestables: 2, variables: 6, estables: 10 },
    ahorro: { nada: 0, hasta10: 5, de10a25: 8, mas25: 10 },
  };

  // ==========================================================================
  // 4 · Tolerancia al riesgo (0-100)
  // ==========================================================================
  //
  //   45  comportamiento  Lo que hizo de verdad en una caída real.
  //   30  reacción        Lo que dice que haría.
  //   15  experiencia     Cuánto ha convivido con la volatilidad.
  //   10  objetivo        Preservar el valor es una preferencia declarada por la
  //                       estabilidad, y cuenta como tal.
  //
  // El comportamiento pesa una vez y media lo que pesa la intención declarada, y
  // esa proporción es el motivo entero de que la pregunta exista. Contestar en
  // frío que uno aguantaría una caída del 30% cuesta poco. Haberla aguantado con
  // dinero propio es una observación.
  //
  // "No he pasado por una caída así" puntúa 15 sobre 45, un tercio. No hay
  // evidencia en ninguna dirección, así que ni se premia ni se castiga, y no
  // puede puntuar como quien ya lo ha demostrado. La falta de evidencia no es
  // evidencia de aguante.

  var PUNTOS_TOLERANCIA = {
    comportamiento: { sinvivirlo: 15, vendi: 5, aguante: 38, aporte: 45 },
    reaccion: { vendertodo: 0, venderparte: 10, esperar: 24, aportar: 30 },
    experiencia: { ninguna: 0, depositos: 5, fondosbanco: 10, indexados: 15 },
    objetivo: { preservar: 0, compra: 2, crecer: 10, ingresos: 8 },
  };

  // Cuando lo declarado contradice a lo observado, manda lo observado. Alguien
  // que vendió en una caída real y ahora dice que aguantaría o que aportaría más
  // se queda con la puntuación de "vender una parte". No se anula su respuesta,
  // se le pone techo, y el techo aparece explicado en el resultado.
  var TECHO_POR_CONTRADICCION = PUNTOS_TOLERANCIA.reaccion.venderparte;

  // ==========================================================================
  // 5 · Perfiles y límites duros
  // ==========================================================================

  // `desde` es la puntuación mínima de cada banda. Las cuatro primeras van de
  // veinte en veinte. La quinta empieza en 85 y no en 80, y esa asimetría es
  // deliberada: es la única mezcla que llega al 90% de crecimiento, con la mayor
  // caída documentada de todas, así que exige que no quede ni una respuesta
  // floja por el camino. Con bandas iguales se llegaba a ella contestando la
  // segunda mejor opción a casi todo, que describe a un inversor sólido y no al
  // que puede asumir el reparto más extremo que produce este motor.
  var PERFILES = [
    { indice: 1, clave: 'defensivo', nombre: 'Defensivo', crecimiento: 10, desde: 0 },
    { indice: 2, clave: 'conservador', nombre: 'Conservador', crecimiento: 30, desde: 20 },
    { indice: 3, clave: 'equilibrado', nombre: 'Equilibrado', crecimiento: 50, desde: 40 },
    { indice: 4, clave: 'dinamico', nombre: 'Dinámico', crecimiento: 70, desde: 60 },
    { indice: 5, clave: 'agresivo', nombre: 'Agresivo', crecimiento: 90, desde: 85 },
  ];

  function bandaDePerfil(puntuacion) {
    var indice = 1;
    for (var i = 0; i < PERFILES.length; i++) {
      if (puntuacion >= PERFILES[i].desde) indice = PERFILES[i].indice;
    }
    return indice;
  }

  // Ningún perfil llega a 0% ni a 100% de crecimiento. Ni siquiera el más
  // defensivo renuncia del todo a crecer, porque la inflación también es una
  // forma de perder. Ni siquiera el más agresivo se queda sin nada estable,
  // porque un imprevisto sin colchón obliga a vender en el peor momento.

  // Los gates ponen TECHO al perfil. Nunca lo suben. Cada uno lleva escrito su
  // motivo, y ese motivo se enseña en el resultado: quien recibe una mezcla más
  // prudente de lo que esperaba tiene derecho a saber qué respuesta la ha
  // limitado.
  var GATES = [
    {
      id: 'sin-colchon',
      techo: 2,
      aplica: function (r) { return r.emergencia === 'ninguno'; },
      motivo: 'No hay ningún colchón de gastos en efectivo. Mientras no lo haya, esta cantidad hace también de fondo de emergencia, y lo que puede hacer de fondo de emergencia es lo que no se mueve.',
    },
    {
      id: 'liquidez-probable',
      techo: 2,
      aplica: function (r) { return r.liquidez === 'alta'; },
      motivo: 'Es bastante probable que haya que sacar una parte importante antes de plazo. Una salida forzada convierte una caída temporal en una pérdida definitiva.',
    },
    {
      id: 'todo-el-patrimonio',
      techo: 4,
      aplica: function (r) { return r.proporcion === 'casitodo'; },
      motivo: 'Esta cantidad es prácticamente todo el dinero financiero disponible. Cuando no hay nada fuera, el reparto más extremo deja a la persona sin ninguna parte que no dependa del mismo episodio de mercado.',
    },
    {
      id: 'compra-comprometida',
      techo: 1,
      aplica: function (r) {
        return r.objetivo === 'compra' && (r.horizonte === 'menos2' || r.horizonte === 'de2a5');
      },
      motivo: 'El dinero tiene destino y fecha. Una caída no cambia el importe que hará falta, así que la prioridad pasa a ser que la cantidad siga estando.',
    },
  ];

  // ==========================================================================
  // 6 · Del perfil a los pesos
  // ==========================================================================
  //
  // El plazo pone un TECHO al peso de crecimiento, por encima de lo que diga el
  // perfil. Es una restricción distinta de la tolerancia: por mucho que alguien
  // aguante una caída, si el dinero se necesita en tres años no hay tiempo para
  // recuperarla. La tolerancia se puede tener; el tiempo no se puede tener a
  // voluntad. Por eso el horizonte entra dos veces en el motor, en la capacidad
  // y aquí, y por eso se dice en vez de disimularlo.

  var TECHO_CRECIMIENTO_POR_PLAZO = {
    menos2: 0, de2a5: 30, de5a10: 60, de10a20: 85, mas20: 90,
  };

  // Dentro de la parte estable, cuánto va a monetario. Depende del plazo y no
  // del perfil: el monetario es la parte que no se mueve, y quien la necesita es
  // quien tiene el dinero cerca, tenga el carácter que tenga.
  var MONETARIO_DE_LA_PARTE_ESTABLE = {
    menos2: 1.00, de2a5: 0.60, de5a10: 0.30, de10a20: 0.20, mas20: 0.15,
  };

  // Suelo de monetario cuando no hay colchón de gastos. Segundo efecto de la
  // misma respuesta, por un mecanismo distinto del gate: el gate baja el nivel
  // de riesgo, este suelo decide qué parte de lo estable tiene que estar
  // disponible de un día para otro. Va dicho aquí para que se vea que la
  // duplicidad es intencionada.
  var SUELO_MONETARIO_SIN_COLCHON = 0.50;

  // Los satélites, en puntos de la cartera total. La renta variable global es el
  // núcleo de la parte de crecimiento porque es la más repartida de las tres:
  // miles de empresas en muchos países. El inmobiliario cotizado y las materias primas son
  // más estrechos y más concentrados, así que entran limitados y nunca pueden
  // pesar más que el núcleo.
  var PROPORCION_MATERIAS_DEL_CRECIMIENTO = 0.10;
  var PROPORCION_INMOBILIARIO_DEL_CRECIMIENTO = 0.15;
  var TOPE_MATERIAS = 5;
  var TOPE_INMOBILIARIO = 10;

  // Por debajo de este peso de crecimiento no entra ningún satélite. Un 2% de
  // materias primas no cambia el comportamiento de una cartera, solo añade una línea más que
  // vigilar y un coste más que pagar.
  var CRECIMIENTO_MINIMO_PARA_SATELITES = 30;

  function pesosExactos(indicePerfil, respuestas) {
    var perfil = PERFILES[indicePerfil - 1];
    var techo = TECHO_CRECIMIENTO_POR_PLAZO[respuestas.horizonte];
    var crecimiento = Math.min(perfil.crecimiento, techo);
    var estable = 100 - crecimiento;

    var materias = 0;
    var inmobiliario = 0;
    if (crecimiento >= CRECIMIENTO_MINIMO_PARA_SATELITES) {
      materias = Math.min(crecimiento * PROPORCION_MATERIAS_DEL_CRECIMIENTO, TOPE_MATERIAS);
      inmobiliario = Math.min(crecimiento * PROPORCION_INMOBILIARIO_DEL_CRECIMIENTO, TOPE_INMOBILIARIO);
    }
    var rentaVariable = crecimiento - materias - inmobiliario;

    var fraccionMonetario = MONETARIO_DE_LA_PARTE_ESTABLE[respuestas.horizonte];
    if (respuestas.emergencia === 'ninguno') {
      fraccionMonetario = Math.max(fraccionMonetario, SUELO_MONETARIO_SIN_COLCHON);
    }
    var monetario = estable * fraccionMonetario;
    var rentaFija = estable - monetario;

    return {
      rentaVariableGlobal: rentaVariable,
      inmobiliarioCotizado: inmobiliario,
      materiasPrimas: materias,
      rentaFija: rentaFija,
      monetario: monetario,
      _crecimiento: crecimiento,
      _techoPorPlazo: techo,
      _limitadoPorPlazo: techo < perfil.crecimiento,
    };
  }

  // Redondeo por restos mayores. Los pesos tienen que sumar 100 exactos: una
  // cartera que suma 99 o 101 delata que nadie ha mirado la aritmética, y esa
  // duda se traslada a todo lo demás.
  //
  // El reparto de las unidades sobrantes se limita a las clases con peso
  // estrictamente positivo. Sin esa condición, una clase que el motor ha dejado
  // fuera a propósito podría acabar con un 1% por un accidente de redondeo, y un
  // 1% de una clase que no debía estar es un error de contenido, no de formato.
  function redondearA100(exactos) {
    var ids = CLASES.map(function (c) { return c.id; });
    var enteros = {};
    var suma = 0;
    ids.forEach(function (id) {
      enteros[id] = Math.floor(exactos[id]);
      suma += enteros[id];
    });
    var sobrantes = 100 - suma;

    var candidatos = ids
      .filter(function (id) { return exactos[id] > 0; })
      .map(function (id) {
        return { id: id, resto: exactos[id] - Math.floor(exactos[id]), orden: ids.indexOf(id) };
      })
      .sort(function (a, b) {
        if (b.resto !== a.resto) return b.resto - a.resto;
        return a.orden - b.orden;
      });

    for (var i = 0; i < sobrantes && i < candidatos.length; i++) {
      enteros[candidatos[i].id] += 1;
    }
    return enteros;
  }

  // ==========================================================================
  // 7 · Volatilidad y caída de la mezcla
  // ==========================================================================
  //
  // La volatilidad de una cartera depende de cómo se muevan las clases entre sí,
  // y ese dato no lo tenemos con fuente. En vez de inventarnos una matriz de
  // correlaciones y presentarla como si estuviera medida, se dan las dos COTAS
  // exactas, que no necesitan ningún parámetro más:
  //
  //   cota alta = suma de pesos por volatilidad     (todo se mueve a la vez)
  //   cota baja = raíz de la suma de cuadrados      (nada se mueve a la vez)
  //
  // La volatilidad real de cualquier cartera cae entre esas dos siempre que las
  // correlaciones no sean negativas. No es una estimación con un margen puesto a
  // ojo: es el rango completo de lo posible bajo un supuesto que se declara.
  function bandaVolatilidad(pesos) {
    var suma = 0;
    var sumaCuadrados = 0;
    CLASES.forEach(function (c) {
      var w = pesos[c.id] / 100;
      suma += w * c.volatilidad;
      sumaCuadrados += w * w * c.volatilidad * c.volatilidad;
    });
    return {
      minima: Math.round(Math.sqrt(sumaCuadrados) * 10) / 10,
      maxima: Math.round(suma * 10) / 10,
    };
  }

  // Dos escenarios con significado literal, cada uno construido solo con las
  // peores caídas que la guía documenta clase por clase.
  //
  //   siTodoCaeALaVez     todas las clases tocan su peor caída conocida en el
  //                       mismo episodio. En 2022 la bolsa y la renta fija
  //                       cayeron juntas, así que esto no es teórico.
  //   siLoEstableAguanta  la parte estable se queda plana y solo cae la de
  //                       crecimiento.
  //
  // La cifra de verdad está entre las dos. Ninguna de las dos es una previsión.
  function rangoCaida(pesos) {
    var todo = 0;
    var soloCrecimiento = 0;
    CLASES.forEach(function (c) {
      var aporta = (pesos[c.id] / 100) * c.caidaMaxima;
      todo += aporta;
      if (CLASES_CRECIMIENTO.indexOf(c.id) >= 0) soloCrecimiento += aporta;
    });
    return {
      siLoEstableAguanta: Math.round(soloCrecimiento),
      siTodoCaeALaVez: Math.round(todo),
    };
  }

  // ==========================================================================
  // 8 · El coste de las comisiones
  // ==========================================================================
  //
  // Mismos supuestos que la pieza ancla de W0 (calculo-comisiones.js): 2,00%
  // anual como coste de una gestión tradicional y 0,20% como coste de una
  // cartera indexada barata. Un test cruzado comprueba que este motor y aquel
  // script dan el mismo euro para el caso de referencia, porque dos aritméticas
  // iguales en dos ficheros distintos se separan sin avisar.
  //
  // La cifra del primer año no depende de ninguna previsión: es la resta de dos
  // porcentajes sobre un importe conocido. La acumulada sí necesita suponer una
  // rentabilidad bruta, y por eso el supuesto va escrito al lado del número en
  // la propia pantalla.
  //
  // Del tramo de plazo se toma el extremo CORTO. Cuanto más largo el plazo,
  // mayor sale el ahorro, así que quedarse con el extremo corto es quedarse
  // corto en el número que sostiene el argumento comercial de la casa.
  var COSTE_TRADICIONAL = 0.0200;
  var COSTE_INDEXADO = 0.0020;
  var BRUTO_SUPUESTO = 0.06;
  var IMPORTE_REFERENCIA = 100000;

  var ANOS_DEL_TRAMO = { menos2: 1, de2a5: 2, de5a10: 5, de10a20: 10, mas20: 20 };

  function costeComisiones(horizonte) {
    var anos = ANOS_DEL_TRAMO[horizonte];
    var conCosteAlto = IMPORTE_REFERENCIA * Math.pow(1 + BRUTO_SUPUESTO - COSTE_TRADICIONAL, anos);
    var conCosteBajo = IMPORTE_REFERENCIA * Math.pow(1 + BRUTO_SUPUESTO - COSTE_INDEXADO, anos);
    return {
      importe: IMPORTE_REFERENCIA,
      anos: anos,
      primerAno: Math.round(IMPORTE_REFERENCIA * (COSTE_TRADICIONAL - COSTE_INDEXADO)),
      acumulado: Math.round(conCosteBajo - conCosteAlto),
      brutoSupuesto: BRUTO_SUPUESTO,
      costeTradicional: COSTE_TRADICIONAL,
      costeIndexado: COSTE_INDEXADO,
    };
  }

  // Fórmula aislada para que el test cruzado contra calculo-comisiones.js pueda
  // llamarla con los parámetros de aquel caso de referencia.
  function diferenciaPorComisiones(capital, anos, bruto, costeAlto, costeBajo) {
    return capital * Math.pow(1 + bruto - costeBajo, anos) - capital * Math.pow(1 + bruto - costeAlto, anos);
  }

  // ==========================================================================
  // 9 · La función principal
  // ==========================================================================

  function maximoDe(tabla) {
    return Object.keys(tabla).reduce(function (a, k) { return Math.max(a, tabla[k]); }, 0);
  }

  function validar(respuestas) {
    var faltan = [];
    var invalidas = [];
    PREGUNTAS.forEach(function (p) {
      var valor = respuestas ? respuestas[p.id] : undefined;
      if (valor === undefined || valor === null || valor === '') {
        faltan.push(p.id);
        return;
      }
      var existe = p.opciones.some(function (o) { return o.codigo === valor; });
      if (!existe) invalidas.push(p.id);
    });
    return { faltan: faltan, invalidas: invalidas, ok: faltan.length === 0 && invalidas.length === 0 };
  }

  function perfilar(respuestas) {
    var v = validar(respuestas);
    if (!v.ok) {
      var error = new Error('Respuestas incompletas o no reconocidas.');
      error.validacion = v;
      throw error;
    }

    // Capacidad.
    var desgloseCapacidad = [];
    var capacidad = 0;
    Object.keys(PUNTOS_CAPACIDAD).forEach(function (id) {
      var puntos = PUNTOS_CAPACIDAD[id][respuestas[id]];
      capacidad += puntos;
      desgloseCapacidad.push({ pregunta: id, puntos: puntos, maximo: maximoDe(PUNTOS_CAPACIDAD[id]) });
    });

    // Tolerancia, con el techo por contradicción entre lo declarado y lo hecho.
    var puntosComportamiento = PUNTOS_TOLERANCIA.comportamiento[respuestas.comportamiento];
    var puntosReaccionBruto = PUNTOS_TOLERANCIA.reaccion[respuestas.reaccion];
    var contradiccion = respuestas.comportamiento === 'vendi' && puntosReaccionBruto > TECHO_POR_CONTRADICCION;
    var puntosReaccion = contradiccion ? TECHO_POR_CONTRADICCION : puntosReaccionBruto;

    var tolerancia = puntosComportamiento + puntosReaccion +
      PUNTOS_TOLERANCIA.experiencia[respuestas.experiencia] +
      PUNTOS_TOLERANCIA.objetivo[respuestas.objetivo];

    var desgloseTolerancia = [
      { pregunta: 'comportamiento', puntos: puntosComportamiento, maximo: maximoDe(PUNTOS_TOLERANCIA.comportamiento) },
      { pregunta: 'reaccion', puntos: puntosReaccion, maximo: maximoDe(PUNTOS_TOLERANCIA.reaccion), puntosSinTecho: puntosReaccionBruto },
      { pregunta: 'experiencia', puntos: PUNTOS_TOLERANCIA.experiencia[respuestas.experiencia], maximo: maximoDe(PUNTOS_TOLERANCIA.experiencia) },
      { pregunta: 'objetivo', puntos: PUNTOS_TOLERANCIA.objetivo[respuestas.objetivo], maximo: maximoDe(PUNTOS_TOLERANCIA.objetivo) },
    ];

    // El mínimo, nunca la media.
    var base = Math.min(capacidad, tolerancia);
    var manda = capacidad <= tolerancia ? 'capacidad' : 'tolerancia';
    var indiceBase = bandaDePerfil(base);

    // Gates: solo bajan.
    var aplicados = GATES.filter(function (g) { return g.aplica(respuestas); });
    var indice = indiceBase;
    aplicados.forEach(function (g) { indice = Math.min(indice, g.techo); });

    var exactos = pesosExactos(indice, respuestas);
    var pesos = redondearA100(exactos);

    return {
      version: VERSION,
      respuestas: respuestas,
      capacidad: capacidad,
      tolerancia: tolerancia,
      // El desglose se devuelve porque la pantalla lo enseña. Un resultado que
      // solo da la puntuación final no se puede discutir, y este tiene que
      // poder discutirlo tanto quien lo recibe como quien pregunte por qué a un
      // perfil le corresponden estos pesos.
      desgloseCapacidad: desgloseCapacidad,
      desgloseTolerancia: desgloseTolerancia,
      manda: manda,
      contradiccion: contradiccion,
      perfilSinLimites: PERFILES[indiceBase - 1],
      perfil: PERFILES[indice - 1],
      limitesAplicados: aplicados.map(function (g) {
        return { id: g.id, techo: g.techo, motivo: g.motivo };
      }),
      limitadoPorPlazo: exactos._limitadoPorPlazo,
      pesoCrecimiento: exactos._crecimiento,
      techoPorPlazo: exactos._techoPorPlazo,
      pesos: pesos,
      pesosExactos: exactos,
      volatilidad: bandaVolatilidad(pesos),
      caida: rangoCaida(pesos),
      comisiones: costeComisiones(respuestas.horizonte),
    };
  }

  var api = {
    VERSION: VERSION,
    CLASES: CLASES,
    CLASES_CRECIMIENTO: CLASES_CRECIMIENTO,
    CLASES_ESTABILIDAD: CLASES_ESTABILIDAD,
    PREGUNTAS: PREGUNTAS,
    PERFILES: PERFILES,
    PUNTOS_CAPACIDAD: PUNTOS_CAPACIDAD,
    PUNTOS_TOLERANCIA: PUNTOS_TOLERANCIA,
    GATES: GATES,
    TECHO_CRECIMIENTO_POR_PLAZO: TECHO_CRECIMIENTO_POR_PLAZO,
    MONETARIO_DE_LA_PARTE_ESTABLE: MONETARIO_DE_LA_PARTE_ESTABLE,
    ANOS_DEL_TRAMO: ANOS_DEL_TRAMO,
    perfilar: perfilar,
    validar: validar,
    bandaDePerfil: bandaDePerfil,
    pesosExactos: pesosExactos,
    redondearA100: redondearA100,
    bandaVolatilidad: bandaVolatilidad,
    rangoCaida: rangoCaida,
    costeComisiones: costeComisiones,
    diferenciaPorComisiones: diferenciaPorComisiones,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.MotorPerfil = api;

}(typeof globalThis !== 'undefined' ? globalThis : this));
