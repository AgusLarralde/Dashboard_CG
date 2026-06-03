const MONTHS=['Ene','Feb','Mar','Abr','May'];
const COL_POS='#27500A', COL_NEG='#A32D2D';
const BG_POS='#C0DD97', BG_NEG='#F7C1C1';

// Aclaramos las variables vacías. Se van a rellenar automáticamente con la info del Sheets
let D = {};
let UNITS = {};
let charts = {};

// ACA VA TU LINK DE GOOGLE APPS SCRIPT:
const API_URL = "https://script.google.com/macros/s/TU_CODIGO_AQUI/exec";

// Funciones de formato y badges
function fmt(v){return Math.round(v).toLocaleString('es-AR')}
function fmtp(v){return v.toFixed(1)+'%'}

function badgeVenta(r,p,higher){
  const g=r-p,good=higher?g>0:g<0;
  const col=good?COL_POS:COL_NEG,bg=good?BG_POS:BG_NEG;
  const pct=p!==0?((g/Math.abs(p))*100):0;
  return `<span class="badge" style="color:${col};background:${bg}">${g>0?'+':''}${fmt(g)}&nbsp;&nbsp;${g>0?'+':''}${pct.toFixed(1)}%</span>`;
}
function badge(r,p,higher){
  const g=r-p,good=higher?g>0:g<0;
  const col=good?COL_POS:COL_NEG,bg=good?BG_POS:BG_NEG;
  return `<span class="badge" style="color:${col};background:${bg}">${g>0?'+':''}${fmt(g)}</span>`;
}
function badgePct(r,p,higher){
  const g=r-p,good=higher?g>0:g<0;
  const col=good?COL_POS:COL_NEG,bg=good?BG_POS:BG_NEG;
  return `<span class="badge" style="color:${col};background:${bg}">${g>0?'+':''}${fmtp(g)}</span>`;
}

window.toggleGroup = function(id) {
  const el = document.getElementById(id);
  const btn = document.getElementById('btn-' + id);
  const collapsed = el.classList.toggle('collapsed');
  btn.textContent = collapsed ? '▼ Mostrar' : '▲ Ocultar';
}

