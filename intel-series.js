/* intel-series.js: las series anuales que comparten la lección «Seis clases de activo» y la herramienta de reparto.
   Fuente: medianoche/intel/series.js. Un solo sitio para los datos: si cambia una cifra, cambia en las dos páginas.

   Datos reales: Damodaran (rv, inm, rf: S&P 500 con dividendos, REITs de EE.UU., bono del Tesoro a 10 años),
   BCE (Euribor 3 meses, media mensual de cierres capitalizada mes a mes, ya en euros; tipos de cambio EUR/USD de cierre),
   Bloomberg (Bloomberg Commodity Index Total Return, que incluye el oro, rentabilidad de cada año natural), Eurostat (HICP media anual).
   El oro no va como clase aparte (Carlos, 2-sep-2026): forma parte del índice de materias primas.
   Las series en dólares se convierten a euros con el tipo de cierre de cada año (TC0 = cierre de 1999). */
(function (raiz) {
  var CLASES = [
    { id: 'rv', nombre: 'Renta variable global', c: 'var(--c-rv)', s: { 2000: -9.03, 2001: -11.85, 2002: -21.97, 2003: 28.36, 2004: 10.74, 2005: 4.83, 2006: 15.61, 2007: 5.48, 2008: -36.55, 2009: 25.94, 2010: 14.82, 2011: 2.10, 2012: 15.89, 2013: 32.15, 2014: 13.52, 2015: 1.38, 2016: 11.77, 2017: 21.61, 2018: -4.23, 2019: 31.21, 2020: 18.02, 2021: 28.47, 2022: -18.04, 2023: 26.06, 2024: 24.88, 2025: 17.78 } },
    { id: 'inm', nombre: 'Inmobiliario', c: 'var(--c-inm)', s: { 2000: 9.29, 2001: 6.68, 2002: 9.56, 2003: 9.81, 2004: 13.64, 2005: 13.51, 2006: 1.73, 2007: -5.40, 2008: -12.00, 2009: -3.85, 2010: -4.12, 2011: -3.89, 2012: 6.44, 2013: 10.72, 2014: 4.50, 2015: 5.19, 2016: 5.31, 2017: 6.21, 2018: 4.52, 2019: 3.69, 2020: 10.43, 2021: 18.86, 2022: 5.65, 2023: 5.68, 2024: 3.96, 2025: 1.58 } },
    { id: 'rf', nombre: 'Renta fija', c: 'var(--c-rf)', s: { 2000: 16.66, 2001: 5.57, 2002: 15.12, 2003: 0.38, 2004: 4.49, 2005: 2.87, 2006: 1.96, 2007: 10.21, 2008: 20.10, 2009: -11.12, 2010: 8.46, 2011: 16.04, 2012: 2.97, 2013: -9.10, 2014: 10.75, 2015: 1.28, 2016: 0.69, 2017: 2.80, 2018: -0.02, 2019: 9.64, 2020: 11.33, 2021: -4.42, 2022: -17.83, 2023: 3.88, 2024: -1.64, 2025: 7.80 } },
    { id: 'mon', nombre: 'Monetario', c: 'var(--c-mon)', eur: true, s: { 2000: 4.48, 2001: 4.35, 2002: 3.37, 2003: 2.36, 2004: 2.13, 2005: 2.21, 2006: 3.12, 2007: 4.36, 2008: 4.73, 2009: 1.24, 2010: 0.81, 2011: 1.40, 2012: 0.57, 2013: 0.22, 2014: 0.21, 2015: -0.02, 2016: -0.26, 2017: -0.33, 2018: -0.32, 2019: -0.36, 2020: -0.42, 2021: -0.55, 2022: 0.34, 2023: 3.49, 2024: 3.63, 2025: 2.20 } },
    { id: 'mat', nombre: 'Materias primas', c: 'var(--c-mat)', s: { 2000: 31.8, 2001: -19.5, 2002: 25.9, 2003: 23.9, 2004: 9.1, 2005: 21.4, 2006: 2.1, 2007: 16.2, 2008: -35.6, 2009: 18.9, 2010: 16.8, 2011: -13.3, 2012: -1.1, 2013: -9.5, 2014: -17.0, 2015: -24.7, 2016: 11.8, 2017: 1.7, 2018: -11.2, 2019: 7.7, 2020: -3.12, 2021: 27.11, 2022: 16.1, 2023: -7.91, 2024: 5.38, 2025: 15.77 } },
  ];
  var TC0 = 1.0046;
  var TC = { 2000: 0.9305, 2001: 0.8813, 2002: 1.0487, 2003: 1.2630, 2004: 1.3621, 2005: 1.1797, 2006: 1.3170, 2007: 1.4721, 2008: 1.3917, 2009: 1.4406, 2010: 1.3362, 2011: 1.2939, 2012: 1.3194, 2013: 1.3791, 2014: 1.2141, 2015: 1.0887, 2016: 1.0541, 2017: 1.1993, 2018: 1.1450, 2019: 1.1234, 2020: 1.2271, 2021: 1.1326, 2022: 1.0666, 2023: 1.1050, 2024: 1.0389, 2025: 1.1750 };
  var INFL = { 2000: 2.2, 2001: 2.2, 2002: 2.3, 2003: 2.1, 2004: 2.2, 2005: 2.2, 2006: 2.2, 2007: 2.2, 2008: 3.4, 2009: 0.3, 2010: 1.6, 2011: 2.7, 2012: 2.5, 2013: 1.4, 2014: 0.4, 2015: 0.2, 2016: 0.2, 2017: 1.5, 2018: 1.8, 2019: 1.2, 2020: 0.3, 2021: 2.6, 2022: 8.4, 2023: 5.4, 2024: 2.4, 2025: 2.1 };
  var ANOS = Object.keys(INFL).map(Number);

  /* Valor de `capital` invertido a comienzos de 2000, año a año, en euros. Las series en dólares empiezan
     convirtiendo el capital al tipo de cierre de 1999 y vuelven a euros al tipo de cierre de cada año. */
  function serieEUR(s, eur, capital) {
    var v = eur ? capital : capital * TC0; var p = [capital];
    ANOS.forEach(function (a) { v *= 1 + s[a] / 100; p.push(eur ? v : v / TC[a]); });
    return p;
  }
  /* Rentabilidad anual en euros de cada clase, por año (lo que necesita un reparto con reequilibrio anual). */
  function retornosEUR(capital) {
    var r = {};
    CLASES.forEach(function (c) { var p = serieEUR(c.s, c.eur, capital); r[c.id] = ANOS.map(function (a, i) { return p[i + 1] / p[i] - 1; }); });
    return r;
  }
  function serieInflacion(capital) {
    var v = capital; var p = [capital];
    ANOS.forEach(function (a) { v *= 1 + INFL[a] / 100; p.push(v); });
    return p;
  }
  raiz.CT_SERIES = { CLASES: CLASES, TC0: TC0, TC: TC, INFL: INFL, ANOS: ANOS, serieEUR: serieEUR, retornosEUR: retornosEUR, serieInflacion: serieInflacion };
}(typeof globalThis !== 'undefined' ? globalThis : this));
