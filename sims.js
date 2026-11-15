/* Figuras interactivas de Electrónica Analógica. Vanilla JS + canvas. */
(function(){
const C = {};
function paleta(el){const cs=getComputedStyle(el);const v=n=>cs.getPropertyValue(n).trim();
  C.bg=v('--surface')||'#fff';C.grid=v('--line')||'#d5dcd9';C.text=v('--fg')||'#16211d';C.muted=v('--muted')||'#56635e';
  C.a=v('--tc')||v('--accent')||'#b4232f';C.b=v('--warn')||'#b8730c';C.c=v('--c6')||'#2c8a52';C.d=v('--c5')||'#c43d63';C.e=v('--c4')||'#b8730c';C.f=v('--c2')||'#3a63c4';}
const F=n=>Number.isInteger(n)?String(n):(Math.abs(n)<1e-9?'0':n.toFixed(2).replace('.',','));

function build(el, spec){
  el.classList.add('sim-box');paleta(el);
  const ctrls=document.createElement('div'); ctrls.className='ctrl sim-ctrls';
  const cv=document.createElement('canvas'); cv.width=spec.w||640; cv.height=spec.h||360; cv.className='sim-cv';
  const out=document.createElement('div'); out.className='readout sim-out';
  el.append(ctrls,cv,out);
  const st={};
  (spec.sliders||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=`${s.l}: ${F(s.v)} ${s.u||''}`;
    const inp=document.createElement('input');inp.type='range';inp.min=s.min;inp.max=s.max;inp.step=s.step||0.01;inp.value=s.v;
    inp.oninput=()=>{st[s.k]=parseFloat(inp.value);sp.textContent=`${s.l}: ${F(st[s.k])} ${s.u||''}`;draw();};lab.append(sp,inp);ctrls.append(lab);});
  (spec.selects||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=s.l;
    const sel=document.createElement('select');s.opts.forEach(o=>{const op=document.createElement('option');op.value=o[0];op.textContent=o[1];if(o[0]===s.v)op.selected=true;sel.append(op);});
    sel.onchange=()=>{st[s.k]=sel.value;draw();};lab.append(sp,sel);ctrls.append(lab);});
  const g=cv.getContext('2d');
  const api={st,cv,g,out,W:cv.width,H:cv.height,
    clear(){paleta(el);g.fillStyle=C.bg;g.fillRect(0,0,cv.width,cv.height);},
    txt(s,x,y,col,sz,al){g.fillStyle=col||C.text;g.font=(sz||13)+'px system-ui';g.textAlign=al||'left';g.fillText(s,x,y);},
    arrow(x1,y1,x2,y2,col,wd){g.strokeStyle=g.fillStyle=col;g.lineWidth=wd||2.5;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1),L=10;g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-L*Math.cos(a-0.4),y2-L*Math.sin(a-0.4));g.lineTo(x2-L*Math.cos(a+0.4),y2-L*Math.sin(a+0.4));g.closePath();g.fill();},
    line(x1,y1,x2,y2,col,wd,dash){g.strokeStyle=col;g.lineWidth=wd||1.5;g.setLineDash(dash||[]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);},
    circ(x,y,r,col,fill){g.beginPath();g.arc(x,y,r,0,Math.PI*2);if(fill){g.fillStyle=col;g.fill();}else{g.strokeStyle=col;g.lineWidth=2;g.stroke();}},
    html(h){out.innerHTML=h;},
    // sistema de ejes cartesiano
    axes(cx,cy,u,xmin,xmax,ymin,ymax){for(let i=Math.ceil(xmin);i<=xmax;i++)api.line(cx+i*u,cy-ymax*u,cx+i*u,cy-ymin*u,C.grid,1);for(let j=Math.ceil(ymin);j<=ymax;j++)api.line(cx+xmin*u,cy-j*u,cx+xmax*u,cy-j*u,C.grid,1);api.line(cx+xmin*u,cy,cx+xmax*u,cy,C.muted,1.5);api.line(cx,cy-ymax*u,cx,cy-ymin*u,C.muted,1.5);}
  };
  function draw(){spec.draw(api);}
  draw(); return api;
}
const SIMS={};

/* ---- helpers Electrónica Analógica ---- */
const NR=(x,d)=>{if(!isFinite(x))return '—';const s=x.toFixed(d===undefined?2:d);return (Math.abs(parseFloat(s))<1e-12?(0).toFixed(d===undefined?2:d):s).replace('.',',');};
const N0=x=>NR(x,0),N1=x=>NR(x,1),N2=x=>NR(x,2),N3=x=>NR(x,3),N4=x=>NR(x,4);
const sup=s=>String(s).replace(/-/g,'−');
const dB=x=>20*Math.log10(Math.abs(x)||1e-12);
const ING=(x,u)=>{const a=Math.abs(x);
  if(a>=1e9)return N2(x/1e9)+' G'+u; if(a>=1e6)return N2(x/1e6)+' M'+u;
  if(a>=1e3)return N2(x/1e3)+' k'+u; if(a>=1)return N2(x)+' '+u;
  if(a>=1e-3)return N2(x*1e3)+' m'+u; if(a>=1e-6)return N2(x*1e6)+' µ'+u;
  if(a>=1e-9)return N2(x*1e9)+' n'+u; return N2(x*1e12)+' p'+u;};
function Rbox(a,x,y,w,h,col,r){const g=a.g;r=r||6;g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.fillStyle=col;g.fill();}
function Rline(a,x,y,w,h,col,r,lw){const g=a.g;r=r||6;g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.strokeStyle=col;g.lineWidth=lw||1.6;g.stroke();}
function alpha(a,v,fn){a.g.save();a.g.globalAlpha=v;fn();a.g.restore();}
/* triángulo de AO */
function AO(a,x,y,s,col){const g=a.g;g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s*1.7,y);g.lineTo(x,y+s);g.closePath();
  g.strokeStyle=col;g.lineWidth=1.8;g.stroke();
  a.txt('−',x+9,y-s*0.42+5,col,13);a.txt('+',x+9,y+s*0.48+5,col,13);}

/* 1 · Cadena de amplificación y efecto de carga */
SIMS.amplificador=el=>build(el,{w:680,h:286,
 sliders:[{k:'Rs',l:'Rs de la fuente',v:50,min:0.1,max:200,step:0.1,u:'kΩ'},
  {k:'Zi1',l:'Zi etapa 1',v:100,min:1,max:1000,step:1,u:'kΩ'},
  {k:'A1',l:'Ganancia etapa 1',v:50,min:1,max:200,step:1},
  {k:'Zo1',l:'Zo etapa 1',v:5,min:0.01,max:50,step:0.01,u:'kΩ'},
  {k:'Zi2',l:'Zi etapa 2',v:10,min:0.5,max:1000,step:0.5,u:'kΩ'},
  {k:'RL',l:'Carga RL',v:1,min:0.05,max:100,step:0.05,u:'kΩ'}],
 draw(a){a.clear();const s=a.st;
  const A2=20, Zo2=0.1;
  const d1=s.Zi1/(s.Rs+s.Zi1), d2=s.Zi2/(s.Zo1+s.Zi2), d3=s.RL/(Zo2+s.RL);
  const Atot=d1*s.A1*d2*A2*d3, Anom=s.A1*A2;
  /* cadena */
  const y=92, bw=104, gap=16;
  const bloques=[['fuente',C.muted],['etapa 1\nA = '+N0(s.A1),C.a],['etapa 2\nA = 20',C.c],['carga\n'+N2(s.RL)+' kΩ',C.b]];
  let x=38;
  const xs=[];
  bloques.forEach((b,i)=>{xs.push(x);
    alpha(a,0.12,()=>Rbox(a,x,y,bw,52,b[1],6));Rline(a,x,y,bw,52,b[1],6,1.5);
    b[0].split('\n').forEach((l,j)=>a.txt(l,x+bw/2,y+(b[0].includes('\n')?22:32)+j*18,b[1],12.5,'center'));
    x+=bw+gap;});
  /* divisores entre bloques */
  const divs=[[d1,'Rs / Zi'],[d2,'Zo1 / Zi2'],[d3,'Zo2 / RL']];
  divs.forEach((d,i)=>{const cx=xs[i]+bw+gap/2;
    a.line(xs[i]+bw,y+26,xs[i+1],y+26,C.muted,1.5);
    const col=d[0]>0.9?C.c:(d[0]>0.7?C.b:C.d);
    a.txt('×'+N3(d[0]),cx,y-10,col,12,'center');
    a.txt(sup(N2(dB(d[0])))+' dB',cx,y+76,col,11,'center');});
  /* resultado */
  const by=206;
  a.txt('Ganancia nominal (producto de las etapas)',38,by,C.muted,12);
  a.txt(N0(Anom)+'  =  '+N1(dB(Anom))+' dB',38,by+24,C.muted,15);
  a.txt('Ganancia real (con efecto de carga)',38,by+56,C.muted,12);
  a.txt(N0(Atot)+'  =  '+N1(dB(Atot))+' dB',38,by+80,C.a,19);
  const px=430;
  a.txt('Pérdida total',px,by,C.muted,12);
  a.txt(sup(N2(dB(Atot)-dB(Anom)))+' dB',px,by+26,dB(Anom)-dB(Atot)>6?C.d:C.b,19);
  a.txt('salida con 10 mV de entrada',px,by+58,C.muted,11.5);
  a.txt(ING(Atot*0.01,'V'),px,by+82,C.text,15);
  a.html('Cada unión entre bloques es un <b>divisor de tensión</b> entre la impedancia de salida de uno y la de entrada del siguiente. Sube Zi de la etapa 2 hasta 1 MΩ y mira cómo el divisor pasa de '+N3(d2)+' a casi 1: se recuperan '+N1(-dB(d2))+' dB <b>sin tocar ninguna ganancia</b>.<br>Esa es exactamente la función del <b>seguidor de tensión</b>: Zi infinita y Zo nula, es decir, divisores iguales a 1.');
 }});