function buildKPIs(ytdEl,abrEl,v){
  const d=D[v];
  const defs=[
    {lbl:'Venta P&L',sm:false,
     ytdV:'$'+fmt(d.ytd.venta_r)+'M',ytdB:badgeVenta(d.ytd.venta_r,d.ytd.venta_p,true),ytdP:'Ppto $'+fmt(d.ytd.venta_p)+'M',
     abrV:'$'+fmt(d.abr.venta_r)+'M',abrB:badgeVenta(d.abr.venta_r,d.abr.venta_p,true),abrP:'Ppto $'+fmt(d.abr.venta_p)+'M'},
    {lbl:'Margen Bruto F',sm:true,
     ytdV:fmtp(d.ytd.mbf_pct_r),ytdB:badgePct(d.ytd.mbf_pct_r,d.ytd.mbf_pct_p,true),ytdP:'Ppto '+fmtp(d.ytd.mbf_pct_p),
     abrV:fmtp(d.abr.mbf_pct_r),abrB:badgePct(d.abr.mbf_pct_r,d.abr.mbf_pct_p,true),abrP:'Ppto '+fmtp(d.abr.mbf_pct_p)},
    {lbl:'Gastos % vta',sm:false,
     ytdV:fmtp(d.ytd.gastos_pct_r),ytdB:badgePct(d.ytd.gastos_pct_r,d.ytd.gastos_pct_p,false),ytdP:'Ppto '+fmtp(d.ytd.gastos_pct_p),
     abrV:fmtp(d.abr.gastos_pct_r),abrB:badgePct(d.abr.gastos_pct_r,d.abr.gastos_pct_p,false),abrP:'Ppto '+fmtp(d.abr.gastos_pct_p)},
    {lbl:'EBITDA $',sm:false,
     ytdV:'$'+fmt(d.ytd.ebitda_r)+'M',ytdB:badge(d.ytd.ebitda_r,d.ytd.ebitda_p,true),ytdP:'Ppto $'+fmt(d.ytd.ebitda_p)+'M',
     abrV:'$'+fmt(d.abr.ebitda_r)+'M',abrB:badge(d.abr.ebitda_r,d.abr.ebitda_p,true),abrP:'Ppto $'+fmt(d.abr.ebitda_p)+'M'},
    {lbl:'EBITDA %',sm:false,
     ytdV:fmtp(d.ytd.ebitda_pct_r),ytdB:badgePct(d.ytd.ebitda_pct_r,d.ytd.ebitda_pct_p,true),ytdP:'Ppto '+fmtp(d.ytd.ebitda_pct_p),
     abrV:fmtp(d.abr.ebitda_pct_r),abrB:badgePct(d.abr.ebitda_pct_r,d.abr.ebitda_pct_p,true),abrP:'Ppto '+fmtp(d.abr.ebitda_pct_p)},
    {lbl:'Net Profit %',sm:false,
     ytdV:fmtp(d.ytd.np_pct_r),ytdB:badgePct(d.ytd.np_pct_r,d.ytd.np_pct_p,true),ytdP:'Ppto '+fmtp(d.ytd.np_pct_p),
     abrV:fmtp(d.abr.np_pct_r),abrB:badgePct(d.abr.np_pct_r,d.abr.np_pct_p,true),abrP:'Ppto '+fmtp(d.abr.np_pct_p)},
  ];
  document.getElementById(ytdEl).innerHTML=defs.map(k=>`<div class="kpi"><div class="kpi-lbl${k.sm?' sm':''}">${k.lbl}</div><div class="kpi-val">${k.ytdV}</div><div class="kpi-sub">${k.ytdB} vs Ppto</div><div class="kpi-ppto">${k.ytdP}</div></div>`).join('');
  document.getElementById(abrEl).innerHTML=defs.map(k=>`<div class="kpi"><div class="kpi-lbl${k.sm?' sm':''}">${k.lbl}</div><div class="kpi-val">${k.abrV}</div><div class="kpi-sub">${k.abrB} vs Ppto</div><div class="kpi-ppto">${k.abrP}</div></div>`).join('');
}

function buildShareRow(elId,realVals){
  const total=realVals.reduce((a,b)=>a+(b>0?b:0),0);
  const absTotal=realVals.reduce((a,b)=>a+Math.abs(b),0);
  const cells=realVals.map((v,i)=>{
    const share=total>0?(v/total*100):(absTotal>0?(Math.abs(v)/absTotal*100):0);
    return `<div class="unit-share-cell" style="color:${UNITS.colors[i]}">${share.toFixed(1)}%</div>`;
  }).join('');
  document.getElementById(elId).innerHTML=`<span class="unit-share-lbl">% part.</span><div class="unit-share-cells">${cells}</div>`;
}

function buildBarChart(id,labels,realD,pptoD,colors){
  // Validación de seguridad para evitar que el gráfico rompa el código si faltan datos
  if (!realD || !pptoD || realD.length === 0) {
    console.warn("Faltan datos para el gráfico:", id);
    return; 
  }

  if(charts[id])charts[id].destroy();
  charts[id]=new Chart(document.getElementById(id),{type:'bar',
    data:{labels,datasets:[
      {label:'Real',data:realD,backgroundColor:colors.map(c=>c+'cc'),borderRadius:4,borderSkipped:false},
      {label:'Ppto',data:pptoD,backgroundColor:colors.map(c=>c+'44'),borderRadius:4,borderSkipped:false}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>' $'+Math.round(ctx.raw).toLocaleString('es-AR')+'M'}}},
      scales:{
        x:{ticks:{font:{size:10},color:'#888780'},grid:{display:false}},
        y:{ticks:{font:{size:9},color:'#888780',callback:v=>'$'+Math.round(v)+'M'},grid:{color:'rgba(136,135,128,0.12)'}}
      }
    }
  });
}

