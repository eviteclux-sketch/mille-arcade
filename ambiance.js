/* Ambiance shared by Mille Arcade and 1.000:
   - a quiet 3D background (thin lines, game color, slow motion) drawn behind every game
   - one song per game, generated from the game id (same game = same song, every game sounds different) */
(function(){
'use strict';
const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
const rnd=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const rgb=hex=>{const m=/^#?([0-9a-f]{6})$/i.exec(hex||'');const n=m?parseInt(m[1],16):0xD4FF00;return[n>>16&255,n>>8&255,n&255];};
const REDUCED=(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}})();

/* ---------- background ---------- */
const KINDS=['grid','tunnel','stars','wire'];
const TINTS=['#D4FF00','#7cc6ff','#ff8a5c','#b8a4ff','#5ef0b0','#ff6fd8','#ffd25e'];
function theme(id,speed,color){const r=rnd(hash(id+'·bg'));return{kind:KINDS[Math.floor(r()*KINDS.length)],color:color||TINTS[Math.floor(r()*TINTS.length)],speed:speed||1,seed:hash(id)};}

// stars: fixed seeded field, depth scrolls toward the viewer
const STARS=(()=>{const r=rnd(7),a=[];for(let i=0;i<120;i++)a.push([r()*2-1,r()*2-1,r()]);return a;})();
// wireframe solids
const PHI=(1+Math.sqrt(5))/2;
const SOLIDS=[
 {v:[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],e:[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]},
 {v:[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],e:[[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]]},
 (()=>{const v=[[-1,PHI,0],[1,PHI,0],[-1,-PHI,0],[1,-PHI,0],[0,-1,PHI],[0,1,PHI],[0,-1,-PHI],[0,1,-PHI],[PHI,0,-1],[PHI,0,1],[-PHI,0,-1],[-PHI,0,1]],e=[];
  for(let i=0;i<12;i++)for(let j=i+1;j<12;j++){const d=Math.hypot(v[i][0]-v[j][0],v[i][1]-v[j][1],v[i][2]-v[j][2]);if(Math.abs(d-2)<.01)e.push([i,j]);}return{v,e};})()
];

function draw(x,W,H,now,th){
 th=th||theme('home');const[r,g,b]=rgb(th.color);const col=a=>`rgba(${r},${g},${b},${Math.max(0,Math.min(1,a)).toFixed(3)})`;
 const t=REDUCED?0:now/1000,sp=Math.min(3,th.speed||1);
 const cx=W/2+Math.sin(t*.23)*W*.035,cy=H*.42+Math.cos(t*.17)*H*.015; // slow camera sway
 x.save();x.lineWidth=1;x.lineCap='round';
 if(th.kind==='grid'){
  // perspective floor: lines rushing toward the viewer, fading into the horizon
  const hz=cy,N=14,ph=(t*.35*sp)%1;
  for(let k=0;k<N;k++){const z=1+(k+1-ph)*0.9,y=hz+(H-hz)*1.15/z;if(y>H+2)continue;
   x.strokeStyle=col(.16*(1-z/(N*0.9+1)));x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();}
  for(let i=-9;i<=9;i++){x.strokeStyle=col(.11-Math.abs(i)*.006);x.beginPath();x.moveTo(cx+i*W*.006,hz);x.lineTo(cx+i*W*.19,H);x.stroke();}
  // faint mirrored ceiling
  for(let k=0;k<N;k++){const z=1+(k+1-ph)*0.9,y=hz-(hz)*0.9/z;if(y<-2)continue;x.strokeStyle=col(.05*(1-z/(N*0.9+1)));x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();}
  const gl=x.createLinearGradient(0,hz-28,0,hz+28);gl.addColorStop(0,col(0));gl.addColorStop(.5,col(.07));gl.addColorStop(1,col(0));x.fillStyle=gl;x.fillRect(0,hz-28,W,56);
 }else if(th.kind==='tunnel'){
  // rounded frames receding into the distance
  const N=12,ph=(t*.28*sp)%1,R=Math.max(W,H)*.75;
  for(let k=N-1;k>=0;k--){const z=(k+1-ph)/N*6+.35,s=R/z,a=.22*(1-z/6.4)*Math.min(1,(z-.35)*3);if(a<=0)continue;
   x.strokeStyle=col(a);x.beginPath();const w=s*.62,h=s*.9,rr=s*.12;
   if(x.roundRect)x.roundRect(cx-w,cy-h,w*2,h*2,rr);else x.rect(cx-w,cy-h,w*2,h*2);x.stroke();}
  x.strokeStyle=col(.07);for(const[dx,dy]of[[-1,-1],[1,-1],[1,1],[-1,1]]){x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+dx*W,cy+dy*H*1.4);x.stroke();}
 }else if(th.kind==='stars'){
  // depth field: points drift toward the viewer and leave a short trail
  const f=Math.min(W,H)*.32,v=.06*sp,seed=(th.seed||0)%997/997;
  for(const[sx,sy,z0]of STARS){let z=(z0+seed-t*v)%1;if(z<0)z+=1;z=z*.95+.05;const z2=Math.min(1,z+.008+.006*sp);
   const px=cx+sx*f/z,py=cy+sy*f/z,qx=cx+sx*f/z2,qy=cy+sy*f/z2;if(px<-10||px>W+10||py<-10||py>H+10)continue;
   const a=(1-z)*.6;x.strokeStyle=col(a);x.lineWidth=Math.max(.6,(1-z)*1.8);x.beginPath();x.moveTo(qx,qy);x.lineTo(px,py);x.stroke();}
 }else{
  // a few slowly turning wireframe solids, far behind the game
  const pos=[[.22,.26,.16,0],[.8,.2,.12,2],[.7,.74,.2,1]];
  pos.forEach(([px,py,sc,si],n)=>{const S=SOLIDS[si],a1=t*(.21+n*.05)*Math.min(1.8,sp),a2=t*(.13+n*.04)+n,size=Math.min(W,H)*sc,ox=W*px+Math.sin(t*.3+n)*8,oy=H*py+Math.cos(t*.25+n*2)*8;
   const P=S.v.map(([X,Y,Z])=>{let y1=Y*Math.cos(a1)-Z*Math.sin(a1),z1=Y*Math.sin(a1)+Z*Math.cos(a1);let x2=X*Math.cos(a2)+z1*Math.sin(a2),z2=-X*Math.sin(a2)+z1*Math.cos(a2);const k=3.2/(3.2+z2);return[ox+x2*size*k,oy+y1*size*k,z2];});
   for(const[i,j]of S.e){const z=(P[i][2]+P[j][2])/2;x.strokeStyle=col(.13-z*.035);x.beginPath();x.moveTo(P[i][0],P[i][1]);x.lineTo(P[j][0],P[j][1]);x.stroke();}});
  // a few drifting specks for depth
  for(let i=0;i<24;i++){const[sx,sy,z0]=STARS[i];const yy=((sy+1)/2*H+t*12*(1-z0)*sp)%H;x.fillStyle=col(.18*(1-z0));x.fillRect((sx+1)/2*W,yy,1.5,1.5);}
 }
 x.restore();
}

