const $=id=>document.getElementById(id);
const fmt=v=>{const a=Math.abs(v);if(a===0)return '0';if(a>=1e6)return (v/1e6).toPrecision(3).replace(/\.?0+$/,'')+'M';if(a>=1e4)return (v/1e3).toPrecision(3).replace(/\.?0+$/,'')+'k';if(a>=100)return String(Math.round(v));if(a>=1)return v.toPrecision(3).replace(/\.?0+$/,'');return v.toPrecision(2).replace(/\.?0+$/,'')};
const es=v=>String(v).replace('.',',');
const num=(v,d=2)=>es((+v).toFixed(d));
const rng=(a,b,n)=>Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1));
const val=id=>parseFloat($(id).value);
function bind(ids,fn){ids.forEach(i=>$(i).addEventListener('input',fn));fn();}
function out(id,t){const e=$(id+'-o');if(e)e.textContent=t;}
function freq(f){return f>=1e6?num(f/1e6,3)+' MHz':f>=1e3?num(f/1e3,3)+' kHz':num(f,2)+' Hz';}
function plotSVG(o,items){
  const W=o.w||640,H=o.h||210,m={l:40,r:14,t:14,b:28};
  const X=x=>+(m.l+(x-o.x0)/(o.x1-o.x0)*(W-m.l-m.r)).toFixed(2);
  const cl=y=>Math.max(o.y0,Math.min(o.y1,y));
  const Y=y=>+(H-m.b-(cl(y)-o.y0)/(o.y1-o.y0)*(H-m.t-m.b)).toFixed(2);
  let s=`<svg viewBox="0 0 ${W} ${H}" class="plot" role="img" aria-label="${o.label||'gráfica'}">`;
  for(const v of (o.yt||[])) s+=`<line class="grid" x1="${m.l}" x2="${W-m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="tk" x="${m.l-6}" y="${Y(v)+4}" text-anchor="end">${o.ytf?o.ytf(v):fmt(v)}</text>`;
  for(const v of (o.xt||[])) s+=`<text class="tk" x="${X(v)}" y="${H-9}" text-anchor="middle">${o.xtf?o.xtf(v):fmt(v)}</text>`;
  const base=(o.y0<=0&&o.y1>=0)?0:o.y0;
  s+=`<line class="ax" x1="${m.l}" x2="${W-m.r}" y1="${Y(base)}" y2="${Y(base)}"/>`;
  if(o.x0<=0&&o.x1>=0) s+=`<line class="ax" x1="${X(0)}" x2="${X(0)}" y1="${m.t}" y2="${H-m.b}"/>`;
  if(o.xl) s+=`<text class="lb" x="${W-m.r}" y="${Y(base)-6}" text-anchor="end">${o.xl}</text>`;
  if(o.yl) s+=`<text class="lb" x="${m.l+6}" y="${m.t+10}">${o.yl}</text>`;
  for(const it of items){
    const c=it.c||'s1';
    if(it.t==='stem'){ it.n.forEach((n,i)=>{ if(n<o.x0||n>o.x1) return; const yy=it.y[i]; s+=`<line class="st ${c}" x1="${X(n)}" x2="${X(n)}" y1="${Y(base)}" y2="${Y(yy)}"/><circle class="${c}" cx="${X(n)}" cy="${Y(yy)}" r="${it.hl===n?6:(it.r||3.5)}"/>`; }); }
    else if(it.t==='line'||it.t==='step'){ let d=''; it.x.forEach((x,i)=>{ if(it.t==='step'&&i>0) d+=`L${X(x)},${Y(it.y[i-1])}`; d+=(i?'L':'M')+X(x)+','+Y(it.y[i]); }); s+=`<path class="ln ${c}" d="${d}"${it.dash?' stroke-dasharray="5 4"':''}${it.w?` stroke-width="${it.w}"`:''}/>`; }
    else if(it.t==='area'){ let d=`M${X(it.x[0])},${Y(base)}`; it.x.forEach((x,i)=>{d+=`L${X(x)},${Y(it.y[i])}`}); d+=`L${X(it.x[it.x.length-1])},${Y(base)}Z`; s+=`<path class="ar ${c}" d="${d}"/>`; }
    else if(it.t==='poly'){ const d=it.pts.map((p,i)=>(i?'L':'M')+X(p[0])+','+Y(p[1])).join('')+'Z'; s+=`<path class="ar ${c}" d="${d}"/>`; }
    else if(it.t==='pt'){ s+=`<circle class="${c}" cx="${X(it.x)}" cy="${Y(it.y)}" r="${it.r||5}"/>`; }
    else if(it.t==='vline'){ s+=`<line class="vl ${c}" x1="${X(it.x)}" x2="${X(it.x)}" y1="${m.t}" y2="${H-m.b}" stroke-dasharray="3 4"/>`; }
    else if(it.t==='text'){ s+=`<text class="lb ${c}" x="${X(it.x)}" y="${Y(it.y)}" text-anchor="${it.a||'middle'}">${it.s}</text>`; }
  }
  return s+'</svg>';
}


