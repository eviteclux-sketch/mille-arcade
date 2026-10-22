// 1.000 — LES CLASSIQUES : 5 jeux sans fin inspirés des plus gros succès à un doigt
// (Stack, Stick Hero, Knife Hit, Color Switch, Helix Jump). Relance immédiate, record,
// combos « parfait », son qui monte, classement par jeu.
(function(){'use strict';
const K=window.__k;if(!K)return;
const C={bg:'#070709',fg:'#fff',p:'#D4FF00',red:'#FF2E4C',muted:'#2A2A31',mfg:'#8F8F99'};
const COL=['#D4FF00','#FF2E4C','#3B9BFF','#B46CFF'];
const NOTES=[523,587,659,698,784,880,988,1047,1175,1319,1397,1568];
const note=(i,v)=>K.tone(NOTES[Math.min(NOTES.length-1,i)],.12,'triangle',v||.12);
const rnd=(a,b)=>a+Math.random()*(b-a);
const TAU=Math.PI*2,mod=(a,m)=>((a%m)+m)%m;

// ---------------- the five games ----------------
const GAMES={
// ---------- EMPILE (Stack) ----------
stack:{name:'EMPILE',icon:'▤',hint:'TAPE POUR POSER LE BLOC',tip:'Pose chaque bloc pile sur le précédent. 3 parfaits d’affilée : le bloc regrandit.',
 init(S){const w0=Math.min(240,S.W*.6);S.w0=w0;S.bh=26;S.B=[{x:(S.W-w0)/2,w:w0}];S.cur={x:-w0,w:w0,dir:1};S.v=210;S.falls=[];S.cam=0;},
 down(S){if(S.dead)return;const pv=S.B[S.B.length-1],c=S.cur,off=c.x-pv.x;
  if(Math.abs(off)<=5){c.x=pv.x;S.combo++;note(S.combo);K.buzz(15);let w=c.w;if(S.combo>=3)w=Math.min(S.w0,w+10);const nx=pv.x-(w-c.w)/2;S.B.push({x:nx,w});S.pop('PARFAIT'+(S.combo>1?' ×'+S.combo:''),C.p);S.flash=.25;}
  else{const ov=c.w-Math.abs(off);if(ov<=0){S.falls.push({x:c.x,w:c.w,y:S.B.length,vy:0});S.die('À CÔTÉ');return;}
   const nx=Math.max(c.x,pv.x);S.falls.push({x:off>0?pv.x+pv.w:c.x,w:Math.abs(off),y:S.B.length,vy:0});S.B.push({x:nx,w:ov});S.combo=0;K.tone(330,.08,'square',.06);if(ov<10)S.pop('OUF !',C.red);}
  S.score++;const n=S.B[S.B.length-1];S.v=Math.min(520,210+S.score*7);S.cur={x:S.score%2?S.W:-n.w,w:n.w,dir:S.score%2?-1:1};},
 update(S,dt){const c=S.cur;if(!S.dead){c.x+=c.dir*S.v*dt;const lo=-c.w*.6,hi=S.W-c.w*.4;if(c.x>hi){c.x=hi;c.dir=-1;}if(c.x<lo){c.x=lo;c.dir=1;}}
  for(const f of S.falls){f.vy+=900*dt;f.y-=f.vy*dt/S.bh;}S.cam+=((Math.max(0,S.B.length-8))*S.bh-S.cam)*Math.min(1,dt*6);},
 draw(S,x){const base=S.H*.82,Y=i=>base-(i+1)*S.bh+S.cam,hue=i=>`hsl(${(70+i*9)%360},90%,${55+((i*3)%10)}%)`;
  for(let i=Math.max(0,S.B.length-30);i<S.B.length;i++){const b=S.B[i];x.fillStyle=hue(i);x.fillRect(b.x,Y(i),b.w,S.bh-2);}
  for(const f of S.falls){x.fillStyle='rgba(255,255,255,.35)';x.fillRect(f.x,base-(f.y+1)*S.bh+S.cam,f.w,S.bh-2);}
  if(!S.dead){x.fillStyle=hue(S.B.length);x.fillRect(S.cur.x,Y(S.B.length),S.cur.w,S.bh-2);}}},
// ---------- LE PONT (Stick Hero) ----------
stick:{name:'LE PONT',icon:'⊢',hint:'MAINTIENS, PUIS RELÂCHE',tip:'Fais pousser le pont et relâche. Au centre rouge : PARFAIT, ×2 points.',hold:true,
 init(S){S.py=S.H*.66;S.P=[{x:0,w:S.W*.22}];this.addP(S);S.hx=S.P[0].w-14;S.len=0;S.ang=0;S.ph='idle';S.camx=0;S.walk=0;},
 addP(S){const l=S.P[S.P.length-1],sc=Math.max(.45,1-S.score*.012),w=rnd(34,92)*sc,gap=rnd(50,S.W*.55);S.P.push({x:l.x+l.w+gap,w});},
 down(S){if(S.ph==='idle')S.ph='grow';},
 up(S){if(S.ph==='grow'){S.ph='rot';K.tone(440,.05,'square',.05);}},
 update(S,dt){const cur=S.P[S.P.length-2],nx=S.P[S.P.length-1],sx=cur.x+cur.w;
  if(S.ph==='grow'){S.len+=Math.min(420,300+S.score*4)*dt;}
  else if(S.ph==='rot'){S.ang=Math.min(Math.PI/2,S.ang+dt*Math.PI/2/.25);if(S.ang>=Math.PI/2){const end=sx+S.len;
    if(end>=nx.x&&end<=nx.x+nx.w){const pf=Math.abs(end-(nx.x+nx.w/2))<=4;S.score+=pf?2:1;if(pf){S.combo++;note(S.combo);S.pop('PARFAIT ×2',C.p);S.flash=.25;}else{S.combo=0;note(0,.08);}K.buzz(15);S.ph='walk';S.goal=nx.x+nx.w-14;}
    else{S.ph='fallwalk';S.goal=end;if(Math.abs(end-nx.x)<12||Math.abs(end-(nx.x+nx.w))<12)S.pop('PRESQUE !',C.red);}}}
  else if(S.ph==='walk'||S.ph==='fallwalk'){S.hx=Math.min(S.goal,S.hx+320*dt);if(S.hx>=S.goal){if(S.ph==='walk'){S.ph='shift';this.addP(S);S.len=0;S.ang=0;}else{S.ph='drop';S.hy=0;}}}
  else if(S.ph==='drop'){S.ang=Math.min(Math.PI,S.ang+dt*5);S.hy+=dt*900;if(S.hy>S.H)S.die('DANS LE VIDE');}
  else if(S.ph==='shift'){const t=S.P[S.P.length-2].x-S.W*.04;S.camx+=(t-S.camx)*Math.min(1,dt*7);if(Math.abs(t-S.camx)<1){S.camx=t;S.ph='idle';}}
  if(S.ph==='drop'&&S.dead)return;},
 draw(S,x){const cx=S.camx,py=S.py;for(const p of S.P){x.fillStyle='#24242c';x.fillRect(p.x-cx,py,p.w,S.H-py);x.fillStyle=C.red;x.fillRect(p.x+p.w/2-4-cx,py,8,5);}
  const cur=S.P[S.P.length-2]||S.P[0],sx=cur.x+cur.w-cx;
  if(S.ph!=='shift'||S.len){x.save();x.translate(sx,py);x.rotate(S.ang);x.fillStyle=C.fg;x.fillRect(-2,-S.len,4,S.len);x.restore();}
  x.fillStyle=C.p;x.fillRect(S.hx-cx-12,py-22+(S.hy||0),14,22);}},
// ---------- LANCER (Knife Hit) ----------
knife:{name:'LANCER',icon:'⟂',hint:'TAPE POUR LANCER',tip:'Plante toutes les lames dans le disque. Ne touche jamais une lame déjà plantée.',
 init(S){S.cy=S.H*.34;S.r=Math.min(80,S.W*.2);S.stage=0;this.stageInit(S);S.fly=null;S.bits=[];},
 stageInit(S){S.stage++;S.rot=0;S.st=0;S.need=Math.min(11,5+S.stage);S.left=S.need;S.boss=S.stage%5===0;S.K=[];const pre=Math.min(4,Math.floor(S.stage/2));
  for(let i=0;i<pre;i++)S.K.push(rnd(0,TAU));S.spin=(1.6+S.stage*.12)*(Math.random()<.5?1:-1);S.pop(S.boss?'BOSS !':'ÉTAPE '+S.stage,S.boss?C.red:C.p);},
 down(S){if(S.dead||S.fly||S.left<=0||S.wait)return;S.fly={y:S.H*.84};K.tone(700,.04,'square',.05);},
 update(S,dt){S.st+=dt;const w=S.boss?S.spin*(1+.9*Math.sin(S.st*2.3)):S.spin*(S.stage>2?1+.45*Math.sin(S.st*1.3):1);S.rot+=w*dt;
  for(const b of S.bits){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=900*dt;}
  if(S.wait){S.wait-=dt;if(S.wait<=0){S.wait=0;this.stageInit(S);}return;}
  if(S.fly){S.fly.y-=2200*dt;if(S.fly.y<=S.cy+S.r){const la=mod(Math.PI/2-S.rot,TAU);
    if(S.K.some(k=>{const d=Math.abs(mod(k-la+Math.PI,TAU)-Math.PI);return d<.2;})){S.bounce={x:S.W/2,y:S.cy+S.r,vx:rnd(-200,200),vy:-300,a:0};S.fly=null;S.die('LAME CONTRE LAME');return;}
    S.K.push(la);S.fly=null;S.left--;S.score++;S.combo++;note(Math.min(11,S.need-S.left));K.buzz(12);S.shake=4;
    if(S.left<=0){S.flash=.35;for(let i=0;i<14;i++)S.bits.push({x:S.W/2,y:S.cy,vx:rnd(-380,380),vy:rnd(-500,-100),c:S.boss?C.red:'#8a6a4a'});S.K=[];S.score+=S.boss?10:3;S.pop(S.boss?'BOSS BATTU +10':'+3',C.p);S.wait=.7;}}}
  if(S.bounce){const b=S.bounce;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=1200*dt;b.a+=dt*12;}},
 knifeShape(x,len){x.fillStyle='#cfcfd6';x.fillRect(-3,0,6,len*.62);x.fillStyle=C.fg;x.beginPath();x.moveTo(-3,len*.62);x.lineTo(3,len*.62);x.lineTo(0,len);x.fill();x.fillStyle='#5a5a66';x.fillRect(-4,-len*.38,8,len*.38);},
 draw(S,x){const cx=S.W/2,cy=S.cy,L=56;
  if(S.K)for(const k of S.K){const a=k+S.rot;x.save();x.translate(cx+Math.cos(a)*(S.r+L*.55),cy+Math.sin(a)*(S.r+L*.55));x.rotate(a-Math.PI/2);x.scale(1,-1);this.knifeShape(x,L);x.restore();}
  if(!S.wait){x.fillStyle=S.boss?'#5a1622':'#6b4f35';x.beginPath();x.arc(cx,cy,S.r,0,TAU);x.fill();x.strokeStyle=S.boss?C.red:'#8a6a4a';x.lineWidth=5;x.stroke();
   x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=2;for(let i=1;i<4;i++){x.beginPath();x.arc(cx,cy,S.r*i/4,S.rot,S.rot+4);x.stroke();}}
  for(const b of S.bits){x.fillStyle=b.c;x.fillRect(b.x-6,b.y-6,12,12);}
  if(S.fly){x.save();x.translate(cx,S.fly.y);x.scale(1,-1);x.translate(0,-L);this.knifeShape(x,L);x.restore();}
  else if(!S.dead&&S.left>0&&!S.wait){x.save();x.translate(cx,S.H*.84);x.scale(1,-1);x.translate(0,-L);this.knifeShape(x,L);x.restore();}
  if(S.bounce){const b=S.bounce;x.save();x.translate(b.x,b.y);x.rotate(b.a);this.knifeShape(x,L);x.restore();}
  for(let i=0;i<S.need;i++){x.fillStyle=i<S.need-S.left?'#3a3a44':C.fg;x.fillRect(16,S.H*.86-i*14,14,8);}}},
// ---------- COULEURS (Color Switch) ----------
color:{name:'COULEURS',icon:'◐',hint:'TAPE POUR SAUTER',tip:'Saute et traverse seulement par ta couleur. La pastille change ta couleur.',
 init(S){S.by=0;S.vy=0;S.cam=-S.H*.7;S.bc=0;S.started=false;S.O=[];S.next=-260;for(let i=0;i<4;i++)this.addO(S);},
 addO(S){const y=S.next,lv=S.O.length,sp=(1.4+Math.min(2,lv*.08))*(Math.random()<.5?1:-1),t=lv<2?'ring':['ring','bar','ring2','ring'][Math.floor(Math.random()*4)];
  S.O.push({t,y,rot:rnd(0,TAU),sp,r:t==='ring2'?96:84,star:true,sw:{y:y-150,used:false}});S.next-=300;},
 down(S){if(S.dead)return;S.started=true;S.vy=-470;K.tone(620,.04,'triangle',.06);},
 hit(S,o){const th=8,br=11,dy=S.by-o.y;
  if(o.t==='bar'){if(Math.abs(dy)>th+br)return false;const seg=S.W/2,off=mod(S.W/2-(o.rot*80),seg*4);return Math.floor(off/seg)!==S.bc;}
  const rings=o.t==='ring2'?[[o.r,o.rot],[o.r-34,-o.rot*1.3]]:[[o.r,o.rot]];
  for(const[r,rot]of rings){if(Math.abs(Math.abs(dy)-r)<th+br){const wa=dy<0?-Math.PI/2:Math.PI/2,idx=Math.floor(mod(wa-rot,TAU)/(TAU/4));if(idx!==S.bc)return true;}}return false;},
 update(S,dt){if(S.started){S.vy+=1300*dt;S.by+=S.vy*dt;}S.cam=Math.min(S.cam,S.by-S.H*.55);
  for(const o of S.O){o.rot+=o.sp*dt;if(!S.dead&&this.hit(S,o)){S.die('MAUVAISE COULEUR');return;}
   if(o.star&&Math.abs(S.by-o.y)<14){o.star=false;S.score++;S.combo++;note(S.combo);K.buzz(10);}
   if(!o.sw.used&&Math.abs(S.by-o.sw.y)<16){o.sw.used=true;let c;do{c=Math.floor(Math.random()*4);}while(c===S.bc);S.bc=c;K.tone(990,.06,'sine',.08);}}
  if(S.O[0]&&S.O[0].y-S.cam>S.H+200){S.O.shift();}if(S.O.length<4)this.addO(S);
  if(S.started&&S.by-S.cam>S.H+20)S.die('TOMBÉ');
  for(const o of S.O)o.sp*=1+dt*.004;},
 draw(S,x){const cx=S.W/2,Y=y=>y-S.cam;
  if(!S.started){x.fillStyle='#24242c';x.fillRect(cx-60,Y(14),120,8);}
  for(const o of S.O){const oy=Y(o.y);if(oy<-200||oy>S.H+200)continue;
   if(o.t==='bar'){const seg=S.W/2,off=o.rot*80,n0=Math.floor(-off/seg)-1;for(let n=n0;n<n0+5;n++){x.fillStyle=COL[mod(n,4)];x.fillRect(off+n*seg+1,oy-8,seg-2,16);}}
   else{const rings=o.t==='ring2'?[[o.r,o.rot],[o.r-34,-o.rot*1.3]]:[[o.r,o.rot]];x.lineWidth=16;for(const[r,rot]of rings)for(let k=0;k<4;k++){x.strokeStyle=COL[k];x.beginPath();x.arc(cx,oy,r,rot+k*TAU/4+.03,rot+(k+1)*TAU/4-.03);x.stroke();}}
   if(o.star){x.fillStyle=C.fg;x.font='900 22px Inter';x.textAlign='center';x.fillText('★',cx,oy+8);}
   if(!o.sw.used){const sy=Y(o.sw.y);for(let k=0;k<4;k++){x.fillStyle=COL[k];x.beginPath();x.moveTo(cx,sy);x.arc(cx,sy,11,k*TAU/4,(k+1)*TAU/4);x.fill();}}}
  x.fillStyle=COL[S.bc];x.beginPath();x.arc(cx,Y(S.by),11,0,TAU);x.fill();}},
// ---------- SPIRALE (Helix Jump) ----------
helix:{name:'SPIRALE',icon:'◎',hint:'GLISSE POUR TOURNER LA TOUR',tip:'Glisse le doigt pour tourner la tour et fais tomber la balle dans les trous. Évite le rouge.',drag:true,
 init(S){S.R=Math.min(150,S.W*.38);S.ri=S.R*.22;S.ry=.3;S.D=118;S.rot=0;S.by=-60;S.vy=0;S.cam=-S.H*.3;S.disc=[];S.pass=0;S.parts=[];for(let i=0;i<14;i++)this.addD(S,i);},
 addD(S,i){const seg=Array(12).fill(0);if(i===0){seg[3]=seg[4]=1;}else{const g=Math.floor(rnd(0,12)),n=Math.random()<.5?2:3;for(let k=0;k<n;k++)seg[(g+k)%12]=1;
   const nd=Math.min(5,Math.floor((i-2)/3));for(let k=0;k<nd;k++){const j=Math.floor(rnd(0,12));if(!seg[j]&&!seg[(j+1)%12]&&!seg[(j+11)%12])seg[j]=2;}}
  S.disc.push({i,y:i*S.D,seg,broken:false});},
 move(S,dx){S.rot+=dx*.011;},
 down(){},
 under(S,d){const la=mod(Math.PI/2-S.rot,TAU);return d.seg[Math.floor(la/(TAU/12))%12];},
 update(S,dt){if(S.dead)return;const py=S.by;S.vy=Math.min(900,S.vy+1500*dt);S.by+=S.vy*dt;
  for(const d of S.disc){if(d.broken)continue;if(S.vy>0&&py<d.y&&S.by>=d.y){const t=this.under(S,d);
    if(t===1){S.pass++;S.score+=Math.min(S.pass,5);S.combo=S.pass;note(S.pass-1);K.buzz(8);if(S.pass===3)S.pop('BOUM !',C.p);continue;}
    if(S.pass>=3){d.broken=true;S.score+=3;S.flash=.3;S.shake=6;S.pop('CASSÉ +3',C.p);for(let k=0;k<12;k++)S.parts.push({x:S.W/2+rnd(-S.R,S.R),y:d.y,vx:rnd(-300,300),vy:rnd(-400,-100)});S.pass=0;continue;}
    if(t===2){S.by=d.y;S.die('ZONE ROUGE');return;}
    S.by=d.y-.1;S.vy=-560;S.pass=0;S.combo=0;K.tone(260,.05,'sine',.08);}}
  S.cam=Math.max(S.cam,S.by-S.H*.32);
  while(S.disc.length&&S.disc[0].y-S.cam<-S.H)S.disc.shift();const last=S.disc[S.disc.length-1];if(last.y-S.cam<S.H*1.5)this.addD(S,last.i+1);
  for(const p of S.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=1200*dt;}},
 seg(S,x,cx,cy,a0,a1,col,dy){const n=6,R=S.R,ri=S.ri,ry=S.ry;x.fillStyle=col;x.beginPath();for(let k=0;k<=n;k++){const a=a0+(a1-a0)*k/n;x.lineTo(cx+R*Math.cos(a),cy+dy+R*ry*Math.sin(a));}
  for(let k=n;k>=0;k--){const a=a0+(a1-a0)*k/n;x.lineTo(cx+ri*Math.cos(a),cy+dy+ri*ry*Math.sin(a));}x.closePath();x.fill();},
 draw(S,x){const cx=S.W/2,vis=S.disc.filter(d=>!d.broken&&d.y-S.cam>-80&&d.y-S.cam<S.H+80);
  const pass=(front)=>{for(const d of vis){const cy=d.y-S.cam,hue=(d.i*23)%360;for(let j=0;j<12;j++){const t=d.seg[j];if(t===1)continue;const a0=S.rot+j*TAU/12,a1=a0+TAU/12,mid=Math.sin((a0+a1)/2);if((mid>0)!==front)continue;
    const top=t===2?C.red:`hsl(${hue},85%,60%)`,side=t===2?'#8a1022':`hsl(${hue},70%,32%)`;if(front)this.seg(S,x,cx,cy,a0,a1,side,10);this.seg(S,x,cx,cy,a0,a1,top,0);}}};
  pass(false);x.fillStyle='#2a2a33';x.fillRect(cx-S.ri,0,S.ri*2,S.H);pass(true);
  for(const p of S.parts){x.fillStyle='#8f8f99';x.fillRect(p.x-5,p.y-S.cam-5,10,10);}
  const bx=cx,byS=S.by-S.cam+S.R*S.ry*.62-12;x.fillStyle=S.pass>=3?C.red:C.p;x.beginPath();x.arc(bx,byS,12,0,TAU);x.fill();}}
};
const ORDER=['helix','color','knife','stack','stick'];

// ---------------- runner ----------------
let root,cv,cx,S=null,id=null,raf=0,last=0,deadAt=0,pd=false,lastX=null;
function el(){if(root)return;root=document.createElement('div');root.id='cl';root.hidden=true;
 root.style.cssText='position:absolute;inset:0;z-index:95;background:#070709;touch-action:none;user-select:none;-webkit-user-select:none';
 root.innerHTML='<canvas id="clc" style="position:absolute;inset:0;width:100%;height:100%"></canvas>'+
  '<button id="clb" style="position:absolute;left:12px;top:calc(12px + env(safe-area-inset-top,0px));z-index:2;color:#fff;border:1px solid #2A2A31;border-radius:999px;padding:9px 14px;font:900 13px Inter,sans-serif;letter-spacing:1px;background:#070709">← JEUX</button>'+
  '<div id="cld" hidden style="position:absolute;left:16px;right:16px;bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:2;background:#121215;border-radius:22px;padding:20px;text-align:center;color:#fff;font-family:Inter,sans-serif"></div>';
 document.getElementById('app').appendChild(root);cv=root.querySelector('#clc');cx=cv.getContext('2d');
 root.querySelector('#clb').addEventListener('click',e=>{e.stopPropagation();close();});
 const pos=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];};
 cv.addEventListener('pointerdown',e=>{e.preventDefault();pd=true;lastX=e.clientX;const[px,py]=pos(e);press(px,py);});
 cv.addEventListener('pointermove',e=>{if(!pd||!S||S.dead||!GAMES[id].move)return;const dx=e.clientX-lastX;lastX=e.clientX;GAMES[id].move(S,dx);if(!S.started){S.started=true;}});
 const up=()=>{pd=false;if(S&&!S.dead&&GAMES[id].up)GAMES[id].up(S);};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 document.addEventListener('keydown',e=>{if(root.hidden||e.repeat||e.target.tagName==='INPUT')return;if(e.key===' '||e.key==='Enter'){e.preventDefault();press(S?S.W/2:0,0);}
  if(id==='helix'&&S&&!S.dead&&(e.key==='ArrowLeft'||e.key==='ArrowRight'))GAMES.helix.move(S,e.key==='ArrowLeft'?-28:28);});
 document.addEventListener('keyup',e=>{if(root.hidden)return;if(e.key===' '||e.key==='Enter')up();});
 window.addEventListener('resize',()=>{if(!root.hidden)fit();});}
