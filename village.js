/* Original village residents, shared supplies and peaceful-world rules. */
(function(root){
  'use strict';
  const old=typeof module!=='undefined'&&module.exports?require('./survival.js'):root.Moonberry,M={...old},tickCore=old.tick,countCore=old.itemCount;
  const MATERIALS={wood:{name:'Space wood',icon:'♠',color:'#bcceaa',value:4},stone:{name:'Moon stone',icon:'◆',color:'#b9c5db',value:3},fiber:{name:'Star fiber',icon:'≋',color:'#dbb6d5',value:2}};
  const RESIDENTS=[{id:'mox',name:'Mox',role:'Garden keeper',x:12,y:8,color:'#a8d4ac',line:'I grew a tomato once. It grew an opinion. I like this moon better with you here.'},{id:'bolt',name:'Bolt',role:'Woodland tinkerer',x:18,y:12,color:'#e7bd88',line:'Hear those trees? Their rings remember every sunrise. Let’s build something that lasts.'},{id:'lumi',name:'Lumi',role:'Curious collector',x:14,y:5,color:'#bfafe5',line:'I catalogue tiny beautiful things. You’re officially on the list, neighbor.'}];
  const BUILDINGS=[{x:13,y:5,type:'workshop',name:'Little Orbit Workshop'},{x:8,y:5,type:'cottage',name:'Mox’s greenhouse'},{x:18,y:5,type:'cottage',name:'Lumi’s observatory'},{x:13,y:8,type:'depot',name:'Village supply chest'}];
  const NODES=[['wood',5,15],['wood',7,18],['wood',19,18],['wood',21,10],['wood',22,17],['wood',25,19],['wood',4,19],['wood',30,9],['wood',10,21],['wood',15,19],['stone',20,16],['stone',24,10],['stone',7,20],['stone',29,17],['stone',13,20],['fiber',6,16],['fiber',20,18],['fiber',15,17],['fiber',22,9],['fiber',27,20]].filter(([,x,y])=>!['rock','crater','wall'].includes(old.terrain(x,y))&&!old.resource(x,y,'surface')).map(([type,x,y],i)=>({id:'node'+i,type,x,y}));
  const village=(x,y)=>x>=6&&x<=20&&y>=3&&y<=17;
  const path=(x,y)=>village(x,y)&&((y===10&&x>=8&&x<=18)||(x===13&&y>=5&&y<=13)||(y===5&&x>=8&&x<=18)||(y===13&&x>=9&&x<=18));
  function fresh(s){s.villageVersion=1;s.materials={wood:0,stone:0,fiber:0};s.stock={wood:0,stone:0,fiber:0,seeds:Array(6).fill(0),harvest:Array(6).fill(0)};s.npcs=RESIDENTS.map(r=>({id:r.id,x:r.x,y:r.y,friendship:0,talkedDay:0,giftDay:0,job:'idle',cargo:null}));s.nodeTaken={};s.crafted={sprinkler:false,drone:false};s.monsters=[];s.nextSpawn=s.turn+180;return s;}
  M.MATERIALS=MATERIALS;M.RESIDENTS=RESIDENTS;M.BUILDINGS=BUILDINGS;M.NODES=NODES;M.inVillage=s=>s.zone==='surface'&&village(s.x,s.y);M.isPath=path;
  M.createState=()=>{const s=fresh(old.createState());for(let y=3;y<=17;y++)for(let x=6;x<=20;x++)if(!s.seen.includes(M.key(x,y)))s.seen.push(M.key(x,y));return s;};
  M.itemCount=(s,id)=>id?.startsWith('material:')?s.materials[id.split(':')[1]]||0:countCore(s,id);
  M.addItem=(s,type,crop,qty=1)=>{if(type!=='material')return old.addItem(s,type,crop,qty);if(!Object.hasOwn(MATERIALS,crop))return false;const id=`material:${crop}`;let index=s.slots.indexOf(id);if(index<0){index=s.slots.indexOf(null);if(index<0)return false;s.slots[index]=id;}s.materials[crop]+=qty;return true;};
  M.dropSelected=s=>{const id=s.slots[s.slot];if(!id?.startsWith('material:'))return old.dropSelected(s);const crop=id.split(':')[1],qty=s.materials[crop];s.drops.push({x:s.x,y:s.y,zone:s.zone,type:'material',crop,qty});s.materials[crop]=0;s.slots[s.slot]=null;return 'Stack placed on the ground. E picks it up nearby.';};
  M.canTill=(x,y)=>old.canTill(x,y)&&!BUILDINGS.some(b=>Math.abs(b.x-x)<=1&&Math.abs(b.y-y)<=1)&&!NODES.some(n=>n.x===x&&n.y===y);
  // Keep legacy planted beds valid, while new beds respect village buildings and trees.
  M.hoe=s=>{if(s.zone==='surface'&&!M.canTill(s.x,s.y)&&!s.beds.includes(M.key(s.x,s.y)))return 'Keep the village buildings and trees clear. Choose open dust for your garden.';return old.hoe(s);};
  M.useItem=(s,rng=Math.random)=>{if(s.slots[s.slot]==='hoe'){if(s.health<=0)return 'Rest inside your habitat to recover.';const text=M.hoe(s);return M.tick(s,rng)||text;}return old.useItem(s,rng);};
  const blocked=(x,y)=>['rock','crater','wall'].includes(M.terrain(x,y));
  const available=(s,n)=>s.nodeTaken[n.id]===undefined||s.day-s.nodeTaken[n.id]>=3;
  M.nodeAvailable=available;
  function step(s,npc,tx,ty){if(npc.x===tx&&npc.y===ty)return true;const queue=[[npc.x,npc.y,null]],seen=new Set([M.key(npc.x,npc.y)]);for(let i=0;i<queue.length;i++){const [x,y,first]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=M.key(nx,ny);if(seen.has(k)||blocked(nx,ny))continue;const next=first||[nx,ny];if(nx===tx&&ny===ty){[npc.x,npc.y]=next;return npc.x===tx&&npc.y===ty;}seen.add(k);queue.push([nx,ny,next]);}}return false;}
  function finish(npc){npc.job='idle';npc.friendship=Math.min(100,npc.friendship+1);npc.target=null;}
  function worker(s,npc){
    const r=RESIDENTS.find(r=>r.id===npc.id);
    if(npc.cargo||npc.job==='return'){
      if(step(s,npc,13,8)){if(npc.cargo){const c=npc.cargo;if(c.type==='harvest')s.stock.harvest[c.crop]+=c.qty;else s.stock[c.crop]+=c.qty;npc.cargo=null;}finish(npc);}return;
    }
    if(npc.job==='idle'){if(s.turn%14===0)step(s,npc,r.x,r.y);return;}
    if(['wood','stone','fiber'].includes(npc.job)){
      const targets=NODES.filter(n=>n.type===npc.job&&available(s,n)).sort((a,b)=>Math.abs(a.x-npc.x)+Math.abs(a.y-npc.y)-Math.abs(b.x-npc.x)-Math.abs(b.y-npc.y));const n=targets[0];if(!n){finish(npc);return;}
      if(step(s,npc,n.x,n.y)){s.nodeTaken[n.id]=s.day;npc.cargo={type:'material',crop:n.type,qty:3};}return;
    }
    const beds=s.beds.map(k=>({k,p:s.plots[k]})).filter(({p})=>npc.job==='water'?p&&!p.watered&&p.age<M.CROPS[p.crop].days:npc.job==='harvest'?p&&p.age>=M.CROPS[p.crop].days:!p&&s.stock.seeds.some(n=>n>0)).sort((a,b)=>{const [ax,ay]=a.k.split(',').map(Number),[bx,by]=b.k.split(',').map(Number);return Math.abs(ax-npc.x)+Math.abs(ay-npc.y)-Math.abs(bx-npc.x)-Math.abs(by-npc.y);});
    const bed=beds[0];if(!bed){finish(npc);return;}const [x,y]=bed.k.split(',').map(Number);
    if(step(s,npc,x,y)){if(npc.job==='water'){bed.p.watered=true;}else if(npc.job==='harvest'){npc.cargo={type:'harvest',crop:bed.p.crop,qty:s.upgrades.tank===2?2:1};delete s.plots[bed.k];}else{const crop=s.stock.seeds.findIndex(n=>n>0);if(crop>=0){s.stock.seeds[crop]--;s.plots[bed.k]={crop,age:0,watered:false};}}}
  }
  M.tick=(s,rng=Math.random)=>{
    const spawn=s.nextSpawn;s.nextSpawn=1e9;s.monsters=s.monsters.filter(m=>m.zone!=='surface'||!village(m.x,m.y));if(M.inVillage(s))s.monsters=s.monsters.filter(m=>m.zone!=='surface');
    // The core deals 10 per hit; absorb 6 before damage so rescue uses the new 4-point hit.
    if((s.turn+1)%3===0&&!M.near(s,'home'))s.health+=s.monsters.filter(m=>m.zone===s.zone&&Math.abs(m.x-s.x)+Math.abs(m.y-s.y)<=1).length*6;
    const result=tickCore(s,rng);s.nextSpawn=spawn;
    if(s.turn>=s.nextSpawn){s.nextSpawn=s.turn+120+Math.floor(rng()*81);if(!M.inVillage(s)&&s.monsters.length===0){const options=[];for(let y=s.y-7;y<=s.y+7;y++)for(let x=s.x-7;x<=s.x+7;x++){const d=Math.abs(x-s.x)+Math.abs(y-s.y);if(d<6||d>8||blocked(x,y)||s.zone==='surface'&&village(x,y)||['wall','rock','crater'].includes(M.terrain(x,y,s.zone)))continue;options.push({x,y,zone:s.zone,hp:2});}if(options.length)s.monsters.push(options[Math.min(options.length-1,Math.floor(rng()*options.length))]);}}
    s.monsters=s.monsters.filter(m=>m.zone!=='surface'||!village(m.x,m.y));if(s.turn%(s.crafted.drone?1:2)===0)s.npcs.forEach(n=>worker(s,n));return result;
  };
  // The v2 core uses its own exported API internally. Install hooks there too.
  const oldMove=old.move,oldShoot=old.shoot,oldUse=old.useItem;old.tick=M.tick;
  M.move=(s,dx,dy,rng=Math.random)=>oldMove(s,dx,dy,rng);
  M.shoot=(s,rng=Math.random)=>oldShoot(s,rng);
  const cleanLegacySlots=fn=>s=>{const saved=s.slots.map(id=>id?.startsWith('material:')?id:null);const result=fn(s);saved.forEach((id,i)=>{if(id)s.slots[i]=id;});return result;};
  M.farm=cleanLegacySlots(old.farm);old.farm=M.farm;
  M.buy=(s,i)=>{const kept=s.slots.map(id=>id?.startsWith('material:')?id:null),before=s.slots.slice();const result=old.buy(s,i);kept.forEach((id,k)=>{if(id&&s.slots[k]!==id){s.slots=before;}});return result;};
  // Teach the original inventory maintenance about material stacks.
  old.itemCount=M.itemCount;
  M.sell=cleanLegacySlots(old.sell);
  M.nearNpc=s=>s.zone==='surface'&&s.npcs.find(n=>Math.abs(n.x-s.x)+Math.abs(n.y-s.y)<=2);
  M.talk=(s,id)=>{const n=s.npcs.find(n=>n.id===id);if(!n)return 'Unknown neighbor.';if(s.zone!=='surface'||Math.abs(n.x-s.x)+Math.abs(n.y-s.y)>2)return 'Walk closer to your neighbor to chat.';if(n.talkedDay!==s.day){n.friendship=Math.min(100,n.friendship+10);n.talkedDay=s.day;return 'A good conversation. +10 friendship. You can now ask for a helping hand.';}return 'Your neighbor is happy to see you. Friendship grows once per day from chatting.';};
  M.gift=(s,id)=>{const n=s.npcs.find(n=>n.id===id);if(!n||s.zone!=='surface'||Math.abs(n.x-s.x)+Math.abs(n.y-s.y)>2)return 'Walk closer to give a gift.';if(n.giftDay===s.day)return 'One thoughtful gift a day is plenty.';const item=s.slots[s.slot];if(!item?.startsWith('harvest:'))return 'Equip a harvested crop in the item bar to give it as a gift.';const i=Number(item.split(':')[1]);s.harvest[i]--;if(!s.harvest[i])s.slots[s.slot]=null;n.friendship=Math.min(100,n.friendship+15);n.giftDay=s.day;return 'A homegrown gift. +15 friendship.';};
  M.command=(s,id,job)=>{const n=s.npcs.find(n=>n.id===id);if(!n||!['water','harvest','plant','wood','stone','fiber','return'].includes(job))return 'Choose a job for a village robot.';if(s.zone!=='surface'||Math.abs(n.x-s.x)+Math.abs(n.y-s.y)>2)return 'Walk closer to give your neighbor a job.';if(n.friendship<10)return 'Have a friendly chat first. Helpers unlock at 10 friendship.';if(n.cargo&&job!=='return')return 'Your helper is carrying supplies. Let them return to the chest first.';n.job=job;return job==='plant'?'Planting assigned. Put seeds into the shared chest first.':`Job assigned: ${job}. Your helper works as you walk and use tools.`;};
  M.collect=(s,node)=>{if(s.zone!=='surface'||Math.abs(node.x-s.x)+Math.abs(node.y-s.y)>1)return 'Walk beside a resource to gather it.';if(!available(s,node))return 'This resource needs three moondays to recover.';if(s.energy<3)return 'Rest inside your habitat to recover energy.';if(!M.addItem(s,'material',node.type,3))return 'Your eight slots are full. Drop or deposit a stack first.';s.energy-=3;s.nodeTaken[node.id]=s.day;const event=M.tick(s);return event||`Gathered 3 ${MATERIALS[node.type].name}. Deposit it in the village chest or sell it at Pip’s.`;};
  M.interact=s=>{if(M.insideHome(s))return 'home';const d=s.drops.find(d=>d.zone===s.zone&&Math.abs(d.x-s.x)+Math.abs(d.y-s.y)<=1);if(d?.type==='material'){if(!M.addItem(s,'material',d.crop,d.qty))return 'All eight slots are full.';s.drops=s.drops.filter(v=>v!==d);return 'Material stack picked up.';}if(s.zone==='surface'&&BUILDINGS.some(b=>['depot','workshop'].includes(b.type)&&b.x===s.x&&b.y===s.y))return 'depot';const n=M.nearNpc(s);if(n)return 'npc:'+n.id;if(s.zone==='surface'&&BUILDINGS.some(b=>['depot','workshop'].includes(b.type)&&Math.abs(b.x-s.x)+Math.abs(b.y-s.y)<=2))return 'depot';const node=s.zone==='surface'&&NODES.find(n=>Math.abs(n.x-s.x)+Math.abs(n.y-s.y)<=1&&available(s,n));if(node)return M.collect(s,node);return old.interact(s);};
  M.atDepot=s=>s.zone==='surface'&&BUILDINGS.some(b=>['depot','workshop'].includes(b.type)&&Math.abs(b.x-s.x)+Math.abs(b.y-s.y)<=2);
  M.deposit=s=>{if(!M.atDepot(s))return 'Walk to the supply chest at 13 E / 8 N.';const id=s.slots[s.slot];if(!id||['hoe','bucket','laser'].includes(id))return 'Equip seeds, a harvested crop, or materials to deposit the stack.';const [type,crop]=id.split(':');if(type==='material'){s.stock[crop]+=s.materials[crop];s.materials[crop]=0;}else{const a=type==='seed'?s.seeds:s.harvest,b=type==='seed'?s.stock.seeds:s.stock.harvest;b[Number(crop)]+=a[Number(crop)];a[Number(crop)]=0;}s.slots[s.slot]=null;return 'Stack deposited. Robots can plant stored seeds; all deliveries arrive here.';};
  M.withdraw=(s,type,crop)=>{if(!M.atDepot(s))return 'Walk to the village supply chest.';const amount=type==='material'?s.stock[crop]:(type==='seed'?s.stock.seeds:s.stock.harvest)[crop];if(!amount)return 'That supply is empty.';if(!M.addItem(s,type,crop,amount))return 'All eight slots are full.';if(type==='material')s.stock[crop]=0;else(type==='seed'?s.stock.seeds:s.stock.harvest)[crop]=0;return 'Stack moved into your item bar.';};
  M.sellMaterials=s=>{if(!M.near(s,'shop'))return 'Visit Pip’s trading post to sell materials.';let value=0;for(const k of Object.keys(MATERIALS)){value+=s.materials[k]*MATERIALS[k].value;s.materials[k]=0;}s.slots=s.slots.map(id=>id?.startsWith('material:')?null:id);s.credits+=value;return value?`Pip bought your materials for ${value} credits.`:'No carried materials to sell.';};
  M.craft=(s,id)=>{if(!M.atDepot(s))return 'Visit the workshop or supply chest.';const costs=id==='sprinkler'?{wood:10,stone:6}:id==='drone'?{wood:12,fiber:8}:null;if(!costs)return 'Unknown workshop recipe.';if(s.crafted[id])return 'Already built.';if(Object.entries(costs).some(([k,n])=>s.stock[k]<n))return 'Deposit the required materials in the shared chest first.';Object.entries(costs).forEach(([k,n])=>s.stock[k]-=n);s.crafted[id]=true;return id==='sprinkler'?'Moon sprinkler built. Six nearby planted beds are watered automatically before each rest.':'Helper drone built. Robot jobs now advance twice as fast.';};
  M.sleep=s=>{if(!M.insideHome(s))return old.sleep(s);if(s.crafted.sprinkler)Object.entries(s.plots).filter(([k])=>{const [x,y]=k.split(',').map(Number);return Math.abs(x-9)+Math.abs(y-10)<=8;}).slice(0,6).forEach(([,p])=>p.watered=true);const result=old.sleep(s);s.nextSpawn=s.turn+180;return result;};
  M.validate=s=>{
    const num=n=>Number.isSafeInteger(n)&&n>=0&&n<=1e7,xy=n=>Number.isSafeInteger(n)&&n>=0;
    if(!s||s.villageVersion!==1||!s.materials||!s.stock||!s.crafted||!['sprinkler','drone'].every(k=>typeof s.crafted[k]==='boolean'))return false;
    if(!Object.keys(MATERIALS).every(k=>num(s.materials[k])&&num(s.stock[k]))||!['seeds','harvest'].every(k=>Array.isArray(s.stock[k])&&s.stock[k].length===6&&s.stock[k].every(num)))return false;
    if(!Array.isArray(s.slots)||!Array.isArray(s.drops)||!s.drops.every(d=>d&&typeof d==='object')||!s.slots.every(id=>id===null||typeof id==='string')||new Set(s.slots.filter(Boolean)).size!==s.slots.filter(Boolean).length)return false;
    for(const k of Object.keys(MATERIALS))if(s.materials[k]>0&&!s.slots.includes('material:'+k))return false;
    if(!s.slots.every(id=>!id?.startsWith('material:')||Object.hasOwn(MATERIALS,id.split(':')[1])&&s.materials[id.split(':')[1]]>0))return false;
    const materialDrops=s.drops.filter(d=>d.type==='material');if(!materialDrops.every(d=>Object.hasOwn(MATERIALS,d.crop)&&num(d.qty)&&d.qty>0&&xy(d.x)&&d.x<M.W&&xy(d.y)&&d.y<M.H&&['surface','cave'].includes(d.zone)))return false;
    const clone={...s,slots:s.slots.map(id=>id?.startsWith('material:')?null:id),drops:s.drops.filter(d=>d.type!=='material')};if(!old.validate(clone)||!Array.isArray(s.npcs)||!s.npcs.every(n=>n&&typeof n==='object'))return false;
    if(!Array.isArray(s.npcs)||s.npcs.length!==3||new Set(s.npcs.map(n=>n.id)).size!==3||!s.npcs.every(n=>RESIDENTS.some(r=>r.id===n.id)&&xy(n.x)&&n.x<M.W&&xy(n.y)&&n.y<M.H&&!blocked(n.x,n.y)&&num(n.friendship)&&n.friendship<=100&&num(n.talkedDay)&&num(n.giftDay)&&['idle','return','water','plant','harvest','wood','stone','fiber'].includes(n.job)&&(!n.cargo||['material','harvest'].includes(n.cargo.type)&&num(n.cargo.qty)&&n.cargo.qty>0&&(n.cargo.type==='material'?Object.hasOwn(MATERIALS,n.cargo.crop):Number.isInteger(n.cargo.crop)&&n.cargo.crop>=0&&n.cargo.crop<6))))return false;
    if(!s.nodeTaken||typeof s.nodeTaken!=='object'||Array.isArray(s.nodeTaken)||!Object.entries(s.nodeTaken).every(([id,n])=>NODES.some(v=>v.id===id)&&num(n)))return false;
    return true;
  };
  M.migrate=input=>{if(input?.villageVersion===1)return M.validate(input)?input:null;const s=old.migrate(input);if(!s)return null;fresh(s);for(let y=3;y<=17;y++)for(let x=6;x<=20;x++)if(!s.seen.includes(M.key(x,y)))s.seen.push(M.key(x,y));return M.validate(s)?s:null;};
  if(typeof module!=='undefined'&&module.exports)module.exports=M;else root.Moonberry=M;
})(typeof window==='undefined'?this:window);