/* 2 · AO ideal: realimentación y saturación */
SIMS.aoideal=el=>build(el,{w:680,h:276,
 selects:[{k:'tipo',l:'Realimentación',v:'neg',opts:[['neg','Negativa (a la entrada −): circuito lineal'],['pos','Positiva (a la entrada +): comparador'],['sin','Sin realimentación: lazo abierto']]}],
 sliders:[{k:'vi',l:'Tensión de entrada',v:0.5,min:-2.5,max:2.5,step:0.05,u:'V'},
  {k:'R1',l:'R1',v:10,min:1,max:100,step:1,u:'kΩ'},{k:'R2',l:'R2',v:100,min:1,max:500,step:1,u:'kΩ'}],
 draw(a){a.clear();const s=a.st,Vsat=13.6;
  const A=-s.R2/s.R1;
  let vo, vm, vp, lineal;
  if(s.tipo==='neg'){vo=A*s.vi; lineal=Math.abs(vo)<=Vsat; if(!lineal)vo=Math.sign(vo)*Vsat;
    vp=0; vm=lineal?0:(s.vi*s.R2+vo*s.R1)/(s.R1+s.R2);}
  else if(s.tipo==='pos'){vo=s.vi>0?Vsat:-Vsat; lineal=false; vm=0; vp=(s.vi*s.R2+vo*s.R1)/(s.R1+s.R2);}
  else {vo=Math.sign(s.vi)*Vsat; lineal=false; vm=0; vp=s.vi;}
  /* esquema */
  const cx=160,cy=118,sz=42;
  AO(a,cx,cy,sz,C.a);
  a.line(cx-60,cy-sz*0.42,cx,cy-sz*0.42,C.muted,1.6);
  a.line(cx-60,cy+sz*0.48,cx,cy+sz*0.48,C.muted,1.6);
  a.line(cx+sz*1.7,cy,cx+sz*1.7+54,cy,C.muted,1.6);
  a.txt('vo',cx+sz*1.7+60,cy+5,C.b,12.5);
  a.circ(cx+sz*1.7+50,cy,4,C.b,true);
  /* realimentación */
  if(s.tipo!=='sin'){const yl=s.tipo==='neg'?cy-sz*0.42:cy+sz*0.48;
    a.line(cx+sz*1.7+36,cy,cx+sz*1.7+36,yl-(s.tipo==='neg'?54:-54),C.c,1.6);
    a.line(cx+sz*1.7+36,yl-(s.tipo==='neg'?54:-54),cx-30,yl-(s.tipo==='neg'?54:-54),C.c,1.6);
    a.line(cx-30,yl-(s.tipo==='neg'?54:-54),cx-30,yl,C.c,1.6);
    a.txt('R2',cx+14,yl-(s.tipo==='neg'?60:-70),C.c,11.5);
    a.txt(s.tipo==='neg'?'realimentación NEGATIVA':'realimentación POSITIVA',cx-50,yl-(s.tipo==='neg'?76:-88),s.tipo==='neg'?C.c:C.d,12);}
  else a.txt('sin realimentación',cx+8,cy-70,C.d,12);
  a.txt('vi',cx-80,cy+(s.tipo==='pos'?sz*0.48:-sz*0.42)+5,C.text,12.5);
  a.txt('R1',cx-48,cy-sz*0.42-10,C.muted,11);
  /* lecturas */
  const bx=400,by=56;
  const fil=[['v⁻',vm,'V'],['v⁺',vp,'V'],['v⁺ − v⁻',vp-vm,'V'],['vo',vo,'V']];
  fil.forEach((f,i)=>{const y=by+i*34;
    a.txt(f[0],bx,y,C.muted,12.5);
    a.txt(N3(f[1])+' V',bx+176,y,i===3?C.b:(i===2&&Math.abs(f[1])<1e-6?C.c:C.text),i===3?16:13.5,'right');});
  a.txt(lineal?'v⁺ = v⁻  ·  cortocircuito virtual':(s.tipo==='neg'?'SATURADO: la regla deja de valer':'SATURADO: salida en ±Vsat'),bx,by+144,lineal?C.c:C.d,12);
  a.txt(lineal?'Av = −R2/R1 = '+N1(A):'|vo| = Vsat = 13,6 V',bx,by+170,lineal?C.text:C.d,13);
  if(s.tipo==='neg')a.txt('satura a partir de vi = ±'+N3(Vsat/Math.abs(A))+' V',bx,by+196,C.muted,11.5);
  a.html(s.tipo==='neg'
   ? (lineal?'Con realimentación <b>negativa</b> valen las dos reglas de oro: no entra corriente por las entradas y <b>v⁺ = v⁻</b>. Como la entrada (+) está a masa, la (−) queda en <b>masa virtual</b> y toda la corriente de R1 pasa a R2: vo = −(R2/R1)·vi.'
      : 'La salida pide '+N1(A*s.vi)+' V, más que la saturación de ±13,6 V. El AO <b>no puede</b>, así que se queda en el límite y <b>la regla v⁺ = v⁻ deja de cumplirse</b>: mira cómo v⁻ ya no vale 0.')
   : s.tipo==='pos'
   ? 'Con realimentación <b>positiva</b> el circuito no es lineal: cualquier desequilibrio se amplifica y lleva la salida a saturación. Las entradas <b>no</b> están al mismo potencial. Esto no es un error de diseño: es el principio del <b>disparador de Schmitt</b>.'
   : 'Sin realimentación, la ganancia es la de lazo abierto (del orden de 10⁵). Unos pocos microvoltios de diferencia bastan para saturar la salida: el AO funciona como <b>comparador</b>.');
 }});

