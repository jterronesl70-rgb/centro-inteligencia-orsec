(function(){
 const TEMPLATE_B='ORSEC_VISUAL_B_REFERENCIA.png?v=27113';
 const C={navy:'#06386d',navy2:'#004f8f',blue:'#1678d2',blue2:'#79bdf0',red:'#e3262e',orange:'#ff8a00',green:'#14a83b',purple:'#7140c7',gray:'#b7c1cd',text:'#083b70',white:'#fff',pale:'#f5f9fc',line:'#d6e4ef'};
 const N=v=>Number(v)||0, F=v=>N(v).toLocaleString('es-PE');
 const pct=(a,b)=>b?((a-b)/b*100):null;
 const P=v=>v==null||!isFinite(v)?'N/D':`${v>=0?'+':''}${v.toFixed(1)}%`;
 const nice=d=>String(d||'').replace('EXTORSION','EXTORSIÓN').replace('VIOLACION SEXUAL','VIOLACIÓN SEXUAL').replace('ROBO DE VEHICULOS','ROBO DE VEHÍCULOS').replace('APROPIACION ILICITA','APROPIACIÓN ILÍCITA').replace('USURPACION','USURPACIÓN');
 const load=src=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src});
 function tx(c,t,x,y,z=16,b=false,col=C.text,a='left'){c.fillStyle=col;c.font=`${b?700:400} ${z}px Arial, sans-serif`;c.textAlign=a;c.textBaseline='middle';c.fillText(String(t??''),x,y)}
 function fit(c,t,x,y,w,z=16,b=false,col=C.text,a='left'){let q=z;while(q>9){c.font=`${b?700:400} ${q}px Arial, sans-serif`;if(c.measureText(String(t)).width<=w)break;q--}tx(c,t,x,y,q,b,col,a)}
 function rr(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke()}}
 function line(c,x1,y1,x2,y2,col=C.line,w=1){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
 function rowsFor(y,t,p,prov){return DB.filter(r=>r.Anio==y&&r.TipoPeriodo===t&&r.Periodo===p&&r.Provincia===prov)}
 function dict(rs){const o={};rs.forEach(r=>o[r.Delito]=N(r.Casos));return o}
 function sum(rs){return rs.reduce((a,r)=>a+N(r.Casos),0)}
 function periodLabel(f,rs){return document.getElementById('periodo')?.selectedOptions?.[0]?.textContent||rs[0]?.EtiquetaPeriodo||f.periodo||''}
 function recolorMapaOriginal(c){
   // Recolorea únicamente los azules de la cartografía original, preservando geometría, bordes y rótulos.
   const x0=285,y0=235,w=535,h=375, im=c.getImageData(x0,y0,w,h), d=im.data;
   for(let i=0;i<d.length;i+=4){
     const r=d[i],g=d[i+1],b=d[i+2];
     // Solo tonos azules/cian del mapa; evita texto negro, blancos y otros elementos.
     if(b>105 && b>r*1.18 && b>g*1.03 && (b-r)>35){
       const lum=(r+g+b)/3;
       let q;
       if(lum<95) q=[198,0,35];          // rojo > 2,500
       else if(lum<135) q=[237,33,36];   // rojo 1,001–2,500
       else if(lum<175) q=[255,133,0];   // naranja 501–1,000
       else if(lum<205) q=[255,205,32];  // amarillo 251–500
       else q=[32,166,70];               // verde <= 250
       // mezcla moderada para conservar antialiasing y límites provinciales
       d[i]=Math.round(q[0]*.88+r*.12); d[i+1]=Math.round(q[1]*.88+g*.12); d[i+2]=Math.round(q[2]*.88+b*.12);
     }
   }
   c.putImageData(im,x0,y0);
 }
 async function generar(){
   if(typeof DB==='undefined'||!Array.isArray(DB)||!DB.length) throw new Error('datos.json aún no está cargado');
   const f=current(), y=N(f.anio)||2026, py=y-1, tipo=f.tipo||'ACUMULADO', per=f.periodo;
   const prov=(f.provincia&&f.provincia!=='TODAS')?f.provincia:'TOTAL REGION';
   const del=(f.delito&&f.delito!=='TODOS')?f.delito:'TODOS';
   const cur=rowsFor(y,tipo,per,prov), prv=rowsFor(py,tipo,per,prov);
   if(!cur.length) throw new Error('Sin registros para la selección actual');
   const dc=dict(cur), dp=dict(prv), label=periodLabel(f,cur);
   const activeCur=del==='TODOS'?cur:cur.filter(r=>r.Delito===del), activePrev=del==='TODOS'?prv:prv.filter(r=>r.Delito===del);
   const totalCur=sum(activeCur), totalPrev=sum(activePrev), totalVar=pct(totalCur,totalPrev);
   const can=document.createElement('canvas');can.width=1536;can.height=1024;const c=can.getContext('2d');
   const bg=await load(TEMPLATE_B);c.drawImage(bg,0,0,1536,1024);
   recolorMapaOriginal(c);
   // V27.11.4: limpiar rótulos heredados BLOQUE 3 / BLOQUE 4 de la plantilla.
   c.fillStyle=C.navy2;c.fillRect(251,153,1261,39);fit(c,'ANÁLISIS TERRITORIAL Y TENDENCIAS',270,173,650,20,true,C.white);
   c.fillStyle=C.navy2;c.fillRect(251,618,1261,39);fit(c,'COMPARATIVO DE PRINCIPALES DELITOS',270,638,650,20,true,C.white);

   // Contexto global en cabecera
   c.fillStyle=C.navy2;c.fillRect(1218,78,300,28);tx(c,'PERÍODO DE ANÁLISIS',1368,92,16,true,C.white,'center');
   rr(c,1218,106,300,62,0,'rgba(255,255,255,.98)',null);
   fit(c,`Año: ${y}  |  ${tipo==='MENSUAL'?'Mensual':'Acumulado'}: ${label}`,1234,126,270,14,true,C.text);
   fit(c,`Provincia: ${prov==='TOTAL REGION'?'Todas':nice(prov)}  |  Delito: ${del==='TODOS'?'Todos':nice(del)}`,1234,151,270,13,true,C.text);

   // Lateral limpio: primero se borra por completo la tipografía fija de la plantilla
   // y después se dibuja una sola capa dinámica.
   c.fillStyle='#063d72';c.fillRect(16,208,234,55);
   fit(c,`Total de casos (${label} ${y})`,28,237,204,14,false,C.white);
   const KP=[['HOMICIDIOS',C.red],['EXTORSION',C.orange],['DETONACIONES','#2ca83a'],['VIOLACION SEXUAL',C.purple],['ROBO DE VEHICULOS','#1293e8']];
   const yRows=[265,394,523,652,781];
   KP.forEach(([d,col],i)=>{
      const yy=yRows[i],a=N(dc[d]),b=N(dp[d]),v=pct(a,b);
      c.fillStyle='#073d72';
      c.fillRect(100,yy-2,147,128);
      fit(c,nice(d),108,yy+18,130,13,true,C.white);
      tx(c,F(a),108,yy+58,38,true,C.white);
      tx(c,(v!=null&&v<=0?'↓ ':'↑ ')+P(v),108,yy+92,16,true,v!=null&&v<=0?'#52df72':'#ff5a5f');
      fit(c,`vs. mismo período ${py} (${F(b)})`,108,yy+116,130,9,false,'#dceafa');
   });

   // Encabezado del mapa limpio: cubre totalmente los textos fijos heredados.
   c.fillStyle=C.white;c.fillRect(270,190,548,62);
   fit(c,'Incidencia delictiva por provincia',285,207,330,18,true,C.text);
   fit(c,`(${del==='TODOS'?'Total de casos':nice(del)} – ${label} ${y})`,285,230,330,14,false,C.text);

   // Tarjeta total: se limpia completa para evitar la segunda línea heredada.
   c.fillStyle='#edf7ff';c.fillRect(620,188,202,122);
   rr(c,627,193,186,105,9,'#edf7ff',null);
   tx(c,prov==='TOTAL REGION'?'Total de casos en la región':'Total de casos selección',720,210,13,false,C.text,'center');
   tx(c,F(totalCur),720,247,30,true,C.text,'center');
   tx(c,(totalVar!=null&&totalVar<=0?'↓ ':'↑ ')+P(totalVar),720,279,18,true,totalVar!=null&&totalVar<=0?C.green:C.red,'center');
   fit(c,`vs. mismo período ${py}`,720,299,170,11,false,C.text,'center');

   // MAPA ORIGINAL RECUPERADO Y LIMPIO.
   // La cartografía original permanece intacta. Se eliminan las etiquetas/recuadros
   // dinámicos superpuestos que duplicaban cifras sobre el mapa.
   // La próxima capa cromática debe aplicarse sin sustituir la geometría original.

   // Cuadro comparativo completo
   c.fillStyle=C.white;c.fillRect(840,198,680,401);tx(c,'Cuadro comparativo de la incidencia delictiva',856,212,18,true,C.text);fit(c,`${prov==='TOTAL REGION'?'Región La Libertad':nice(prov)} – ${label} (${py} vs ${y})`,856,232,600,13,false,C.text);
   const x0=850,y0=251,cols=[0,250,375,500,610,670],headH=48;c.fillStyle=C.navy2;c.fillRect(x0,y0,660,headH);
   [['Delito'],[String(py)], [String(y)],['Variación','Absoluta'],['Variación','%']].forEach((parts,i)=>{const cx=x0+(cols[i]+cols[i+1])/2;if(parts.length===1)tx(c,parts[0],cx,y0+24,13,true,C.white,'center');else{tx(c,parts[0],cx,y0+16,12,true,C.white,'center');tx(c,parts[1],cx,y0+34,12,true,C.white,'center')}});
   const allDel=['HOMICIDIOS','EXTORSION','DETONACIONES','LESIONES','SECUESTRO AL PASO','VIOLACION SEXUAL','HURTOS','ROBOS','APROPIACION ILICITA','ESTAFA','USURPACION','ROBO DE VEHICULOS','VIOLENCIA FAMILIAR'];const list=del==='TODOS'?allDel:[del];const bodyH=247,rowH=Math.min(23,bodyH/Math.max(1,list.length));
   list.forEach((d,i)=>{const yy=y0+headH+i*rowH;c.fillStyle=i%2?'#f8fbfd':'#eaf4fb';c.fillRect(x0,yy,660,rowH);const a=N(dp[d]),b=N(dc[d]),dif=b-a,v=pct(b,a);fit(c,nice(d),860,yy+rowH/2,220,11,true,C.text);tx(c,F(a),x0+312,yy+rowH/2,11,true,C.text,'center');tx(c,F(b),x0+437,yy+rowH/2,11,true,C.text,'center');tx(c,(dif>=0?'+':'')+F(dif),x0+555,yy+rowH/2,11,true,dif<=0?C.green:C.red,'center');tx(c,P(v),x0+635,yy+rowH/2,11,true,v!=null&&v<=0?C.green:C.red,'center')});
   const tY=y0+headH+list.length*rowH+4;c.fillStyle=C.navy2;c.fillRect(x0,tY,660,37);tx(c,'Total general',860,tY+19,14,true,C.white);tx(c,F(totalPrev),x0+312,tY+19,13,true,C.white,'center');tx(c,F(totalCur),x0+437,tY+19,13,true,C.white,'center');tx(c,(totalCur-totalPrev>=0?'+':'')+F(totalCur-totalPrev),x0+555,tY+19,13,true,C.white,'center');tx(c,P(totalVar),x0+635,tY+19,13,true,C.white,'center');

   // Bloque 4 gráfico 5 indicadores
   c.fillStyle=C.white;c.fillRect(270,665,757,267);tx(c,'Comparativo por delito',286,682,17,true,C.text);fit(c,`(${py} vs ${y} – Total de casos)`,286,702,320,13,false,C.text);tx(c,`■ ${py}`,620,692,14,true,C.red);tx(c,`■ ${y}`,710,692,14,true,C.navy2);
   const chartD=KP.map(k=>k[0]),max=Math.max(1,...chartD.flatMap(d=>[N(dp[d]),N(dc[d])]));const cx=312,cy=726,cw=675,ch=145,gw=cw/chartD.length;[0,.25,.5,.75,1].forEach(q=>{const yy=cy+ch-ch*q;line(c,cx,yy,cx+cw,yy,'#d7e4ee');tx(c,F(Math.round(max*q)),cx-12,yy,9,false,C.text,'right')});
   chartD.forEach((d,i)=>{const a=N(dp[d]),b=N(dc[d]),v=pct(b,a),mid=cx+gw*i+gw/2,bw=30,ha=ch*a/max,hb=ch*b/max;c.fillStyle=C.red;c.fillRect(mid-bw-3,cy+ch-ha,bw,ha);c.fillStyle=C.navy2;c.fillRect(mid+3,cy+ch-hb,bw,hb);tx(c,F(a),mid-bw/2-3,cy+ch-ha-10,12,true,C.red,'center');tx(c,F(b),mid+bw/2+3,cy+ch-hb-10,12,true,C.green,'center');const nm=d==='ROBO DE VEHICULOS'?['Robo de','vehículos']:[nice(d).charAt(0)+nice(d).slice(1).toLowerCase()];nm.forEach((q,j)=>tx(c,q,mid,cy+ch+17+j*13,10,true,C.text,'center'));tx(c,(v!=null&&v<=0?'↓ ':'↑ ')+P(v),mid,cy+ch+52,17,true,v!=null&&v<=0?C.green:C.red,'center')});

   // Donut participación
   c.fillStyle=C.white;c.fillRect(1030,665,490,267);tx(c,'Participación de los principales delitos',1046,683,17,true,C.text);fit(c,`(Respecto al total de casos – ${y})`,1046,704,390,13,false,C.text);
   const shares=[['HURTOS','#ffd21f'],['EXTORSION','#168bea'],['ROBOS','#21a447'],['VIOLENCIA FAMILIAR','#e3262e'],['ROBO DE VEHICULOS','#6d36c7'],['DETONACIONES','#ff8a00'],['VIOLACION SEXUAL','#d94bc7'],['HOMICIDIOS','#79a9b8']];
   const otrosDelitos=['LESIONES','SECUESTRO AL PASO','APROPIACION ILICITA','ESTAFA','USURPACION'];
   const other=otrosDelitos.reduce((a,d)=>a+N(dc[d]),0);
   const seg=[...shares.map(([d,col])=>[nice(d),N(dc[d]),col]),['Otros',other,C.gray]],dtotal=Math.max(1,totalCur),centerX=1172,centerY=810,R=94,r=48;let ang=-Math.PI/2;
   seg.forEach(([name,val,col])=>{if(val<=0)return;const da=val/dtotal*Math.PI*2;c.beginPath();c.arc(centerX,centerY,R,ang,ang+da);c.arc(centerX,centerY,r,ang+da,ang,true);c.closePath();c.fillStyle=col;c.fill();ang+=da});c.beginPath();c.arc(centerX,centerY,r,0,Math.PI*2);c.fillStyle=C.white;c.fill();tx(c,'Total',centerX,centerY-13,12,true,C.text,'center');tx(c,F(totalCur),centerX,centerY+10,21,true,C.text,'center');tx(c,'casos',centerX,centerY+29,11,true,C.text,'center');
   seg.forEach(([name,val,col],i)=>{const yy=730+i*19;c.fillStyle=col;c.fillRect(1285,yy-6,10,10);fit(c,`${name} ${(val/dtotal*100).toFixed(1)}%`,1302,yy,205,9.5,true,C.text)});
   fit(c,'Otros = Lesiones, Secuestro al paso, Apropiación ilícita, Estafa y Usurpación',1285,914,220,9,true,C.text);

   // Pie institucional final: franja más baja, sin cubrir el lema lateral y sin texto heredado.
   c.fillStyle=C.white;
   c.fillRect(0,965,1536,59);
   tx(c,'Fuente: Unidad de Estadística de la Región Policial de La Libertad.',23,983,11,true,C.text);
   tx(c,'Elaboración: Observatorio Regional de Seguridad Ciudadana (ORSEC) – La Libertad.',23,1003,10,false,C.text);
   tx(c,'“Cada dato tiene un territorio. Cada territorio tiene personas. Cada persona merece un La Libertad Segura.”',1510,994,9.5,false,C.text,'right');
   tx(c,'ORSEC · VISUAL B FINAL',1510,1015,9,true,'#6d8192','right');
   return can.toDataURL('image/png');
 }
 window.orsecGenerarVisualB=generar;
 window.ORSEC_EXPERIMENTAL_BUILD='V27.12.0-VISUAL-B-FINAL-CERRADA';
})();