const baseOpts={responsive:true,maintainAspectRatio:false,
  plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>' $'+Math.round(ctx.raw).toLocaleString('es-AR')+'M'}}},
  scales:{
    x:{ticks:{font:{size:10},color:'#888780',autoSkip:false},grid:{display:false}},
    y:{ticks:{font:{size:9},color:'#888780',callback:v=>'$'+Math.round(v/1000)+'k'},grid:{color:'rgba(136,135,128,0.12)'}}
  }
};
function mkDS(data,color,dashed,fill){
  return{data,borderColor:color,backgroundColor:fill?color+'15':'transparent',
    borderWidth:dashed?1.5:2,borderDash:dashed?[4,3]:[],
    pointRadius:data.map(v=>v===null?0:3),pointHoverRadius:5,fill:!!fill,tension:0.3};
}
function buildLineChart(id,realD,pptoD,abs){
  const r=abs?realD.map(v=>v===null?null:Math.abs(v)):realD;
  const p=abs?pptoD.map(v=>v===null?null:Math.abs(v)):pptoD;
  if(charts[id])charts[id].destroy();
  charts[id]=new Chart(document.getElementById(id),{type:'line',
    data:{labels:MONTHS,datasets:[mkDS(r,'#185FA5',false,true),mkDS(p,'#888780',true,false)]},
    options:JSON.parse(JSON.stringify(baseOpts))});
}

function buildPctRow(containerId,chartId,realPct,pptoPct){
  const chart=charts[chartId];
  const container=document.getElementById(containerId);
  function render(){
    if(!chart||!chart.chartArea||chart.chartArea.right===0)return;
    const ca=chart.chartArea;
    const step=(ca.right-ca.left)/(MONTHS.length-1);
    let html='<div style="position:relative;height:32px">';
    MONTHS.forEach((m,i)=>{
      const r=realPct[i],p=pptoPct[i];
      const xPx=ca.left+i*step;
      html+=`<div style="position:absolute;left:${xPx}px;transform:translateX(-50%);text-align:center;line-height:1.3">
        <span style="display:block;font-size:10px;font-weight:500;color:#1a1a18">${r===null?'':fmtp(Math.abs(r))}</span>
        <span style="display:block;font-size:9px;color:#888780">${p===null?'':fmtp(Math.abs(p))}</span>
      </div>`;
    });
    html+='</div>';
    container.innerHTML='<div style="margin-bottom:2px"><span style="font-size:9px;font-weight:500;color:#1a1a18">real</span> <span style="font-size:9px;color:#888780">/ ppto</span></div>'+html;
  }
  if(chart&&chart.chartArea&&chart.chartArea.right>0)render();
  else setTimeout(render,400);
}

