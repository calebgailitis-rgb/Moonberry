/* Moonberry's deterministic simulation. No browser or network dependencies. */
(function (root) {
  'use strict';
  const W = 36, H = 28, SAVE_KEY = 'moonberry-save-v1';
  const CROPS = [
    {name:'Moonberry',icon:'✿',color:'#ed95cb',days:2,buy:8,sell:24,description:'Little berries. Suspiciously large dreams.'},
    {name:'Wobble shroom',icon:'♧',color:'#9ee9c2',days:3,buy:14,sell:42,description:'Waves hello when nobody is looking.'},
    {name:'Eye of Saturn',icon:'◉',color:'#ecc575',days:4,buy:22,sell:70,description:'It watches the watering can.'},
    {name:'Void trumpet',icon:'♆',color:'#b2a2f1',days:5,buy:30,sell:105,description:'Sings in a frequency only rocks enjoy.'}
  ];
  const POI = [
    {x:9,y:10,type:'home',name:'Your little habitat'},
    {x:17,y:10,type:'shop',name:'Pip’s trading post'},
    {x:23,y:7,type:'cave',name:'The Humming Hollow'},
    {x:29,y:20,type:'ruin',name:'The Listening Garden'},
    {x:6,y:22,type:'ruin',name:'The Quiet Observatory'}
  ];
  const key=(x,y)=>`${x},${y}`;
  function terrain(x,y,zone='surface') {
    if(x<0||y<0||x>=W||y>=H) return 'wall';
    if(zone==='cave') {
      if(x<17||x>29||y<8||y>20) return 'wall';
      if((x===20||x===26)&&y!==14&&y!==18&&y>10&&y<19) return 'wall';
      return 'cave';
    }
    if(x>=10&&x<=14&&y>=12&&y<=15) return 'plot';
    if(POI.some(p=>Math.abs(p.x-x)<=1&&Math.abs(p.y-y)<=1)) return 'dust';
    if((x-4)**2+(y-5)**2<8||(x-27)**2+(y-13)**2<10||(x-18)**2+(y-23)**2<7) return 'crater';
    if((x*17+y*31)%43===0 && (x<7||x>18||y<8||y>17)) return 'rock';
    return y<8||x>22?'dust':'moss';
  }
  function createState(){
    const s={version:1,day:1,credits:100,energy:100,x:12,y:10,zone:'surface',selected:0,seeds:[8,2,0,0],harvest:[0,0,0,0],plots:{},seen:[],caveSeen:[],collected:[],relics:[],paidThrough:0,rent:80,arrears:0,upgrades:{tank:0,boots:0,scanner:0},steps:0,notes:['Day 1 · A small habitat. A very big sky.'],won:false};
    reveal(s);return s;
  }
  function reveal(s){
    const set=new Set(s.zone==='cave'?s.caveSeen:s.seen),radius=4+s.upgrades.scanner*2;
    for(let y=s.y-radius;y<=s.y+radius;y++)for(let x=s.x-radius;x<=s.x+radius;x++)if(x>=0&&y>=0&&x<W&&y<H&&Math.hypot(x-s.x,y-s.y)<=radius+.5)set.add(key(x,y));
    if(s.zone==='cave')s.caveSeen=[...set];else s.seen=[...set];
  }
  function move(s,dx,dy){
    if(Math.abs(dx)+Math.abs(dy)!==1)return 'Choose one direction.';
    const t=terrain(s.x+dx,s.y+dy,s.zone);
    if(['wall','crater','rock'].includes(t))return 'Find a path around the rocks.';
    if(s.energy<1)return 'Your suit needs a rest. Head home or rest until tomorrow.';
    s.x+=dx;s.y+=dy;s.steps++;
    if(s.steps%(4+s.upgrades.boots*4)===0)s.energy=Math.max(0,s.energy-1);
    reveal(s);return '';
  }
  function targetPlot(s){
    if(s.zone!=='surface')return null;
    if(terrain(s.x,s.y)==='plot')return key(s.x,s.y);
    for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]])if(terrain(s.x+dx,s.y+dy)==='plot')return key(s.x+dx,s.y+dy);
    return null;
  }
  function farm(s){
    const k=targetPlot(s);if(!k)return 'Stand on or beside a garden bed to farm.';
    const p=s.plots[k];
    if(p&&p.age>=CROPS[p.crop].days){s.harvest[p.crop]+=s.upgrades.tank===2?2:1;delete s.plots[k];return `Harvested ${CROPS[p.crop].name}! Sell it at Pip’s trading post.`;}
    if(p&&p.watered)return 'Already watered. Sleep to let it grow.';
    if(s.energy<3)return 'Time to rest. Your plants can wait.';
    if(!p){if(!s.seeds[s.selected])return 'No seeds of this kind. Buy more from Pip.';s.seeds[s.selected]--;s.plots[k]={crop:s.selected,age:0,watered:false};s.energy-=3;return `Planted ${CROPS[s.selected].name}. Press Space again to water.`;}
    p.watered=true;s.energy-=s.upgrades.tank?1:3;return 'A little moonwater. A little patience. Growth happens overnight.';
  }
  function near(s,type){return s.zone==='surface'&&POI.find(p=>p.type===type&&Math.abs(p.x-s.x)+Math.abs(p.y-s.y)<=2);}
  function addNote(s,t){s.notes.unshift(`Day ${s.day} · ${t}`);s.notes=s.notes.slice(0,12);}
  function sleep(s){
    for(const p of Object.values(s.plots)){if(p.watered)p.age++;p.watered=false;}
    const closingDay=s.day;
    if(closingDay%7===0&&s.paidThrough<closingDay){s.arrears+=s.rent;addNote(s,`Rent of ${s.rent} cr carried forward. No eviction, just a fresh start.`);}
    s.day++;s.energy=100+s.upgrades.tank*20;s.zone='surface';s.x=12;s.y=10;
    if(closingDay%7===0)s.rent=80+Math.min(120,Math.floor(closingDay/7)*20);
    // A modest seed grant prevents an empty satchel from ending a save.
    if(s.seeds.every(n=>n===0)&&!Object.keys(s.plots).length&&s.harvest.every(n=>n===0)&&s.credits<8){s.seeds[0]+=3;addNote(s,'Pip left three moonberry seeds by the door.');}
    reveal(s);return `Good morning, gardener. Day ${s.day}. Watered plants grew overnight.`;
  }
  function rentDueDay(s){return Math.ceil(s.day/7)*7;}
  function pay(s){
    const due=rentDueDay(s),current=s.paidThrough>=due?0:s.rent,total=current+s.arrears;
    if(!total)return 'This lunar week is already paid. Breathe easy.';
    if(s.credits<total)return `You need ${total-s.credits} more credits. Sell crops or explore for crystals.`;
    s.credits-=total;s.arrears=0;s.paidThrough=due;addNote(s,'Rent paid. This patch of moon is yours for another week.');return 'Rent paid. A small victory under a very big sky.';
  }
  function sell(s){const value=s.harvest.reduce((n,v,i)=>n+v*CROPS[i].sell,0);if(!value)return 'Your harvest basket is empty.';s.credits+=value;s.harvest=[0,0,0,0];return `Pip bought your harvest for ${value} credits.`;}
  function buy(s,i){if(!Number.isInteger(i)||!CROPS[i])return 'Unknown seed.';if(s.credits<CROPS[i].buy)return 'Not enough credits for that seed.';s.credits-=CROPS[i].buy;s.seeds[i]++;return `One ${CROPS[i].name} seed tucked safely away.`;}
  function upgrade(s,type){
    if(!Object.hasOwn(s.upgrades,type))return 'Unknown equipment.';
    const level=s.upgrades[type],cost=(type==='tank'?90:type==='boots'?70:110)*(level+1);
    if(level>=2)return 'This equipment is fully upgraded.';
    if(s.credits<cost)return `This upgrade needs ${cost} credits.`;
    s.credits-=cost;s.upgrades[type]++;reveal(s);return 'Equipment upgraded. The moon feels a little more like home.';
  }
  function resource(x,y,zone){
    if(zone==='cave')return terrain(x,y,zone)==='cave'&&(x*7+y*11)%9===0;
    return !['crater','rock','plot','wall'].includes(terrain(x,y))&&(x*13+y*23)%59===0;
  }
  function interact(s){
    if(s.zone==='cave'&&Math.abs(s.x-23)+Math.abs(s.y-19)<=1){s.zone='surface';s.x=23;s.y=8;reveal(s);return 'Back beneath the stars.';}
    if(near(s,'home'))return 'home';if(near(s,'shop'))return 'shop';
    if(near(s,'cave')){s.zone='cave';s.x=23;s.y=19;reveal(s);return 'The hollow hums in B-flat. Find its heart to the north.';}
    const relic=s.zone==='cave'&&Math.abs(s.x-23)+Math.abs(s.y-9)<=1?'hollow':near(s,'ruin')?.name;
    if(relic){
      if(s.relics.includes(relic))return 'The ancient garden is quiet. You have already gathered its memory.';
      s.relics.push(relic);s.credits+=85;s.seeds[2]+=2;s.seeds[3]++;addNote(s,'An ancient memory found. Something lived here before us.');
      if(s.relics.length===3){s.won=true;addNote(s,'All three memories reunited. The moon remembers how to bloom.');return 'Three memories reunited! The lunar garden awakens. Keep tending your homestead as long as you like.';}
      return 'A lunar memory! +85 credits, 2 Eye of Saturn seeds, 1 Void trumpet seed.';
    }
    for(const [dx,dy] of [[0,0],[0,1],[1,0],[-1,0],[0,-1]]){
      const x=s.x+dx,y=s.y+dy,id=`${s.zone}:${key(x,y)}`;
      if(resource(x,y,s.zone)&&!s.collected.includes(id)){
        if(s.energy<4)return 'Rest before collecting more crystals.';
        s.energy-=4;s.collected.push(id);s.credits+=s.zone==='cave'?18:10;return `A singing crystal. +${s.zone==='cave'?18:10} credits.`;
      }
    }
    return 'There is a whole moon out there. Look for crystals, ruins, and a cave in the northeast.';
  }
  function validate(s){
    const integer=(v,min,max)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
    if(!s||s.version!==1||!integer(s.day,1,100000)||!integer(s.credits,0,1e9)||!integer(s.x,0,W-1)||!integer(s.y,0,H-1)||!['surface','cave'].includes(s.zone))return false;
    if(!s.upgrades||!['tank','boots','scanner'].every(k=>integer(s.upgrades[k],0,2))||!integer(s.energy,0,140)||!integer(s.selected,0,3))return false;
    if(![s.seeds,s.harvest].every(a=>Array.isArray(a)&&a.length===4&&a.every(v=>integer(v,0,1e7))))return false;
    if(![s.seen,s.caveSeen,s.collected,s.relics,s.notes].every(a=>Array.isArray(a)&&a.length<10000&&a.every(v=>typeof v==='string'&&v.length<500)))return false;
    if(!integer(s.paidThrough,0,100007)||!integer(s.rent,80,200)||!integer(s.arrears,0,1e9)||!integer(s.steps,0,1e9)||typeof s.won!=='boolean')return false;
    if(!s.plots||typeof s.plots!=='object'||Array.isArray(s.plots)||Object.keys(s.plots).length>20)return false;
    for(const [k,p] of Object.entries(s.plots)){const [x,y]=k.split(',').map(Number);if(key(x,y)!==k||terrain(x,y)!=='plot'||!p||!integer(p.crop,0,3)||!integer(p.age,0,100000)||typeof p.watered!=='boolean')return false;}
    return !['wall','crater','rock'].includes(terrain(s.x,s.y,s.zone));
  }
  const api={W,H,SAVE_KEY,CROPS,POI,key,terrain,createState,reveal,move,farm,targetPlot,near,sleep,pay,sell,buy,upgrade,resource,interact,rentDueDay,validate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Moonberry=api;
})(typeof window==='undefined'?this:window);
