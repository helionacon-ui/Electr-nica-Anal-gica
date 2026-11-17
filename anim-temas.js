/* Electrónica Analógica: una animación por tema */
(function(){var M=window.MANIM;if(!M)return;var U=M.util,C=M.C,nf=U.nf,lerp=U.lerp,ease=U.ease,seg=U.seg,clamp=U.clamp,RG=U.RG,W=640;
var LG=function(x){return Math.log(x)/Math.LN10;};

/* T1 efecto de carga */
M.reg('ea-t1',M.curva({title:'Modelo de amplificador: el efecto de carga',H:560,dur:18,p:[0.1,10],ax:{xr:[1,5],yr:[0,105],xt:[1,2,3,4,5],yt:[25,50,75,100],xf:function(v){return ['10 Ω','100 Ω','1 kΩ','10 kΩ','100 kΩ'][v-1];},yd:0,xl:'R_{L}',yl:'|A_{v}|'},h:300,
 curvas:[{f:function(x,Ro){var RL=Math.pow(10,x);return 100*RL/(RL+Ro*100);},c:'m'}],
 extra:function(D,A){D.line(A.X(1),A.Y(100),A.X(5),A.Y(100),C.mut,1,[4,4]);D.text('A_{v0} = 100',A.X(1.1),A.Y(100)-8,{s:14,c:C.mut});},
 read:function(Ro){return ['R_{o} = '+nf(Ro*100,0)+' Ω','A_{v} = A_{v0}·R_{L}/(R_{L} + R_{o}):  con R_{L} = 1 kΩ  → '+nf(100*1000/(1000+Ro*100),1)];},
 caps:[[6,'Un amplificador se modela con su ganancia en vacío A<sub>v0</sub>, su resistencia de entrada R<sub>i</sub> y su resistencia de salida R<sub>o</sub>.'],[12,'Al conectar una carga, R<sub>o</sub> y R<sub>L</sub> forman un divisor: la ganancia efectiva cae cuando R<sub>L</sub> es comparable a R<sub>o</sub>.'],[99,'Un buen amplificador de tensión tiene R<sub>o</sub> pequeña (y R<sub>i</sub> grande) para que la carga y la fuente apenas le afecten.']]}));

/* T2 cortocircuito virtual en el no inversor */
M.reg('ea-t2',M.base({title:'AO ideal: el cortocircuito virtual',H:560,dur:16,caps:[[5,'Con realimentación negativa, el AO ajusta su salida hasta que <i>v<sub>−</sub> = v<sub>+</sub></i>: es el cortocircuito virtual.'],[10,'En el montaje no inversor, v<sub>−</sub> es la salida dividida por R₁ y R₂. Si debe valer v<sub>in</sub>, la salida tiene que ser <i>(1 + R₂/R₁)·v<sub>in</sub></i>.'],[99,'Las curvas de v<sub>+</sub> (= v<sub>in</sub>) y v<sub>−</sub> coinciden en todo momento, y por las entradas no entra corriente.']]},
 function(D,t){var G=3,A=U.axes(D,{xr:[0,4*Math.PI],yr:[-3.6,3.6],xt:[],yt:[-3,-1,1,3],yd:0,xl:'t',yl:'v (V)'},{x:80,y:96,w:480,h:300,grid:true}),sh=t*1.2;
  U.plotf(D,A,function(x){return Math.sin(x-sh);},C.f,4);U.plotf(D,A,function(x){return Math.sin(x-sh);},C.hl,1.6,1);D.line(0,0,0,0);U.plotf(D,A,function(x){return G*Math.sin(x-sh);},C.m,2.8);
  D.text('v_{+} = v_{in}',A.X(0.3),A.Y(-2.8),{s:15,c:C.f});D.text('v_{−} (encima)',A.X(3.4),A.Y(-2.8),{s:15,c:C.hl});D.text('v_{out}',A.X(11),A.Y(3.3),{s:15,c:C.m});
  U.readout(D,['R_{1} = 1 kΩ,  R_{2} = 2 kΩ:  G = 1 + R_{2}/R_{1} = 3','v_{+} − v_{−} = 0    i_{+} = i_{−} = 0'],468);}));

/* T3 integrador */
M.reg('ea-t3',M.base({title:'Integrador con AO: de cuadrada a triangular',H:560,dur:16,caps:[[5,'En el integrador la realimentación es un condensador: <i>v<sub>out</sub> = −(1/RC)·∫v<sub>in</sub> dt</i>.'],[10,'Mientras la entrada vale +1 V la salida baja con pendiente constante −1/RC; cuando vale −1 V, sube.'],[99,'Una onda cuadrada se convierte en triangular. En la práctica se pone una resistencia en paralelo con C para que el offset no la sature.']]},
 function(D,t){var A=U.axes(D,{xr:[0,8],yr:[-1.6,1.6],xt:[2,4,6,8],yt:[-1,1],xd:0,yd:0,xl:'t (ms)',yl:'v (V)'},{x:80,y:96,w:480,h:300,grid:true}),xx=seg(t,1,14)*8,sq=function(x){return Math.floor(x)%2===0?1:-1;},tri=function(x){var f=x%2;return 0.5-(f<1?f:2-f);};
  var p=[],q=[];for(var i=0;i<=400;i++){var x=8*i/400;if(x>xx)break;p.push([A.X(x),A.Y(sq(x))]);q.push([A.X(x),A.Y(tri(x))]);}D.path(p,C.f,2.4);D.path(q,C.m,3);if(q.length)D.dot(q[q.length-1][0],q[q.length-1][1],6,C.m);
  D.text('v_{in}',A.X(0.1),A.Y(1.3),{s:15,c:C.f});D.text('v_{out}',A.X(0.6),A.Y(-0.85),{s:15,c:C.m});
  U.readout(D,['RC = 1 ms:  pendiente = ∓v_{in}/RC = ∓1 V/ms','v_{out} pico a pico = 1 V'],468);}));

/* T4 comparador con histéresis */
var rs=3;function rn(){rs=(rs*16807)%2147483647;return rs/2147483647-0.5;}var NZ=[];for(var i4=0;i4<=800;i4++)NZ.push(rn()*0.5);
M.reg('ea-t4',M.base({title:'Comparador con histéresis (Schmitt)',H:580,dur:16,caps:[[5,'Un comparador simple cambia de estado cada vez que la señal ruidosa cruza el umbral: rebota varias veces en cada cruce.'],[10,'Con realimentación positiva hay dos umbrales: la salida sube al pasar de V<sub>TH</sub> y solo baja al caer por debajo de V<sub>TL</sub>.'],[99,'Si el ruido es menor que la anchura de la histéresis (V<sub>TH</sub> − V<sub>TL</sub>), la salida conmuta una sola vez por cruce.']]},
 function(D,t){var A=U.axes(D,{xr:[0,8],yr:[-1.8,1.8],xt:[],yt:[-0.5,0.5],yd:1,xl:'t',yl:'v_{in}'},{x:80,y:90,w:480,h:200,grid:true}),B=U.axes(D,{xr:[0,8],yr:[-1.4,1.4],xt:[],yt:[-1,1],yd:0,xl:'t',yl:'v_{out}'},{x:80,y:330,w:480,h:110}),n=Math.floor(seg(t,0.5,14)*800);
  var f=function(i){var x=i/100;return 1.3*Math.sin(x*1.2)+NZ[i];},p=[],o=[],st=-1;D.line(A.X(0),A.Y(0.5),A.X(8),A.Y(0.5),C.bad,1.2,[5,4]);D.line(A.X(0),A.Y(-0.5),A.X(8),A.Y(-0.5),C.ok,1.2,[5,4]);D.text('V_{TH}',A.X(8),A.Y(0.5)-6,{s:13,c:C.bad,a:'right'});D.text('V_{TL}',A.X(8),A.Y(-0.5)+16,{s:13,c:C.ok,a:'right'});
  for(var i=0;i<=n;i++){var v=f(i);if(v>0.5)st=1;if(v<-0.5)st=-1;p.push([A.X(i/100),A.Y(v)]);o.push([B.X(i/100),B.Y(st)]);}D.path(p,C.f,1.6);D.path(o,C.m,2.8);
  U.readout(D,['umbrales ±0,5 V: el ruido de ±0,25 V no provoca rebotes'],520);}));

/* T5 producto ganancia-ancho de banda */
M.reg('ea-t5',M.curva({title:'AO real: producto ganancia × ancho de banda',H:560,dur:18,p:[0,2.5],ax:{xr:[0,7],yr:[0,110],xt:[0,1,2,3,4,5,6,7],yt:[20,40,60,80,100],xf:function(v){return ['1','10','100','1k','10k','100k','1M','10M'][v];},yd:0,xl:'f (Hz)',yl:'dB'},h:300,ghost:false,
 curvas:[{f:function(x){var f=Math.pow(10,x);return 20*LG(1e5/Math.sqrt(1+f*f/100));},c:'mut',w:2,fija:true},{f:function(x,g){var G=Math.pow(10,g),f=Math.pow(10,x);return 20*LG(G/Math.sqrt(1+Math.pow(f*G/1e6,2)));},c:'m'}],
 extra:function(D,A,g){var G=Math.pow(10,g),fc=1e6/G;D.dot(A.X(LG(fc)),A.Y(20*g-3),6,C.hl);D.line(A.X(LG(fc)),A.Y(0),A.X(LG(fc)),A.Y(20*g-3),C.hl,1.2,[4,3]);D.text('lazo abierto',A.X(1.4),A.Y(101),{s:14,c:C.mut});},
 read:function(g){var G=Math.pow(10,g);return ['ganancia en lazo cerrado G = '+nf(G,G<10?1:0)+' ('+nf(20*g,0)+' dB)','ancho de banda = GBW/G = 1 MHz/'+nf(G,G<10?1:0)+' = '+(1e6/G>=1000?nf(1e6/G/1000,1)+' kHz':nf(1e6/G,0)+' Hz')];},
 caps:[[6,'La ganancia en lazo abierto de un AO real es enorme (10⁵) pero cae a −20 dB/déc desde unos pocos hercios.'],[12,'Al cerrar el lazo con ganancia G, la respuesta es plana hasta tocar la curva de lazo abierto: el corte está en <i>f<sub>c</sub> = GBW/G</i>.'],[99,'Ganancia por ancho de banda es constante: si se pide más ganancia a una sola etapa se pierde banda. A veces conviene repartirla entre dos.']]}));

/* T6 filtro paso banda RC */
M.reg('ea-t6',M.curva({title:'Bode de un filtro paso banda',H:560,dur:18,p:[2,4.5],ax:{xr:[0,6],yr:[-50,6],xt:[0,1,2,3,4,5,6],yt:[-40,-20,-3],xf:function(v){return ['1','10','100','1k','10k','100k','1M'][v];},yd:0,xl:'f (Hz)',yl:'dB'},h:300,
 curvas:[{f:function(x,h){var f=Math.pow(10,x),f1=100,f2=Math.pow(10,h);return 20*LG((f/f1)/Math.sqrt(1+f*f/(f1*f1))/Math.sqrt(1+f*f/(f2*f2)));},c:'m'}],
 extra:function(D,A,h){D.line(A.X(0),A.Y(-3),A.X(6),A.Y(-3),C.mut,1,[4,4]);D.line(A.X(2),A.Y(-50),A.X(2),A.Y(6),C.f,1,[3,4]);D.line(A.X(h),A.Y(-50),A.X(h),A.Y(6),C.hl,1,[3,4]);},
 read:function(h){return ['paso alto f_{1} = 100 Hz    paso bajo f_{2} = '+(Math.pow(10,h)>=1000?nf(Math.pow(10,h)/1000,1)+' kHz':nf(Math.pow(10,h),0)+' Hz'),'pendientes: +20 dB/déc por debajo de f_{1},  −20 dB/déc por encima de f_{2}'];},
 caps:[[6,'Un paso alto RC seguido de un paso bajo (separados por un seguidor) deja pasar solo la banda entre f<sub>1</sub> y f<sub>2</sub>.'],[12,'En Bode cada polo o cero simple aporta una recta de ±20 dB/déc a partir de su frecuencia de corte.'],[99,'Si las dos esquinas se acercan, la banda se estrecha y las dos caídas se solapan: la ganancia máxima ya no llega a 0 dB.']]}));

/* T7 cuadripolos: parámetros */
M.reg('ea-t7',M.pasos({title:'Cuadripolos: cuatro parámetros para describirlo',H:560,dur:20,y0:115,lines:[
 {s:'Parámetros z:  v_{1} = z_{11}i_{1} + z_{12}i_{2},   v_{2} = z_{21}i_{1} + z_{22}i_{2}',size:18},
 {s:'Parámetros y:  i_{1} = y_{11}v_{1} + y_{12}v_{2},   i_{2} = y_{21}v_{1} + y_{22}v_{2}',size:18},
 {s:'Parámetros h:  v_{1} = h_{11}i_{1} + h_{12}v_{2},   i_{2} = h_{21}i_{1} + h_{22}v_{2}',size:18,c:'m'},
 {s:'h_{11} = h_{ie}: impedancia de entrada con la salida en corto',size:17},
 {s:'h_{21} = h_{fe} = β: ganancia de corriente con la salida en corto',size:17},
 {s:'h_{22} = h_{oe}: admitancia de salida con la entrada abierta',size:17},
 {s:'Cada parámetro se mide anulando una variable (corto o abierto)',size:17,c:'hl'}]}));

/* T8 efecto Miller */
M.reg('ea-t8',M.traza({title:'Respuesta en alta frecuencia: el efecto Miller',H:560,dur:16,x0:1,x1:200,ax:{xr:[0,210],yr:[0,12],xt:[50,100,150,200],yt:[3,6,9,12],xd:0,yd:0,xl:'|A_{v}|',yl:'f_{H} (MHz)'},h:300,
 f:function(a){var Cin=10+2*(1+a);return 1/(2*Math.PI*1000*Cin*1e-12)/1e6;},
 read:function(a){var Cin=10+2*(1+a);return ['|A_{v}| = '+nf(a,0)+'    C_{M} = C_{μ}(1 + |A_{v}|) = '+nf(2*(1+a),0)+' pF','f_{H} = 1/(2πR_{s}C_{in}) = '+nf(1/(2*Math.PI*1000*Cin*1e-12)/1e6,2)+' MHz'];},
 caps:[[5,'La capacidad C<sub>μ</sub> entre base y colector une la entrada con la salida, que va invertida y amplificada.'],[10,'Vista desde la entrada, se comporta como una capacidad <i>C<sub>μ</sub>(1 + |A<sub>v</sub>|)</i>: el teorema de Miller la multiplica por la ganancia.'],[99,'Con R<sub>s</sub> = 1 kΩ, C<sub>π</sub> = 10 pF y C<sub>μ</sub> = 2 pF, la frecuencia de corte superior cae al subir la ganancia. El cascodo evita este efecto.']]}));

/* T9 transconductancia del BJT */
M.reg('ea-t9',M.traza({title:'Pequeña señal: la transconductancia',H:560,dur:16,x0:0.6,x1:0.7,tangent:true,ax:{xr:[0.55,0.72],yr:[0,12],xt:[0.6,0.65,0.7],yt:[3,6,9,12],xd:2,yd:0,xl:'v_{BE} (V)',yl:'i_{C} (mA)'},h:300,
 f:function(v){return 1e-14*Math.exp(v/0.025)*1000;},
 read:function(v){var I=1e-14*Math.exp(v/0.025)*1000;return ['punto Q: V_{BE} = '+nf(v,3)+' V    I_{C} = '+nf(I,2)+' mA','g_{m} = I_{C}/V_{T} = '+nf(I/25*1000,0)+' mA/V    r_{π} = β/g_{m} = '+nf(100/(I/25),0)+' Ω'];},
 caps:[[5,'La corriente de colector depende exponencialmente de v<sub>BE</sub>: <i>i<sub>C</sub> = I<sub>S</sub>·e<sup>v<sub>BE</sub>/V<sub>T</sub></sup></i>.'],[10,'Para señales pequeñas alrededor del punto Q la curva se sustituye por su tangente, de pendiente <i>g<sub>m</sub> = I<sub>C</sub>/V<sub>T</sub></i>.'],[99,'Por eso los parámetros del modelo en pequeña señal (g<sub>m</sub>, r<sub>π</sub>) dependen de la polarización: más corriente, más ganancia.']]}));

/* T10 desensibilización por realimentación */
M.reg('ea-t10',M.traza({title:'Realimentación negativa: ganancia estable',H:560,dur:16,x0:0,x1:5,ax:{xr:[0,5.2],yr:[0,11],xt:[0,1,2,3,4,5],yt:[2,4,6,8,10],xf:function(v){return '10'+['⁰','¹','²','³','⁴','⁵'][v];},yd:0,xl:'A (lazo abierto)',yl:'A_{f}'},h:300,
 f:function(x){var A=Math.pow(10,x);return A/(1+A*0.1);},extra:function(D,A){D.line(A.X(0),A.Y(10),A.X(5.2),A.Y(10),C.mut,1.2,[5,4]);D.text('1/β = 10',A.X(5.1),A.Y(10)-8,{s:14,c:C.mut,a:'right'});},
 read:function(x){var A=Math.pow(10,x),Af=A/(1+A*0.1);return ['A = '+nf(A,0)+'    Aβ = '+nf(A*0.1,1)+'    A_{f} = A/(1 + Aβ) = '+nf(Af,3),'si A cambia un 50 %, A_{f} cambia un '+nf(50/(1+A*0.1),A>1000?3:1)+' %'];},
 caps:[[5,'Con realimentación negativa la ganancia es <i>A<sub>f</sub> = A/(1 + Aβ)</i>, con β la fracción de la salida que se resta a la entrada.'],[10,'Cuando la ganancia de lazo Aβ es grande, A<sub>f</sub> ≈ 1/β: solo depende de la red de realimentación (resistencias precisas).'],[99,'Las variaciones de A (temperatura, transistor, fabricación) se dividen por (1 + Aβ). Se sacrifica ganancia a cambio de estabilidad y linealidad.']]}));

/* T11 oscilador: criterio de Barkhausen */
M.reg('ea-t11',M.base({title:'Osciladores: el criterio de Barkhausen',H:560,dur:18,caps:[[6,'Un oscilador es un amplificador realimentado sin entrada. Con ganancia de lazo |Aβ| < 1 la oscilación se apaga.'],[12,'Con |Aβ| = 1 y fase total de 0° (o 360°) se mantiene. Es el criterio de Barkhausen.'],[99,'En la práctica se arranca con |Aβ| algo mayor que 1 para que el ruido crezca, y una no linealidad (saturación, control de ganancia) la limita.']]},
 function(D,t){var k=t<6?0:(t<12?1:2),g=[0.8,1,1.25][k],tt=(t%6)/6*8,A=U.axes(D,{xr:[0,8],yr:[-1.4,1.4],xt:[2,4,6,8],yt:[-1,1],xd:0,yd:0,xl:'t (ms)',yl:'v'},{x:80,y:96,w:480,h:300,grid:true}),s=(g-1)*1.2;
  var amp=function(x){var a=0.5*Math.exp(s*x);return k===2?Math.min(a,1):a;};var p=[];for(var i=0;i<=400;i++){var x=8*i/400;if(x>tt)break;p.push([A.X(x),A.Y(amp(x)*Math.sin(2*Math.PI*1.2*x))]);}D.path(p,[C.g,C.ok,C.m][k],2.6);
  U.readout(D,['|Aβ| = '+nf(g,2),['se amortigua','oscilación mantenida','crece hasta que la saturación la limita'][k]],468);}));

/* T12 clase B frente a clase AB */
M.reg('ea-t12',M.base({title:'Amplificador de potencia: distorsión de cruce',H:560,dur:16,caps:[[5,'En clase B cada transistor conduce media onda. Cerca de cero ninguno conduce hasta que |v<sub>in</sub>| supera unos 0,7 V: aparece la distorsión de cruce.'],[10,'En clase AB se polarizan ligeramente los dos transistores (con diodos o un multiplicador de V<sub>BE</sub>) para que siempre conduzca alguno.'],[99,'El rendimiento máximo de clase B es <i>η = π/4 ≈ 78,5 %</i> a plena salida; en AB es casi igual, sin distorsión de cruce.']]},
 function(D,t){var ab=t>8,A=U.axes(D,{xr:[0,4*Math.PI],yr:[-3.3,3.3],xt:[],yt:[-3,-1.5,1.5,3],yd:1,xl:'t',yl:'v (V)'},{x:80,y:96,w:480,h:300,grid:true}),sh=t*1.1;
  U.plotf(D,A,function(x){return 3*Math.sin(x-sh);},C.f,1.4,0.5);U.plotf(D,A,function(x){var v=3*Math.sin(x-sh);return ab?v*0.97:(Math.abs(v)<0.7?0:v-Math.sign(v)*0.7);},C.m,3);
  D.rect(A.X(0),A.Y(0.7),A.X(4*Math.PI)-A.X(0),A.Y(-0.7)-A.Y(0.7),null,RG(C.bad,ab?0.03:0.12));
  U.readout(D,[ab?'clase AB: salida sin zona muerta':'clase B: zona muerta de ±0,7 V'],468);}));
})();
