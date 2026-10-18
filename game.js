/* Original procedural artwork and browser interface for Moonberry. */
(() => {
  'use strict';
  const M=window.Moonberry,$=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d');
  let state=M.createState(),saveAvailable=true,toastTimer,view='',beam=null;
  try {const raw=localStorage.getItem(M.SAVE_KEY);if(raw){const candidate=M.migrate(JSON.parse(raw));if(candidate)state=candidate;else notify('Saved data could not be read. Export a backup before starting over.');}}catch{saveAvailable=false;notify('Browser saving is unavailable. Use Export save to keep your progress.');}
  function notify(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),5500);}
  function save(silent=true){try{localStorage.setItem(M.SAVE_KEY,JSON.stringify(state));saveAvailable=true;if(!silent)notify('Homestead saved on this browser.');}catch{saveAvailable=false;if(!silent)notify('Saving is blocked. Export a save file instead.');}}
  function act(fn){const result=fn();if(result)notify(result);save();refresh();}
  const totalHarvest=()=>state.harvest.reduce((n,v,i)=>n+v*M.CROPS[i].sell,0);
  function itemInfo(id){if(!id)return {name:'Empty',icon:'·',color:'#71828a'};if(id==='hoe')return {name:'Moon hoe',icon:'⚒',color:'#d8c99e'};if(id==='bucket')return {name:'Water bucket',icon:'▱',color:'#9bcfef'};if(id==='laser')return {name:'Laser · Lv 1',icon:'⌁',color:'#f5a6ad'};const [kind,i]=id.split(':');return {name:M.CROPS[i].name+(kind==='seed'?' seeds':''),icon:M.CROPS[i].icon,color:M.CROPS[i].color};}
  function use(){if(state.slots[state.slot]==='laser')beam={x:state.x,y:state.y,zone:state.zone,dir:[...state.facing],until:performance.now()+220};act(()=>M.useItem(state));}
  function refresh(){
    const due=M.rentDueDay(state),paid=state.paidThrough>=due,total=(paid?0:state.rent)+state.arrears;
    $('status').innerHTML=`<div class="stat"><small>MOONDAY</small><b>${String(state.day).padStart(2,'0')}</b></div><div class="stat"><small>CREDITS</small><b>✧ ${state.credits}</b></div><div class="stat"><small>SUIT ENERGY</small><b>${state.energy}<span style="font-size:12px;color:#a3b0bc"> / ${100+state.upgrades.tank*20}</span></b></div>`;
    $('vitals').innerHTML=[['Health',state.health,100,'#e6a4aa'],['Oxygen',state.oxygen,100,state.oxygen<=20?'#eea187':'#9cd3e5'],['Bucket',state.water,12+state.upgrades.tank*8,'#adc9ed']].map(([label,value,max,color])=>`<div><span>${label} <b>${value}/${max}</b></span><div class="meter" role="progressbar" aria-label="${label}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}"><i style="width:${value/max*100}%;background:${color}"></i></div></div>`).join('');
    $('hotbar').innerHTML=state.slots.map((id,i)=>{const item=itemInfo(id),qty=id==='bucket'?state.water:M.itemCount(state,id);return `<button class="slot ${i===state.slot?'active':''}" data-slot="${i}" aria-pressed="${i===state.slot}" aria-label="Slot ${i+1}: ${item.name}${id?' · '+qty:''}"><kbd>${i+1}</kbd><span class="slot-icon" style="color:${item.color}">${item.icon}</span><span class="slot-name">${item.name}</span>${id&&!['hoe','laser'].includes(id)?`<b class="slot-count">${qty}</b>`:''}</button>`;}).join('');
    document.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{M.selectSlot(state,Number(b.dataset.slot));save();refresh();});
    $('equipped').textContent=`${state.slots.filter(Boolean).length}/8 CARRY SLOTS · ${itemInfo(state.slots[state.slot]).name}`;
    $('lease').textContent=`WEEK ${Math.ceil(state.day/7)}`;$('rent').textContent=`${total} cr`;$('deadline').textContent=paid&&!state.arrears?'All settled':`Due end of day ${due}`;
    $('rent-progress').style.width=`${total?Math.min(100,state.credits/total*100):100}%`;
    $('rent-note').textContent=state.arrears?`${state.arrears} cr carried forward. There’s always another harvest.`:paid?'Your rent is paid. Go find something wonderful.':`${due-state.day+1} days to make this little patch yours.`;
    $('pay').disabled=!total;$('pay').textContent=total?'Pay rent · '+total+' cr':'Paid for this week ✓';
    $('seeds').innerHTML=M.CROPS.map((c,i)=>`<button class="seed ${state.slots[state.slot]==='seed:'+i?'active':''}" data-seed="${i}" ${state.seeds[i]?'':'disabled'} aria-pressed="${state.slots[state.slot]==='seed:'+i}"><span class="icon" style="color:${c.color}">${c.icon}</span><span>${c.name}<small>${c.buy===null?'Rare drop · ':''}${c.days} nights · ${c.sell} cr</small></span><span class="count">${state.seeds[i]}</span></button>`).join('');
    document.querySelectorAll('[data-seed]').forEach(b=>b.onclick=()=>{const i=state.slots.indexOf('seed:'+b.dataset.seed);if(i>=0)M.selectSlot(state,i);save();refresh();});
    $('inventory').textContent=`Harvest basket · ${state.harvest.reduce((a,b)=>a+b,0)} crops · ${totalHarvest()} cr value`;
    $('quest').textContent=state.won?'The moon remembers you. All three memories found. Your story keeps growing.':`${state.relics.length} / 3 lunar memories found. Follow the crystals northeast to the Humming Hollow.`;
    $('notes').replaceChildren(...state.notes.slice(0,3).map(n=>{const p=document.createElement('div');p.textContent=n;return p;}));
    $('region').textContent=state.zone==='cave'?'THE HUMMING HOLLOW':'MOSSFIELD OUTPOST';$('coordinates').textContent=`${String(state.x).padStart(2,'0')}° E / ${String(state.y).padStart(2,'0')}° N`;
    const p=state.plots[M.targetPlot(state)],id=state.slots[state.slot];
    $('prompt').textContent=M.insideHome(state)?'Inside habitat · E to rest and refill health, oxygen & water':state.oxygen<=20?'Oxygen low · Return inside the habitat at 9 E / 10 N':id==='laser'?'SPACE · Fire level 1 laser in the direction you face':id==='hoe'?'SPACE · Till moon dust under your feet':p&&p.age>=M.CROPS[p.crop].days?'SPACE · Harvest '+M.CROPS[p.crop].name:id==='bucket'?'SPACE · Water a planted bed':id?.startsWith('seed:')?'SPACE · Plant selected seeds in your own bed':'1–8 · Equip item     E · Interact';
  }
  function open(title,html){$('dialog-body').innerHTML=`<div class="eyebrow">MOONBERRY · FIELD COMPANION</div><h2>${title}</h2>${html}`;if(!$('dialog').open)$('dialog').showModal();}
  function shop(){
    view='shop';
    if(!M.near(state,'shop')){open('A short walk to Pip’s', '<p>The trading post is the little lavender shelter east of your habitat, at <b>17° E / 10° N</b>. Walk there and press E to trade.</p>');return;}
    open('Pip’s trading post',`<p>“Locally grown. Cosmically peculiar.” You have <b>${state.credits} credits</b>. Rare seeds are found in dustling drops.</p><button class="primary" id="sell">Sell harvest · ${totalHarvest()} cr</button>`+M.CROPS.map((c,i)=>c.buy===null?'':`<div class="row"><div><b style="color:${c.color}">${c.icon} ${c.name}</b><small>${c.description}<br>${c.days} nights · harvest sells for ${c.sell} cr</small></div><button data-buy="${i}" ${state.credits<c.buy?'disabled':''}>${c.buy} cr · seed</button></div>`).join('')+['tank','boots','scanner'].map((k,i)=>{const l=state.upgrades[k],cost=[90,70,110][i]*(l+1);return `<div class="row"><div><b>${['Moonwater kit','Moon boots','Horizon scanner'][i]} · ${l}/2</b><small>${['More bucket capacity and cheaper watering. Level 2 doubles yields.','Walk farther on each charge.','Clear more moon dust with every step.'][i]}</small></div><button data-upgrade="${k}" ${l>=2||state.credits<cost?'disabled':''}>${l>=2?'Maxed':cost+' cr'}</button></div>`;}).join(''));
    $('sell').onclick=()=>{act(()=>M.sell(state));shop();};document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{act(()=>M.buy(state,Number(b.dataset.buy)));shop();});document.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{act(()=>M.upgrade(state,b.dataset.upgrade));shop();});
  }
  function rest(){if(!M.insideHome(state)){notify('Rest inside your house. Walk onto the habitat at 9° E / 10° N, then press E.');return;}open('Rest inside your habitat?',`<p>Your safe little airlock. Resting restores health, oxygen, energy, and bucket water. Watered crops grow one stage; dry crops wait patiently.</p><p>Rent is due at the end of day ${M.rentDueDay(state)}. Unpaid rent carries forward without eviction.</p><button id="confirm-sleep" class="primary">Rest · begin day ${state.day+1}</button>`);$('confirm-sleep').onclick=()=>{$('dialog').close();act(()=>M.sleep(state));};}
  function interact(){const result=M.interact(state);if(result==='shop'){shop();return;}if(result==='home'){rest();return;}if(result)notify(result);save();refresh();}
  function help(){open('Make this moon your own.', '<p><b>Eight slots.</b> Keys 1–8 (or tap a slot) equip your carried items. Matching seeds and harvest stack. Tools take one slot each. Q drops a selected seed or crop stack; E picks it up. Full inventory? Sell crops or drop a stack.</p><p><b>Your garden.</b> Equip the hoe (1). Walk onto open dust and press Space to till the tile underfoot. Equip seeds (starting in 4–5) and use them on the bed, then the bucket (2) to water. You can stand beside a bed. Use any item except the hoe or laser to harvest ripe crops.</p><p><b>Home is oxygen.</b> Movement and item use consume oxygen every two actions. Dustlings damage health. Nothing drains while idle or closed. Walk onto your house at <b>9 E / 10 N</b> and press E to rest inside: health, oxygen, energy, and water refill; watered crops grow. At zero oxygen, each action outside costs 5 health. The emergency tether returns you home only when health reaches zero.</p><p><b>Level 1 laser.</b> Equip slot 3, face a dustling with movement, then press Space. Range 6 tiles; rocks block shots. Two hits disperse a dustling. Each defeat has exactly a 1-in-10 chance to drop either a Comet melon or Prism fern seed. E collects it nearby. Dustlings appear occasionally as you take actions. Home is safe.</p><p><b>Life on the moon.</b> WASD or arrows walk; E trades at Pip’s, explores ruins, and enters the cave. M opens your chart. Moon dust clears permanently as you walk. Weekly rent, crop sales, upgrades, and the three-memory story continue. Progress saves on this browser; export backups to keep it safe.</p>');}
  function chart(){const seen=new Set(state.seen);let html='<p>Gold is you; lavender is a landmark. Silver dust is still unexplored.</p><div class="chart" aria-label="Explored surface map">';for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){const visible=seen.has(M.key(x,y)),point=M.POI.some(p=>p.x===x&&p.y===y);html+=`<i class="${!visible?'hidden':state.zone==='surface'&&state.x===x&&state.y===y?'you':point?'point':''}"></i>`;}open('A small step into the unknown.',html+'</div><p>'+Math.round(seen.size/(M.W*M.H)*100)+'% of the surface charted · '+state.relics.length+' / 3 memories</p>');}
  $('help').onclick=help;$('close').onclick=()=>$('dialog').close();$('save').onclick=()=>save(false);$('pay').onclick=()=>act(()=>M.pay(state));$('sleep').onclick=rest;$('shop').onclick=shop;$('map').onclick=chart;
  $('action').onclick=use;$('interact').onclick=interact;$('drop').onclick=()=>act(()=>M.dropSelected(state));
  document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const [x,y]=b.dataset.move.split(',').map(Number);act(()=>M.move(state,x,y));});
  const keys={w:[0,-1],ArrowUp:[0,-1],a:[-1,0],ArrowLeft:[-1,0],s:[0,1],ArrowDown:[0,1],d:[1,0],ArrowRight:[1,0]};let lastMove=0;
  document.addEventListener('keydown',e=>{
    if($('dialog').open||['INPUT','TEXTAREA'].includes(e.target.tagName))return;
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(keys[k]){e.preventDefault();if(e.repeat&&performance.now()-lastMove<130)return;lastMove=performance.now();act(()=>M.move(state,...keys[k]));}
    else if(k===' '){if(e.target.closest('button,a,label'))return;e.preventDefault();if(!e.repeat)use();}
    else if(k==='e'&&!e.repeat)interact();else if(k==='q'&&!e.repeat)act(()=>M.dropSelected(state));else if(k==='m')chart();else if('12345678'.includes(k)&&k.length===1){M.selectSlot(state,Number(k)-1);save();refresh();}
  });
  $('export').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`moonberry-day-${state.day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Save exported. Keep it somewhere safe among the stars.');};
  $('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('size');const candidate=M.migrate(JSON.parse(await file.text()));if(!candidate)throw Error('invalid');open('Restore this homestead?',`<p>This save is on day ${candidate.day} with ${candidate.credits} credits. Restoring it replaces the current homestead. Export your current save first if you want to keep both.</p><button id="restore" class="primary">Restore day ${candidate.day}</button>`);$('restore').onclick=()=>{state=candidate;save();refresh();$('dialog').close();notify('Welcome home. Your save has been restored.');};}catch{notify('That file is not a supported Moonberry save. Your current game is safe.');}e.target.value='';};
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
    if(p.crop===4){ellipse(cx,cy,11*stage+2,8*stage+2,c.color);line(cx-7,cy-5,cx+7,cy+5,'#fff0bd',2);ellipse(cx+4,cy-3,2,2,'#ffeac0');}
    if(p.crop===5){for(let i=0;i<3;i++){line(cx,cy+12,cx-10+i*10,cy-8+i%2*4,c.color,3);ellipse(cx-10+i*10,cy-8+i%2*4,4,7,i%2?'#d8c5f4':c.color);}}
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
    const id=state.slots[state.slot];if(id==='hoe'){rect(x+35,y+18,3,18,'#bb9d79');rect(x+29,y+15,13,5,'#c9d2c5');}if(id==='bucket'){rect(x+32,y+24,9,9,'#90bcd7');line(x+33,y+24,x+39,y+20,'#c5dfeb');}if(id==='laser'){rect(x+30,y+20,14,6,'#abb8c0');rect(x+41,y+21,4,3,'#f4a0ad');}
  }
  function render(ms){
    const time=matchMedia('(prefers-reduced-motion: reduce)').matches?0:ms/1000;
    const ox=Math.max(0,Math.min(M.W-COLS,state.x-Math.floor(COLS/2))),oy=Math.max(0,Math.min(M.H-ROWS,state.y-Math.floor(ROWS/2)));
    const cave=state.zone==='cave',seen=new Set(cave?state.caveSeen:state.seen),collected=new Set(state.collected);
    rect(0,0,960,600,'#9ca7a4');
    for(let sy=0;sy<ROWS;sy++)for(let sx=0;sx<COLS;sx++){
      const x=sx+ox,y=sy+oy,px=sx*TILE,py=sy*TILE,k=M.key(x,y),t=!cave&&state.beds.includes(k)?'plot':M.terrain(x,y,state.zone),n=(x*7919+y*104729)%97;
      if(!seen.has(k)){
        rect(px,py,40,40,'#9ca7a4');ctx.save();ctx.beginPath();ctx.rect(px,py,40,40);ctx.clip();
        const dust=ctx.createRadialGradient(px+20+Math.sin(time*.2+y)*8,py+20,2,px+20,py+20,34);dust.addColorStop(0,'#c4c9bc99');dust.addColorStop(1,'#9ca7a400');ctx.fillStyle=dust;ctx.fillRect(px,py,40,40);
        for(let i=0;i<5;i++){const drift=(n+i*11+time*2)%44;ellipse(px+drift,py+(n+i*7)%40,1,1,'#e2e0cb88');}ctx.restore();continue;
      }
      const base=cave?(t==='wall'?'#283345':'#4b5269'):t==='moss'?['#637e76','#68857b','#6c857c'][n%3]:['#86938c','#929d93','#8a9891'][n%3];
      rect(px,py,40,40,base);
      if(t==='crater'){ellipse(px+20,py+22,21,17,'#596c70');ellipse(px+22,py+23,16,12,'#465c66');line(px+7,py+30,px+30,py+34,'#a4b0a1',2);}
      else if(t==='rock'||t==='wall'){rect(px+4,py+9,30,23,cave?'#364158':'#667b7c');rect(px+9,py+4,21,10,cave?'#46516a':'#a0ada0');rect(px+7,py+12,7,5,cave?'#52617a':'#829b90');}
      else if(t==='plot'){
        rect(px+2,py+3,36,34,'#4e4b50');rect(px+4,py+5,32,3,'#9d8b77');for(let i=0;i<3;i++)rect(px+7,py+13+i*7,26,2,'#6f625e');
        const p=state.plots[k];if(p)crop(px,py,p,time);
      }else{for(let i=0;i<3;i++)rect(px+(n+i*11)%35,py+(n*3+i*7)%36,2+(n%3),2,cave?'#68708a':t==='moss'?'#91aa90':'#acb6a6');if(t==='moss'&&n%7===0){line(px+22,py+30,px+22,py+23,'#a5bf9d');rect(px+18,py+23,8,3,'#c3cba8');}}
      if(M.resource(x,y,state.zone)&&t!=='plot'&&!collected.has(`${state.zone}:${k}`)){
        ctx.globalAlpha=.12;ellipse(px+20,py+19,19,20,'#bbc5ff');ctx.globalAlpha=1;
        ctx.fillStyle=cave?'#bfadea':'#bae4d7';ctx.beginPath();ctx.moveTo(px+20,py+6);ctx.lineTo(px+28,py+20);ctx.lineTo(px+20,py+31);ctx.lineTo(px+14,py+21);ctx.fill();line(px+20,py+9,px+20,py+27,'#eef8df',2);
      }
      if(cave&&x===23&&y===19){rect(px+8,py+9,23,23,'#c1ccaa');rect(px+13,py+9,13,23,'#687e87');}
      if(cave&&x===23&&y===9){ellipse(px+20,py+20,16,9,'#8792ad');ellipse(px+20,py+8,7,10,state.relics.includes('hollow')?'#68758a':'#e0bdf1');}
    }
    if(!cave)for(const p of M.POI){if(seen.has(M.key(p.x,p.y)))landmark((p.x-ox)*TILE,(p.y-oy)*TILE,p,time);}
    for(const d of state.drops){if(d.zone!==state.zone||!seen.has(M.key(d.x,d.y)))continue;const x=(d.x-ox)*40+20,y=(d.y-oy)*40+24;ellipse(x,y+7,10,4,'#65736b');rect(x-6,y-7,12,15,'#e7dbb0');rect(x-3,y-4,6,7,M.CROPS[d.crop].color);}
    for(const m of state.monsters){if(m.zone!==state.zone||!seen.has(M.key(m.x,m.y)))continue;const x=(m.x-ox)*40,y=(m.y-oy)*40;ellipse(x+20,y+32,15,5,'#5f6d6b');ellipse(x+20,y+23+Math.sin(time*3)*2,14,11,'#b598bc');rect(x+10,y+9,4,10,'#cdb6c7');rect(x+27,y+9,4,10,'#cdb6c7');rect(x+13,y+20,4,5,'#394351');rect(x+24,y+20,4,5,'#394351');rect(x+12,y+2,16,3,'#4d5260');rect(x+12,y+2,m.hp*8,3,'#e7a5ae');}
    if(beam&&beam.zone===state.zone&&ms<beam.until){const x=(beam.x-ox)*40+20,y=(beam.y-oy)*40+20;let length=6;for(let i=1;i<=6;i++){const tx=beam.x+beam.dir[0]*i,ty=beam.y+beam.dir[1]*i;if(['wall','rock','crater'].includes(M.terrain(tx,ty,state.zone))){length=i-.5;break;}}line(x,y,x+beam.dir[0]*length*40,y+beam.dir[1]*length*40,'#e8a4c9',6);line(x,y,x+beam.dir[0]*length*40,y+beam.dir[1]*length*40,'#fff0c7',2);}
    astronaut((state.x-ox)*TILE,(state.y-oy)*TILE,time);
    // Soft edge shading gives the discovered landscape a little depth.
    const shade=ctx.createRadialGradient(480,300,180,480,300,570);shade.addColorStop(0,'#08132300');shade.addColorStop(1,'#08132360');ctx.fillStyle=shade;ctx.fillRect(0,0,960,600);
    if(!cave){for(const p of M.POI){if(!seen.has(M.key(p.x,p.y)))continue;const x=(p.x-ox)*40+20,y=(p.y-oy)*40+53;if(x<0||x>960||y<0||y>580)continue;ctx.font='10px monospace';ctx.textAlign='center';const label=p.type==='home'?'HABITAT':p.type==='shop'?'PIP’S TRADING POST':p.type==='cave'?'HUMMING HOLLOW':'ANCIENT RUINS';const width=ctx.measureText(label).width+16;rect(x-width/2,y-11,width,19,'#243443dd');ctx.fillStyle='#e0e5cd';ctx.fillText(label,x,y+2);}}
    requestAnimationFrame(render);
  }
  refresh();requestAnimationFrame(render);
  if(state.day===1&&state.steps===0)notify('Your moon, your garden. Equip the hoe (1), then Space to till open dust.');
})();
