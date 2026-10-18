/* Original procedural artwork and browser interface for Moonberry. */
(() => {
  'use strict';
  const M=window.Moonberry,$=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d');
  let state=M.createState(),saveAvailable=true,toastTimer,view='';
  try {const raw=localStorage.getItem(M.SAVE_KEY);if(raw){const candidate=JSON.parse(raw);if(M.validate(candidate))state=candidate;else notify('Saved data could not be read. A fresh homestead is ready.');}}catch{saveAvailable=false;notify('Browser saving is unavailable. Use Export save to keep your progress.');}
  function notify(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),5500);}
  function save(silent=true){try{localStorage.setItem(M.SAVE_KEY,JSON.stringify(state));saveAvailable=true;if(!silent)notify('Homestead saved on this browser.');}catch{saveAvailable=false;if(!silent)notify('Saving is blocked. Export a save file instead.');}}
  function act(fn){const result=fn();if(result)notify(result);save();refresh();}
  const totalHarvest=()=>state.harvest.reduce((n,v,i)=>n+v*M.CROPS[i].sell,0);
  function refresh(){
    const due=M.rentDueDay(state),paid=state.paidThrough>=due,total=(paid?0:state.rent)+state.arrears;
    $('status').innerHTML=`<div class="stat"><small>MOONDAY</small><b>${String(state.day).padStart(2,'0')}</b></div><div class="stat"><small>CREDITS</small><b>✧ ${state.credits}</b></div><div class="stat"><small>SUIT ENERGY</small><b>${state.energy}<span style="font-size:12px;color:#a3b0bc"> / ${100+state.upgrades.tank*20}</span></b></div>`;
    $('lease').textContent=`WEEK ${Math.ceil(state.day/7)}`;$('rent').textContent=`${total} cr`;$('deadline').textContent=paid&&!state.arrears?'All settled':`Due end of day ${due}`;
    $('rent-progress').style.width=`${total?Math.min(100,state.credits/total*100):100}%`;
    $('rent-note').textContent=state.arrears?`${state.arrears} cr carried forward. There’s always another harvest.`:paid?'Your rent is paid. Go find something wonderful.':`${due-state.day+1} days to make this little patch yours.`;
    $('pay').disabled=!total;$('pay').textContent=total?'Pay rent · '+total+' cr':'Paid for this week ✓';
    $('seeds').innerHTML=M.CROPS.map((c,i)=>`<button class="seed ${state.selected===i?'active':''}" data-seed="${i}" aria-pressed="${state.selected===i}"><span class="icon" style="color:${c.color}">${c.icon}</span><span>${c.name}<small>${c.days} nights · sells for ${c.sell} cr</small></span><span class="count">${state.seeds[i]}</span></button>`).join('');
    document.querySelectorAll('[data-seed]').forEach(b=>b.onclick=()=>{state.selected=Number(b.dataset.seed);save();refresh();});
    $('inventory').textContent=`Harvest basket · ${state.harvest.reduce((a,b)=>a+b,0)} crops · ${totalHarvest()} cr value`;
    $('quest').textContent=state.won?'The moon remembers you. All three memories found. Your story keeps growing.':`${state.relics.length} / 3 lunar memories found. Follow the crystals northeast to the Humming Hollow.`;
    $('notes').replaceChildren(...state.notes.slice(0,3).map(n=>{const p=document.createElement('div');p.textContent=n;return p;}));
    $('region').textContent=state.zone==='cave'?'THE HUMMING HOLLOW':'MOSSFIELD OUTPOST';$('coordinates').textContent=`${String(state.x).padStart(2,'0')}° E / ${String(state.y).padStart(2,'0')}° N`;
    const p=state.plots[M.targetPlot(state)];
    $('prompt').textContent=state.zone==='cave'?'E · Gather crystals / discover memories / exit at the south':M.near(state,'home')?'E · Your habitat — rest and grow':M.near(state,'shop')?'E · Pip’s trading post':M.near(state,'cave')?'E · Enter the Humming Hollow':M.near(state,'ruin')?'E · Listen to the ancient garden':M.targetPlot(state)?p?(p.age>=M.CROPS[p.crop].days?'SPACE · Harvest '+M.CROPS[p.crop].name:p.watered?'Watered ✓ · Rest to grow':'SPACE · Water '+M.CROPS[p.crop].name):'SPACE · Plant '+M.CROPS[state.selected].name:'WASD · Wander     E · Discover';
  }
  function open(title,html){$('dialog-body').innerHTML=`<div class="eyebrow">MOONBERRY · FIELD COMPANION</div><h2>${title}</h2>${html}`;if(!$('dialog').open)$('dialog').showModal();}
  function shop(){
    view='shop';
    if(!M.near(state,'shop')){open('A short walk to Pip’s', '<p>The trading post is the little lavender shelter east of your habitat, at <b>17° E / 10° N</b>. Walk there and press E to trade.</p>');return;}
    open('Pip’s trading post',`<p>“Locally grown. Cosmically peculiar.” You have <b>${state.credits} credits</b>.</p><button class="primary" id="sell">Sell harvest · ${totalHarvest()} cr</button>`+M.CROPS.map((c,i)=>`<div class="row"><div><b style="color:${c.color}">${c.icon} ${c.name}</b><small>${c.description}<br>${c.days} nights · harvest sells for ${c.sell} cr</small></div><button data-buy="${i}" ${state.credits<c.buy?'disabled':''}>${c.buy} cr · seed</button></div>`).join('')+['tank','boots','scanner'].map((k,i)=>{const l=state.upgrades[k],cost=[90,70,110][i]*(l+1);return `<div class="row"><div><b>${['Moonwater kit','Moon boots','Horizon scanner'][i]} · ${l}/2</b><small>${['Less energy to water. Level 2 doubles harvest yield.','Walk farther on each charge.','Reveal more of the moon with every step.'][i]}</small></div><button data-upgrade="${k}" ${l>=2||state.credits<cost?'disabled':''}>${l>=2?'Maxed':cost+' cr'}</button></div>`;}).join(''));
    $('sell').onclick=()=>{act(()=>M.sell(state));shop();};document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{act(()=>M.buy(state,Number(b.dataset.buy)));shop();});document.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{act(()=>M.upgrade(state,b.dataset.upgrade));shop();});
  }
  function rest(){open('Call it a moonday?',`<p>Watered crops grow one stage overnight. Unwatered crops wait patiently. You wake at home with a full suit.</p><p>Rent is due at the end of day ${M.rentDueDay(state)}. Unpaid rent carries forward without eviction.</p><button id="confirm-sleep" class="primary">Rest · begin day ${state.day+1}</button>`);$('confirm-sleep').onclick=()=>{$('dialog').close();act(()=>M.sleep(state));};}
  function interact(){const result=M.interact(state);if(result==='shop'){shop();return;}if(result==='home'){rest();return;}if(result)notify(result);save();refresh();}
  function help(){open('Welcome to your little moon.', '<p>You arrived with a habitat, 100 credits, and a pocketful of impossible seeds. Make a living. Pay the lease. Find what the moon left behind.</p><p><b>1 · Plant.</b> Walk south to the twenty garden beds. Stand on or beside a bed. Choose a seed in your satchel (or keys 1–4), then press Space to plant and again to water.</p><p><b>2 · Grow.</b> Rest until tomorrow. Water each day until the crop is ripe, then press Space to harvest. Plants never wither.</p><p><b>3 · Trade.</b> Walk east to Pip’s lavender trading post and press E. Sell crops, buy seeds, and upgrade equipment. Pay rent from the lease card each week.</p><p><b>4 · Explore.</b> WASD or arrows to walk. E gathers nearby crystals, enters caves, and discovers ancient memories. Your chart keeps every place you’ve revealed. Three memories are hidden across the moon.</p><p>Time advances only when you rest. Progress saves after each action on this browser. Export a backup to move between devices or browser addresses. Touch players can use the direction buttons beneath the world.</p>');}
  function chart(){const seen=new Set(state.seen);let html='<p>Your surface discoveries. Gold is you; lavender is a discovered landmark. Dark tiles are still a mystery.</p><div class="chart" aria-label="Explored surface map">';for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){const visible=seen.has(M.key(x,y)),point=M.POI.some(p=>p.x===x&&p.y===y);html+=`<i class="${!visible?'hidden':state.zone==='surface'&&state.x===x&&state.y===y?'you':point?'point':''}"></i>`;}open('A small step into the unknown.',html+'</div><p>'+Math.round(seen.size/(M.W*M.H)*100)+'% of the surface charted · '+state.relics.length+' / 3 memories</p>');}
  $('help').onclick=help;$('close').onclick=()=>$('dialog').close();$('save').onclick=()=>save(false);$('pay').onclick=()=>act(()=>M.pay(state));$('sleep').onclick=rest;$('shop').onclick=shop;$('map').onclick=chart;
  $('action').onclick=()=>M.targetPlot(state)?act(()=>M.farm(state)):interact();
  document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const [x,y]=b.dataset.move.split(',').map(Number);act(()=>M.move(state,x,y));});
  const keys={w:[0,-1],ArrowUp:[0,-1],a:[-1,0],ArrowLeft:[-1,0],s:[0,1],ArrowDown:[0,1],d:[1,0],ArrowRight:[1,0]};let lastMove=0;
  document.addEventListener('keydown',e=>{
    if($('dialog').open||['INPUT','TEXTAREA'].includes(e.target.tagName))return;
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(keys[k]){e.preventDefault();if(performance.now()-lastMove<110)return;lastMove=performance.now();act(()=>M.move(state,...keys[k]));}
    else if(k===' '){e.preventDefault();if(!e.repeat)act(()=>M.farm(state));}
    else if(k==='e'&&!e.repeat)interact();else if(k==='m')chart();else if('1234'.includes(k)&&k.length===1){state.selected=Number(k)-1;save();refresh();}
  });
  $('export').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`moonberry-day-${state.day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Save exported. Keep it somewhere safe among the stars.');};
  $('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('size');const candidate=JSON.parse(await file.text());if(!M.validate(candidate))throw Error('invalid');open('Restore this homestead?',`<p>This save is on day ${candidate.day} with ${candidate.credits} credits. Restoring it replaces the current homestead. Export your current save first if you want to keep both.</p><button id="restore" class="primary">Restore day ${candidate.day}</button>`);$('restore').onclick=()=>{state=candidate;save();refresh();$('dialog').close();notify('Welcome home. Your save has been restored.');};}catch{notify('That file is not a supported Moonberry save. Your current game is safe.');}e.target.value='';};
  $('reset').onclick=()=>{open('Begin a new homestead?', '<p>This replaces your current progress on this browser. Export a save first if you want to return to it.</p><button id="confirm-reset" class="primary">Start a new homestead</button>');$('confirm-reset').onclick=()=>{state=M.createState();save();refresh();$('dialog').close();notify('A fresh start. The moon has been waiting for you.');};};
  window.addEventListener('pagehide',()=>save());

  // A deliberately small, original pixel-art renderer: every sprite is drawn here.
  const TILE=40,COLS=24,ROWS=15;
  function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
  function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  function line(x,y,x2,y2,c,width=2){ctx.strokeStyle=c;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();}
  function crop(x,y,p,time){
    const c=M.CROPS[p.crop],grown=p.age>=c.days,stage=Math.min(1,(p.age+1)/c.days),sway=Math.sin(time*1.5+x)*1.5;
    if(p.watered)ellipse(x+20,y+24,15,9,'#384e58');
    line(x+20,y+30,x+20+sway,y+27-stage*22,'#8bbb94',3);
    ellipse(x+13,y+24,7,3,'#83aa91');ellipse(x+26,y+20,6,3,'#a1c5a4');
    const cx=x+20+sway,cy=y+27-stage*22;
    if(p.crop===0){ellipse(cx-5,cy,6*stage+2,6*stage+2,c.color);ellipse(cx+5,cy-3,5*stage+2,5*stage+2,'#dfa6d8');rect(cx-4,cy-4,3,3,'#ffe0e9');}
    if(p.crop===1){rect(cx-3,cy,6,12*stage,'#cce0bf');ellipse(cx,cy,12*stage+3,6*stage+2,c.color);rect(cx-4,cy-3,3,2,'#eff5c4');rect(cx+4,cy-1,3,2,'#689fa4');}
    if(p.crop===2){ellipse(cx,cy,10*stage+2,8*stage+2,c.color);ellipse(cx,cy,4,5,'#5a4b64');ellipse(cx,cy-1,2,2,'#faf3c4');line(cx-15,cy+3,cx+15,cy-3,'#cb94a8',2);}
    if(p.crop===3){rect(cx-4,cy,8,9,c.color);ctx.fillStyle=c.color;ctx.beginPath();ctx.moveTo(cx-12,cy-8);ctx.lineTo(cx+12,cy-8);ctx.lineTo(cx+3,cy+5);ctx.lineTo(cx-3,cy+5);ctx.fill();ellipse(cx,cy-8,12,4,'#e0bce7');}
    if(grown){const b=.5+.5*Math.sin(time*3+x);ctx.globalAlpha=b;rect(x+32,y+4,2,6,'#f7e4a4');rect(x+30,y+6,6,2,'#f7e4a4');ctx.globalAlpha=1;}
  }
  function habitat(x,y,shop=false){
    ellipse(x+20,y+30,48,14,'#233643');
    rect(x-13,y+5,65,30,shop?'#a7a2c4':'#cfdbd3');rect(x-17,y+8,6,20,'#93a7a9');rect(x+51,y+10,6,18,'#849ca3');
    ctx.fillStyle=shop?'#c6b4d1':'#e1e5cd';ctx.beginPath();ctx.ellipse(x+19,y+5,32,24,0,Math.PI,0);ctx.fill();
    rect(x+4,y-7,31,17,'#415c72');rect(x+7,y-5,25,9,shop?'#ceaccf':'#a6d6c8');rect(x+17,y-5,3,12,'#70888b');
    rect(x+8,y+15,18,22,'#43546b');rect(x+12,y+17,10,16,'#8caaae');rect(x+18,y+25,2,2,'#f2dc9f');
    rect(x+45,y-26,3,35,'#8c9da4');line(x+46,y-26,x+58,y-36,'#8c9da4');ellipse(x+59,y-38,10,3,'#bcd1c1');
    if(shop){rect(x-14,y+9,66,7,'#d5aabb');for(let j=0;j<6;j++)rect(x-12+j*11,y+9,5,7,'#eee1c5');rect(x-25,y+22,12,15,'#8c8d70');}
    else{rect(x-38,y+14,20,13,'#344f6a');for(let j=0;j<3;j++)line(x-37+j*7,y+14,x-37+j*7,y+26,'#83a7b0',1);}
  }
  function landmark(x,y,p,time){
    if(p.type==='home'||p.type==='shop'){habitat(x,y,p.type==='shop');return;}
    if(p.type==='cave'){
      ellipse(x+20,y+18,39,27,'#697586');rect(x-9,y+8,57,27,'#697586');ellipse(x+20,y+21,22,24,'#1b273c');rect(x-1,y+21,42,15,'#1b273c');
      for(let i=0;i<3;i++){rect(x+3+i*13,y+8-i*3,4,9,'#a4a1da');}return;
    }
    ellipse(x+20,y+29,37,13,'#3a4d55');rect(x-8,y-22,9,49,'#8caca8');rect(x+38,y-28,9,55,'#8caca8');rect(x-8,y-23,55,8,'#a1b8aa');rect(x+8,y+10,25,18,'#667e83');
    const found=state.relics.includes(p.name);ellipse(x+20,y+5+Math.sin(time)*3,7,9,found?'#708984':'#dfc6ed');if(!found){ctx.globalAlpha=.15;ellipse(x+20,y+5,23,25,'#e6bbf2');ctx.globalAlpha=1;}
  }
  function astronaut(x,y,time){
    const bob=Math.sin(time*2)*1;ellipse(x+20,y+34,12,5,'#223743');
    rect(x+7,y+15+bob,6,15,'#a8b4be');rect(x+13,y+15+bob,17,16,'#eee6cb');rect(x+14,y+30+bob,6,7,'#b2bac1');rect(x+25,y+30+bob,6,7,'#b2bac1');
    rect(x+11,y+5+bob,21,15,'#f1e6cf');rect(x+8,y+9+bob,5,8,'#d9d8c5');rect(x+14,y+8+bob,18,9,'#4e6a7d');rect(x+17,y+8+bob,10,3,'#a3d9cf');rect(x+17,y+23+bob,8,3,'#b2c690');rect(x+30,y+21+bob,5,9,'#eee6cb');
  }
  function render(ms){
    const time=matchMedia('(prefers-reduced-motion: reduce)').matches?0:ms/1000;
    const ox=Math.max(0,Math.min(M.W-COLS,state.x-Math.floor(COLS/2))),oy=Math.max(0,Math.min(M.H-ROWS,state.y-Math.floor(ROWS/2)));
    const cave=state.zone==='cave',seen=new Set(cave?state.caveSeen:state.seen),collected=new Set(state.collected);
    rect(0,0,960,600,'#172338');
    for(let sy=0;sy<ROWS;sy++)for(let sx=0;sx<COLS;sx++){
      const x=sx+ox,y=sy+oy,px=sx*TILE,py=sy*TILE,k=M.key(x,y),t=M.terrain(x,y,state.zone),n=(x*7919+y*104729)%97;
      if(!seen.has(k)){
        rect(px,py,40,40,n%3===0?'#1c293d':'#1b283b');if(n%5===0)rect(px+n%32,py+12,2,2,'#43536a');continue;
      }
      const base=cave?(t==='wall'?'#283345':'#4b5269'):t==='moss'?['#637e76','#68857b','#6c857c'][n%3]:['#86938c','#929d93','#8a9891'][n%3];
      rect(px,py,40,40,base);
      if(t==='crater'){ellipse(px+20,py+22,21,17,'#596c70');ellipse(px+22,py+23,16,12,'#465c66');line(px+7,py+30,px+30,py+34,'#a4b0a1',2);}
      else if(t==='rock'||t==='wall'){rect(px+4,py+9,30,23,cave?'#364158':'#667b7c');rect(px+9,py+4,21,10,cave?'#46516a':'#a0ada0');rect(px+7,py+12,7,5,cave?'#52617a':'#829b90');}
      else if(t==='plot'){
        rect(px+2,py+3,36,34,'#4e4b50');rect(px+4,py+5,32,3,'#9d8b77');for(let i=0;i<3;i++)rect(px+7,py+13+i*7,26,2,'#6f625e');
        const p=state.plots[k];if(p)crop(px,py,p,time);
      }else{for(let i=0;i<3;i++)rect(px+(n+i*11)%35,py+(n*3+i*7)%36,2+(n%3),2,cave?'#68708a':t==='moss'?'#91aa90':'#acb6a6');if(t==='moss'&&n%7===0){line(px+22,py+30,px+22,py+23,'#a5bf9d');rect(px+18,py+23,8,3,'#c3cba8');}}
      if(M.resource(x,y,state.zone)&&!collected.has(`${state.zone}:${k}`)){
        ctx.globalAlpha=.12;ellipse(px+20,py+19,19,20,'#bbc5ff');ctx.globalAlpha=1;
        ctx.fillStyle=cave?'#bfadea':'#bae4d7';ctx.beginPath();ctx.moveTo(px+20,py+6);ctx.lineTo(px+28,py+20);ctx.lineTo(px+20,py+31);ctx.lineTo(px+14,py+21);ctx.fill();line(px+20,py+9,px+20,py+27,'#eef8df',2);
      }
      if(cave&&x===23&&y===19){rect(px+8,py+9,23,23,'#c1ccaa');rect(px+13,py+9,13,23,'#687e87');}
      if(cave&&x===23&&y===9){ellipse(px+20,py+20,16,9,'#8792ad');ellipse(px+20,py+8,7,10,state.relics.includes('hollow')?'#68758a':'#e0bdf1');}
    }
    if(!cave)for(const p of M.POI){if(seen.has(M.key(p.x,p.y)))landmark((p.x-ox)*TILE,(p.y-oy)*TILE,p,time);}
    astronaut((state.x-ox)*TILE,(state.y-oy)*TILE,time);
    // Soft edge shading gives the discovered landscape a little depth.
    const shade=ctx.createRadialGradient(480,300,180,480,300,570);shade.addColorStop(0,'#08132300');shade.addColorStop(1,'#08132360');ctx.fillStyle=shade;ctx.fillRect(0,0,960,600);
    if(!cave){for(const p of M.POI){if(!seen.has(M.key(p.x,p.y)))continue;const x=(p.x-ox)*40+20,y=(p.y-oy)*40+53;if(x<0||x>960||y<0||y>580)continue;ctx.font='10px monospace';ctx.textAlign='center';const label=p.type==='home'?'HABITAT':p.type==='shop'?'PIP’S TRADING POST':p.type==='cave'?'HUMMING HOLLOW':'ANCIENT RUINS';const width=ctx.measureText(label).width+16;rect(x-width/2,y-11,width,19,'#243443dd');ctx.fillStyle='#e0e5cd';ctx.fillText(label,x,y+2);}}
    requestAnimationFrame(render);
  }
  refresh();requestAnimationFrame(render);
  if(state.day===1&&state.steps===0)notify('Welcome home. Walk south to your garden beds. Space plants and waters.');
})();
