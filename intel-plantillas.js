'use strict';
// ============================================================================
// CT Advisory · educación financiera · textos de la pantalla de resultado
// ct-wealth-ambito: pieza-a
// ============================================================================
//
// LA REGLA QUE DEFINE ESTE FICHERO: aquí vive TODO el texto que el usuario lee
// en la pantalla de resultado, y ninguna de estas frases la escribe un modelo.
// Están escritas a mano, revisadas una a una, y el programa solo elige cuál
// pinta y rellena huecos con números (ampliacion.md 3.1).
//
// Separado de `app-herramienta.js` a propósito: cuando el abogado regulatorio
// revise el producto, tiene que poder leer de corrido todo lo que se muestra
// sin cruzarse con una línea de código. Ese es el único motivo de que este
// fichero exista como fichero aparte.
//
// --- Recorte del 10-ago-2026 -----------------------------------------------
//
// Segunda vez que Carlos rechaza el material por lo mismo: demasiado texto.
// Sus palabras, que son el criterio con el que se ha recortado esto: "en muy
// poco texto y de la forma más visual posible".
//
// Qué se ha hecho, y qué NO:
//
//   · Los cuatro campos de cada perfil pasan de párrafo a frase. Dicen lo
//     mismo con la mitad de palabras; ninguno se ha borrado.
//   · Los bloques comunes que explican la aritmética se conservan ÍNTEGROS en
//     contenido y se sirven plegados. Lo que protege no es que el usuario los
//     lea, es que estén y sean ciertos: un supervisor que pregunte de dónde
//     sale un número merece la respuesta completa, no un resumen.
//   · No se ha quitado ni una cautela, ni un aviso, ni la declaración de qué
//     no es esto. Ese material no es longitud negociable.
//
// La distinción, que conviene no perder en un recorte futuro: se abrevia lo
// que describe, nunca lo que advierte.
// ============================================================================

