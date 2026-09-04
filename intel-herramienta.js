/* intel-herramienta.js: la herramienta de reparto por clase de activo de CT Intelligence.
   Fuente: medianoche/intel/herramienta.js. Solo carga en /intelligence/herramienta/.

   Pinta el cuestionario del motor (intel-motor.js, MotorPerfil: preguntas, puntuaciones, límites y pesos,
   probado con 983.040 combinaciones), mantiene la rosca provisional mientras se responde y, al terminar,
   enseña el reparto con los textos de intel-plantillas.js. Las cifras de riesgo del reparto salen de las
   mismas series anuales en euros que la guía «Cinco clases de activo» (intel-series.js), con reequilibrio
   anual: peor año natural y mayor caída desde un máximo, 2000-2025. Nada sale del navegador. */
(function () {
  'use strict';
  const M = window.MotorPerfil, S = window.CT_SERIES, T = window.PlantillasPerfil;
  const raiz = document.getElementById('herr');
  if (!raiz || !M || !S || !T) return;

  /* Del id del motor al id de las series y a los nombres que ve el lector */
  const MAPA = { rentaVariableGlobal: 'rv', inmobiliarioCotizado: 'inm', materiasPrimas: 'mat', rentaFija: 'rf', monetario: 'mon' };
  const ORDEN = ['rentaVariableGlobal', 'inmobiliarioCotizado', 'materiasPrimas', 'rentaFija', 'monetario'];
  const NOMBRE = { rv: 'Renta variable global', inm: 'Inmobiliario', mat: 'Materias primas', rf: 'Renta fija', mon: 'Monetario' };
  const ICONOS = window.CT_ICONOS || {};
  const PLAZO = { menos2: 'menos de 2 años', de2a5: 'de 2 a 5 años', de5a10: 'de 5 a 10 años', de10a20: 'de 10 a 20 años', mas20: 'más de 20 años' };
  const DIMENSION = { capacidad: 'Situación', tolerancia: 'Tolerancia al riesgo' };
  const ETIQUETA = { horizonte: 'Plazo', objetivo: 'Objetivo', emergencia: 'Colchón de gastos', ahorro: 'Ahorro mensual', ingresos: 'Ingresos', proporcion: 'Parte del patrimonio', liquidez: 'Necesidad de sacar dinero', reaccion: 'Reacción a una caída', comportamiento: 'Lo que hizo en una caída', experiencia: 'Experiencia' };
  const CAPITAL = 100000;
  const CLAVE_GUARDADO = 'ct-intelligence-reparto';

  const $ = (id) => document.getElementById(id);
  /* Punto de millar también en cifras de cuatro dígitos («1.800 €»): el locale es-ES no lo pone hasta cinco. */
  const eur = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
  const pct = (n, d) => (n < 0 ? '−' : '') + Math.abs(n).toFixed(d == null ? 1 : d).replace('.', ',') + ' %';
  const an = (i) => (i ? 1999 + i : 2000);
  /* La parte de crecimiento se lee de los propios pesos, para que la rosca y el texto digan lo mismo que la lista. */
  const crecimientoDe = (pesos) => M.CLASES_CRECIMIENTO.reduce((s, id) => s + (pesos[id] || 0), 0);

  /* ── Rosca y lista de reparto ─────────────────────────────────────────── */
  function pintarDonut(svg, pesos) {
    const crecimiento = crecimientoDe(pesos);
    const C = 2 * Math.PI * 44; let off = 0; let arcos = '';
    ORDEN.forEach((id) => {
      const w = pesos[id] || 0; if (!w) return;
      const l = w / 100 * C;
      arcos += `<circle class="seg" cx="60" cy="60" r="44" stroke="var(--c-${MAPA[id]})" stroke-dasharray="${l.toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 60 60)"/>`;
      off += l;
    });
    svg.innerHTML = arcos + `<text class="cen" x="60" y="62" text-anchor="middle">${crecimiento} %</text><text class="cen2" x="60" y="75" text-anchor="middle">DE CRECIMIENTO</text>`;
    svg.setAttribute('aria-label', `Reparto: ${crecimiento} % en clases de crecimiento y ${100 - crecimiento} % en clases estables`);
  }
  function pintarReparto(ul, pesos) {
    ul.innerHTML = ORDEN.map((id) => `<li style="--c:var(--c-${MAPA[id]})"><span class="rep-ico">${ICONOS[MAPA[id]] || '<i></i>'}</span>${NOMBRE[MAPA[id]]}<b>${pesos[id] || 0} %</b></li>`).join('');
  }

  /* ── Riesgo histórico del reparto, con las series de la guía (reequilibrio anual) ── */
  function riesgoHistorico(pesos) {
    const r = S.retornosEUR(CAPITAL);
    let v = CAPITAL, pico = v, iPico = 0;
    let peor = { a: null, r: Infinity }, dd = { r: 0, de: 0, a: 0 };
    const rets = [];
    S.ANOS.forEach((a, i) => {
      let ret = 0;
      ORDEN.forEach((id) => { ret += ((pesos[id] || 0) / 100) * r[MAPA[id]][i]; });
      rets.push(ret * 100);
      v *= 1 + ret;
      if (ret * 100 < peor.r) peor = { a: a, r: ret * 100 };
      if (v > pico) { pico = v; iPico = i + 1; }
      const d = (v / pico - 1) * 100;
      if (d < dd.r) dd = { r: d, de: iPico, a: i + 1 };
    });
    /* Rentabilidad anual media compuesta y volatilidad (desviación típica muestral de las rentabilidades
       anuales). La escala 1-7 sigue las bandas de volatilidad del indicador sintético de riesgo de los fondos
       (CESR/10-673: <0,5 · 2 · 5 · 10 · 15 · 25 %), calculada con cierres anuales: orientativa, no es el
       indicador de ningún producto (Carlos, 2-sep 19:09: «como los productos de verdad si es legal»). */
    const n = rets.length, media = rets.reduce((s, x) => s + x, 0) / n;
    const vol = Math.sqrt(rets.reduce((s, x) => s + (x - media) * (x - media), 0) / (n - 1));
    const anual = (Math.pow(v / CAPITAL, 1 / n) - 1) * 100;
    const escala = vol < 0.5 ? 1 : vol < 2 ? 2 : vol < 5 ? 3 : vol < 10 ? 4 : vol < 15 ? 5 : vol < 25 ? 6 : 7;
    return { peor: peor, dd: dd, fin: v, anual: anual, vol: vol, escala: escala };
  }

  /* ── Estado ───────────────────────────────────────────────────────────── */
  let respuestas = {};
  let paso = 0;
  const N = M.PREGUNTAS.length;
  /* Reparto final tras editarlo a mano (Carlos, 3-sep-2026: además de moverse con el cuestionario, cada
     peso se puede escribir). null mientras no se ha tocado nada: el reparto vigente es el del cuestionario. */
  let pesosEditados = null;

  /* Reparto provisional mientras se responde. Con las tablas del motor, pero solo con lo contestado: cada
     dimensión puntúa por la fracción de puntos conseguidos sobre los posibles de las preguntas ya respondidas,
     así que cada respuesta mueve la rosca (Carlos, 2-sep-2026: «de las preguntas solo una parte afectan al
     piechart y actúa raro»). Los límites duros solo entran cuando su pregunta ya está contestada; el plazo,
     mientras no se conteste, se supone intermedio. El resultado final lo da el motor completo, no esto. */
  function provisional() {
    const fraccion = (tabla) => {
      let obtenidos = 0, posibles = 0;
      Object.keys(tabla).forEach((id) => { if (respuestas[id] in tabla[id]) { obtenidos += tabla[id][respuestas[id]]; posibles += Math.max(...Object.values(tabla[id])); } });
      return posibles ? obtenidos / posibles * 100 : null;
    };
    const cap = fraccion(M.PUNTOS_CAPACIDAD), tol = fraccion(M.PUNTOS_TOLERANCIA);
    const base = cap === null && tol === null ? 0 : Math.min(cap === null ? 100 : cap, tol === null ? 100 : tol);
    let indice = M.bandaDePerfil(base);
    M.GATES.forEach((g) => { if (g.aplica(respuestas)) indice = Math.min(indice, g.techo); });
    const r = Object.assign({ horizonte: 'de5a10', emergencia: 'de3a6' }, respuestas);
    return M.redondearA100(M.pesosExactos(indice, r));
  }

  function pintarProvisional() {
    const pesos = provisional();
    pintarDonut($('donut1'), pesos);
    pintarReparto($('reparto1'), pesos);
  }

  /* Las opciones se construyen una vez por pregunta y se actualizan en el sitio: así el foco de teclado no se
     pierde al elegir, y las flechas mueven la selección como en un grupo de radios. */
  function marcarSeleccion() {
    const p = M.PREGUNTAS[paso];
    $('q-ops').querySelectorAll('.op').forEach((b) => {
      const sel = respuestas[p.id] === b.dataset.codigo;
      b.classList.toggle('sel', sel); b.setAttribute('aria-checked', String(sel)); b.tabIndex = sel || !respuestas[p.id] ? 0 : -1;
    });
    $('btn-sig').disabled = !respuestas[p.id];
  }
  function elegir(codigo) {
    const p = M.PREGUNTAS[paso];
    respuestas[p.id] = codigo;
    marcarSeleccion(); pintarProvisional();
    $('btn-guardar').querySelector('span').textContent = 'Guardar en este navegador';
  }
  function pintarPregunta() {
    const p = M.PREGUNTAS[paso];
    $('q-num').textContent = `Pregunta ${paso + 1} de ${N}`;
    $('q-dim').textContent = p.id === 'horizonte' ? 'Plazo' : DIMENSION[p.dimension];
    $('q-prog').style.width = ((paso + 1) / N * 100).toFixed(0) + '%';
    $('q-texto').textContent = p.texto;
    const ops = $('q-ops'); ops.innerHTML = '';
    p.opciones.forEach((o) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'op'; b.setAttribute('role', 'radio'); b.dataset.codigo = o.codigo;
      b.innerHTML = '<i></i><span></span>'; b.querySelector('span').textContent = o.texto;
      b.addEventListener('click', () => elegir(o.codigo));
      ops.appendChild(b);
    });
    const ayuda = $('q-ayuda');
    if (p.ayuda) { ayuda.textContent = p.ayuda; ayuda.hidden = false; } else { ayuda.hidden = true; }
    $('btn-ant').disabled = paso === 0;
    $('btn-sig').querySelector('span').textContent = paso === N - 1 ? 'Ver el reparto' : 'Siguiente';
    marcarSeleccion();
  }
  $('q-ops').addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].indexOf(e.key) < 0) return;
    const botones = [...$('q-ops').querySelectorAll('.op')];
    const i = botones.indexOf(document.activeElement); if (i < 0) return;
    e.preventDefault();
    const j = (i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : botones.length - 1)) % botones.length;
    botones[j].focus(); elegir(botones[j].dataset.codigo);
  });

  /* ── Resultado ────────────────────────────────────────────────────────── */

  /* Misma lista que pintarReparto, pero con el peso en un <input> en vez de un <b> fijo, y un botón
     de menos y otro de más a cada lado para subir y bajar sin teclear (Carlos, 3-sep-2026: «pon
     símbolo de más y menos para ajustar de forma más cómoda»), un punto porcentual por pulsación.

     La lista se construye UNA sola vez por elemento <ul> y `actualizarValores()` es lo único que se
     llama en cada cambio posterior: repintarla entera con innerHTML -- como hacía la versión
     anterior -- perdía el foco al editar, y con los botones de más/menos cada pulsación habría
     destruido el propio botón recién pulsado (hallazgo de la revisión adversarial del commit
     7501c93, 3-sep-2026).

     El estado vigente nunca se lee de un `pesos` capturado en el cierre del manejador: se pide
     siempre a `obtenerPesos()`, que da el reparto EN ESE INSTANTE. Si se capturara un valor fijo al
     construir la lista, dos cambios rápidos y seguidos -- la rueda del ratón sobre el campo, o
     pulsar los botones deprisa -- reequilibrarían el segundo sobre la base del primero y el total
     dejaría de sumar 100 (mismo hallazgo). */
  let listaReparto = null; // { ul, actualizarValores } una vez construida; se reutiliza siempre

  function pintarRepartoEditable(ul, pesos, obtenerPesos, onCambio) {
    if (listaReparto && listaReparto.ul === ul) { listaReparto.actualizarValores(pesos); return; }

    ul.innerHTML = ORDEN.map((id) => `<li style="--c:var(--c-${MAPA[id]})"><span class="rep-ico">${ICONOS[MAPA[id]] || '<i></i>'}</span>${NOMBRE[MAPA[id]]}<span class="rep-ctrl"><button type="button" class="rep-paso" data-id="${id}" data-paso="-1" aria-label="Bajar un punto el peso de ${NOMBRE[MAPA[id]]}">&#8722;</button><b><input class="rep-input" type="number" inputmode="numeric" min="0" max="100" step="1" value="${pesos[id] || 0}" data-id="${id}" aria-label="Peso de ${NOMBRE[MAPA[id]]}, en por ciento">&nbsp;%</b><button type="button" class="rep-paso" data-id="${id}" data-paso="1" aria-label="Subir un punto el peso de ${NOMBRE[MAPA[id]]}">&#43;</button></span></li>`).join('');

    /* Punto único de entrada para cualquier cambio (input o botón): recorta al rango 0-100 y deja
       el campo con ese valor válido SIEMPRE, aunque no haya cambiado nada que reequilibrar -- si no,
       un valor no numérico que se recupera al mismo número que ya había (p.ej. borrar el campo y
       salir) se queda vacío en pantalla, porque `actualizarValores()` solo se llama cuando de
       verdad cambia el reparto. Solo avisa a `onCambio` si el valor final es distinto del vigente. */
    const aplicar = (id, valorPropuesto) => {
      const anterior = obtenerPesos()[id] || 0;
      const v = Math.max(0, Math.min(100, Math.round(valorPropuesto)));
      const inp = ul.querySelector(`.rep-input[data-id="${id}"]`);
      if (inp) inp.value = String(v);
      if (v !== anterior) onCambio(id, v);
    };

    ul.querySelectorAll('.rep-input').forEach((inp) => {
      const confirmar = () => {
        let v = parseFloat(String(inp.value).replace(',', '.'));
        /* No numérico: no hay límite al que corregir, así que se recupera el valor vigente. */
        if (!isFinite(v)) v = obtenerPesos()[inp.dataset.id] || 0;
        aplicar(inp.dataset.id, v);
      };
      inp.addEventListener('change', confirmar);
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
    });
    ul.querySelectorAll('.rep-paso').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        aplicar(id, (obtenerPesos()[id] || 0) + Number(btn.dataset.paso));
      });
    });

    listaReparto = {
      ul: ul,
      actualizarValores: (pesosVigentes) => {
        ORDEN.forEach((id) => {
          const v = pesosVigentes[id] || 0;
          const inp = ul.querySelector(`.rep-input[data-id="${id}"]`);
          if (inp) inp.value = String(v);
          const botones = ul.querySelectorAll(`.rep-paso[data-id="${id}"]`);
          botones.forEach((b) => { b.disabled = Number(b.dataset.paso) < 0 ? v <= 0 : v >= 100; });
        });
      }
    };
    listaReparto.actualizarValores(pesos);
  }

  /* Reparte lo que deja libre la clase editada entre las otras cuatro, proporcional al peso que ya tenían
     (si no tenían nada, a partes iguales), con el método del resto mayor para que la suma cuadre siempre
     en 100 exacto — nunca 99 o 101 por redondeo. La cifra escrita se respeta tal cual. */
  function reequilibrar(pesos, idEditado, valor) {
    const otros = ORDEN.filter((id) => id !== idEditado);
    const restante = 100 - valor;
    const nuevos = {}; nuevos[idEditado] = valor;
    if (restante <= 0) { otros.forEach((id) => { nuevos[id] = 0; }); return nuevos; }
    const sumaOtros = otros.reduce((s, id) => s + (pesos[id] || 0), 0);
    const partes = otros.map((id) => ({ id: id, exacto: sumaOtros > 0 ? (pesos[id] || 0) / sumaOtros * restante : restante / otros.length }));
    let asignado = 0;
    partes.forEach((p) => { p.base = Math.floor(p.exacto); p.resto = p.exacto - p.base; asignado += p.base; });
    let sobra = restante - asignado;
    partes.slice().sort((a, b) => b.resto - a.resto).forEach((p, i) => { nuevos[p.id] = p.base + (i < sobra ? 1 : 0); });
    return nuevos;
  }

  /* Fuente única de verdad de lo que se ve ahora mismo en el resultado (rosca, lista editable y
     cifras de riesgo). `aplicarCambioReparto` la lee siempre a través de `pesosVigentes()`, nunca de
     un valor capturado al construir la lista -- ver la nota de `pintarRepartoEditable`. */
  let pesosVista = null;
  function pesosVigentes() { return pesosVista || {}; }
  function aplicarCambioReparto(id, valor) {
    pesosEditados = reequilibrar(pesosVigentes(), id, valor);
    refrescarResultado(pesosEditados);
  }

  /* Repinta todo lo que depende solo de los pesos (rosca, lista editable y las cuatro cifras de riesgo
     histórico): se llama al mostrar el resultado y de nuevo cada vez que se edita un peso a mano. Lo que
     depende del cuestionario en sí —el nombre del perfil, el titular, las notas, el desglose— no se toca
     aquí: editar a mano no reclasifica el perfil, solo cambia el reparto y lo que de él se deriva. */
  function refrescarResultado(pesos) {
    pesosVista = pesos;
    pintarDonut($('donut2'), pesos);
    pintarRepartoEditable($('reparto2'), pesos, pesosVigentes, aplicarCambioReparto);
    const crecimiento = crecimientoDe(pesos);
    $('res-texto').textContent = `${crecimiento} % en clases de crecimiento (renta variable global, inmobiliario y materias primas) y ${100 - crecimiento} % en clases estables (renta fija y monetario).`;
    const rh = riesgoHistorico(pesos);
    $('kpi-anual').textContent = pct(rh.anual, 1);
    $('kpi-peor').textContent = pct(rh.peor.r, Math.abs(rh.peor.r) < 5 ? 1 : 0);
    $('kpi-peor-l').textContent = (rh.peor.r < 0 ? 'Peor año' : 'Año menos bueno') + ` de este reparto, en euros (${rh.peor.a})`;
    $('kpi-dd').textContent = pct(rh.dd.r, Math.abs(rh.dd.r) < 5 ? 1 : 0);
    $('kpi-dd-l').textContent = rh.dd.r < 0
      ? `Mayor caída desde un máximo, con cierres anuales (${an(rh.dd.de)} a ${an(rh.dd.a)})`
      : 'Sin caída entre cierres anuales en el periodo';
    $('kpi-riesgo').innerHTML = `${rh.escala}<small>de 7</small>`;
    $('riesgo-escala').innerHTML = [1, 2, 3, 4, 5, 6, 7].map((k) => `<i${k <= rh.escala ? ' class="on"' : ''}></i>`).join('');
    $('kpi-riesgo-l').textContent = `Escala de riesgo 1 a 7 por volatilidad histórica (${pct(rh.vol, 1)} anual), comparable con la de los fondos. Orientativa: no es el indicador de ningún producto`;
    return rh;
  }

  function pintarResultado() {
    const res = M.perfilar(respuestas);
    pesosEditados = null;
    const crecimientoBase = crecimientoDe(res.pesos);
    const clave = crecimientoBase === 0 ? 'plazoCorto' : res.perfil.clave;
    const tx = T.PERFILES[clave];
    const plazo = PLAZO[respuestas.horizonte];

    $('res-perfil').textContent = `Reparto ${res.perfil.nombre.toLowerCase()} · plazo ${plazo}`;
    $('res-titular').textContent = tx.titular;
    $('kpi-anual-l').textContent = 'Rentabilidad anual media de este reparto, del año 2000 a 2025, en euros y sin comisiones';
    refrescarResultado(res.pesos);
    const com = res.comisiones;

    /* Cuatro notas, siempre las mismas cuatro para que el bloque quede alineado: qué esperar, qué vigilar,
       qué ha limitado el reparto (plazo, límites duros, contradicción) y una advertencia. */
    const limites = [];
    if (res.limitadoPorPlazo) limites.push(`Con un plazo ${plazo}, el peso de crecimiento no pasa del ${res.techoPorPlazo} % por alta que sea la tolerancia a una caída: el dinero que se necesita pronto no tiene tiempo de recuperarse.`);
    res.limitesAplicados.forEach((g) => limites.push(g.motivo));
    if (res.contradiccion) limites.push(T.COMUNES.contradiccion);
    const notas = [
      ['Qué esperar', tx.queEsperar],
      ['Qué vigilar', tx.queVigilar],
      ['Qué ha limitado el reparto', limites.length ? limites.join(' ') : `Ninguna respuesta ha puesto techo al reparto: el peso de crecimiento es el que corresponde a la puntuación y al plazo ${plazo}.`],
      ['Una advertencia', 'Las caídas de arriba son cifras históricas, no un límite. El futuro puede ser peor.'],
    ];
    $('res-notas').innerHTML = notas.map(() => '<div class="nota"><b></b><span></span></div>').join('');
    $('res-notas').querySelectorAll('.nota').forEach((el, i) => { el.querySelector('b').textContent = notas[i][0]; el.querySelector('span').textContent = notas[i][1]; });

    /* Desglose: las dos puntuaciones, pregunta a pregunta */
    const fila = (d) => `<li><span>${ETIQUETA[d.pregunta] || d.pregunta}</span><b>${d.puntos}/${d.maximo}</b></li>`;
    $('res-desglose').innerHTML =
      `<p>${T.COMUNES.comoSeCalcula}</p>` +
      `<div class="it-desglose"><div><b>Capacidad ${res.capacidad}/100</b><ul>${res.desgloseCapacidad.map(fila).join('')}</ul></div>` +
      `<div><b>Tolerancia ${res.tolerancia}/100</b><ul>${res.desgloseTolerancia.map(fila).join('')}</ul></div></div>` +
      `<p>${T.COMUNES.porQueElMinimo} En este caso manda la ${res.manda}. Versión del motor ${res.version}.</p>` +
      `<p>La escala de riesgo sigue las bandas de volatilidad del indicador sintético de riesgo de los fondos (1: menos del 0,5 % anual; 2: hasta el 2 %; 3: hasta el 5 %; 4: hasta el 10 %; 5: hasta el 15 %; 6: hasta el 25 %; 7: más), calculada con las rentabilidades anuales de este reparto entre el año 2000 y 2025, en euros. Es orientativa: no es el indicador de ningún producto. La diferencia entre una comisión del 2 % anual y otra del 0,20 % sobre ${eur(com.importe)} es de ${eur(com.primerAno)} el primer año.</p>`;

    /* Prompt para los asistentes de IA, con este reparto y sus cifras (intelligence.js rellena los enlaces).
       Se calcula al vuelo, no al pintar el resultado: si se ha editado un peso a mano, el prompt tiene que
       decir el reparto que se ve en pantalla en ese momento, no el que salió del cuestionario. */
    const promptResultado = () => {
      const pesos = pesosEditados || res.pesos;
      const rh = riesgoHistorico(pesos);
      const lineas = ORDEN.map((id) => `- ${NOMBRE[MAPA[id]]}: ${pesos[id] || 0} %`).join('\n');
      return `He usado la herramienta de reparto de cartera de CT Intelligence (https://www.ctadvisory.es/intelligence/herramienta/), material educativo de CT Advisory. Con diez preguntas sobre plazo, situación y tolerancia al riesgo devuelve un reparto orientativo por clase de activo, sin nombrar productos ni entidades.\n\nMi resultado: reparto ${res.perfil.nombre.toLowerCase()}, plazo ${plazo}.\n${lineas}\nSegún las series históricas del año 2000 a 2025 en euros, este reparto rindió un ${pct(rh.anual, 1)} anual de media, ${rh.peor.r < 0 ? `su peor año fue ${rh.peor.a}, con ${pct(rh.peor.r, 1)},` : 'no tuvo ningún año en pérdidas'} y la mayor caída entre dos cierres anuales fue ${pct(rh.dd.r, 1)}. En la escala de riesgo 1 a 7 de los fondos, por volatilidad histórica, queda en ${rh.escala}. La diferencia entre una comisión del 2 % anual y otra del 0,20 % sobre ${eur(com.importe)} es de ${eur(com.primerAno)} el primer año.\nCómo se calcula: dos puntuaciones de 0 a 100, situación ${res.capacidad} y tolerancia al riesgo ${res.tolerancia}; se toma la más baja.\n\nExplica con claridad, en español y para alguien sin formación financiera, qué significa este reparto, y después pregúntame qué duda tengo.`;
    };
    (window.CT_IA_COLA = window.CT_IA_COLA || []).push(['resultado', promptResultado]);

    $('resultado').hidden = false;
    return res;
  }

  /* ── Guardar en este navegador y empezar de nuevo ─────────────────────── */
  function guardar() {
    try {
      localStorage.setItem(CLAVE_GUARDADO, JSON.stringify({ respuestas: respuestas, version: M.VERSION, fecha: new Date().toISOString() }));
      $('btn-guardar').querySelector('span').textContent = 'Guardado en este navegador';
    } catch (e) { $('btn-guardar').querySelector('span').textContent = 'No se ha podido guardar en este navegador'; }
  }
  /* Solo se recupera un guardado de esta misma versión del motor: con otra, las respuestas podrían no
     significar lo mismo. */
  function recuperar() {
    try {
      const g = JSON.parse(localStorage.getItem(CLAVE_GUARDADO) || 'null');
      if (g && g.respuestas && g.version === M.VERSION && M.validar(g.respuestas).ok) return g;
      if (g) localStorage.removeItem(CLAVE_GUARDADO);
    } catch (e) { /* sin guardado o navegador sin almacenamiento */ }
    return null;
  }
  function reiniciar() {
    respuestas = {}; paso = 0; pesosEditados = null;
    try { localStorage.removeItem(CLAVE_GUARDADO); } catch (e) { /* nada */ }
    $('resultado').hidden = true;
    $('btn-guardar').querySelector('span').textContent = 'Guardar en este navegador';
    pintarPregunta(); pintarProvisional();
    raiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('btn-ant').addEventListener('click', () => { if (paso > 0) { paso--; pintarPregunta(); } });
  $('btn-sig').addEventListener('click', () => {
    const p = M.PREGUNTAS[paso]; if (!respuestas[p.id]) return;
    if (paso < N - 1) { paso++; pintarPregunta(); return; }
    pintarResultado();
    $('resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('btn-guardar').addEventListener('click', guardar);
  $('btn-reiniciar').addEventListener('click', reiniciar);

  /* Con un reparto guardado: el cuestionario arranca en la primera pregunta con las respuestas marcadas, para
     poder revisarlas, y el resultado ya está pintado debajo. */
  const guardado = recuperar();
  if (guardado) {
    respuestas = guardado.respuestas; paso = 0;
    pintarPregunta(); pintarProvisional(); pintarResultado();
    $('btn-guardar').querySelector('span').textContent = 'Guardado en este navegador';
  } else { pintarPregunta(); pintarProvisional(); }
})();
