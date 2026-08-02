/* =====================================================================
   CT Advisory · analytics.js
   ---------------------------------------------------------------------
   Analítica de audiencia sin cookies y sin identificar a nadie.
   Este es el ÚNICO fichero que hay que tocar para activarla o apagarla.

   CÓMO ACTIVARLA (5 minutos, gratis):
     1. Entre en dash.cloudflare.com y cree una cuenta gratuita.
     2. Menú lateral: «Analytics & Logs» → «Web Analytics» → «Add a site».
     3. Escriba  www.ctadvisory.es  y confirme.
     4. Le dará un fragmento con  "token": "xxxxxxxx...".
        Copie SOLO ese token y péguelo abajo, entre las comillas.
     5. Suba este fichero. En 24-48 h empezará a ver visitas por página.

   Mientras el token siga con el valor de fábrica, este script no hace
   absolutamente nada: no carga scripts externos ni envía una sola
   petición. La web funciona igual.

   POR QUÉ CLOUDFLARE Y NO GOOGLE ANALYTICS:
     · No usa cookies, así que no obliga a poner banner de consentimiento.
     · No construye perfiles ni sigue al usuario entre sitios.
     · Es gratis y sin límite de visitas.
     · Un banner de cookies en una web cuyo argumento es el rigor cuesta
       más en conversión de lo que aporta el dato.

   IMPORTANTE: al activarlo, Cloudflare pasa a ser encargado del
   tratamiento. Ya está declarado en privacidad.html (apartados 2 y 3).
   Si decide NO activarlo, conviene quitar esa mención.
   ===================================================================== */

(function () {
  "use strict";

  var TOKEN = "PEGUE_AQUI_SU_TOKEN";

  // Sin token configurado, no se carga nada.
  if (!TOKEN || TOKEN.indexOf("PEGUE_AQUI") === 0) return;

  // Respeta la preferencia «no rastrear» del navegador.
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  var s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token: TOKEN }));
  document.head.appendChild(s);
})();