(function (raiz) {

  // ==========================================================================
  // Un bloque por perfil. Los cinco tienen la misma estructura y una longitud
  // parecida para que se lean en paralelo y se vea que ninguno está más
  // vendido que los demás.
  //
  //   titular      la frase que va bajo el gráfico
  //   queHace      qué reparto es este (va plegado: el círculo ya lo enseña)
  //   queEsperar   qué se va a sentir teniéndolo
  //   queVigilar   dónde se rompe. Es la única que avisa, y va siempre visible
  // ==========================================================================

  var PERFILES = {
    // Variante propia para cuando el plazo deja el peso de crecimiento en cero.
    // Se eligió al ver el resultado en el navegador: con el reparto
    // íntegramente monetario, el texto de "defensivo" seguía hablando de una
    // parte de crecimiento que en ese caso no existe. Una plantilla fija que
    // describe algo que los números no dicen es peor que no tener plantilla,
    // porque el lector se fía de la frase y no del gráfico. La variante se
    // elige por una condición aritmética, no por criterio.
    plazoCorto: {
      titular: 'Con este plazo la pregunta ya no es cómo invertirlo, es dónde mantenerlo disponible.',
      queHace: 'Todo el peso queda en la clase que no se mueve. Por debajo de dos años no entra nada de crecimiento, diga lo que diga el resto del cuestionario: recuperarse de una caída lleva años, y aquí no hay años.',
      queEsperar: 'Algo parecido al tipo de interés a corto plazo del momento. Ni caídas ni subidas apreciables.',
      queVigilar: 'La inflación. La cantidad sigue entera y compra menos, y eso no aparece en ningún extracto.',
    },
    defensivo: {
      titular: 'Construido para que la cantidad siga estando cuando haga falta.',
      queHace: 'Casi todo el peso queda en las dos clases que menos se mueven. La parte de crecimiento es pequeña y está por una razón concreta: a plazos largos, un dinero que no crece nada pierde poder de compra todos los años.',
      queEsperar: 'Movimientos pequeños. Renuncia a buena parte de la subida a cambio de que la bajada sea corta.',
      queVigilar: 'La inflación. Si los tipos a corto quedan por debajo de los precios, el saldo sube y lo que compra baja.',
    },
    conservador: {
      titular: 'Se apoya en la parte estable y deja crecer a una minoría del dinero.',
      queHace: 'Dos tercios largos del peso están en renta fija y monetario. El resto se reparte entre las clases de crecimiento, con la renta variable global como núcleo.',
      queEsperar: 'Años tranquilos con alguno claramente malo. En 2022 la renta fija cayó a la vez que la bolsa.',
      queVigilar: 'La tentación de modificarlo cuando la parte de crecimiento sube mucho un año. Solo funciona si se mantiene.',
    },
    equilibrado: {
      titular: 'Partido en dos mitades: una que crece y otra que amortigua.',
      queHace: 'La mitad del peso queda en clases de crecimiento y la otra mitad en clases estables. Es el punto donde ninguna de las dos partes manda sobre la otra.',
      queEsperar: 'Una caída del orden de la que aparece arriba en algún momento. No es remota: ya ha ocurrido.',
      queVigilar: 'Confundir la parte estable con un seguro. Amortigua, y cuando todo cae a la vez amortigua bastante menos.',
    },
    dinamico: {
      titular: 'Orientado al crecimiento, con una parte estable que sigue haciendo su trabajo.',
      queHace: 'La mayoría del peso está en clases de crecimiento, con la renta variable global como núcleo y dos satélites limitados. La parte estable se queda pequeña y pasa a servir para cubrir un imprevisto sin vender lo que ha caído.',
      queEsperar: 'Recorridos largos hacia arriba interrumpidos por caídas fuertes que tardan años en recuperarse.',
      queVigilar: 'El plazo. Esto solo tiene sentido mientras el dinero pueda quedarse quieto todo ese tiempo.',
    },
    agresivo: {
      titular: 'El reparto con más crecimiento que produce esta herramienta, y con la mayor caída.',
      queHace: 'Nueve de cada diez euros quedan en clases de crecimiento. La décima parte estable no está de adorno: es lo que permite cubrir un gasto imprevisto sin liquidar lo que en ese momento esté en pérdidas.',
      queEsperar: 'Caídas de más de la mitad del valor en los peores episodios registrados, y años enteros en pérdidas.',
      queVigilar: 'La distancia entre lo que uno cree que hará en una caída y lo que acaba haciendo cuando llega.',
    },
  };

  // ==========================================================================
  // Bloques comunes. Explican CÓMO se ha llegado al resultado, que es la parte
  // que hace auditable la calculadora. Un usuario que no entiende de dónde
  // sale su perfil no puede discutirlo, y un supervisor tampoco.
  //
  // Casi todos se sirven dentro de un plegable. Que estén plegados no los hace
  // menos obligatorios: se abrevian los que describen, nunca los que advierten.
  // ==========================================================================

  var COMUNES = {
    comoSeCalcula: 'El resultado sale de dos puntuaciones. La capacidad mide circunstancias objetivas: plazo, colchón de gastos, estabilidad de ingresos y qué parte del dinero total representa esta cantidad. La tolerancia mide comportamiento: lo que se hizo en una caída real y lo que se dice que se haría en la siguiente.',

    porQueElMinimo: 'De las dos manda la más baja, nunca la media. Son dos restricciones separadas y el reparto tiene que cumplir las dos. Quien tiene capacidad de sobra pero vende en cuanto cae ya ha mostrado cuál es su límite, y quien aguantaría cualquier cosa pero necesita el dinero el año que viene va a tener que venderlo caiga o no caiga.',

    contradiccion: 'En una caída real se vendió, y en la pregunta sobre la próxima se ha marcado aguantar o aportar. El motor se queda con lo que ocurrió: la puntuación de la respuesta declarada se ha limitado a la de vender una parte. Es la única forma de que la pregunta sobre el pasado sirva para algo.',

    volatilidad: 'La volatilidad de una mezcla depende de cómo se muevan las clases entre sí, y ese dato no lo tenemos con una fuente que podamos citar. En vez de suponer una correlación y presentarla como si estuviera medida, se dan las dos cotas exactas: la de arriba supone que todas las clases se mueven a la vez, la de abajo que ninguna lo hace. La cifra real cae entre las dos siempre que las correlaciones no sean negativas.',

    caida: 'Los dos extremos se calculan con las peores caídas documentadas clase por clase, cada una con su fuente. El extremo bajo supone que la parte estable se queda plana y solo cae la de crecimiento. El extremo alto supone que todas tocan su peor registro en el mismo episodio, que es aproximadamente lo que pasó en 2022 con la bolsa y la renta fija a la vez.',

    caidaNoEsPrevision: 'Ninguno de los dos números es una previsión ni un límite. Son magnitudes de episodios que ya ocurrieron, aplicadas a este reparto para dar una idea del orden de lo que se asume.',

    comisiones: 'La diferencia del primer año es una resta entre dos porcentajes sobre un importe conocido, y no depende de ninguna previsión. La cifra acumulada sí necesita suponer una rentabilidad, y el supuesto va escrito al lado.',

    comisionesPlazo: 'Del tramo de plazo elegido se ha tomado el extremo corto. Cuanto más largo es el plazo mayor sale la diferencia, así que quedarse con el extremo corto es quedarse corto en el número.',

    supuestoBruto: 'El 6% bruto anual es el mismo supuesto que usa la pieza sobre gestión activa y pasiva. Se mantiene igual para todos los repartos en vez de ajustarlo a cada uno, porque ajustarlo exigiría suponer una rentabilidad futura por clase de activo, y eso no está documentado en ninguna parte de estas páginas.',

    comisionesPlazoCorto: 'A un año no hay nada que componer, así que esa es toda la diferencia. Lo que convierte una comisión en un problema serio es el tiempo, y aquí el tiempo todavía no ha entrado en juego.',

    volatilidadSinFuente: 'Las volatilidades por clase con las que se calcula esta banda son un supuesto de la casa. Las caídas máximas sí están documentadas con su fuente; la volatilidad anual no la hemos localizado en una fuente primaria que podamos citar, y preferimos decirlo a rellenar el hueco con una estimación disfrazada de dato.',

    // Dos frases añadidas el 10-ago-2026 por la lectura antagonista del
    // proyecto, que señaló dos formulaciones que exponían más de lo que el
    // producto hace: "carteras personalizadas" describe algo más ancho que
    // esto, y "el sistema hace el trabajo" es mala narrativa y además falsa
    // en la parte que importa. Ninguna de las dos describe una capacidad
    // nueva: describen con precisión la que ya está construida.
    alcanceReparto: 'El reparto es orientativo y se expresa solo en pesos por clase de activo. No llega a ningún producto, ninguna entidad ni ningún código de instrumento, y no tiene en cuenta la situación completa de nadie.',

    quienResponde: 'Las reglas de cálculo y cada frase de esta pantalla están escritas y revisadas por Carlos Torres, que responde del contenido. La aritmética está automatizada; el texto no. Ningún modelo de lenguaje redacta lo que se lee aquí.',

    queNoEs: 'Información de carácter general sobre asignación de activos. No es asesoramiento en materia de inversión, no es una recomendación personalizada y no propone ningún producto ni ninguna entidad. CT Advisory no está inscrita en el registro de empresas de servicios de inversión de la CNMV y no presta ese servicio. Toda inversión puede perder valor, incluido el capital aportado, y la rentabilidad pasada no garantiza la futura.',

    sinDatos: 'Las respuestas no salen de este navegador. El cálculo ocurre en el propio dispositivo y no se envía nada a ningún servidor. Si decides guardar algo en el panel de Mis Finanzas, se queda solo aquí, nunca en un servidor de CT Advisory.',

    // --- Navegación hacia la educación pública -----------------------------
    //
    // Estos textos son el enlace entre la calculadora y la educación, que es el
    // punto exacto donde ESMA mira (límite 1: el genérico se contamina si es
    // preparatorio del específico). Tres reglas los gobiernan:
    //
    //   · Cada título es el NOMBRE del documento al otro lado, no una promesa
    //     sobre quien lee. "Cinco clases de activo", nunca "las clases para tu
    //     perfil".
    //   · Cada llamada nombra una cifra o una operación concreta. Es lo que las
    //     hace fuertes sin prometer un resultado personal, que además sería
    //     lenguaje de idoneidad y lo bloquearía el linter.
    //   · El pie dice que la página es la misma para todo el mundo y que se
    //     abre sin pasar por aquí. Esa frase es la que convierte el enlace en
    //     navegación en vez de en el paso siguiente de un embudo.
    tituloClases: 'Cinco clases de activo',
    pieClases: 'La misma página para todo el mundo, con las mismas clases en el mismo orden. Se abre sin pasar por este cuestionario y no cambia según lo que se haya respondido.',
    ctaClases: 'Comparar las seis de un vistazo',
    tituloCoste: 'Quién lo gestiona y cómo lo compras',
    pieCoste: 'La misma página para todo el mundo: qué diferencia a la gestión activa de la pasiva, y los pasos para comprar por tu cuenta. Se abre sin pasar por este cuestionario.',
    ctaCoste: 'Ver cómo funciona',
  };

  var api = { PERFILES: PERFILES, COMUNES: COMUNES };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.PlantillasPerfil = api;

}(typeof globalThis !== 'undefined' ? globalThis : this));