/* 3 · Configuraciones lineales */
SIMS.lineales=el=>build(el,{w:680,h:282,
 selects:[{k:'cfg',l:'Configuración',v:'inv',opts:[['inv','Inversor'],['noinv','No inversor'],['seg','Seguidor de tensión'],['sum','Sumador inversor'],['res','Restador'],['inst','Amplificador de instrumentación'],['int','Integrador'],['der','Derivador']]}],
 sliders:[{k:'R1',l:'R1',v:10,min:0.5,max:100,step:0.5,u:'kΩ'},{k:'R2',l:'R2',v:100,min:0.5,max:500,step:0.5,u:'kΩ'},
  {k:'v1',l:'Entrada v1',v:0.5,min:-2,max:2,step:0.05,u:'V'},{k:'v2',l:'Entrada v2',v:0.2,min:-2,max:2,step:0.05,u:'V'}],
 draw(a){a.clear();const s=a.st,Vsat=13.6;
  const R3=10,R4=10;
  const D={inv:{f:'vo = −(R2/R1)·v1',g:-s.R2/s.R1,zi:s.R1+' kΩ',o:-s.R2/s.R1*s.v1,n:'Invierte y amplifica. Admite ganancias menores que 1.'},
   noinv:{f:'vo = (1 + R2/R1)·v1',g:1+s.R2/s.R1,zi:'∞',o:(1+s.R2/s.R1)*s.v1,n:'No invierte. La ganancia nunca puede ser menor que 1.'},
   seg:{f:'vo = v1',g:1,zi:'∞',o:s.v1,n:'Ganancia 1, pero Zi infinita y Zo nula: desacopla etapas.'},
   sum:{f:'vo = −R2·(v1/R1 + v2/R1)',g:null,zi:'R1 por rama',o:-s.R2*(s.v1/s.R1+s.v2/s.R1),n:'Las entradas no interaccionan porque todas llegan a la masa virtual.'},
   res:{f:'vo = (R2/R1)·(v2 − v1)',g:s.R2/s.R1,zi:'distinta por rama',o:s.R2/s.R1*(s.v2-s.v1),n:'Sólo es exacto si R1/R2 = R3/R4.'},
   inst:{f:'vo = (1 + 2R2/R1)·(R4/R3)·(v2 − v1)',g:(1+2*s.R2/s.R1)*(R4/R3),zi:'∞',o:(1+2*s.R2/s.R1)*(R4/R3)*(s.v2-s.v1),n:'Zi infinita y ganancia con una sola resistencia.'},
   int:{f:'vo = −(1/R1C)·∫v1 dt',g:null,zi:s.R1+' kΩ',o:null,n:'−20 dB/década. Necesita una resistencia en paralelo con C.'},
   der:{f:'vo = −R2C·dv1/dt',g:null,zi:'1/jωC',o:null,n:'+20 dB/década. Amplifica el ruido: necesita una R en serie con C.'}}[s.cfg];
  /* esquema simplificado */
  const cx=150,cy=112,sz=40;
  AO(a,cx,cy,sz,C.a);
  a.line(cx+sz*1.7,cy,cx+sz*1.7+50,cy,C.muted,1.6);
  a.circ(cx+sz*1.7+46,cy,4,C.b,true);a.txt('vo',cx+sz*1.7+54,cy+5,C.b,12);
  const inv=['inv','sum','int','der'].includes(s.cfg);
  const ya=cy-sz*0.42, yb=cy+sz*0.48;
  if(s.cfg==='seg'){a.line(cx+sz*1.7+30,cy,cx+sz*1.7+30,ya-44,C.c,1.6);
    a.line(cx+sz*1.7+30,ya-44,cx-26,ya-44,C.c,1.6);a.line(cx-26,ya-44,cx-26,ya,C.c,1.6);a.line(cx-26,ya,cx,ya,C.muted,1.6);
    a.line(cx-74,yb,cx,yb,C.muted,1.6);a.txt('v1',cx-92,yb+5,C.text,12.5);}
  else{a.line(cx-74,ya,cx,ya,C.muted,1.6);
    a.line(cx-74,yb,cx,yb,C.muted,1.6);
    a.txt(inv?'v1':'0',cx-92,ya+5,inv?C.text:C.muted,12.5);
    a.txt(inv?'0':'v1',cx-92,yb+5,inv?C.muted:C.text,12.5);
    a.line(cx+sz*1.7+30,cy,cx+sz*1.7+30,ya-44,C.c,1.6);
    a.line(cx+sz*1.7+30,ya-44,cx-26,ya-44,C.c,1.6);a.line(cx-26,ya-44,cx-26,ya,C.c,1.6);
    a.txt(['int'].includes(s.cfg)?'C':'R2',cx+10,ya-52,C.c,11.5);
    a.txt(['der'].includes(s.cfg)?'C':'R1',cx-56,ya-8,C.muted,11.5);}
  if(inv)a.txt('masa virtual',cx-40,yb+22,C.c,11);
  /* panel */
  const bx=380,by=56;
  a.txt(D.f,bx,by-18,C.a,14);
  if(D.g!==null){a.txt('Ganancia',bx,by+18,C.muted,12);
    a.txt(N3(D.g)+'  =  '+N1(dB(D.g))+' dB',bx,by+42,C.text,15);}
  else {a.txt('Ganancia dependiente de la frecuencia',bx,by+18,C.muted,12);
    a.txt(s.cfg==='int'?'−20 dB/década':(s.cfg==='der'?'+20 dB/década':'según cada rama'),bx,by+42,C.text,14);}
  a.txt('Impedancia de entrada',bx,by+78,C.muted,12);
  a.txt(String(D.zi),bx,by+100,C.text,14);
  if(D.o!==null){const sat=Math.abs(D.o)>Vsat;
    a.txt('Salida',bx,by+136,C.muted,12);
    a.txt(sat?sup(N2(Math.sign(D.o)*Vsat))+' V  (saturado)':N3(D.o)+' V',bx,by+160,sat?C.d:C.b,17);}
  a.html('<b>'+D.f+'</b><br>'+D.n+(D.g!==null&&Math.abs(D.g)>0?'<br>Con R1 = '+N1(s.R1)+' kΩ y R2 = '+N1(s.R2)+' kΩ la ganancia vale <b>'+N3(D.g)+'</b> ('+N1(dB(D.g))+' dB).':''));
 }});