function fit(){const r=root.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);cv.width=r.width*d;cv.height=r.height*d;cx.setTransform(d,0,0,d,0,0);return r;}
function best(){const b=K.META.cbest||{};return b[id]||0;}
function start(){const r=fit();S={W:r.width,H:r.height,score:0,combo:0,dead:false,started:!GAMES[id].drag,pops:[],flash:0,shake:0,t:0,
 pop(m,c){this.pops.push({m,c,t:0});},die(m){if(this.dead)return;this.dead=true;this.why=m;deadAt=performance.now();K.tone(140,.25,'sawtooth',.08);K.buzz([60,40,60]);this.shake=8;setTimeout(over,550);}};
 GAMES[id].init(S);$('cld').hidden=true;K.ev('classic_start',{game:id});}
const $=i=>document.getElementById(i);
function press(px,py){if(!S)return;if(S.dead){if(performance.now()-deadAt>700&&!$('cld').contains(document.activeElement))start();return;}
 if(GAMES[id].drag){S.started=true;return;}GAMES[id].down(S,px,py);}
function over(){const sc=S.score,prev=best(),rec=sc>prev;if(rec){K.META.cbest=Object.assign({},K.META.cbest,{[id]:sc});K.saveMeta();}
 K.ev('classic_over',{game:id,err:sc});
 const send=()=>{if(sc<=0)return;try{fetch(K.SB.url+'/rest/v1/precision_runs',{method:'POST',headers:{apikey:K.SB.key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({player:K.PID(),pseudo:K.META.name||null,score:Math.min(200000,sc),stage:0,game:id}),keepalive:true}).catch(()=>{});}catch(e){}};
 if(rec)send();
 const need=!K.META.name&&rec&&sc>0;const d=$('cld');
 d.innerHTML=`<div style="font:900 13px Inter;letter-spacing:2px;color:${rec&&sc>0?C.p:C.red}">${rec&&sc>0?'🏆 NOUVEAU RECORD !':S.why}</div>
  <div style="font:900 54px/1.1 Inter;margin-top:6px">${sc}</div>
  <div style="color:#8F8F99;font:700 13px Inter">${rec?'':`Record : ${prev} · encore ${prev-sc+1} pour le battre`}</div>
  <div id="clr" style="color:#fff;font:700 13px Inter;margin-top:6px"></div>
  ${need?`<div style="display:flex;gap:8px;margin-top:12px"><input id="cln" maxlength="16" placeholder="Ton pseudo pour le classement" style="flex:1;min-width:0;background:#000;color:#fff;border:1px solid #2A2A31;border-radius:12px;padding:12px;font:700 15px Inter"><button id="clo" style="border:1px solid #2A2A31;border-radius:12px;padding:12px 14px;color:#fff;font:900 14px Inter">OK</button></div>`:''}
  <button id="clagain" style="display:block;width:100%;margin-top:14px;background:${C.p};color:#000;border-radius:14px;padding:16px;font:900 18px Inter;letter-spacing:1px">↻ REJOUER</button>
  <div id="cltop" style="margin-top:10px;text-align:left;font:700 13px Inter"></div>`;
 d.hidden=false;
 $('clagain').addEventListener('click',e=>{e.stopPropagation();start();});
 if(need)$('clo').addEventListener('click',e=>{e.stopPropagation();const n=$('cln').value.trim().slice(0,16);if(n){K.META.name=n;K.saveMeta();send();K.toast('✔ '+n+' au classement');$('clo').parentNode.remove();}});
 if(sc>0)K.sbRpc('classic_rank',{g:id,s:sc}).then(r=>{const e=$('clr');if(e&&typeof r==='number')e.textContent=`Ta place : n°${r} au classement ${GAMES[id].name}`;});
 K.sbRpc('classic_top',{g:id,n:3}).then(rows=>{const e=$('cltop');if(!e||!Array.isArray(rows)||!rows.length)return;e.innerHTML=rows.map((r,i)=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-top:1px solid #2A2A31"><span>${['🥇','🥈','🥉'][i]} ${String(r.pseudo).replace(/[<>&]/g,'')}</span><b>${r.score}</b></div>`).join('');});}
function loop(now){if(root.hidden)return;const dt=Math.min(1/30,(now-last)/1000||0);last=now;
 if(S){S.t+=dt;if(!S.dead||id==='stick'||id==='knife'||id==='stack')GAMES[id].update(S,dt);
  const x=cx;x.save();x.fillStyle=C.bg;x.fillRect(0,0,S.W,S.H);if(S.shake>0){x.translate(rnd(-S.shake,S.shake),rnd(-S.shake,S.shake));S.shake=Math.max(0,S.shake-dt*30);}
  GAMES[id].draw(S,x);x.restore();
  if(S.flash>0){x.fillStyle=`rgba(212,255,0,${S.flash*.5})`;x.fillRect(0,0,S.W,S.H);S.flash=Math.max(0,S.flash-dt);}
  x.textAlign='center';x.fillStyle=C.fg;x.font='900 64px Inter';x.fillText(S.score,S.W/2,110);
  x.font='700 12px Inter';x.fillStyle=C.mfg;x.fillText(`RECORD ${Math.max(best(),S.score)}`,S.W/2,134);
  if(S.combo>1&&!S.dead){x.fillStyle=C.p;x.font='900 14px Inter';x.fillText(`COMBO ×${S.combo}`,S.W/2,156);}
  for(const p of S.pops){p.t+=dt;x.globalAlpha=Math.max(0,1-p.t/1.1);x.fillStyle=p.c;x.font='900 26px Inter';x.fillText(p.m,S.W/2,S.H*.5-p.t*60);}x.globalAlpha=1;S.pops=S.pops.filter(p=>p.t<1.1);
  if(!S.dead&&S.score===0&&!S.started||(!S.dead&&S.score===0&&S.t<2.2)){x.fillStyle=C.fg;x.font='900 15px Inter';x.fillText(GAMES[id].hint,S.W/2,S.H*.93);x.fillStyle=C.mfg;x.font='600 12px Inter';
   const words=GAMES[id].tip.split(' ');let line='',yy=S.H*.93+20;for(const w of words){if(x.measureText(line+w).width>S.W-40){x.fillText(line,S.W/2,yy);yy+=16;line='';}line+=w+' ';}x.fillText(line,S.W/2,yy);}}
 raf=requestAnimationFrame(loop);}
function open(g){el();id=g;root.hidden=false;start();cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(loop);}
function close(){root.hidden=true;cancelAnimationFrame(raf);S=null;K.showHome();}
window.__cl={open,close,GAMES,ORDER,get S(){return S},best:g=>((K.META.cbest||{})[g]||0)};
const hm=document.getElementById('home');if(hm&&!hm.hidden)K.showHome();
})();
