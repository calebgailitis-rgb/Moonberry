/* Inventory, homestead tools, oxygen and dustling encounters. Extends the v1 core. */
(function(root){
  'use strict';
  const base=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.Moonberry;
  const M={...base},key=base.key,blocked=t=>['wall','rock','crater'].includes(t);
  M.CROPS=[...base.CROPS,
    {name:'Comet melon',icon:'✺',color:'#fcad78',days:3,buy:null,sell:95,description:'Rare dustling seed. A tiny comet with a sweet heart.'},
    {name:'Prism fern',icon:'❖',color:'#85e8e4',days:4,buy:null,sell:125,description:'Rare dustling seed. Leaves made of moonlight.'}];
  M.terrain=(x,y,zone='surface')=>{const t=base.terrain(x,y,zone);return t==='plot'||t==='moss'?'dust':t;};
  M.insideHome=s=>s.zone==='surface'&&s.x===9&&s.y===10;
  function note(s,text){s.notes.unshift(`Day ${s.day} · ${text}`);s.notes=s.notes.slice(0,12);}
  M.itemCount=(s,id)=>{if(!id)return 0;if(['hoe','bucket','laser'].includes(id))return 1;const [type,crop]=id.split(':');return (type==='seed'?s.seeds:s.harvest)[Number(crop)]||0;};
  function tidy(s){s.slots=s.slots.map(id=>id&&M.itemCount(s,id)?id:null);}
  function canCarry(s,id){tidy(s);return s.slots.includes(id)||s.slots.includes(null);}
  M.addItem=(s,type,crop,qty=1)=>{const id=`${type}:${crop}`;if(!canCarry(s,id))return false;if(!s.slots.includes(id))s.slots[s.slots.indexOf(null)]=id;(type==='seed'?s.seeds:s.harvest)[crop]+=qty;return true;};
  function give(s,type,crop,qty=1){if(!M.addItem(s,type,crop,qty))s.drops.push({x:s.x,y:s.y,zone:s.zone,type,crop,qty});}
  M.selectSlot=(s,i)=>{if(!Number.isInteger(i)||i<0||i>7)return;s.slot=i;const id=s.slots[i];if(id?.startsWith('seed:'))s.selected=Number(id.split(':')[1]);};
  M.createState=()=>{const s=base.createState();Object.assign(s,{version:2,health:100,oxygen:100,water:12,slot:0,facing:[0,1],slots:['hoe','bucket','laser','seed:0','seed:1',null,null,null],seeds:[8,2,0,0,0,0],harvest:[0,0,0,0,0,0],beds:[],turn:0,nextSpawn:24,monsters:[],drops:[]});s.notes=['Day 1 · A hoe, a bucket, a laser, and a little patch of possibility.'];return s;};
  function rescue(s,reason){s.zone='surface';s.x=9;s.y=10;s.monsters=[];note(s,`Emergency tether brought you home: ${reason}. Rest inside to recover.`);M.reveal(s);return `${reason}! Your emergency tether brought you inside the habitat. Rest to recover.`;}
  M.tick=(s,rng=Math.random)=>{
    s.turn++;
    if(!M.insideHome(s)&&s.turn%2===0)s.oxygen=Math.max(0,s.oxygen-1);
    if(s.turn%3===0)for(const m of s.monsters){
      if(m.zone!==s.zone)continue;const d=Math.abs(m.x-s.x)+Math.abs(m.y-s.y);
      if(d<=1&&!M.near(s,'home')){s.health=Math.max(0,s.health-10);continue;}
      if(d>10||M.near(s,'home'))continue;
      const options=Math.abs(s.x-m.x)>=Math.abs(s.y-m.y)?[[Math.sign(s.x-m.x),0],[0,Math.sign(s.y-m.y)]]:[[0,Math.sign(s.y-m.y)],[Math.sign(s.x-m.x),0]];
      for(const [dx,dy] of options){if(!dx&&!dy)continue;const x=m.x+dx,y=m.y+dy;if(blocked(M.terrain(x,y,m.zone))||x===s.x&&y===s.y||s.monsters.some(o=>o!==m&&o.zone===m.zone&&o.x===x&&o.y===y)||M.POI.some(p=>Math.abs(p.x-x)+Math.abs(p.y-y)<=2))continue;m.x=x;m.y=y;break;}
    }
    if(s.turn>=s.nextSpawn){s.nextSpawn=s.turn+24+Math.floor(rng()*20);if(s.monsters.length<3){const options=[];for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++){const x=s.x+dx,y=s.y+dy,d=Math.abs(dx)+Math.abs(dy);if(d<5||d>7||blocked(M.terrain(x,y,s.zone))||M.POI.some(p=>Math.abs(p.x-x)+Math.abs(p.y-y)<4)||s.monsters.some(m=>m.zone===s.zone&&m.x===x&&m.y===y))continue;options.push({x,y,zone:s.zone,hp:2});}if(options.length)s.monsters.push(options[Math.min(options.length-1,Math.floor(rng()*options.length))]);}}
    if(s.oxygen<=0&&!M.insideHome(s))s.health=Math.max(0,s.health-5);if(s.health<=0)return rescue(s,'Suit health depleted');return s.oxygen<=0&&!M.insideHome(s)?'Oxygen empty! Losing 5 health per action. Get inside your house.':'';
  };
  M.move=(s,dx,dy,rng=Math.random)=>{if(Math.abs(dx)+Math.abs(dy)!==1)return 'Choose one direction.';s.facing=[dx,dy];const x=s.x+dx,y=s.y+dy;if(blocked(M.terrain(x,y,s.zone)))return 'Find a path around the rocks.';if(s.monsters.some(m=>m.zone===s.zone&&m.x===x&&m.y===y))return 'A dustling blocks the path. Face it and use your laser.';if(s.health<=0)return 'Rest inside the habitat to recover.';s.x=x;s.y=y;s.steps++;if(s.steps%(4+s.upgrades.boots*4)===0)s.energy=Math.max(0,s.energy-1);M.reveal(s);return M.tick(s,rng)||(s.oxygen===20?'Oxygen low. Head inside the house at 9° E / 10° N and rest.':'');};
  M.canTill=(x,y)=>!blocked(M.terrain(x,y))&&!M.POI.some(p=>Math.abs(p.x-x)<=1&&Math.abs(p.y-y)<=1)&&!M.resource(x,y,'surface');
  M.targetPlot=s=>{if(s.zone!=='surface')return null;for(const [dx,dy] of [[0,0],s.facing,[0,1],[1,0],[-1,0],[0,-1]]){const k=key(s.x+dx,s.y+dy);if(s.beds.includes(k))return k;}return null;};
  M.hoe=s=>{if(s.zone!=='surface')return 'The hollow is solid rock. Make your garden on the surface.';const k=key(s.x,s.y);if(!M.canTill(s.x,s.y))return 'Choose open dust away from buildings, crystals, and rocks.';if(s.beds.includes(k))return 'A bed is already here. Equip seeds or your bucket.';if(s.energy<2)return 'Rest inside the habitat to recover energy.';s.energy-=2;s.beds.push(k);return 'Your garden, your choice. Soil tilled underfoot. Equip seeds to plant here.';};
  M.farm=s=>{
    const k=M.targetPlot(s);if(!k)return 'Equip your hoe and use it on open moon dust to make a garden bed.';const p=s.plots[k],id=s.slots[s.slot];
    if(p&&p.age>=M.CROPS[p.crop].days){if(!M.addItem(s,'harvest',p.crop,s.upgrades.tank===2?2:1))return 'All 8 slots are full. Sell or drop a stack before harvesting.';delete s.plots[k];return `Harvested ${M.CROPS[p.crop].name}! It is now in your item bar.`;}
    if(id==='bucket'){if(!p)return 'Plant seeds in this bed before watering.';if(p.watered)return 'Already watered. Rest inside to let it grow.';if(!s.water)return 'Your bucket is empty. Rest inside your habitat to refill it.';if(s.energy<1)return 'Rest inside to recover energy.';s.water--;p.watered=true;s.energy=Math.max(0,s.energy-(s.upgrades.tank?1:3));return 'Watered. Rest inside your habitat to let it grow.';}
    if(!id?.startsWith('seed:'))return p?'Equip your bucket to water this plant.':'Equip seeds from the item bar to plant here.';if(p)return 'There is already a plant here. Equip your bucket to water it.';if(s.energy<3)return 'Rest inside your habitat to recover energy.';
    const crop=Number(id.split(':')[1]);s.seeds[crop]--;s.plots[k]={crop,age:0,watered:false};s.energy-=3;tidy(s);return `Planted ${M.CROPS[crop].name}. Equip your bucket and water it.`;
  };
  M.shoot=(s,rng=Math.random)=>{if(s.energy<1)return 'Your laser needs energy. Rest inside your habitat.';s.energy--;const [dx,dy]=s.facing;
    for(let i=1;i<=6;i++){const x=s.x+dx*i,y=s.y+dy*i;if(blocked(M.terrain(x,y,s.zone)))break;const m=s.monsters.find(m=>m.zone===s.zone&&m.x===x&&m.y===y);if(!m)continue;m.hp--;if(m.hp>0)return M.tick(s,rng)||'Laser hit! One more shot will disperse this dustling.';s.monsters=s.monsters.filter(v=>v!==m);const rare=rng()<0.1;if(rare){const crop=4+Math.min(1,Math.floor(rng()*2));s.drops.push({x:m.x,y:m.y,zone:m.zone,type:'seed',crop,qty:1});}return M.tick(s,rng)||(rare?'Dustling dispersed! A rare seed dropped. Press E nearby to pick it up.':'Dustling dispersed. The moon is quiet again.');}
    return M.tick(s,rng)||'Level 1 laser fired. Face a dustling in the same row or column (range 6).';
  };
  M.useItem=(s,rng=Math.random)=>{if(s.health<=0)return 'Rest inside your habitat to recover.';const id=s.slots[s.slot];if(id==='laser')return M.shoot(s,rng);if(!id)return 'This slot is empty. Choose a tool or seed stack.';const message=id==='hoe'?M.hoe(s):M.farm(s);return M.tick(s,rng)||message;};
  M.dropSelected=s=>{const id=s.slots[s.slot];if(!id)return 'Nothing in this slot.';if(['hoe','bucket','laser'].includes(id))return 'Keep your starter tools. Seed and harvest stacks can be dropped.';const [type,cropText]=id.split(':'),crop=Number(cropText),qty=M.itemCount(s,id);s.drops.push({x:s.x,y:s.y,zone:s.zone,type,crop,qty});(type==='seed'?s.seeds:s.harvest)[crop]=0;tidy(s);return 'Stack placed on the ground. Press E nearby to pick it up again.';};
  M.sleep=s=>{
    if(!M.insideHome(s))return 'Rest inside your house: walk onto 9° E / 10° N, then press E.';
    for(const p of Object.values(s.plots)){if(p.watered&&p.age<M.CROPS[p.crop].days)p.age++;p.watered=false;}
    const d=s.day;if(d%7===0&&s.paidThrough<d){s.arrears+=s.rent;note(s,`Rent of ${s.rent} cr carried forward.`);}s.day++;s.energy=100+s.upgrades.tank*20;s.health=100;s.oxygen=100;s.water=12+s.upgrades.tank*8;s.monsters=[];s.nextSpawn=s.turn+24;if(d%7===0)s.rent=80+Math.min(120,Math.floor(d/7)*20);
    if(s.seeds.every(n=>!n)&&!Object.keys(s.plots).length&&s.harvest.every(n=>!n)&&s.credits<8){give(s,'seed',0,3);note(s,'Pip left three moonberry seeds by the door.');}M.reveal(s);return `Day ${s.day}. Health, oxygen, energy, and bucket refilled. Watered plants grew overnight.`;
  };
  M.sell=s=>{const value=s.harvest.reduce((n,v,i)=>n+v*M.CROPS[i].sell,0);if(!value)return 'Your harvest basket is empty.';s.credits+=value;s.harvest=Array(6).fill(0);tidy(s);return `Pip bought your harvest for ${value} credits.`;};
  M.buy=(s,i)=>{if(!Number.isInteger(i)||!M.CROPS[i]||M.CROPS[i].buy===null)return 'This rare seed can only be found in a dustling drop.';if(!canCarry(s,`seed:${i}`))return 'All 8 slots are full. Free a slot before buying a new seed type.';if(s.credits<M.CROPS[i].buy)return 'Not enough credits.';s.credits-=M.CROPS[i].buy;M.addItem(s,'seed',i);return `One ${M.CROPS[i].name} seed tucked safely away.`;};
  M.interact=s=>{
    if(M.insideHome(s))return 'home';
    const d=s.drops.find(d=>d.zone===s.zone&&Math.abs(d.x-s.x)+Math.abs(d.y-s.y)<=1);if(d){if(!M.addItem(s,d.type,d.crop,d.qty))return 'All 8 slots are full. The dropped stack will wait here.';s.drops=s.drops.filter(v=>v!==d);return `Picked up ${d.qty} ${M.CROPS[d.crop].name} ${d.type==='seed'?'seed':'harvest'}.`;}
    if(M.near(s,'home'))return 'Step onto the habitat door at 9° E / 10° N to rest inside.';
    const before=[...s.seeds],result=base.interact(s);const added=s.seeds.map((v,i)=>v-before[i]);s.seeds=before;added.forEach((qty,i)=>{if(qty>0)give(s,'seed',i,qty);});return result;
  };
  M.validate=s=>{
    const int=(v,a,b)=>Number.isSafeInteger(v)&&v>=a&&v<=b,coord=(x,y)=>int(x,0,M.W-1)&&int(y,0,M.H-1),zone=z=>['surface','cave'].includes(z);
    if(!s||s.version!==2||!int(s.day,1,100000)||!int(s.credits,0,1e9)||!coord(s.x,s.y)||!zone(s.zone)||!int(s.energy,0,140)||!int(s.health,0,100)||!int(s.oxygen,0,100)||!int(s.water,0,28)||!int(s.selected,0,5)||!int(s.slot,0,7))return false;
    if(!s.upgrades||!['tank','boots','scanner'].every(k=>int(s.upgrades[k],0,2))||![s.seeds,s.harvest].every(a=>Array.isArray(a)&&a.length===6&&a.every(n=>int(n,0,1e7))))return false;
    if(!Array.isArray(s.slots)||s.slots.length!==8||!['hoe','bucket','laser'].every(id=>s.slots.includes(id))||new Set(s.slots.filter(Boolean)).size!==s.slots.filter(Boolean).length)return false;
    if(!s.slots.every(id=>id===null||['hoe','bucket','laser'].includes(id)||typeof id==='string'&&/^(seed|harvest):[0-5]$/.test(id)&&M.itemCount(s,id)>0))return false;
    for(const type of ['seed','harvest'])for(let i=0;i<6;i++)if((type==='seed'?s.seeds:s.harvest)[i]>0&&!s.slots.includes(`${type}:${i}`))return false;
    if(![s.seen,s.caveSeen,s.collected,s.relics,s.notes,s.beds].every(a=>Array.isArray(a)&&a.length<10000&&a.every(v=>typeof v==='string'&&v.length<500)))return false;
    if(!s.beds.every(k=>{const [x,y]=k.split(',').map(Number);return key(x,y)===k&&M.canTill(x,y);})||new Set(s.beds).size!==s.beds.length)return false;
    if(!int(s.paidThrough,0,100007)||!int(s.rent,80,200)||!int(s.arrears,0,1e9)||!int(s.steps,0,1e9)||!int(s.turn,0,1e9)||!int(s.nextSpawn,0,1e9)||typeof s.won!=='boolean')return false;
    if(!Array.isArray(s.facing)||s.facing.length!==2||!s.facing.every(v=>int(v,-1,1))||Math.abs(s.facing[0])+Math.abs(s.facing[1])!==1)return false;
    if(!s.plots||typeof s.plots!=='object'||Array.isArray(s.plots)||Object.keys(s.plots).length>M.W*M.H)return false;
    for(const [k,p] of Object.entries(s.plots))if(!s.beds.includes(k)||!p||!int(p.crop,0,5)||!int(p.age,0,100000)||typeof p.watered!=='boolean')return false;
    if(!Array.isArray(s.monsters)||s.monsters.length>3||!s.monsters.every(m=>m&&coord(m.x,m.y)&&zone(m.zone)&&!blocked(M.terrain(m.x,m.y,m.zone))&&int(m.hp,1,2)))return false;
    if(!Array.isArray(s.drops)||s.drops.length>10000||!s.drops.every(d=>d&&coord(d.x,d.y)&&zone(d.zone)&&['seed','harvest'].includes(d.type)&&int(d.crop,0,5)&&int(d.qty,1,1e7)))return false;
    return !blocked(M.terrain(s.x,s.y,s.zone));
  };
  M.migrate=old=>{
    if(old?.version===2)return M.validate(old)?old:null;
    if(!base.validate(old))return null;
    const s=JSON.parse(JSON.stringify(old));Object.assign(s,{version:2,health:100,oxygen:100,water:12,slot:0,facing:[0,1],slots:['hoe','bucket','laser',null,null,null,null,null],seeds:[...s.seeds,0,0],harvest:[...s.harvest,0,0],beds:Object.keys(s.plots),turn:0,nextSpawn:24,monsters:[],drops:[]});
    for(const type of ['seed','harvest'])for(let i=0;i<6;i++){const a=type==='seed'?s.seeds:s.harvest;if(a[i]>0){const slot=s.slots.indexOf(null);if(slot>=0)s.slots[slot]=`${type}:${i}`;else{s.drops.push({x:9,y:10,zone:'surface',type,crop:i,qty:a[i]});a[i]=0;}}}
    note(s,'Starter tools delivered. Your crops are safe; overflow stacks wait at your house.');return M.validate(s)?s:null;
  };
  if(typeof module!=='undefined'&&module.exports)module.exports=M;else root.Moonberry=M;
})(typeof window==='undefined'?this:window);