/* 4 · Comparador y Schmitt */
SIMS.schmitt=el=>build(el,{w:680,h:266,
 selects:[{k:'tipo',l:'Circuito',v:'noinv',opts:[['comp','Comparador simple (sin histéresis)'],['noinv','Schmitt no inversor'],['inv','Schmitt inversor']]}],
 sliders:[{k:'R1',l:'R1',v:10,min:1,max:100,step:1,u:'kΩ'},{k:'R2',l:'R2',v:100,min:5,max:500,step:5,u:'kΩ'},
  {k:'ruido',l:'Ruido en la señal',v:0.35,min:0,max:2,step:0.05,u:'V'},
  {k:'Vref',l:'Referencia',v:0,min:-5,max:5,step:0.25,u:'V'}],
 draw(a){a.clear();const s=a.st,Vsat=13.6;
  let VTH,VTL;
  if(s.tipo==='comp'){VTH=VTL=s.Vref;}
  else if(s.tipo==='noinv'){VTH=s.Vref*(1+s.R1/s.R2)+Vsat*s.R1/s.R2;VTL=s.Vref*(1+s.R1/s.R2)-Vsat*s.R1/s.R2;}
  else{VTH=s.Vref*s.R2/(s.R1+s.R2)+Vsat*s.R1/(s.R1+s.R2);VTL=s.Vref*s.R2/(s.R1+s.R2)-Vsat*s.R1/(s.R1+s.R2);}
  const hist=VTH-VTL;
  /* señal con ruido determinista */
  const N=560, ox=44,oy=96,W=392,H=68;
  const X=i=>ox+i/N*W, Y=v=>oy+H/2-v/12*H/2;
  let rnd=98765;const rr=()=>{rnd=(rnd*1103515245+12345)&0x7fffffff;return rnd/0x7fffffff-0.5;};
  const sig=[];for(let i=0;i<=N;i++){const t=i/N;
    sig.push(9*Math.sin(2*Math.PI*1.5*t)+s.ruido*(rr()+0.6*rr()));}
  a.txt('entrada  vi',ox,oy-16,C.muted,12);
  a.line(ox,oy+H/2,ox+W,oy+H/2,C.grid,1.2);
  a.g.strokeStyle=C.text;a.g.lineWidth=1.4;a.g.beginPath();
  sig.forEach((v,i)=>{const x=X(i),y=Y(v);if(i===0)a.g.moveTo(x,y);else a.g.lineTo(x,y);});
  a.g.stroke();
  a.line(ox,Y(VTH),ox+W,Y(VTH),C.c,1.4,[5,3]);
  a.txt('VTH',ox+W+6,Y(VTH)+4,C.c,10.5);
  if(s.tipo!=='comp'){a.line(ox,Y(VTL),ox+W,Y(VTL),C.d,1.4,[5,3]);
    a.txt('VTL',ox+W+6,Y(VTL)+4,C.d,10.5);
    alpha(a,0.1,()=>Rbox(a,ox,Y(VTH),W,Y(VTL)-Y(VTH),C.b,0));}
  /* salida */
  const oy2=224,H2=56;
  const Y2=v=>oy2-((v+Vsat)/(2*Vsat))*H2;
  a.txt('salida  vo',ox,oy2-H2-14,C.muted,12);
  let est=1,conm=0;
  a.g.strokeStyle=C.a;a.g.lineWidth=1.8;a.g.beginPath();
  let prev=null;
  sig.forEach((v,i)=>{let ne=est;
    if(s.tipo==='comp')ne=v>s.Vref?1:-1;
    else if(s.tipo==='noinv'){if(est<0&&v>VTH)ne=1;else if(est>0&&v<VTL)ne=-1;}
    else{if(est>0&&v>VTH)ne=-1;else if(est<0&&v<VTL)ne=1;}
    if(ne!==est&&i>0){conm++;a.g.lineTo(X(i),Y2(est*Vsat));a.g.lineTo(X(i),Y2(ne*Vsat));est=ne;}
    const x=X(i),y=Y2(est*Vsat);
    if(i===0)a.g.moveTo(x,y);else a.g.lineTo(x,y);});
  a.g.stroke();
  a.txt('+Vsat',ox-8,Y2(Vsat)+4,C.muted,10,'right');
  a.txt('−Vsat',ox-8,Y2(-Vsat)+4,C.muted,10,'right');
  /* panel */
  const bx=486,by=62;
  a.txt('Umbrales',bx,by-18,C.a,13);
  a.txt('VTH',bx,by+6,C.c,12);a.txt(N3(VTH)+' V',bx+170,by+6,C.c,13,'right');
  a.txt('VTL',bx,by+30,C.d,12);a.txt(N3(VTL)+' V',bx+170,by+30,C.d,13,'right');
  a.txt('histéresis',bx,by+58,C.muted,12);
  a.txt(N3(hist)+' V',bx+170,by+58,hist>s.ruido*3?C.c:C.d,15,'right');
  a.txt('ruido pico a pico ≈ '+N2(s.ruido*3)+' V',bx,by+84,C.muted,11);
  a.txt('Conmutaciones',bx,by+118,C.muted,12);
  a.txt(String(conm),bx+170,by+118,conm<=3?C.c:C.d,19,'right');
  a.txt(conm<=3?'una por cruce: correcto':'¡rebotes! el ruido cruza',bx,by+144,conm<=3?C.c:C.d,11.5);
  if(conm>3)a.txt('el umbral varias veces',bx,by+162,C.d,11.5);
  a.html(s.tipo==='comp'
   ? 'Un comparador <b>sin histéresis</b> tiene un único umbral. Sube el ruido y mira cómo la salida conmuta <b>muchas veces</b> en cada cruce: en un sistema digital eso son pulsos espurios que estropean la cuenta.'
   : 'El <b>disparador de Schmitt</b> tiene <b>dos</b> umbrales: para subir hace falta llegar a VTH y para bajar, a VTL. Mientras el ruido sea menor que la histéresis ('+N3(hist)+' V), la salida conmuta una sola vez por cruce. Baja R2 o sube R1 para aumentar la histéresis.');
 }});

/* 5 · Limitaciones del AO real */
SIMS.aoreal=el=>build(el,{w:680,h:292,
 sliders:[{k:'G',l:'Ganancia de lazo cerrado',v:11,min:1,max:200,step:1},
  {k:'GBW',l:'Producto ganancia-ancho de banda',v:1,min:0.1,max:10,step:0.1,u:'MHz'},
  {k:'SR',l:'Slew rate',v:0.5,min:0.1,max:20,step:0.1,u:'V/µs'},
  {k:'Vp',l:'Amplitud de salida',v:10,min:0.1,max:13,step:0.1,u:'V'},
  {k:'Vos',l:'Tensión de offset',v:2,min:0,max:10,step:0.1,u:'mV'},
  {k:'cmrr',l:'CMRR',v:70,min:40,max:120,step:5,u:'dB'}],
 draw(a){a.clear();const s=a.st;
  const BW=s.GBW*1e6/s.G;
  const fsr=s.SR*1e6/(2*Math.PI*s.Vp);
  const flim=Math.min(BW,fsr);
  const errOS=s.Vos*s.G;
  const acm=s.G/Math.pow(10,s.cmrr/20);
  const errCM=acm*100;   /* con 100 mV de modo común */
  /* gráfico log de ganancia */
  const ox=52,oy=172,W=350,H=112;
  const f0=1,f1=1e7;
  const X=f=>ox+Math.log10(f/f0)/Math.log10(f1/f0)*W;
  const Ymax=Math.max(dB(s.GBW*1e6),60), Ymin=-20;
  const Y=d=>oy-(d-Ymin)/(Ymax-Ymin)*H;
  a.line(ox,oy,ox+W,oy,C.grid,1.3);a.line(ox,oy,ox,oy-H,C.grid,1.3);
  for(let e=0;e<=7;e++){const x=X(Math.pow(10,e));
    a.line(x,oy,x,oy+5,C.muted,1);
    a.txt(['1','10','100','1k','10k','100k','1M','10M'][e],x,oy+19,C.muted,9.5,'center');}
  a.txt('Hz',ox+W+12,oy+5,C.muted,10);
  a.txt('dB',ox-12,oy-H+6,C.muted,10,'right');a.txt('Hz',ox+W+10,oy+4,C.muted,10);
  /* curva de lazo abierto */
  a.g.strokeStyle=C.muted;a.g.lineWidth=1.5;a.g.setLineDash([5,3]);a.g.beginPath();
  const fp=s.GBW*1e6/Math.pow(10,100/20);
  for(let e=0;e<=70;e++){const f=Math.pow(10,e/10);
    const g=dB(Math.pow(10,100/20)/Math.sqrt(1+Math.pow(f/fp,2)));
    const x=X(f),y=Y(Math.min(g,Ymax));if(e===0)a.g.moveTo(x,y);else a.g.lineTo(x,y);}
  a.g.stroke();a.g.setLineDash([]);
  a.txt('A lazo abierto',ox+8,Y(Ymax)+14,C.muted,10.5);
  /* curva de lazo cerrado */
  a.g.strokeStyle=C.a;a.g.lineWidth=2.4;a.g.beginPath();
  for(let e=0;e<=70;e++){const f=Math.pow(10,e/10);
    const g=dB(s.G/Math.sqrt(1+Math.pow(f/BW,2)));
    const x=X(f),y=Y(Math.max(Math.min(g,Ymax),Ymin));if(e===0)a.g.moveTo(x,y);else a.g.lineTo(x,y);}
  a.g.stroke();
  a.line(X(BW),oy,X(BW),Y(dB(s.G))-6,C.a,1.3,[4,3]);
  a.txt('BW',X(BW),Y(dB(s.G))-12,C.a,11,'center');
  a.line(X(fsr),oy,X(fsr),oy-H,C.d,1.6,[6,3]);
  a.txt('slew rate',X(fsr),oy-H-6,C.d,11,'center');
  if(fsr<BW)alpha(a,0.1,()=>Rbox(a,X(fsr),oy-H,X(BW)-X(fsr),H,C.d,0));
  /* panel */
  const bx=452,by=50;
  const fil=[['Ancho de banda  GBW/G',ING(BW,'Hz'),C.a],
   ['Límite por slew rate',ING(fsr,'Hz'),C.d],
   ['Frecuencia máxima útil',ING(flim,'Hz'),C.b],
   ['Error por offset  Vos·G',N1(errOS)+' mV',errOS>100?C.d:C.text],
   ['Acm = G / CMRR',N4(acm*1000)+' ·10⁻³',C.text],
   ['Error con 100 mV de modo común',N3(errCM)+' mV',C.text]];
  fil.forEach((f,i)=>{const y=by+i*38;
    a.txt(f[0],bx,y,C.muted,11.5);
    a.txt(f[1],bx,y+20,f[2],14.5);});
  a.html(fsr<BW
   ? 'Con '+N1(s.Vp)+' V de pico, el <b>slew rate</b> limita a '+ING(fsr,'Hz')+', bastante por debajo del ancho de banda de pequeña señal ('+ING(BW,'Hz')+'). En la zona sombreada la senoide sale <b>triangular</b>: es distorsión de gran señal, y no se arregla bajando la ganancia sino reduciendo la amplitud o cambiando de AO.'
   : 'Aquí manda el <b>GBW</b>: con ganancia '+N0(s.G)+' el ancho de banda es '+ING(BW,'Hz')+', y el slew rate no estorba hasta '+ING(fsr,'Hz')+'. Sube la amplitud de salida y verás cómo el límite del slew rate baja hasta cruzarse con el del ancho de banda.');
 }});