/* ---------- music ---------- */
const PROGS=[[[0,'m'],[8,'M'],[3,'M'],[10,'M']],[[0,'m'],[5,'m'],[8,'M'],[7,'M']],[[0,'m'],[10,'M'],[8,'M'],[10,'M']],[[0,'M'],[7,'M'],[9,'m'],[5,'M']],
 [[9,'m'],[5,'M'],[0,'M'],[7,'M']],[[0,'M'],[9,'m'],[5,'M'],[7,'M']],[[0,'m'],[3,'M'],[10,'M'],[5,'m']],[[0,'M'],[5,'M'],[9,'m'],[7,'M']]];
const ARPS=[[0,2,1,3,2,1,0,2,3,2,1,null,0,2,3,null],[0,null,2,null,3,null,2,1,0,null,2,null,1,2,3,null],[0,1,2,3,2,1,0,1,2,3,2,1,0,1,2,1],[0,null,1,2,null,1,0,null,2,null,3,2,null,1,0,null],
 [0,2,3,2,1,2,3,2,0,2,3,2,1,null,2,null],[0,null,null,2,null,null,1,null,3,null,null,2,null,1,null,null],[0,0,2,0,1,0,2,3,0,0,2,0,3,2,1,2],[3,2,1,0,null,0,1,2,3,null,2,null,1,null,0,null]];