function buildTable(v){
  const d=D[v].abr;
  const rows=[
    {lbl:'Venta P&L',r:d.venta_r,p:d.venta_p,higher:true,tp:'$'},
    {lbl:'Margen Bruto F %',r:d.mbf_pct_r,p:d.mbf_pct_p,higher:true,tp:'pct'},
    {lbl:'Gastos $',r:-d.gastos_r,p:-d.gastos_p,higher:false,tp:'$'},
    {lbl:'Gastos %',r:d.gastos_pct_r,p:d.gastos_pct_p,higher:false,tp:'pct'},
    {lbl:'EBITDA $',r:d.ebitda_r,p:d.ebitda_p,higher:true,tp:'$'},
    {lbl:'EBITDA %',r:d.ebitda_pct_r,p:d.ebitda_pct_p,higher:true,tp:'pct'},
    {lbl:'Net Profit $',r:d.np_r,p:d.np_p,higher:true,tp:'$'},
    {lbl:'Net Profit %',r:d.np_pct_r,p:d.np_pct_p,higher:true,tp:'pct'},
  ];
  const tbody=rows.map(row=>{
    const isPct=row.tp==='pct';
    const diff=row.r-row.p;
    const good=row.higher?diff>0:diff<0;
    const col=diff===0?'#1a1a18':(good?COL_POS:COL_NEG);
    const pre=diff>0?'+':'';
    const rStr=isPct?fmtp(row.r):'$'+fmt(row.r)+'M';
    const pStr=isPct?fmtp(row.p):'$'+fmt(row.p)+'M';
    const dStr=isPct?`${pre}${diff.toFixed(1)}pp`:`${pre}${fmt(Math.round(diff))}M`;
    const pct=row.p!==0?`${pre}${((diff/Math.abs(row.p))*100).toFixed(1)}%`:'–';
    return `<tr><td>${row.lbl}</td><td>${rStr}</td><td style="color:#888780">${pStr}</td><td style="color:${col};font-weight:500">${dStr}</td><td style="color:${col};font-weight:500">${pct}</td></tr>`;
  }).join('');
  document.getElementById('pl-table').innerHTML=`<table class="pl"><thead><tr><th>Línea</th><th>Real Abr</th><th>Ppto Abr</th><th>Desvío</th><th>%</th></tr></thead><tbody>${tbody}<tr><td>—</td><td colspan="4" style="color:#888780;font-size:10px;text-align:left">Abril 2026 · ARS millones</td></tr></tbody></table>`;
}

function setView(v){
  document.querySelectorAll('.seg-btn').forEach(b=>b.classList.toggle('active',b.dataset.v===v));
  const d=D[v];
  buildKPIs('kpi-ytd','kpi-abr',v);
  buildBarChart('cUnitVentaYtd',UNITS.labels,UNITS.ytd.venta_r,UNITS.ytd.venta_p,UNITS.colors);
  buildShareRow('share-venta-ytd',UNITS.ytd.venta_r);
  buildBarChart('cUnitEbitdaYtd',UNITS.labels,UNITS.ytd.ebitda_r,UNITS.ytd.ebitda_p,UNITS.colors);
  buildShareRow('share-ebitda-ytd',UNITS.ytd.ebitda_r);
  buildBarChart('cUnitVentaAbr',UNITS.labels,UNITS.abr.venta_r,UNITS.abr.venta_p,UNITS.colors);
  buildShareRow('share-venta-abr',UNITS.abr.venta_r);
  buildBarChart('cUnitEbitdaAbr',UNITS.labels,UNITS.abr.ebitda_r,UNITS.abr.ebitda_p,UNITS.colors);
  buildShareRow('share-ebitda-abr',UNITS.abr.ebitda_r);
  buildLineChart('cVenta',d.venta.real,d.venta.ppto,false);
  buildLineChart('cMbf',d.mbf.real,d.mbf.ppto,false);
  buildLineChart('cGastos',d.gastos.real,d.gastos.ppto,true);
  buildLineChart('cEbitda',d.ebitda.real,d.ebitda.ppto,false);
  buildTable(v);
  setTimeout(()=>{
    buildPctRow('pt-gastos','cGastos',d.gastos_pct.real,d.gastos_pct.ppto);
    buildPctRow('pt-ebitda','cEbitda',d.ebitda_pct.real,d.ebitda_pct.ppto);
  },400);
}

// Función asincrónica para conectar a Google Sheets
async function cargarDatos() {
  try {
    const response = await fetch(API_URL);
    const datosDinamicos = await response.json();
    
    // Rellenamos nuestras variables vacías con la info recibida
    D = datosDinamicos.D;
    UNITS = datosDinamicos.UNITS;
    
    // Una vez que los datos llegaron, dibujamos el tablero inicial
    setView('Consolidado');
  } catch (error) {
    console.error("Error al cargar la base de datos:", error);
  }
}

// Event Listeners
document.querySelectorAll('.seg-btn').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.v)));

// Cuando termina de cargar la web, llama a Google Sheets en lugar de dibujar datos estáticos
window.addEventListener('load', cargarDatos);