/* ---------- vídeos incrustados (solo fuera del visor de artefactos) ---------- */
(function(){
  if(!/(^|\.)github\.io$|^localhost$|^127\./.test(location.hostname))return;
  document.querySelectorAll('.vlist li[data-yt]').forEach(function(li){
    var b=document.createElement('button');b.type='button';b.className='vplay';b.textContent='▶ Ver aquí';
    var box=null;
    b.addEventListener('click',function(){
      if(box){box.remove();box=null;b.textContent='▶ Ver aquí';return;}
      box=document.createElement('div');box.className='vframe';
      var f=document.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+li.dataset.yt;
      f.title='Vídeo de YouTube';f.loading='lazy';f.allowFullscreen=true;
      f.allow='accelerometer; encrypted-media; gyroscope; picture-in-picture';
      box.appendChild(f);li.appendChild(box);b.textContent='✕ Cerrar vídeo';
    });
    li.querySelector('a').after(b);
  });
})();
/* ---------- búsqueda en todo el sitio ---------- */
(function(){
  const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const PG=document.body.dataset.page;
  const NAMES={"index": "Portada", "empezar": "Cómo es el examen", "tema-1-2": "T1–2 Amplificadores y AO ideal", "tema-3": "T3 Aplicaciones lineales", "tema-4": "T4 Aplicaciones no lineales", "tema-5": "T5 AO real", "tema-6": "T6 Bode y filtros", "tema-7": "T7 Cuadripolos", "tema-8": "T8 Transistores en frecuencia", "realimentacion": "Realimentación y osciladores", "potencia": "Amplificadores de potencia", "examen-2025-26": "P1 curso 25-26 resuelto", "examenes": "Exámenes resueltos", "fuen": "Apuntes de Fuen", "problemas": "Problemas resueltos", "calculadoras": "Calculadoras de bolsillo", "autoevaluacion": "Autoevaluación", "formulario": "Formulario", "glosario": "Glosario", "plan": "Plan de estudio", "completa": "Guía completa"};
  const idx=[];
  document.querySelectorAll('main section').forEach(sec=>{
    const h=sec.querySelector('h2');const title=h?h.textContent:'';const tc=sec.getAttribute('style')||'';
    sec.querySelectorAll('h3,h4,p,li,figcaption,summary,dt,dd,td').forEach(el=>{
      const t=el.textContent.replace(/\s+/g,' ').trim();if(t.length<12)return;idx.push({el,title,t,n:norm(t),tc,p:PG});
    });
  });
  let remote=null,loading=false;
  function load(cb){
    if(remote){cb();return;} if(loading)return; loading=true;
    fetch('buscar.json').then(r=>r.json()).then(j=>{remote=PG==='completa'?[]:j.filter(e=>e.p!==PG).map(e=>Object.assign(e,{n:norm(e.t)}));cb();}).catch(()=>{remote=[];});
  }
  const inp=$('srch'),box=$('srch-out');
  function open_(el){let d=el.closest('details');while(d){d.open=true;d=d.parentElement.closest('details');}
    el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1900);}
  function show(){
    const q=norm(inp.value.trim());if(q.length<2){box.hidden=true;box.innerHTML='';return;}
    const w=q.split(/\s+/);
    const loc=idx.filter(e=>w.every(x=>e.n.includes(x))).slice(0,6);
    const rem=(remote||[]).filter(e=>w.every(x=>e.n.includes(x))).slice(0,6);
    box.hidden=false;box.innerHTML='';
    if(!loc.length&&!rem.length){box.textContent='Sin resultados. Prueba con otra palabra, por ejemplo «Miller» o «slew».';return;}
    const add=(r,here)=>{
      const b=document.createElement('button');b.type='button';b.className='sres';b.setAttribute('style',r.tc);
      const s=document.createElement('span');s.className='sres-t';s.textContent=r.title;
      if(!here){const pp=document.createElement('span');pp.className='sres-p';pp.textContent=NAMES[r.p]||r.p;s.appendChild(pp);}
      b.appendChild(s);
      const i=r.n.indexOf(w[0]);const a=Math.max(0,i-50);const sn=r.t.slice(a,a+150);
      b.appendChild(document.createTextNode((a>0?'… ':'')+sn+(a+150<r.t.length?' …':'')));
      b.addEventListener('click',()=>{ if(here)open_(r.el); else location.href=r.p+'.html#'+r.id; });
      box.appendChild(b);
    };
    loc.forEach(r=>add(r,true)); rem.forEach(r=>add(r,false));
  }
  inp.addEventListener('input',()=>{show();load(show);});
})();
/* ---------- ir a un ancla y abrir los desplegables que la contienen ---------- */
(function(){
  function go(){
    const h=decodeURIComponent(location.hash.slice(1));if(!h)return;
    const el=document.getElementById(h);if(!el)return;
    let d=el.closest('details');while(d){d.open=true;d=d.parentElement.closest('details');}
    setTimeout(()=>el.scrollIntoView({block:'start'}),60);
    setTimeout(()=>el.scrollIntoView({block:'start'}),900);
  }
  addEventListener('hashchange',go);addEventListener('load',go);
})();
/* ---------- índice lateral y botón de subir ---------- */
(function(){
  const links=[...document.querySelectorAll('.toc a')];
  const map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
  const heads=[...map.keys()].map(i=>$(i)).filter(Boolean);
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es_=>{es_.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.remove('on'));const a=map.get(e.target.id);if(a){a.classList.add('on');if(getComputedStyle(a.parentElement).display==='flex'){a.scrollIntoView({block:'nearest',inline:'center'});}}}});},{rootMargin:'-20% 0px -70% 0px'});
    heads.forEach(h=>io.observe(h));
  }
  const t=$('totop');const f=()=>t.classList.toggle('show',window.scrollY>600);addEventListener('scroll',f,{passive:true});f();
})();
/* ---------- instalable y sin conexión (solo en GitHub Pages) ---------- */
(function(){
  if('serviceWorker' in navigator && /(^|\.)github\.io$/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(function(){});
  const cur=document.querySelector('.toc a.cur');
  if(cur&&getComputedStyle(cur.parentElement).display==='flex')cur.scrollIntoView({block:'nearest',inline:'center'});
})();
