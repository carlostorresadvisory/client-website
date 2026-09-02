/* intel-clases.js: la gráfica de 100.000 € desde 2000, la tabla del periodo y las cifras de las fichas de la
   lección «Seis clases de activo». Solo carga en esa página. Fuente: medianoche/intel/clases-de-activo.js.

   Datos reales: Damodaran (rv, inm, oro, rf), BCE (Euribor 3M mensual, capitalizado por año; tipos de cambio),
   Bloomberg (BCOMTR anual), Eurostat (HICP). Series en dólares: capital en USD al tipo de cierre de 1999, retorno
   anual, conversión al tipo de cierre de cada año. Series con eur:true no se convierten. */
(function(){
const svg=document.getElementById('graf');if(!svg||!window.CT_SERIES)return;
/* Los datos viven en intel-series.js (compartidos con la herramienta). */
const {CLASES,TC0,TC,INFL}=window.CT_SERIES;
const AÑOS=Object.keys(INFL).map(Number);
const CAPITAL=100000; /* Carlos, 2-sep-2026: 100.000 € de partida, que vale para el grande añadiendo un cero y para el pequeño quitándolo */
const eur=n=>Math.round(n).toLocaleString('es-ES')+' €';
const eurK=n=>n>=1e6?(n/1e6).toFixed(2).replace('.',',')+' M€':Math.round(n/1000).toLocaleString('es-ES')+' mil €';
const pct=(n,d=1)=>(n<0?'−':'')+Math.abs(n).toFixed(d).replace('.',',')+'%';
/* Comisión anual descontada (Carlos, 2-sep-2026, 18:10: «para que se viera la diferencia monetaria»): cada año el valor
   se multiplica por (1 − comisión). Las series brutas fijan la escala del eje y las cifras de las fichas. */
let comision=0;
function serieEUR(s,eur,c){let v=eur?CAPITAL:CAPITAL*TC0;const p=[CAPITAL];AÑOS.forEach(a=>{v*=(1+s[a]/100)*(1-c/100);p.push(eur?v:v/TC[a])});return p}
function serieInfl(){let v=CAPITAL;const p=[CAPITAL];AÑOS.forEach(a=>{v*=1+INFL[a]/100;p.push(v)});return p}
const construir=c=>CLASES.map(k=>({...k,p:serieEUR(k.s,k.eur,c)}));
const brutas=construir(0);let series=brutas;const infl=serieInfl();
/* Gráfica. Dos geometrías: escritorio (nombre y valor al final de cada línea) y compacta por debajo de 700 px
   (más alta, solo el valor abreviado al final, letra mayor). Se elige por ancho real y se vuelve a pintar al girar. */
const ult=AÑOS.length;
let W,H,PL,PR,PT,PB,PW,PH,topV,x,y;
const maxV=Math.max(...brutas.flatMap(s=>s.p),...infl);
const pasos=[50000,100000,200000,250000,500000];const paso=pasos[pasos.findIndex(p=>maxV/p<=5)]||500000;
function geometria(compacta){
  if(compacta){W=560;H=560;PL=8;PR=96;PT=24;PB=40}else{W=1120;H=470;PL=84;PR=250;PT=22;PB=38}
  PW=W-PL-PR;PH=H-PT-PB;topV=Math.ceil(maxV/paso)*paso;x=i=>PL+PW*i/ult;y=v=>PT+PH*(1-v/topV)}
function dibujar(){
  const compacta=svg.getBoundingClientRect().width<700;geometria(compacta);let g='';
  for(let v=0;v<=topV;v+=paso){g+=`<line class="grid" x1="${PL}" x2="${W-PR}" y1="${y(v)}" y2="${y(v)}"/>`;
    g+=compacta?(v?`<text class="eje" x="${PL+4}" y="${y(v)-5}">${eurK(v)}</text>`:''):`<text class="eje" x="${PL-12}" y="${y(v)+4}" text-anchor="end">${v.toLocaleString('es-ES')} €</text>`}
  (compacta?[2000,2010,2020,2025]:[2000,2005,2010,2015,2020,2025]).forEach(a=>{const i=a-2000;g+=`<text class="eje" x="${x(i)}" y="${H-12}" text-anchor="${a===2000&&compacta?'start':'middle'}">${a}</text>`});
  const path=p=>p.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)).join(' ');
  const area=p=>path(p)+` L${x(p.length-1).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;
  series.forEach(s=>{g+=`<path class="area" data-id="${s.id}" style="fill:${s.c}" d="${area(s.p)}"/>`});
  g+=`<path class="infl" d="${path(infl)}"/>`;
  series.forEach(s=>{g+=`<path class="linea" data-id="${s.id}" style="stroke:${s.c}" d="${path(s.p)}"/>`});
  /* Etiquetas al final de cada línea, sin pisarse: ordenadas por altura y separadas al menos `sep` px */
  const sep=compacta?26:20;
  const etqs=[...series.map(s=>({id:s.id,n:s.nombre,c:s.c,v:s.p[ult],y:y(s.p[ult])})),{id:'infl',n:'Inflación',c:'var(--ink-2)',v:infl[ult],y:y(infl[ult]),infl:true}].sort((a,b)=>a.y-b.y);
  for(let i=1;i<etqs.length;i++){if(etqs[i].y-etqs[i-1].y<sep)etqs[i].y=etqs[i-1].y+sep}
  for(let i=etqs.length-1;i>0;i--){if(etqs[i].y>H-PB-6)etqs[i].y=H-PB-6;if(etqs[i].y-etqs[i-1].y<sep)etqs[i-1].y=etqs[i].y-sep}
  etqs.forEach(e=>{const yy=y(e.v);const txt=compacta?`<tspan class="etq-v">${eurK(e.v)}</tspan>`:`<tspan class="etq-n">${e.n}</tspan><tspan class="etq-v" dx="8">${eur(e.v)}</tspan>`;
    g+=`<g class="etq-g${e.infl?' infl-g':''}" data-id="${e.id}"><line class="guia" x1="${x(ult)}" x2="${W-PR+8}" y1="${yy}" y2="${e.y}"/>${e.infl?'':`<circle cx="${x(ult)}" cy="${yy}" r="4" style="fill:${e.c}"/>`}<text class="etq" x="${W-PR+12}" y="${e.y+5}">${txt}</text></g>`});
  g+=`<g class="crux" hidden><line class="crux-l" y1="${PT}" y2="${H-PB}"/></g>`;
  g+=`<rect class="capta" x="${PL}" y="${PT}" width="${PW}" height="${PH}" fill="transparent"/>`;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML=g;svg.dataset.compacta=String(compacta);enganchar();pintar()}

/* Chips y destacado */
const chips=document.getElementById('chips');
const ICONOS=window.CT_ICONOS||{};
chips.innerHTML=series.map(s=>`<li><button type="button" class="chip" data-id="${s.id}" style="--c:${s.c}" aria-pressed="false"><span class="chip-ico" style="color:${s.c}">${ICONOS[s.id]||'<i></i>'}</span>${s.nombre}</button></li>`).join('')+`<li><span class="chip infl"><i></i>Inflación zona euro</span></li>`;
let act=null;
function pintar(){chips.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.id===act)));
  svg.querySelectorAll('.linea,.etq-g').forEach(el=>el.classList.toggle('tenue',!!act&&el.dataset.id!==act&&el.dataset.id!=='infl'));
  svg.querySelectorAll('.area').forEach(el=>el.classList.toggle('on',el.dataset.id===act))}
chips.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;act=act===b.dataset.id?null:b.dataset.id;pintar();pintarNota()});
/* Guía vertical: el valor de cada clase en el año señalado. Se engancha tras cada pintado porque el SVG se regenera. */
const tip=document.getElementById('tip');
function enganchar(){const crux=svg.querySelector('.crux'),cruxL=svg.querySelector('.crux-l'),capta=svg.querySelector('.capta');
  function señalar(ev){const r=svg.getBoundingClientRect();const px=((ev.touches?ev.touches[0].clientX:ev.clientX)-r.left)*W/r.width;
    const i=Math.max(0,Math.min(ult,Math.round((px-PL)/PW*ult)));const xx=x(i);crux.hidden=false;cruxL.setAttribute('x1',xx);cruxL.setAttribute('x2',xx);
    const filas=[...series.map(s=>({n:s.nombre,c:s.c,v:s.p[i]})),{n:'Inflación',c:'var(--ink-2)',v:infl[i],infl:true}].sort((a,b)=>b.v-a.v);
    tip.innerHTML=`<b>${i?1999+i:'Inicio de 2000'}</b>`+filas.map(f=>`<span><i style="--c:${f.c}${f.infl?';border-top:2px dotted var(--ink-2);background:none;border-radius:0;height:0':''}"></i>${f.n}<em>${eur(f.v)}</em></span>`).join('');
    tip.hidden=false;const left=xx/W*r.width;tip.style.left=Math.min(Math.max(left+14,0),r.width-tip.offsetWidth-8)+'px';tip.style.top=(PT/H*r.height+8)+'px'}
  capta.addEventListener('mousemove',señalar);capta.addEventListener('touchstart',señalar,{passive:true});capta.addEventListener('touchmove',señalar,{passive:true});
  capta.addEventListener('mouseleave',()=>{crux.hidden=true;tip.hidden=true})}
dibujar();
let t;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(()=>{if((svg.getBoundingClientRect().width<700)!==(svg.dataset.compacta==='true'))dibujar()},150)});
/* Cifras de una serie: valor final, anual compuesto, peor año y mayor caída entre cierres anuales (índice 0 = inicio de 2000) */
const an=i=>i?1999+i:2000;
const p1=n=>pct(n,Math.abs(n)<5?1:0);
function cifras(s){const fin=s.p[s.p.length-1];const anual=(Math.pow(fin/CAPITAL,1/AÑOS.length)-1)*100;
  let peor={a:null,r:0};AÑOS.forEach((a,i)=>{const r=(s.p[i+1]/s.p[i]-1)*100;if(r<peor.r)peor={a,r}});
  let pk=s.p[0],pi=0,dd={r:0,de:0,a:0};s.p.forEach((v,i)=>{if(v>pk){pk=v;pi=i}const d=(v/pk-1)*100;if(d<dd.r)dd={r:d,de:pi,a:i}});
  return {fin,anual,peor,dd}}
/* Tabla del periodo: sigue la comisión elegida */
const tb=document.querySelector('#ranking tbody');
function pintarTabla(){tb.innerHTML='';
  [...series].sort((a,b)=>b.p[b.p.length-1]-a.p[a.p.length-1]).forEach(s=>{const c=cifras(s);
    tb.insertAdjacentHTML('beforeend',`<tr><td><span class="sw-ico" style="color:${s.c}">${ICONOS[s.id]||''}</span>${s.nombre}</td><td class="n" data-l="Vale hoy">${eur(c.fin)}</td><td class="n" data-l="Anual">${pct(c.anual)}</td><td class="n" data-l="Peor año">${c.peor.a}</td><td class="n neg" data-l="Caída ese año">${p1(c.peor.r)}</td></tr>`)});
  tb.insertAdjacentHTML('beforeend',`<tr><td><i class="sw" style="--c:transparent;border-top:2px dotted var(--ink-2);border-radius:0;height:0"></i>Inflación</td><td class="n" data-l="Vale hoy">${eur(infl[infl.length-1])}</td><td class="n" data-l="Anual">${pct((Math.pow(infl[infl.length-1]/CAPITAL,1/AÑOS.length)-1)*100)}</td><td class="n" data-l="Peor año">—</td><td class="n neg" data-l="Caída ese año">—</td></tr>`);
  const cad=document.getElementById('tabla-cad');if(cad)cad.textContent=comision?`en una tabla, con una comisión del ${fee()} anual`:'en una tabla'}
pintarTabla();
/* Cifras de las fichas (data-cifra): siempre sin comisión, son las de la clase, no las de un producto */
brutas.forEach(s=>{const c=cifras(s);const set=(k,v)=>{const el=document.querySelector(`[data-cifra="${s.id}-${k}"]`);if(el)el.textContent=v};
  set('anual',pct(c.anual));set('peor',p1(c.peor.r));set('anio',String(c.peor.a));set('dd',p1(c.dd.r));set('dd-anios',an(c.dd.de)+' a '+an(c.dd.a))});
/* Botón de comisión: vuelve a construir las series netas, repinta gráfica y tabla y explica la diferencia en euros */
const seg=document.getElementById('comision'),nota=document.getElementById('comision-nota');
function pintarNota(){if(!nota)return;if(!comision){nota.hidden=true;return}
  const id=act||'rv';const b=brutas.find(s=>s.id===id),n=series.find(s=>s.id===id);const vb=b.p[ult],vn=n.p[ult];
  const SUJ={rv:'la renta variable global termina',inm:'el inmobiliario termina',rf:'la renta fija termina',mon:'el monetario termina',mat:'las materias primas terminan'};
  nota.innerHTML=`Con una comisión del <b>${fee()} anual</b>, ${SUJ[id]||n.nombre+' termina'} en <b>${eur(vn)}</b> en vez de ${eur(vb)}: la comisión se lleva <b>${eur(vb-vn)}</b> en veintiséis años.`;nota.hidden=false}
const fee=()=>comision%1?'0,2 %':comision+' %';
if(seg)seg.addEventListener('click',e=>{const b=e.target.closest('.seg-b');if(!b)return;comision=parseFloat(b.dataset.c);
  seg.querySelectorAll('.seg-b').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));series=construir(comision);dibujar();pintarTabla();pintarNota();
  (window.CT_IA_COLA=window.CT_IA_COLA||[]).push(['grafica',promptGrafica])});
/* Prompts para los asistentes de IA (intelligence.js rellena los enlaces) */
const FUENTE={rv:'S&P 500 con dividendos',inm:'REITs de EE.UU.',rf:'bono del Tesoro de EE.UU. a 10 años',mon:'Euribor a 3 meses, capitalizado',mat:'Bloomberg Commodity Index Total Return, incluye el oro'};
function promptGrafica(){const lineas=brutas.map(s=>{const c=cifras(s);return `- ${s.nombre} (${FUENTE[s.id]||''}): ${eur(c.fin)} · ${pct(c.anual)} anual · peor año ${c.peor.a}, ${p1(c.peor.r)} · mayor caída ${p1(c.dd.r)} (${an(c.dd.de)} a ${an(c.dd.a)})`});
  return `Estoy leyendo la guía «Cinco clases de activo» de CT Intelligence (https://www.ctadvisory.es/intelligence/clases-de-activo/), material educativo de CT Advisory. Muestra qué habrían hecho 100.000 € invertidos a comienzos del año 2000 en cinco clases de activo, en euros y hasta finales de 2025, comparados con la inflación de la zona euro. Los valores en dólares se convierten a euros con el tipo de cambio de cierre de cada año.\n\nDatos de la página (valor a finales de 2025 · rentabilidad anual media compuesta · peor año y su caída · mayor caída entre cierres anuales):\n${lineas.join('\n')}\n- Inflación de la zona euro: a finales de 2025 se necesitaban ${eur(infl[ult])} para comprar lo que se compraba con 100.000 € en el año 2000.${comision?`\nLa gráfica está descontando una comisión anual del ${fee()} en todas las clases.`:''}\nFuentes: Aswath Damodaran (NYU Stern), Banco Central Europeo, Bloomberg, Eurostat.\n\nExplica con claridad, en español y para alguien sin formación financiera. Empieza resumiendo en tres frases lo que muestra la página y después pregúntame qué duda tengo.`}
function promptFichas(){const f=[...document.querySelectorAll('.it-ficha')].map(a=>{const t=a.querySelector('.ci-t').textContent.trim(),d=a.querySelector('.it-def').textContent,e=[...a.querySelectorAll('.it-detalle dd')].map(x=>x.textContent).join(' ');return `- ${t}: ${d}${e?' '+e:''}`});
  return `Estoy leyendo la guía «Cinco clases de activo» de CT Intelligence (https://www.ctadvisory.es/intelligence/clases-de-activo/), material educativo de CT Advisory. La página describe así cada clase de activo:\n${f.join('\n')}\n\nExplica con claridad, en español y para alguien sin formación financiera. Pregúntame primero sobre qué clase o qué concepto tengo la duda.`}
(window.CT_IA_COLA=window.CT_IA_COLA||[]).push(['grafica',promptGrafica]);
(window.CT_IA_COLA=window.CT_IA_COLA||[]).push(['fichas',promptFichas]);
})();
