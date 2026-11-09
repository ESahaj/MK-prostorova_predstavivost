
'use strict';
const ASSETS={"cleo": "assets/cleo.png", "spotty": "assets/spotty.png", "thinky": "assets/thinky.png", "scout": "assets/scout.png"};
const $=s=>document.querySelector(s),COLORS=['#ee795c','#eaba3b','#59b9a5','#638bda','#b47ed0','#f18eaf'],FACES=['červená','žlutá','zelená','modrá','fialová','růžová'];
const CATS=[{id:'count',icon:'🧱',name:'Kolik je kostek?',desc:'Spočítej celou stavbu. Pozor, některé kostky se schovávají!',friend:'spotty',color:'#ffdf9b'},{id:'views',icon:'👀',name:'Pohledy na stavbu',desc:'Najdi pohled zepředu, zprava nebo shora.',friend:'scout',color:'#cee8f3'},{id:'build',icon:'🏗️',name:'Postav to taky',desc:'Postav předlohu, přidávej i odebírej a nakonec spočítej kostičky.',friend:'cleo',color:'#d5ebc9'},{id:'rotate',icon:'🔄',name:'Otočená stavba',desc:'Poznej stejnou stavbu, i když je otočená.',friend:'thinky',color:'#e4d2ee'},{id:'netcube',icon:'🎲',name:'Ze sítě krychle',desc:'Která barevná krychle vznikne složením sítě?',friend:'cleo',color:'#f6d4dd'},{id:'cubenet',icon:'✂️',name:'Najdi správnou síť',desc:'Vyber síť pro krychli na obrázku.',friend:'thinky',color:'#c9e9df'},{id:'voxel',icon:'🧊',name:'Rozebírej krychli',desc:'Odebírej kostičky a prohlížej si velkou krychli ze všech stran.',color:'#cce6f3'},{id:'test',icon:'⭐',name:'Velký test',desc:'Deset úloh. Vyhodnocení tě čeká až na konci.',friend:'scout',color:'#ffe8a6'}];
let difficulty=0,category='',tasks=[],index=0,selected=-1,answered=false,results=[],turn=0,layer=0,building=[],removeMode=false,session={},exam=false;
const rnd=n=>Math.floor(Math.random()*n),pick=a=>a[rnd(a.length)],shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a},key=m=>JSON.stringify(m),clone=m=>m.map(r=>[...r]),sum=m=>m.flat().reduce((a,b)=>a+b,0),rot=m=>m[0].map((_,x)=>m.map(r=>r[x]).reverse()),rotate=(m,n)=>{m=clone(m);for(let i=0;i<n%4;i++)m=rot(m);return m},canonical=m=>[0,1,2,3].map(i=>key(rotate(m,i))).sort()[0],esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const noun=n=>n===1?'kostka':n>=2&&n<=4?'kostky':'kostek',qty=n=>n+' '+noun(n);
function matrix(){const n=difficulty===0?2:3,max=difficulty===0?2:difficulty+1;let m;do{m=Array.from({length:n},()=>Array.from({length:n},()=>rnd(max+1)))}while(sum(m)<2||m.flat().every(v=>v===m[0][0]));return m}
function poly(points,fill,stroke='#263d50',width=1.8){return `<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`}
const DIRECTIONS=[['ZEPŘEDU','ZPRAVA'],['ZPRAVA','ZEZADU'],['ZEZADU','ZLEVA'],['ZLEVA','ZEPŘEDU']];
function iso(m,angle=0,small=false,maxLayer=0,showCells=false){const directions=DIRECTIONS[((angle%4)+4)%4];m=rotate(m,angle);const n=m.length,s=Math.min(35,100/n,100/Math.max(1,...m.flat())),cx=200,cy=115,pt=(x,y,z)=>[cx+(x-y)*s,cy+(x+y)*s*.5-z*s],cubes=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)for(let z=0;z<m[y][x];z++)if(!maxLayer||z===maxLayer-1)cubes.push({x,y,z});cubes.sort((a,b)=>(a.x+a.y-b.x-b.y)*10+a.z-b.z);let out=`<svg viewBox="0 0 400 250" role="img" aria-label="Stavba z kostek">`;const cells=showCells?rotate(m.map((row,y)=>row.map((_,x)=>String.fromCharCode(65+x)+(y+1))),angle):null;
function cellLabel(x,y,z){
 const [px,py]=pt(x+.5,y+.5,z);
 return `<text x="${px}" y="${py+4}" text-anchor="middle" font-size="11" font-weight="850" fill="#243b50" stroke="#fff8e9" stroke-width="3" paint-order="stroke">${cells[y][x]}</text>`;
}
for(let y=0;y<n;y++)for(let x=0;x<n;x++)out+=poly([pt(x,y,0),pt(x+1,y,0),pt(x+1,y+1,0),pt(x,y+1,0)],'#fff9e8bb','#657f80',.8);if(cells)for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(!m[y][x])out+=cellLabel(x,y,0);for(const {x,y,z} of cubes){out+=poly([pt(x,y+1,z),pt(x+1,y+1,z),pt(x+1,y+1,z+1),pt(x,y+1,z+1)],'#ebae44');out+=poly([pt(x+1,y,z),pt(x+1,y+1,z),pt(x+1,y+1,z+1),pt(x+1,y,z+1)],'#d5794a');out+=poly([pt(x,y,z+1),pt(x+1,y,z+1),pt(x+1,y+1,z+1),pt(x,y+1,z+1)],'#ffe19a');if(cells&&z===m[y][x]-1)out+=cellLabel(x,y,z+1)}
if(!small){out+=`<path d="M79 208L112 190m0 0l-13 1m13-1l-6 12" fill="none" stroke="#243b50" stroke-width="2"/><text x="52" y="229" fill="#243b50" font-size="13" font-weight="800">${directions[0]}</text><path d="M315 208L280 190m0 0l13 1m-13-1l6 12" fill="none" stroke="#243b50" stroke-width="2"/><text x="299" y="229" fill="#243b50" font-size="13" font-weight="800">${directions[1]}</text>`}return out+'</svg>'}
function trimView(m){const occupied=[];m.forEach((r,y)=>r.forEach((v,x)=>{if(v)occupied.push([x,y])}));if(!occupied.length)return [[0]];const xs=occupied.map(p=>p[0]),ys=occupied.map(p=>p[1]),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);return m.slice(top,bottom+1).map(r=>r.slice(left,right+1))}
function hasVisibleColumns(matrix){
 // At a tile's projected center, only columns on the same diagonal can
 // cover its surface. Each step toward the viewer adds one cube of depth.
 for(let y=0;y<matrix.length;y++){
  for(let x=0;x<matrix[y].length;x++){
   for(let step=1;y+step<matrix.length&&x+step<matrix[y+step].length;step++){
    if(matrix[y+step][x+step]-matrix[y][x]>=step)return false;
   }
  }
 }
 return true;
}
function viewData(m,dir){if(dir==='top')return trimView(m.map(r=>r.map(v=>v>0?1:0)));const heights=dir==='front'?m[0].map((_,x)=>Math.max(...m.map(r=>r[x]))):dir==='left'?m.map(r=>Math.max(...r)):m.map(r=>Math.max(...r)).reverse(),max=Math.max(...heights);return trimView(Array.from({length:max},(_,y)=>heights.map(h=>h>=max-y?1:0)))}
function flatView(m){m=trimView(m);const h=m.length,w=m[0].length,s=Math.min(34,130/Math.max(w,h)),ox=100-w*s/2,oy=80-h*s/2;let out='<svg viewBox="0 0 200 160" role="img" aria-label="Plochý pohled na kostky">';for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(m[y][x])out+=`<rect x="${ox+x*s}" y="${oy+y*s}" width="${s}" height="${s}" fill="#eab755" stroke="#243b50" stroke-width="2"/>`;return out+'</svg>'}
const neg=a=>a.map(v=>-v),dot=(a,b)=>a.reduce((v,n,i)=>v+n*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],veq=(a,b)=>key(a)===key(b);
function fold(cells){const map=new Map(cells.map((c,i)=>[c.join(','),i])),frames=Array(6),queue=[0];frames[0]={u:[1,0,0],v:[0,1,0],n:[0,0,1]};for(let k=0;k<queue.length;k++){const i=queue[k],f=frames[i],[x,y]=cells[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const j=map.get([x+dx,y+dy].join(','));if(j===undefined)continue;const g=dx===1?{u:neg(f.n),v:f.v,n:f.u}:dx===-1?{u:f.n,v:f.v,n:neg(f.u)}:dy===1?{u:f.u,v:neg(f.n),n:f.v}:{u:f.u,v:f.n,n:neg(f.v)};if(frames[j]){if(!veq(frames[j].u,g.u)||!veq(frames[j].v,g.v)||!veq(frames[j].n,g.n))return null}else{frames[j]=g;queue.push(j)}}}return queue.length===6&&new Set(frames.map(f=>key(f.n))).size===6?frames:null}
function normalize(c){const minX=Math.min(...c.map(v=>v[0])),minY=Math.min(...c.map(v=>v[1]));return c.map(([x,y])=>[x-minX,y-minY]).sort((a,b)=>a[1]-b[1]||a[0]-b[0])}
function shapeKey(c){const variants=[];for(let flip=0;flip<2;flip++)for(let turn=0;turn<4;turn++){let v=c.map(([x,y])=>[flip?-x:x,y]);for(let i=0;i<turn;i++)v=v.map(([x,y])=>[-y,x]);variants.push(key(normalize(v)))}return variants.sort()[0]}
function nets(){let shapes=[[[0,0]]];for(let size=2;size<=6;size++){const seen=new Map();for(const c of shapes)for(const [x,y] of c)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const p=[x+dx,y+dy];if(c.some(v=>veq(v,p)))continue;const n=normalize([...c,p]);seen.set(shapeKey(n),n)}shapes=[...seen.values()]}return shapes.filter(c=>fold(c))}
const NETS=nets();
function triples(net){const f=fold(net.cells);if(!f)return[];const out=[];for(let t=0;t<6;t++)for(let l=0;l<6;l++)for(let r=0;r<6;r++)if(dot(f[t].n,f[l].n)===0&&dot(f[t].n,f[r].n)===0&&dot(f[l].n,f[r].n)===0&&dot(cross(f[l].n,f[r].n),f[t].n)===-1)out.push([net.colors[t],net.colors[l],net.colors[r]]);return out}
const CROSS_NET=[[1,0],[0,1],[1,1],[2,1],[1,2],[1,3]];
function net(){
 // Preserve the order of the faces so their colors rotate with the net.
 const horizontalCross=CROSS_NET.map(([x,y])=>[3-y,x]);
 const cells=difficulty<2?pick([CROSS_NET,horizontalCross]):pick(NETS);
 return {cells:clone(cells),colors:shuffle([0,1,2,3,4,5])};
}
function answerCorner(net,corners=triples(net)){
 if(difficulty!==0)return pick(corners);
 // Keep the middle square on top. Use a side arm and the square
 // immediately below the middle for the two visible side faces.
 const center=net.colors[2], lower=net.colors[4];
 const arms=[net.colors[1],net.colors[3]];
 return pick(corners.filter(([top,left,right])=>
  top===center&&((left===lower&&arms.includes(right))||
                (right===lower&&arms.includes(left)))
 ));
}
function sameCornerColors(a,b){
 return a.every(color=>b.includes(color));
}
function isWrongCorner(corners,candidate){
 if(corners.some(corner=>key(corner)===key(candidate)))return false;
 if(difficulty===2)return true;
 const colorsMeet=corners.some(corner=>sameCornerColors(corner,candidate));
 return difficulty===1?colorsMeet:!colorsMeet;
}
const FACE_MARKS=[
 '<circle r="7"/>','<rect x="-6" y="-6" width="12" height="12"/>',
 '<path d="M0 -9L8 0 0 9 -8 0Z"/>','<path d="M0 -8L8 6H-8Z"/>',
 '<path d="M-3 -8H3V-3H8V3H3V8H-3V3H-8V-3H-3Z"/>',
 '<circle r="8" fill="none" stroke="#243b50" stroke-width="3"/>'
];
function faceMark(color,x,y,scale=1){
 return `<g transform="translate(${x} ${y}) scale(${scale})" fill="#243b50">${FACE_MARKS[color]}</g>`;
}
function netSvg(n,marked=false){const maxX=Math.max(...n.cells.map(c=>c[0]))+1,maxY=Math.max(...n.cells.map(c=>c[1]))+1,s=Math.min(38,170/maxX,175/maxY),ox=110-maxX*s/2,oy=110-maxY*s/2;let out='<svg viewBox="0 0 220 220" role="img" aria-label="Barevná síť krychle">';n.cells.forEach(([x,y],i)=>{out+=`<rect x="${ox+x*s}" y="${oy+y*s}" width="${s}" height="${s}" fill="${COLORS[n.colors[i]]}" stroke="#243b50" stroke-width="2"/>`;if(marked)out+=faceMark(n.colors[i],ox+(x+.5)*s,oy+(y+.5)*s,s/38)});return out+'</svg>'}
function cubeSvg(t,marked=false){const T=[[110,35],[175,70],[110,105],[45,70]],L=[[45,70],[110,105],[110,180],[45,145]],R=[[110,105],[175,70],[175,145],[110,180]];return '<svg viewBox="0 0 220 220" role="img" aria-label="Barevná krychle">'+poly(T,COLORS[t[0]])+poly(L,COLORS[t[1]])+poly(R,COLORS[t[2]])+(marked?faceMark(t[0],110,70)+faceMark(t[1],77,125)+faceMark(t[2],143,125):'')+'</svg>'}
function uniqueOptions(correct,create,optionKey=key,optionCount=4){const options=[correct],seen=new Set([optionKey(correct)]);let tries=0;while(options.length<optionCount&&tries++<1000){const o=create();if(!seen.has(optionKey(o))){seen.add(optionKey(o));options.push(o)}}if(options.length<optionCount)throw Error('Nelze připravit odlišné možnosti');return shuffle(options)}
function allCubesVisible(matrix,turn){
 const heights=rotate(matrix,turn);
 const cubes=heights.flatMap((row,y)=>row.flatMap((height,x)=>
  Array.from({length:height},(_,z)=>[x,y,z])));
 // Rays from the three outward face centers follow the isometric
 // camera direction (+x,+y,+z). A clear ray certifies a visible face.
 return cubes.every(cube=>[0,1,2].some(axis=>{
  const face=cube.map((v,i)=>v+(i===axis?1:.5));
  return !cubes.some(other=>{
   const enter=Math.max(...other.map((v,i)=>v-face[i]),0);
   const leave=Math.min(...other.map((v,i)=>v+1-face[i]));
   return leave>enter+1e-8;
  });
 }));
}
function connectedCountingBuilding(size,maxHeight){
 const heights=Array.from({length:size},()=>Array(size).fill(0));
 const frontier=new Map();
 function addColumn(x,y){
  heights[y][x]=1+rnd(maxHeight);
  frontier.delete(y*size+x);
  for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){
   if(nx>=0&&ny>=0&&nx<size&&ny<size&&!heights[ny][nx]){
    frontier.set(ny*size+nx,[nx,ny]);
   }
  }
 }
 addColumn(rnd(size),rnd(size));
 const columns=size+rnd(size);
 for(let i=1;i<columns;i++)addColumn(...pick([...frontier.values()]));
 return heights;
}
function makeTask(id,fixedView=false){let m=['count','views','build','rotate'].includes(id)?matrix():null;let options,answer,dir,n,t,startTurn=0;
if(id==='count'&&fixedView){
 // The back corner may be hidden. Leave it empty so the answer counts
 // only the three columns whose outer faces are visible in this view.
 do{
  m=[[0,rnd(difficulty===2?4:3)],[rnd(difficulty===2?4:3),rnd(difficulty===2?4:3)]];
 }while(sum(m)<2);
}
if(id==='count'&&!fixedView){
 const size=difficulty+3;
 const maxHeight=difficulty+2;
 for(let attempt=0;attempt<24;attempt++){
  m=connectedCountingBuilding(size,maxHeight);
  if(sum(m)<size)continue;
  const visibleTurn=shuffle([0,1,2,3]).find(angle=>allCubesVisible(m,angle));
  if(visibleTurn!==undefined){startTurn=visibleTurn;break}
  m=null;
 }
 if(!m||sum(m)<size){
  // On either front edge, every cube has an unobstructed outward face.
  m=Array.from({length:size},(_,y)=>Array.from({length:size},(_,x)=>
   x===size-1||y===size-1?1+rnd(maxHeight):0
  ));
 }
}
if(id==='count'){answer=sum(m);options=uniqueOptions(answer,()=>Math.max(1,answer+pick([-4,-3,-2,-1,1,2,3,4])))}
if(id==='views'){
 dir=pick(difficulty===0?['front','top']:['front','right','left','top']);
 while(!hasVisibleColumns(dir==='left'?rotate(m,2):m))m=matrix();answer=viewData(m,dir);options=uniqueOptions(answer,()=>viewData(matrix(),dir),canonical)}
if(id==='rotate'){answer=rotate(m,pick([1,2,3]));options=uniqueOptions(answer,()=>{let wrong;do{wrong=matrix()}while(canonical(wrong)===canonical(m));return wrong})}
if(id==='netcube'){n=net();const good=triples(n);answer=answerCorner(n,good);options=uniqueOptions(answer,()=>{let v;do{v=shuffle([0,1,2,3,4,5]).slice(0,3)}while(!isWrongCorner(good,v));return v})}
if(id==='cubenet'){n=net();t=answerCorner(n);answer=n;options=uniqueOptions(n,()=>{let wrong;do{wrong=net()}while(!isWrongCorner(triples(wrong),t));return wrong})}
return {id,m,dir,startTurn,net:n,cube:t,marked:difficulty===2&&!!n&&rnd(2)===0,options,correct:options?options.findIndex(o=>key(o)===key(answer)):-1,response:-1,build:null}}
function newTasks(id){return Array.from({length:10},(_,i)=>makeTask(id==='test'?['count','views','rotate','netcube','cubenet'][i%5]:id,id==='test'))}
function go(id){saveSession();category=id;if(id==='voxel'){renderVoxel();return}exam=id==='test';if(session[sessionKey(id)]){({tasks,index,results}=session[sessionKey(id)])}else{tasks=newTasks(id);index=0;results=[]}render()}
function sessionKey(id){return id+':'+difficulty}
function saveSession(){if(category&&category!=='voxel')session[sessionKey(category)]={tasks,index,results}}
let voxelSessions={};
function newVoxel(size){
 const cubes=[];
 for(let z=0;z<size;z++)for(let y=0;y<size;y++)for(let x=0;x<size;x++)cubes.push([x,y,z]);
 return {cubes,undo:[],yaw:Math.PI/4,pitch:Math.PI/6,paintTask:0,paintAnswers:Array(4).fill(''),paintSolved:Array(4).fill(false)};
}
function voxelFaces(state,size){
 const {yaw,pitch}=state;
 const sin=Math.sin(yaw),cos=Math.cos(yaw);
 const rise=Math.sin(pitch),level=Math.cos(pitch);
 const camera=[cos*level,sin*level,rise];
 const occupied=new Set(state.cubes.map(cube=>cube.join(',')));
 const unit=155/size;
 const point=(x,y,z)=>{
  x-=size/2;y-=size/2;z-=size/2;
  return [200+(x*sin-y*cos)*unit,147.5+((x*cos+y*sin)*rise-z*level)*unit];
 };
 const ordered=state.cubes.map((cube,index)=>({cube,index,depth:dot(cube,camera)}))
  .sort((a,b)=>a.depth-b.depth);
 return ordered.map(({cube,index})=>{
  const paint=['#e97972','#82bb68','#68b9df'][size-3];
  const faces=[];
  camera.forEach((direction,axis)=>{
   if(Math.abs(direction)<1e-8)return;
   const neighbor=[...cube];
   neighbor[axis]+=Math.sign(direction);
   if(occupied.has(neighbor.join(',')))return;
   const sides=[0,1,2].filter(other=>other!==axis);
   const corners=[[0,0],[1,0],[1,1],[0,1]].map(([u,v])=>{
    const vertex=[...cube];
    vertex[axis]+=direction>0?1:0;
    vertex[sides[0]]+=u;
    vertex[sides[1]]+=v;
    return point(...vertex);
   });
   const painted=direction>0?cube[axis]===size-1:cube[axis]===0;
   const color=painted?paint:'#fff1ce';
   faces.push(`<g class="voxel-face-${axis}">${poly(corners,color)}</g>`);
  });
  if(!faces.length)return '';
  return `<g class="voxel" data-voxel="${index}" tabindex="0" role="button" aria-label="Odebrat kostku ${cube.map(v=>v+1).join(', ')}">${faces.join('')}</g>`;
 }).join('');
}
function bindVoxelOrbit(state,size){
 const svg=$('#voxel-svg');
 let gesture=null;
 const cubeAt=target=>target.closest?.('[data-voxel]');
 const remove=cube=>{
  if(!cube)return;
  state.undo.push(state.cubes.splice(Number(cube.dataset.voxel),1)[0]);
  renderVoxel();
 };
 svg.onpointerdown=event=>{
  if(gesture||event.button!==0)return;
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,yaw:state.yaw,pitch:state.pitch,cube:cubeAt(event.target),moved:false};
  svg.setPointerCapture(event.pointerId);
 };
 svg.onpointermove=event=>{
  if(gesture?.id!==event.pointerId)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(!gesture.moved&&Math.hypot(dx,dy)<6)return;
  gesture.moved=true;
  state.yaw=gesture.yaw+dx*.012;
  state.pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,gesture.pitch+dy*.012));
  svg.innerHTML=voxelFaces(state,size);
 };
 svg.onpointerup=event=>{
  if(gesture?.id!==event.pointerId)return;
  const {cube,moved}=gesture;
  gesture=null;
  if(!moved)remove(cube);
 };
 svg.onpointercancel=svg.onlostpointercapture=()=>{gesture=null};
 svg.onkeydown=event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  event.preventDefault();
  remove(cubeAt(event.target));
 };
}
function paintedFaceCount(cube,size){
 return cube.filter(coordinate=>coordinate===0||coordinate===size-1).length;
}
const PAINT_QUESTIONS=[
 'Odeber všechny krychličky, které mají právě tři barevné stěny.',
 'Odeber všechny krychličky, které mají právě dvě barevné stěny.',
 'Odeber všechny krychličky, které mají právě jednu barevnou stěnu.',
 'A kolik krychliček nemá barevnou ani jednu stranu?'
];
function paintedExercise(size,state){
 const task=state.paintTask;
 const matching=cube=>paintedFaceCount(cube,size)===3-task;
 const interiorQuestion=task===3;
 if(!interiorQuestion&&!state.paintSolved[task]&&state.cubes.some(matching))return '';
 const expected=newVoxel(size).cubes.filter(matching).length;
 const first=Math.max(0,expected-((task+size)%4));
 return `<div class="grid-wrap paint-exercise">
  <h2>${interiorQuestion?'Vyber odpověď':'Kolik jich bylo?'}</h2>
  <p>${interiorQuestion?'Počítej v původní celé krychli.':'Počítej jen krychličky, které odpovídají pokynu nahoře.'}</p>
  <div class="tools">${[0,1,2,3].map(offset=>{
   const value=first+offset;
   return `<button data-paint-answer="${value}" aria-pressed="${state.paintAnswers[task]===value}">${value}</button>`;
  }).join('')}</div>
  <p id="paint-feedback" role="status">${state.paintSolved[task]?'✓ Správně!':state.paintAnswers[task]!==''?'Zkus to ještě jednou.':''}</p>
  ${state.paintSolved[task]&&task<3?'<button type="button" data-next-paint>Další otázka →</button>':''}
 </div>`;
}
function renderVoxel(){
 const size=difficulty+3;
 const state=voxelSessions[size]??=newVoxel(size);
 document.querySelector('body').setAttribute('data-view','task');
 $('#app').innerHTML=`<div class="page-head"><button id="back">← Výběr úkolů</button><h2>Rozebírej krychli</h2></div>${taskLevels()}<div class="question"><img src="${ASSETS.thinky}" alt="Thinky"><div><p>Natřeli jsme krychli a pak jsme ji rozřezali na malé krychličky.</p><h1>${PAINT_QUESTIONS[state.paintTask]}</h1><p class="muted">Tažením krychli otočíš. Když se potřebuješ dostat dovnitř, můžeš odložit i krychličky, které do odpovědi nepatří.</p></div></div><nav class="levels" aria-label="Otázky k natřené krychli">${PAINT_QUESTIONS.map((_,i)=>`<button data-paint-task="${i}" class="${state.paintTask===i?'active':''}" aria-pressed="${state.paintTask===i}">Otázka ${i+1}${state.paintSolved[i]?' ✓':''}</button>`).join('')}</nav><div class="board voxel-board"><svg id="voxel-svg" viewBox="0 0 400 295" role="group" aria-label="Krychle z jednotlivých kostek">${voxelFaces(state,size)}</svg><div class="board-label" aria-live="polite">Zbývá ${qty(state.cubes.length)} z ${size**3}</div></div><div class="tools"><button id="voxel-left">↶ Otočit vlevo</button><button id="voxel-right">↷ Otočit vpravo</button><button id="voxel-flip">${state.pitch<0?'Zpět nahoru':'Pohled zespodu'}</button><button id="voxel-undo" ${state.undo.length?'':'disabled'}>Vrátit kostku</button><button id="voxel-reset">Obnovit krychli</button></div>${paintedExercise(size,state)}`;
 bindTaskLevels();
 $('#back').onclick=home;
 $('#voxel-left').onclick=()=>{state.yaw-=Math.PI/2;renderVoxel()};
 $('#voxel-right').onclick=()=>{state.yaw+=Math.PI/2;renderVoxel()};
 $('#voxel-flip').onclick=()=>{state.pitch=state.pitch<0?Math.PI/6:-Math.PI/6;renderVoxel()};
 $('#voxel-undo').onclick=()=>{if(state.undo.length)state.cubes.push(state.undo.pop());renderVoxel()};
 $('#voxel-reset').onclick=()=>{Object.assign(state,{cubes:newVoxel(size).cubes,undo:[],yaw:Math.PI/4,pitch:Math.PI/6});renderVoxel()};
 const choosePaintTask=index=>{
  if(index===state.paintTask)return;
  state.paintTask=index;
  state.cubes=newVoxel(size).cubes;
  state.undo=[];
  renderVoxel();
 };
 document.querySelectorAll('[data-paint-task]').forEach(button=>{
  button.onclick=()=>choosePaintTask(Number(button.dataset.paintTask));
 });
 const nextPaint=$('[data-next-paint]');
 if(nextPaint)nextPaint.onclick=()=>choosePaintTask(state.paintTask+1);
 document.querySelectorAll('[data-paint-answer]').forEach(button=>{
  button.onclick=()=>{
   const task=state.paintTask;
   const expected=newVoxel(size).cubes.filter(cube=>paintedFaceCount(cube,size)===3-task).length;
   const answer=Number(button.dataset.paintAnswer);
   state.paintAnswers[task]=answer;
   state.paintSolved[task]=answer===expected;
   renderVoxel();
  };
 });
 bindVoxelOrbit(state,size);
}
function taskLevels(){
 return `<nav class="levels" aria-label="Obtížnost úlohy">${[0,1,2].map(level=>
  `<button data-task-level="${level}" class="${level===difficulty?'active':''}" aria-pressed="${level===difficulty}" aria-label="Obtížnost ${level+1}">${'★'.repeat(level+1)}</button>`
 ).join('')}</nav>`;
}
function bindTaskLevels(){
 document.querySelectorAll('[data-task-level]').forEach(button=>button.onclick=()=>{
  const nextLevel=Number(button.dataset.taskLevel);
  if(nextLevel===difficulty)return;
  const section=category;
  saveSession();
  category='';
  difficulty=nextLevel;
  go(section);
 });
}
function home(){document.querySelector('body').setAttribute('data-view','home');if(typeof scrollTo==='function')scrollTo(0,0);saveSession();category='';$('#app').innerHTML=`<section class="hero"><div><h1>Malé kostky.<br>Velká dobrodružství!</h1><p>Počítej, otáčej, stav a objevuj, jak věci vypadají z různých stran. Cleo a její kamarádi ti budou dělat společnost.</p><div class="speech">Co dnes prozkoumáš? ↓</div></div><div class="hero-art">${['cleo','spotty','thinky','scout'].map(n=>`<img src="${ASSETS[n]}" alt="${n[0].toUpperCase()+n.slice(1)}">`).join('')}</div></section><div class="levels" aria-label="Obtížnost">${['Malé rozkoukání','Pořádná výprava','Velká výzva'].map((s,i)=>`<button data-level="${i}" class="${i===difficulty?'active':''}" aria-pressed="${i===difficulty}">${'★'.repeat(i+1)} ${s}</button>`).join('')}</div><div class="cards">${CATS.map(c=>`<button class="card" data-cat="${c.id}" style="--color:${c.color}"><span class="icon" aria-hidden="true">${c.icon}</span><b>${c.name}</b><p>${c.desc}</p><small>${c.id==='voxel'?'Volné zkoumání':session[sessionKey(c.id)]?`${session[sessionKey(c.id)].results.filter(Boolean).length} / 10 hotovo`:'10 nových úloh'} →</small></button>`).join('')}</div>`;document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>go(b.dataset.cat));document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{difficulty=+b.dataset.level;home()})}
function instructions(q){return {count:exam?['Kolik nejméně kostiček bylo použito na stavbu?','Každý sloupec stojí na zemi. Započítej jen kostičky, které stavba podle obrázku potřebuje.']:['Kolik kostek je v celé stavbě?','Ve výchozím pohledu je vidět alespoň část každé kostičky. Každý sloupec stojí na zemi.'],views:['Jak vypadá stavba '+({front:'zepředu',right:'zprava',left:'zleva',top:'shora'}[q.dir])+'?',q.dir==='top'?'Představ si pohled přímo shora. Každý obsazený sloupec se ukáže jako jeden čtvereček.':'Směr pohledu ukazují šipky u stavby. Vyber správný plochý obrázek.'],build:['Postav úplně stejnou stavbu.','Přidávej nebo odebírej kostičky v plánu. Po dokončení spočítej, kolik jsi jich použil.'],rotate:['Která stavba je stejná, jen otočená?','Stavbu otáčíme na podložce. Kostky nepřidáváme ani neubíráme.'],netcube:['Která krychle vznikne z této sítě?','Síť přehneme po hranách. Barvy zůstanou na stejných stěnách. Krychli můžeš otáčet.'],cubenet:['Která síť patří k této krychli?','Představ si, že síť složíš a krychli otočíš. Barvy musí souhlasit.']}[q.id]}
function render(){document.querySelector('body').setAttribute('data-view','task');if(typeof scrollTo==='function')scrollTo(0,0);if(index>=10){finish();return}const q=tasks[index],c=CATS.find(c=>c.id===q.id),[title,desc]=instructions(q);selected=q.response;answered=!exam&&results[index]===true;turn=q.startTurn??0;layer=0;removeMode=false;building=q.build?clone(q.build):q.m?.map(r=>r.map(()=>0))||[];$('#app').innerHTML=`<div class="page-head"><button id="back">← Výběr úkolů</button><h2>${exam?'⭐ Velký test':c.name}</h2><span class="count">${index+1} / 10</span></div>${taskLevels()}<div class="question"><img src="${ASSETS[c.friend]}" alt="${c.friend[0].toUpperCase()+c.friend.slice(1)}"><div><span class="badge">${exam?'TEST · Vyhodnocení až na konci':['★','★★','★★★'][difficulty]}</span><h1>${title}</h1><p>${desc}</p></div></div><div id="task-area"></div><div class="feedback" id="feedback" role="status" aria-live="polite">${exam?'Označ odpověď. Správnost zjistíš až po dokončení testu.':answered?'✓ Tuto úlohu už máš vyřešenou.':'Vyber svou odpověď.'}</div><div class="actions"><button id="prev" ${index===0?'disabled':''}>← Předchozí</button><button id="next" class="primary" ${exam?selected<0?'disabled':'':!answered?'disabled':''}>${index===9?exam?'Vyhodnotit test ✓':'Dokončit výpravu ★':'Další úloha →'}</button></div>`;
bindTaskLevels();$('#back').onclick=home;$('#prev').onclick=()=>{index--;render()};$('#next').onclick=()=>{if(exam?selected<0:!answered)return;index++;saveSession();render()};drawTask();if(selected>=0)markSelection();}
function drawTask(){const q=tasks[index],area=$('#task-area');if(q.id==='build'){const locked=!!q.buildVerified;area.innerHTML=`<div class="build-panels"><div><div class="board"><div id="reference">${iso(q.m,turn,false,0,true)}</div><div class="board-label">Předloha</div></div></div><div><div class="board"><div id="built">${iso(building,turn,false,0,true)}</div><div class="board-label">Tvoje stavba</div></div></div></div><div class="tools"><button id="spin">↻ Otočit obě stavby</button></div><div class="grid-wrap"><h2>${locked?'1. Stavba je hotová ✓':'1. Postav stejnou stavbu'}</h2><p class="muted">${locked?'Prohlédni si svou stavbu a spočítej všechny použité kostičky.':'Zvol Přidat nebo Odebrat kostičku a klepni na políčko plánu. Číslo v políčku je výška sloupce. Stejné označení, třeba B2, najdeš v plánu i na obrázku.'}</p><div class="build-grid" style="grid-template-columns:repeat(${q.m.length},1fr)">${building.map((r,y)=>r.map((h,x)=>`<button data-cell="${y},${x}" ${locked?'disabled':''} aria-label="Sloupec ${y+1}, ${x+1}: ${qty(h)}"><span class="cell-label">${String.fromCharCode(65+x)}${y+1}</span>${h}</button>`).join('')).join('')}</div>${locked?`<div class="count-finale"><h2>2. Kolik kostiček jsi použil?</h2><p>Počítej i kostičky, které jsou uvnitř nebo za jinými.</p><form id="count-form"><label for="build-total">Počet kostiček</label><div class="count-entry"><input id="build-total" type="number" inputmode="numeric" min="0" max="27" step="1" required value="${esc(q.countAnswer??'')}" ${answered?'disabled':''}><button class="primary" type="submit" ${answered?'disabled':''}>Zkontrolovat počet ✓</button></div></form><button id="edit-build">← Ještě upravit stavbu</button></div>`:`<div class="tools"><button id="add" aria-pressed="${!removeMode}" class="${!removeMode?'mode-active':''}">+ Přidat kostičku</button><button id="remove" aria-pressed="${removeMode}" class="${removeMode?'mode-active':''}">− Odebrat kostičku</button><button id="clear">Vyprázdnit plán</button><button class="primary" id="check">Hotovo, zkontrolovat stavbu ✓</button></div>`}</div>`;$('#spin').onclick=()=>{turn=(turn+1)%4;$('#reference').innerHTML=iso(q.m,turn,false,0,true);$('#built').innerHTML=iso(building,turn,false,0,true)};if(locked){$('#edit-build').onclick=()=>{invalidateBuild();drawTask()};$('#build-total').oninput=()=>{q.countAnswer=$('#build-total').value};$('#count-form').onsubmit=e=>{e.preventDefault();const value=$('#build-total').value,n=Number(value);q.countAnswer=value;const correct=value!==''&&Number.isInteger(n)&&n===sum(building);feedback(correct,correct?'Stavba i počet kostiček jsou správně!':'Počet ještě nesedí. Spočítej všechny sloupce i schované kostičky.');if(correct){results[index]=true;answered=true;$('#next').disabled=false;saveSession();drawTask()}};return}$('#add').onclick=()=>{removeMode=false;drawTask()};$('#remove').onclick=()=>{removeMode=true;drawTask()};$('#clear').onclick=()=>{building=building.map(r=>r.map(()=>0));q.build=clone(building);invalidateBuild();drawTask()};document.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>{const [y,x]=b.dataset.cell.split(',').map(Number);building[y][x]=Math.max(0,Math.min(3,building[y][x]+(removeMode?-1:1)));q.build=clone(building);invalidateBuild();drawTask()});$('#check').onclick=()=>{const correct=key(building)===key(q.m);if(correct){q.build=clone(building);q.buildVerified=true;answered=false;results[index]=false;$('#next').disabled=true;drawTask();feedback(true,'Stavba je stejná! Teď ještě spočítej, kolik kostiček jsi použil.')}else feedback(false,'Ještě to není ono. Porovnej výšky sloupců a jejich místa s předlohou.')};return}
let graphic=q.id==='netcube'?netSvg(q.net,q.marked):q.id==='cubenet'?cubeSvg(q.cube,q.marked):iso(q.m,q.id==='views'&&q.dir==='left'?2:turn,false,layer);const rotatable=!exam&&['count','rotate'].includes(q.id);area.innerHTML=`<div class="work"><div><div class="board" id="main-board">${graphic}<div class="board-label">${q.id==='netcube'?'Rozložená síť':q.id==='cubenet'?'Složená krychle':'Předloha stavby'}</div></div>${rotatable?`<div class="tools"><button id="spin">↻ Otočit stavbu</button>${q.id==='count'&&!exam?'<button id="layers">Prohlédnout patra</button>':''}</div>`:''}${layer?`<div class="layer">Patro ${layer}: ${qty(q.m.flat().filter(h=>h>=layer).length)}</div>`:''}${['netcube','cubenet'].includes(q.id)?'<p class="net-note">Rozhoduje i to, které stěny spolu sousedí a jak jsou uspořádané kolem rohu.</p>':''}</div><div class="options ${q.id==='count'?'numbers':''}" aria-label="Možnosti odpovědi">${q.options.map((o,i)=>`<button class="option" data-choice="${i}" aria-label="${q.id==='count'?qty(o):'Možnost '+String.fromCharCode(65+i)}" aria-pressed="${selected===i}">${q.id==='count'?o:q.id==='views'?flatView(o):q.id==='rotate'?iso(o,0,true):q.id==='netcube'?cubeSvg(o,q.marked):netSvg(o,q.marked)}<span class="opt-tag">${q.id==='count'?noun(o):String.fromCharCode(65+i)}</span></button>`).join('')}</div></div>`;document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>choose(+b.dataset.choice));if(rotatable)$('#spin').onclick=()=>{turn=(turn+1)%4;drawTask();markSelection()};if($('#layers'))$('#layers').onclick=()=>{layer=(layer+1)%(Math.max(...q.m.flat())+1);drawTask();markSelection()};}
function invalidateBuild(){const q=tasks[index];q.buildVerified=false;q.countAnswer='';answered=false;results[index]=false;$('#next').disabled=true;$('#feedback').className='feedback';$('#feedback').textContent='Přidávej nebo odebírej kostičky a postav stejnou stavbu.';saveSession()}
function markSelection(){document.querySelectorAll('[data-choice]').forEach(b=>{b.classList.toggle('selected',+b.dataset.choice===selected);b.setAttribute('aria-pressed',String(+b.dataset.choice===selected))})}
function feedback(good,text){$('#feedback').className='feedback '+(good?'good':'bad');$('#feedback').textContent=(good?'✓ ':'Zkus to ještě jednou. ')+text}
function choose(i){const q=tasks[index];selected=i;q.response=i;markSelection();if(exam){$('#feedback').textContent='Odpověď je označená. Můžeš pokračovat nebo ji změnit.';$('#next').disabled=false;saveSession();return}const correct=i===q.correct;if(correct){answered=true;results[index]=true;feedback(true,explanation(q));$('#next').disabled=false}else{answered=false;results[index]=false;$('#next').disabled=true;feedback(false,q.id==='count'?'Počítej sloupce a nezapomeň na skryté kostky.':q.id==='views'?'Představ si, že se díváš rovně ve směru šipky.':q.id==='rotate'?'Sleduj, které sloupce stojí vedle sebe.': 'Zkontroluj, které barevné stěny spolu tvoří roh.')}saveSession()}
function explanation(q){if(q.id==='count')return `Správně! Celá stavba má ${qty(sum(q.m))}.`;if(q.id==='views')return 'Správně, takhle stavba vypadá z vybraného směru.';if(q.id==='rotate')return 'Je to stejná stavba, jen otočená na podložce.';return 'Správně! Barvy i sousední stěny souhlasí.'}
function finish(){document.querySelector('body').setAttribute('data-view','result');const score=exam?tasks.filter(q=>q.response===q.correct).length:results.filter(Boolean).length;$('#app').innerHTML=`${taskLevels()}<section class="result"><h1>${exam?'Test je hotový!':'Výprava je hotová!'} ✦</h1><p class="score">${score} / 10</p><p>${score===10?'Výborně! Máš skvělou prostorovou představivost.':'Každá další stavba ti pomůže vidět zase o kousek víc.'}</p>${exam?tasks.map((q,i)=>`<div class="review ${q.response===q.correct?'good':''}"><b>${q.response===q.correct?'✓':'✗'} ${i+1}. ${CATS.find(c=>c.id===q.id).name}</b><br>Tvoje odpověď: ${q.id==='count'?qty(q.options[q.response]):String.fromCharCode(65+q.response)}. Správně: ${q.id==='count'?qty(q.options[q.correct]):String.fromCharCode(65+q.correct)}.<div style="max-width:220px">${q.id==='netcube'?cubeSvg(q.options[q.correct],q.marked):q.id==='cubenet'?netSvg(q.options[q.correct],q.marked):q.id==='views'?flatView(q.options[q.correct]):q.id==='rotate'?iso(q.options[q.correct],0,true):''}</div></div>`).join(''):''}<div class="tools"><button id="home" class="primary">Vybrat další úkol →</button><button id="again">Nových 10 úloh</button></div></section>`;bindTaskLevels();$('#home').onclick=home;$('#again').onclick=()=>{delete session[sessionKey(category)];tasks=newTasks(category);index=0;results=[];render()};saveSession()}
document.querySelector('a.brand').onclick=e=>{e.preventDefault();home()};$('#restart').onclick=()=>{session={};voxelSessions={};category='';difficulty=0;home()};addEventListener('hashchange',home);home();