/* 6 · Diagrama de Bode */
SIMS.bode=el=>build(el,{w:680,h:324,
 selects:[{k:'tipo',l:'Función de transferencia',v:'pb',opts:[['pb','Paso bajo: K/(1+jω/ωp)'],['pa','Paso alto: K·(jω/ωz)/(1+jω/ωp)'],['pbanda','Paso banda: dos polos y un cero'],['dos','Dos polos: K/((1+jω/ωp1)(1+jω/ωp2))']]}],
 sliders:[{k:'K',l:'Ganancia K',v:1,min:0.1,max:100,step:0.1},
  {k:'f1',l:'Primera frecuencia de corte',v:1591,min:10,max:100000,step:10,u:'Hz'},
  {k:'f2',l:'Segunda frecuencia de corte',v:100000,min:100,max:1000000,step:100,u:'Hz'},
  {k:'fm',l:'Cursor',v:1000,min:10,max:1000000,step:10,u:'Hz'}],
 draw(a){a.clear();const s=a.st;
  function G(f){const w=f;let re=s.K,im=0;
    const mulz=(f0)=>{const r=1,i=w/f0;const nr=re*r-im*i,ni=re*i+im*r;re=nr;im=ni;};
    const divp=(f0)=>{const r=1,i=w/f0;const d=r*r+i*i;const nr=(re*r+im*i)/d,ni=(im*r-re*i)/d;re=nr;im=ni;};
    if(s.tipo==='pb'){divp(s.f1);}
    else if(s.tipo==='pa'){const nr=-im*(w/s.f1)*0+0;
      /* (jw/f1)/(1+jw/f1) */
      const num_r=0,num_i=w/s.f1;const den_r=1,den_i=w/s.f1;const d=den_r*den_r+den_i*den_i;
      const qr=(num_r*den_r+num_i*den_i)/d, qi=(num_i*den_r-num_r*den_i)/d;
      const tr=re*qr-im*qi, ti=re*qi+im*qr;re=tr;im=ti;}
    else if(s.tipo==='pbanda'){const num_i=w/s.f1;const d1=1+Math.pow(w/s.f1,2);
      const qr=(num_i*(w/s.f1))/d1, qi=(num_i*1)/d1;re=s.K*qr;im=s.K*qi;divp(s.f2);}
    else {divp(s.f1);divp(s.f2);}
    return [re,im];}
  const ox=56,oy=160,W=392,H=112;
  const fa=1,fb=1e7;
  const X=f=>ox+Math.log10(f/fa)/Math.log10(fb/fa)*W;
  let gmin=1e9,gmax=-1e9;
  const pts=[];
  for(let e=0;e<=140;e++){const f=Math.pow(10,e/20);const [r,i]=G(f);
    const g=dB(Math.hypot(r,i));const ph=Math.atan2(i,r)*180/Math.PI;
    pts.push([f,g,ph]);gmin=Math.min(gmin,g);gmax=Math.max(gmax,g);}
  gmax=Math.ceil((gmax+6)/20)*20; gmin=Math.max(gmin,gmax-100);gmin=Math.floor(gmin/20)*20;
  const Y=g=>oy-(g-gmin)/(gmax-gmin)*H;
  a.txt('módulo  |G|  [dB]',ox,oy-H-14,C.muted,12);
  a.line(ox,oy,ox+W,oy,C.grid,1.3);a.line(ox,oy,ox,oy-H,C.grid,1.3);
  for(let g=gmin;g<=gmax;g+=20){const y=Y(g);if(y<oy-1&&y>oy-H-1){a.line(ox,y,ox+W,y,C.grid,0.8);a.txt(String(g),ox-8,y+4,C.muted,9.5,'right');}}
  for(let e=0;e<=7;e++){const x=X(Math.pow(10,e));a.line(x,oy,x,oy+4,C.muted,1);}
  a.g.strokeStyle=C.a;a.g.lineWidth=2.3;a.g.beginPath();
  pts.forEach((p,i)=>{const x=X(p[0]),y=Y(Math.max(p[1],gmin));if(i===0)a.g.moveTo(x,y);else a.g.lineTo(x,y);});
  a.g.stroke();
  /* fase */
  const oy2=292,H2=76;
  const Y2=p=>oy2-(p+180)/360*H2;
  a.txt('fase  [º]',ox,oy2-H2-12,C.muted,12);
  a.line(ox,oy2,ox+W,oy2,C.grid,1.3);
  a.line(ox,Y2(0),ox+W,Y2(0),C.grid,0.9);
  a.txt('+180',ox-8,Y2(180)+4,C.muted,9,'right');a.txt('0',ox-8,Y2(0)+4,C.muted,9,'right');a.txt('−180',ox-8,Y2(-180)+4,C.muted,9,'right');
  a.g.strokeStyle=C.c;a.g.lineWidth=2.1;a.g.beginPath();
  let last=null;
  pts.forEach((p,i)=>{const x=X(p[0]),y=Y2(p[2]);
    if(i===0||Math.abs(p[2]-last)>170){a.g.moveTo(x,y);}else a.g.lineTo(x,y);last=p[2];});
  a.g.stroke();
  for(let e=0;e<=7;e++){const x=X(Math.pow(10,e));a.line(x,oy2,x,oy2+4,C.muted,1);
    a.txt(['1','10','100','1k','10k','100k','1M','10M'][e],x,oy2+17,C.muted,9.5,'center');}
  /* cursor */
  const [cr,ci]=G(s.fm);
  const cg=dB(Math.hypot(cr,ci)), cp=Math.atan2(ci,cr)*180/Math.PI;
  a.line(X(s.fm),oy-H,X(s.fm),oy,C.b,1.5,[4,3]);
  a.line(X(s.fm),oy2-H2,X(s.fm),oy2,C.b,1.5,[4,3]);
  a.circ(X(s.fm),Y(cg),4,C.b,true);a.circ(X(s.fm),Y2(cp),4,C.b,true);
  /* frecuencias de corte */
  [[s.f1,C.c],[s.tipo==='pb'||s.tipo==='pa'?null:s.f2,C.f]].forEach(([f,col])=>{if(!f)return;
    a.line(X(f),oy,X(f),oy-H,col,1.2,[3,3]);
    a.txt(ING(f,'Hz'),X(f),oy-H-2,col,10,'center');});
  /* panel */
  const bx=486,by=72;
  a.txt('En el cursor',bx,by-20,C.b,13);
  a.txt('f',bx,by+4,C.muted,12);a.txt(ING(s.fm,'Hz'),bx+176,by+4,C.text,13,'right');
  a.txt('|G|',bx,by+30,C.muted,12);a.txt(N3(Math.hypot(cr,ci)),bx+176,by+30,C.text,13,'right');
  a.txt('|G| en dB',bx,by+56,C.muted,12);a.txt(sup(N2(cg))+' dB',bx+176,by+56,C.a,14,'right');
  a.txt('fase',bx,by+82,C.muted,12);a.txt(sup(N1(cp))+'º',bx+176,by+82,C.c,14,'right');
  a.txt('Frecuencias de corte',bx,by+120,C.muted,11.5);
  a.txt('f1 = '+ING(s.f1,'Hz'),bx,by+142,C.c,12.5);
  if(s.tipo!=='pb'&&s.tipo!=='pa')a.txt('f2 = '+ING(s.f2,'Hz'),bx,by+162,C.f,12.5);
  a.txt('pendiente final',bx,by+192,C.muted,11.5);
  a.txt({pb:'−20 dB/déc',pa:'0 dB/déc',pbanda:'−20 dB/déc',dos:'−40 dB/déc'}[s.tipo],bx,by+212,C.text,13);
  a.html('Pon el cursor justo en una frecuencia de corte y comprueba los <b>−3 dB</b> y los <b>−45º</b> que aporta cada polo. Mueve el cursor una década a cada lado y verás que la fase ya ha recorrido casi todo su cambio: de 0º a −90º entre f/10 y 10f.<br>Con <b>dos polos</b> la pendiente final es de −40 dB/década y la fase llega a −180º: eso es lo que hace inestable a un lazo realimentado, y es el puente con Regulación Automática.');
 }});