const DRUMS=[{kick:[0,8],hat:[4,12],bass:[0,6,8,14]},{kick:[0,4,8,12],hat:[2,6,10,14],bass:[0,3,8,11]},{kick:[0,6,8],hat:[4,12],bass:[0,8,10]},
 {kick:[0],hat:[8],bass:[0,10]},{kick:[0,4,8,12],hat:[2,6,10,14],bass:[0,3,6,8,11,14]},{kick:[0,10],hat:[4,8,12],bass:[0,4,8,12]}];
const WAVES=[['triangle',0,.14],['square',2000,.06],['sawtooth',1500,.055],['sine',0,.18],['triangle',0,.12],['square',1600,.065]];
const SONGC={};
function song(id){if(SONGC[id])return SONGC[id];const r=rnd(hash(id));const pick=a=>a[Math.floor(r()*a.length)];
 const base=45+Math.floor(r()*10),pr=pick(PROGS),w=pick(WAVES),d=pick(DRUMS);
 return SONGC[id]={bpm:96+Math.floor(r()*10)*4,prog:pr.map(([o])=>{const n=base+o;return n>base+7?n-12:n;}),q:pr.map(p=>p[1]),arp:pick(ARPS),bass:d.bass,kick:d.kick,hat:d.hat,wave:w[0],cut:w[1],lead:w[2]};}
const TONES={m:[0,3,7,12],M:[0,4,7,12]};
const mtof=m=>440*Math.pow(2,(m-69)/12);
// a small sequencer: player(getAudioContext,{on:()=>bool,vol})
function player(getCtx,opt){
 opt=opt||{};let out=null,noise=null,outCtx=null;
 const P={key:null,song:null,step:0,next:0,timer:null,rate:1,
  play(key,rate){this.rate=rate||1;if(key===this.key&&this.song)return;this.key=key;this.song=key?song(key):null;this.step=0;this.next=0;if(!this.timer)this.timer=setInterval(()=>this.tick(),25);},
  stop(){this.key=null;this.song=null;},
  tick(){const c=getCtx(),s=this.song;if(!c||!s||c.state!=='running'||(opt.on&&!opt.on()))return;
   if(outCtx!==c){outCtx=c;out=c.createGain();out.gain.value=opt.vol||.22;out.connect(c.destination);const n=c.createBuffer(1,c.sampleRate*.2,c.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;noise=n;}
   if(this.next<c.currentTime-.2)this.next=c.currentTime+.05;
   while(this.next<c.currentTime+.12){this.note(c,this.step,this.next);this.next+=60/(s.bpm*this.rate)/4;this.step=(this.step+1)%64;}},
  note(c,i,t){const s=this.song,bar=i>>4,st=i&15,root=s.prog[bar],tn=TONES[s.q[bar]],a=s.arp[st];
   if(a!==null)voice(c,s.wave,mtof(root+12+tn[a]),t,s.lead,.16,0,s.cut);
   if(s.bass.includes(st))voice(c,'triangle',mtof(root-12),t,.32,.28);
   if(s.kick.includes(st))voice(c,'sine',150,t,.55,.16,45);
   if(s.hat.includes(st))hit(c,t,.08,.04,7000);}
 };
 function env(g,t,peak,dec){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+dec);}
 function voice(c,type,f,t,peak,dec,slide,cut){const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dec);
  let n=o;if(cut){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=cut;o.connect(fl);n=fl;}n.connect(g);g.connect(out);env(g,t,peak,dec);o.start(t);o.stop(t+dec+.05);}
 function hit(c,t,peak,dec,hp){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noise;f.type='highpass';f.frequency.value=hp;s.connect(f);f.connect(g);g.connect(out);env(g,t,peak,dec);s.start(t);s.stop(t+dec+.05);}
 return P;
}

window.AMB={bg:{draw,theme},song,player};
})();