/* 7 · Filtros activos */
SIMS.filtros=el=>build(el,{w:680,h:300,
 selects:[{k:'tipo',l:'Filtro',v:'pb',opts:[['pb','Paso bajo activo (C en paralelo con R2)'],['pa','Paso alto activo (C en serie con R1)'],['banda','Paso banda (los dos encadenados)']]}],
 sliders:[{k:'R1',l:'R1',v:10,min:1,max:100,step:1,u:'kΩ'},{k:'R2',l:'R2',v:100,min:1,max:500,step:1,u:'kΩ'},
  {k:'C',l:'C',v:10,min:0.1,max:100,step:0.1,u:'nF'},{k:'orden',l:'Secciones encadenadas',v:1,min:1,max:4,step:1}],
 draw(a){a.clear();const s=a.st;
  const R1=s.R1*1e3,R2=s.R2*1e3,Cc=s.C*1e-9;
  const K=R2/R1;
  const fpb=1/(2*Math.PI*R2*Cc), fpa=1/(2*Math.PI*R1*Cc);
  function H(f){const w=2*Math.PI*f;let m=1,ph=0;
    for(let k=0;k<s.orden;k++){
      if(s.tipo==='pb'||s.tipo==='banda'){m*=K/Math.sqrt(1+Math.pow(w*R2*Cc,2));ph+=180-Math.atan(w*R2*Cc)*180/Math.PI;}
      if(s.tipo==='pa'||s.tipo==='banda'){const x=w*R1*Cc;
        if(s.tipo==='pa')m*=K*x/Math.sqrt(1+x*x);else m*=x/Math.sqrt(1+x*x);
        ph+=(s.tipo==='pa'?180:0)+90-Math.atan(x)*180/Math.PI;}}
    return [m,((ph+180)%360)-180];}
  const ox=52,oy=190,W=372,H2=128;
  const fa=1,fb=1e7;
  const X=f=>ox+Math.log10(f/fa)/Math.log10(fb/fa)*W;
  let gmax=-1e9;const pts=[];
  for(let e=0;e<=140;e++){const f=Math.pow(10,e/20);const [m,p]=H(f);
    const g=dB(m);pts.push([f,g,p]);gmax=Math.max(gmax,g);}
  gmax=Math.ceil((gmax+6)/20)*20; const gmin=gmax-120;
  const Y=g=>oy-(g-gmin)/(gmax-gmin)*H2;
  a.txt('|H|  [dB]',ox,oy-H2-14,C.muted,12);
  a.line(ox,oy,ox+W,oy,C.grid,1.3);a.line(ox,oy,ox,oy-H2,C.grid,1.3);
  for(let g=gmin;g<=gmax;g+=20){const y=Y(g);if(y<oy&&y>oy-H2)
    {a.line(ox,y,ox+W,y,C.grid,0.8);a.txt(String(g),ox-8,y+4,C.muted,9.5,'right');}}
  for(let e=0;e<=7;e++){const x=X(Math.pow(10,e));a.line(x,oy,x,oy+4,C.muted,1);
    a.txt(['1','10','100','1k','10k','100k','1M','10M'][e],x,oy+18,C.muted,9.5,'center');}
  a.txt('Hz',ox+W+10,oy+4,C.muted,10);
  /* banda pasante sombreada */
  const g0=Math.max(...pts.map(p=>p[1]));
  const ban=pts.filter(p=>p[1]>=g0-3);
  if(ban.length){const f1=ban[0][0],f2=ban[ban.length-1][0];
    alpha(a,0.1,()=>Rbox(a,X(f1),oy-H2,X(f2)-X(f1),H2,C.c,0));
    a.line(ox,Y(g0-3),ox+W,Y(g0-3),C.c,1.2,[4,3]);
    a.txt('−3 dB',ox+W+10,Y(g0-3)+4,C.c,10);}
  a.g.strokeStyle=C.a;a.g.lineWidth=2.4;a.g.beginPath();
  pts.forEach((p,i)=>{const x=X(p[0]),y=Y(Math.max(p[1],gmin));if(i===0)a.g.moveTo(x,y);else a.g.lineTo(x,y);});
  a.g.stroke();
  /* panel */
  const bx=464,by=62;
  a.txt('Ganancia en la banda',bx,by-18,C.muted,12);
  a.txt(N1(g0)+' dB  ( ×'+N2(Math.pow(10,g0/20))+' )',bx,by+6,C.a,15);
  const fc1=s.tipo==='pa'?fpa:fpb, fc2=s.tipo==='banda'?fpb:null;
  a.txt(s.tipo==='pa'?'Corte inferior fL':'Corte superior fH',bx,by+42,C.muted,12);
  a.txt(ING(s.tipo==='pa'?fpa:fpb,'Hz'),bx,by+66,C.c,15);
  if(s.tipo==='banda'){a.txt('Corte inferior fL',bx,by+100,C.muted,12);
    a.txt(ING(fpa,'Hz'),bx,by+124,C.f,15);
    const BW=Math.abs(fpb-fpa);
    a.txt('Ancho de banda',bx,by+156,C.muted,12);
    a.txt(ING(BW,'Hz'),bx,by+178,C.b,14);}
  else {a.txt('Pendiente',bx,by+100,C.muted,12);
    a.txt((s.tipo==='pb'?'−':'+')+N0(20*s.orden)+' dB/década',bx,by+124,C.text,14);
    a.txt('orden '+s.orden,bx,by+154,C.muted,12);
    a.txt('('+s.orden+' sección'+(s.orden>1?'es':'')+')',bx,by+174,C.muted,11.5);}
  a.html('Con '+s.orden+' sección'+(s.orden>1?'es encadenadas':'')+', la pendiente fuera de la banda es de <b>'+N0(20*s.orden)+' dB/década</b>: cada sección añade sus 20. El filtro <b>activo</b> permite encadenarlas sin que una cargue a la siguiente, porque la salida del AO tiene impedancia nula; con filtros pasivos, cada etapa estropearía la anterior.<br>La frecuencia de corte sale de la constante de tiempo: <b>f = 1/(2πRC)</b>, con R la resistencia que acompaña al condensador.');
 }});

/* 8 · Cuadripolos */
SIMS.cuadripolo=el=>build(el,{w:680,h:286,
 selects:[{k:'red',l:'Topología',v:'T',opts:[['T','Red en T'],['PI','Red en Π']]},
  {k:'par',l:'Juego de parámetros',v:'z',opts:[['z','Parámetros z (circuito abierto)'],['y','Parámetros y (cortocircuito)'],['h','Parámetros h (híbridos)']]}],
 sliders:[{k:'Za',l:'Za',v:1,min:0.1,max:20,step:0.1,u:'kΩ'},{k:'Zb',l:'Zb',v:2,min:0.1,max:20,step:0.1,u:'kΩ'},{k:'Zc',l:'Zc',v:5,min:0.1,max:50,step:0.1,u:'kΩ'}],
 draw(a){a.clear();const s=a.st;
  let z11,z12,z21,z22;
  if(s.red==='T'){z11=s.Za+s.Zc;z12=z21=s.Zc;z22=s.Zb+s.Zc;}
  else{const Ya=1/s.Za,Yb=1/s.Zb,Yc=1/s.Zc;
    const y11=Ya+Yc,y12=-Yc,y21=-Yc,y22=Yb+Yc;
    const dy=y11*y22-y12*y21;
    z11=y22/dy;z12=-y12/dy;z21=-y21/dy;z22=y11/dy;}
  const dz=z11*z22-z12*z21;
  const Y=[[z22/dz,-z12/dz],[-z21/dz,z11/dz]];
  const Hh=[[dz/z22,z12/z22],[-z21/z22,1/z22]];
  /* dibujo */
  const ox=56,oy=104,W=250;
  a.line(ox,oy,ox+W,oy,C.muted,1.6);
  a.line(ox,oy+80,ox+W,oy+80,C.muted,1.6);
  a.circ(ox,oy,4,C.text,true);a.circ(ox,oy+80,4,C.text,true);
  a.circ(ox+W,oy,4,C.text,true);a.circ(ox+W,oy+80,4,C.text,true);
  a.txt('1',ox-14,oy+5,C.muted,11);a.txt("1'",ox-16,oy+85,C.muted,11);
  a.txt('2',ox+W+8,oy+5,C.muted,11);a.txt("2'",ox+W+8,oy+85,C.muted,11);
  const caja=(x,y,w,h,txt,col)=>{Rbox(a,x,y,w,h,C.bg,4);alpha(a,0.16,()=>Rbox(a,x,y,w,h,col,4));Rline(a,x,y,w,h,col,4,1.4);
    a.txt(txt,x+w/2,y+h/2+4,col,11.5,'center');};
  if(s.red==='T'){
    caja(ox+40,oy-11,56,22,'Za '+N1(s.Za)+'k',C.a);
    caja(ox+W-96,oy-11,56,22,'Zb '+N1(s.Zb)+'k',C.c);
    a.line(ox+W/2,oy,ox+W/2,oy+26,C.muted,1.6);
    caja(ox+W/2-28,oy+26,56,28,'Zc '+N1(s.Zc)+'k',C.f);
    a.line(ox+W/2,oy+54,ox+W/2,oy+80,C.muted,1.6);}
  else{
    caja(ox+W/2-30,oy-11,60,22,'Zc '+N1(s.Zc)+'k',C.f);
    a.line(ox+46,oy,ox+46,oy+26,C.muted,1.6);
    caja(ox+18,oy+26,56,28,'Za '+N1(s.Za)+'k',C.a);
    a.line(ox+46,oy+54,ox+46,oy+80,C.muted,1.6);
    a.line(ox+W-46,oy,ox+W-46,oy+26,C.muted,1.6);
    caja(ox+W-74,oy+26,56,28,'Zb '+N1(s.Zb)+'k',C.c);
    a.line(ox+W-46,oy+54,ox+W-46,oy+80,C.muted,1.6);}
  /* matriz */
  const bx=380,by=74;
  const M={z:[[z11,z12],[z21,z22]],y:Y,h:Hh}[s.par];
  const nom={z:['z11','z12','z21','z22'],y:['y11','y12','y21','y22'],h:['h11','h12','h21','h22']}[s.par];
  const un={z:['kΩ','kΩ','kΩ','kΩ'],y:['mS','mS','mS','mS'],h:['kΩ','—','—','mS']}[s.par];
  a.txt('Matriz de parámetros '+s.par,bx,by-22,C.a,13.5);
  Rline(a,bx-10,by-8,250,86,C.grid,6,1.4);
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){
    const v=M[i][j], k=i*2+j;
    a.txt(nom[k],bx+j*122,by+16+i*36,C.muted,11);
    a.txt(N3(v)+' '+un[k],bx+j*122+104,by+16+i*36,C.text,12.5,'right');}
  const rec=Math.abs(z12-z21)<1e-9, sim=Math.abs(z11-z22)<1e-9;
  a.txt('Δz = '+N3(dz),bx-10,by+104,C.muted,12);
  a.txt(rec?'recíproca  (z12 = z21)':'NO recíproca',bx-10,by+128,rec?C.c:C.d,12.5);
  a.txt(sim?'simétrica  (z11 = z22)':'no simétrica  (z11 ≠ z22)',bx-10,by+150,sim?C.c:C.muted,12.5);
  a.txt('comprobación: h11 = Za + (Zb ∥ Zc)',bx-10,by+180,C.muted,11);
  const h11c=s.red==='T'?s.Za+(s.Zb*s.Zc)/(s.Zb+s.Zc):0;
  if(s.red==='T')a.txt(N3(h11c)+' kΩ  ✓',bx-10,by+198,C.c,12);
  a.html(s.par==='z'
   ? 'Los <b>z</b> se miden con las puertas en <b>circuito abierto</b>. En una red en T se leen del dibujo: z11 y z22 son «mi rama serie más la paralela», y z12 = z21 es la <b>rama paralela</b>.'
   : s.par==='y'
   ? 'Los <b>y</b> se miden en <b>cortocircuito</b> y son la matriz <b>inversa</b> de los z (la matriz completa, no elemento a elemento). En una red en Π se leen directamente del dibujo, igual que los z en una red en T.'
   : 'Los <b>h</b> son <b>híbridos</b>: h11 en ohmios, h22 en siemens y los otros dos adimensionales. Son los que describen un transistor, porque su entrada se comporta como una impedancia y su salida como una fuente de corriente: h11 = h_ie, h21 = h_fe = β.');
 }});

/* 9 · Efecto Miller */
SIMS.miller=el=>build(el,{w:680,h:286,
 sliders:[{k:'Av',l:'Ganancia de la etapa  |Av|',v:100,min:1,max:400,step:1},
  {k:'Cmu',l:'C base-colector  Cµ',v:5,min:0.5,max:30,step:0.5,u:'pF'},
  {k:'Cpi',l:'C base-emisor  Cπ',v:20,min:1,max:100,step:1,u:'pF'},
  {k:'Rth',l:'Resistencia de entrada',v:1.8,min:0.1,max:20,step:0.1,u:'kΩ'},
  {k:'Ro',l:'Resistencia de salida',v:4.7,min:0.1,max:50,step:0.1,u:'kΩ'},
  {k:'CL',l:'Capacidad de carga',v:10,min:1,max:100,step:1,u:'pF'}],
 draw(a){a.clear();const s=a.st;
  const CM=s.Cmu*(1+s.Av), Ci=s.Cpi+CM;
  const t1=s.Rth*1e3*Ci*1e-12, t2=s.Ro*1e3*s.CL*1e-12;
  const fH=1/(2*Math.PI*(t1+t2));
  const fH_sinM=1/(2*Math.PI*(s.Rth*1e3*(s.Cpi+s.Cmu)*1e-12+t2));
  /* esquema */
  const cx=180,cy=100;
  a.line(cx-110,cy,cx-20,cy,C.muted,1.6);
  a.txt('base',cx-150,cy+5,C.muted,11.5);
  a.txt('colector',cx+124,cy-16,C.muted,11.5);
  alpha(a,0.12,()=>Rbox(a,cx-20,cy-28,56,56,C.a,5));Rline(a,cx-20,cy-28,56,56,C.a,5,1.6);
  a.txt('Av',cx+8,cy+5,C.a,14,'center');
  a.txt('−'+N0(s.Av),cx+8,cy+22,C.a,10.5,'center');
  a.line(cx+36,cy,cx+120,cy,C.muted,1.6);
  /* Cmu puente */
  a.line(cx-70,cy,cx-70,cy-56,C.c,1.5);
  a.line(cx-70,cy-56,cx-12,cy-56,C.c,1.5);
  a.line(cx+48,cy-56,cx+86,cy-56,C.c,1.5);
  a.line(cx+86,cy-56,cx+86,cy,C.c,1.5);
  Rbox(a,cx-12,cy-68,60,24,C.bg,4);
  alpha(a,0.16,()=>Rbox(a,cx-12,cy-68,60,24,C.c,4));Rline(a,cx-12,cy-68,60,24,C.c,4,1.3);
  a.txt('Cµ '+N1(s.Cmu),cx+18,cy-52,C.c,10.5,'center');
  /* flecha a equivalente */
  a.arrow(cx-30,cy+70,cx+36,cy+70,C.muted,2);
  a.txt('teorema de Miller',cx+3,cy+60,C.muted,11,'center');
  /* equivalente */
  const ey=cy+130;
  a.line(cx-110,ey,cx+120,ey,C.muted,1.6);
  a.line(cx-70,ey,cx-70,ey+26,C.b,2.2);
  alpha(a,0.16,()=>Rbox(a,cx-112,ey+26,84,24,C.b,4));Rline(a,cx-112,ey+26,84,24,C.b,4,1.3);
  a.txt('CM = '+N0(CM)+' pF',cx-70,ey+42,C.b,10.5,'center');
  a.line(cx+86,ey,cx+86,ey+26,C.c,1.8);
  alpha(a,0.14,()=>Rbox(a,cx+50,ey+26,74,24,C.c,4));Rline(a,cx+50,ey+26,74,24,C.c,4,1.3);
  a.txt('≈ Cµ',cx+87,ey+42,C.c,10.5,'center');
  /* panel */
  const bx=400,by=56;
  const fil=[['CM = Cµ·(1+|Av|)',N0(CM)+' pF',C.b],
   ['Ci = Cπ + CM',N0(Ci)+' pF',C.a],
   ['τ entrada  Rth·Ci',N0(t1*1e9)+' ns',C.text],
   ['τ salida  Ro·CL',N0(t2*1e9)+' ns',C.text],
   ['Στ',N0((t1+t2)*1e9)+' ns',C.muted],
   ['fH ≈ 1/(2π·Στ)',ING(fH,'Hz'),C.a]];
  fil.forEach((f,i)=>{const y=by+i*34;
    a.txt(f[0],bx,y,C.muted,11.5);
    a.txt(f[1],bx+230,y+2,f[2],i===5?16:13.5,'right');});
  a.txt('sin tener en cuenta Miller saldría '+ING(fH_sinM,'Hz'),bx,by+216,C.d,11);
  a.txt('es decir, '+N1(fH_sinM/fH)+' veces más: el error típico',bx,by+234,C.d,11);
  a.html('Cµ vale sólo '+N1(s.Cmu)+' pF, pero al estar entre la entrada y la salida de un amplificador inversor <b>aparece multiplicado por 1+|Av|</b>: '+N0(CM)+' pF. Representa el <b>'+N0(100*CM/Ci)+' %</b> de la capacidad de entrada.<br>Baja la ganancia a 10 y mira cómo fH se multiplica: ganancia y ancho de banda están ligados. La forma de romper ese compromiso es el <b>cascodo</b>, que hace trabajar al transistor de entrada con ganancia casi 1.');
 }});

/* 10 · Respuesta en frecuencia completa */
SIMS.respfrec=el=>build(el,{w:680,h:300,
 sliders:[{k:'Amed',l:'Ganancia en la banda plana',v:150,min:5,max:500,step:5},
  {k:'fCs',l:'Corte del condensador de entrada',v:30,min:1,max:2000,step:1,u:'Hz'},
  {k:'fCc',l:'Corte del condensador de salida',v:12,min:1,max:2000,step:1,u:'Hz'},
  {k:'fCe',l:'Corte del desacoplo de emisor',v:220,min:1,max:5000,step:1,u:'Hz'},
  {k:'fH',l:'Frecuencia de corte superior',v:160,min:5,max:5000,step:5,u:'kHz'}],
 draw(a){a.clear();const s=a.st;
  const fL=Math.max(s.fCs,s.fCc,s.fCe);
  const fLc=Math.sqrt(s.fCs**2+s.fCc**2+s.fCe**2);
  const fHh=s.fH*1e3;
  const dom=[['Cs',s.fCs],['Cc',s.fCc],['CE',s.fCe]].sort((x,y)=>y[1]-x[1])[0];
  const ox=52,oy=190,W=380,H=128;
  const fa=1,fb=1e8;
  const X=f=>ox+Math.log10(f/fa)/Math.log10(fb/fa)*W;
  const A0=dB(s.Amed);
  const gmax=Math.ceil((A0+10)/10)*10, gmin=gmax-80;
  const Y=g=>oy-(g-gmin)/(gmax-gmin)*H;
  a.txt('|A|  [dB]',ox,oy-H-14,C.muted,12);
  a.line(ox,oy,ox+W,oy,C.grid,1.3);a.line(ox,oy,ox,oy-H,C.grid,1.3);
  for(let g=gmin;g<=gmax;g+=20){const y=Y(g);if(y<oy&&y>oy-H){a.line(ox,y,ox+W,y,C.grid,0.8);a.txt(String(g),ox-8,y+4,C.muted,9.5,'right');}}
  for(let e=0;e<=8;e++){const x=X(Math.pow(10,e));a.line(x,oy,x,oy+4,C.muted,1);
    a.txt(['1','10','100','1k','10k','100k','1M','10M','100M'][e],x,oy+18,C.muted,9,'center');}
  a.txt('Hz',ox+W+10,oy+4,C.muted,10);
  /* curva */
  a.g.strokeStyle=C.a;a.g.lineWidth=2.5;a.g.beginPath();
  for(let e=0;e<=160;e++){const f=Math.pow(10,e/20);
    let m=s.Amed;
    [s.fCs,s.fCc,s.fCe].forEach(fc=>{m*= (f/fc)/Math.sqrt(1+Math.pow(f/fc,2));});
    m/=Math.sqrt(1+Math.pow(f/fHh,2));
    const g=dB(m);const x=X(f),y=Y(Math.max(g,gmin));
    if(e===0)a.g.moveTo(x,y);else a.g.lineTo(x,y);}
  a.g.stroke();
  /* banda */
  a.line(ox,Y(A0-3),ox+W,Y(A0-3),C.c,1.2,[4,3]);
  a.txt('−3 dB',ox+W+10,Y(A0-3)+4,C.c,10);
  alpha(a,0.08,()=>Rbox(a,X(fLc),oy-H,X(fHh)-X(fLc),H,C.c,0));
  [[fLc,'fL',C.f],[fHh,'fH',C.b]].forEach(([f,t,col])=>{
    a.line(X(f),oy,X(f),oy-H,col,1.5,[5,3]);
    a.txt(t,X(f),oy-H-4,col,11.5,'center');});
  /* cortes de baja */
  [['Cs',s.fCs],['Cc',s.fCc],['CE',s.fCe]].forEach(([n,f],i)=>{
    a.line(X(f),oy+26+i*0,X(f),oy+34,C.muted,1,[2,2]);
    a.txt(n,X(f),oy+46,n===dom[0]?C.d:C.muted,10,'center');});
  a.txt('condensadores grandes',ox,oy+64,C.muted,10.5);
  a.txt('(acoplo y desacoplo)',ox,oy+80,C.muted,10.5);
  /* panel */
  const bx=464,by=58;
  const fil=[['Ganancia media',N1(A0)+' dB',C.a],
   ['fL (la mayor)',ING(fL,'Hz'),C.f],
   ['fL (√Σf²)',ING(fLc,'Hz'),C.f],
   ['Condensador dominante',dom[0],C.d],
   ['fH',ING(fHh,'Hz'),C.b],
   ['Ancho de banda',ING(fHh-fLc,'Hz'),C.c]];
  fil.forEach((f,i)=>{const y=by+i*34;
    a.txt(f[0],bx,y,C.muted,11.5);
    a.txt(f[1],bx+180,y+2,f[2],i===5?15:13,'right');});
  a.txt('GBW ≈ '+ING(s.Amed*(fHh-fLc),'Hz'),bx,by+212,C.muted,11.5);
  a.html('Dos familias de condensadores en dos extremos: los <b>grandes</b> (acoplo y desacoplo) marcan fL y los <b>pequeños</b> (parásitos del transistor) marcan fH. En la banda plana no actúa ninguno: los grandes son cortocircuitos y los pequeños, circuitos abiertos.<br>El condensador que domina fL es el de <b>'+dom[0]+'</b>, el de frecuencia de corte más alta. Mueve los otros dos y verás que apenas cambia nada: para ensanchar la banda por abajo hay que agrandar <b>ese</b> condensador y no los demás.');
 }});

document.querySelectorAll("[data-sim]").forEach(function(el){var k=el.getAttribute("data-sim");if(SIMS[k]){try{SIMS[k](el);}catch(e){console.error("sim "+k,e);}}else console.warn("sim no encontrada: "+k);});
})();
