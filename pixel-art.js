/* Hand-authored pixel shapes, shared by world sprites and conversation portraits. */
(function(root){
  'use strict';
  const palettes={mox:['#5a8261','#a9d67d','#e4f0b5'],bolt:['#9a6261','#edba77','#ffe3ab'],lumi:['#7567a8','#bda2ef','#eee0ff'],nova:['#ad698c','#f1acb4','#ffe0c6'],pico:['#4b8991','#92d8cf','#dbf5d0']};
  function robot(id,mood='happy',time=0){const [dark,body,light]=palettes[id]||palettes.mox,a=[],r=(x,y,w,h,c)=>a.push([x,y,w,h,c]);
    r(5,17,10,2,'#394454');r(5,9,10,8,dark);r(6,10,8,6,body);r(3,10,2,5,dark);r(15,10,2,5,dark);r(4,10,1,4,light);r(6,17,3,3,'#394454');r(12,17,3,3,'#394454');r(7,17,2,2,body);r(12,17,2,2,body);
    r(4,3,12,7,dark);r(3,4,14,5,dark);r(4,4,12,5,body);r(5,3,10,2,light);r(5,5,10,4,'#324657');r(6,5,8,1,'#4d6b79');
    if(mood==='soft'){r(6,6,3,1,light);r(11,6,3,1,light);r(9,8,2,1,'#e9b8ad');}
    else if(Math.floor(time*2)%13===12){r(6,7,2,1,light);r(12,7,2,1,light);}
    else{r(6,6,2,2,light);r(12,6,2,2,light);r(7,6,1,1,'#fff8dd');r(13,6,1,1,'#fff8dd');r(9,8,2,1,light);}
    r(4,8,2,1,'#efa7b0');r(14,8,2,1,'#efa7b0');r(9,11,3,3,light);r(10,11,1,2,body);
    if(id==='mox'){r(9,0,2,3,dark);r(6,0,4,2,'#6bba7b');r(10,0,4,1,'#a0db7e');r(6,15,8,2,'#e8d69f');}
    if(id==='bolt'){r(4,2,12,2,'#f7d9a0');r(6,0,8,3,'#e9a358');r(3,3,14,1,'#815e61');r(6,11,2,5,'#74657b');r(12,11,2,5,'#74657b');}
    if(id==='lumi'){r(9,0,2,3,body);r(8,0,4,1,'#fff1b9');r(9,12,3,1,'#fff1b9');r(10,11,1,3,'#fff1b9');r(3,10,3,2,'#e2b0d6');}
    if(id==='nova'){r(7,1,7,2,'#6a688f');r(8,0,5,1,'#8e84b4');r(8,13,5,2,'#e7cb87');r(10,12,1,4,'#ffe2a4');}
    if(id==='pico'){r(5,2,10,3,'#f6ead0');r(9,2,2,3,'#e78697');r(8,3,4,1,'#e78697');r(7,11,6,5,'#f6ead0');r(9,12,2,3,'#e78697');r(8,13,4,1,'#e78697');}
    if(mood==='curious'){r(16,0,2,1,'#fff1b9');r(17,1,1,2,'#fff1b9');r(16,3,1,1,'#fff1b9');r(16,5,1,1,'#fff1b9');}return a;
  }
  function draw(ctx,shapes,x,y,scale=2){for(const [px,py,w,h,c] of shapes){ctx.fillStyle=c;ctx.fillRect(Math.round(x)+px*scale,Math.round(y)+py*scale,w*scale,h*scale);}}
  function portrait(id,mood='happy'){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" shape-rendering="crispEdges" aria-hidden="true">${robot(id,mood).map(([x,y,w,h,c])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`).join('')}</svg>`;}
  function crop(i,grown,stage,time=0){const a=[],r=(x,y,w,h,c)=>a.push([x,y,w,h,c]),stem='#4c8065',leaf='#90c97d',dark='#3d5265',shine='#fff3d9';
    r(7,10,2,8,stem);r(3,12,5,2,stem);r(3,11,4,2,leaf);r(9,10,5,2,stem);r(10,9,4,2,leaf);
    if(!grown&&stage<.6){r(6,7,4,4,leaf);r(7,7,2,1,'#d1e99b');return a;}
    if(i===0){r(3,4,6,7,'#a45d9a');r(2,5,8,5,'#d886ba');r(4,4,4,2,'#f1b0d4');r(9,2,6,7,'#a45d9a');r(8,3,8,5,'#e799c9');r(10,2,4,2,'#ffcae0');r(6,8,6,6,'#bd6ca6');r(7,8,4,2,'#f4accc');}
    else if(i===1){r(6,7,6,8,'#c8d5af');r(6,14,7,2,'#92b58f');r(2,3,14,6,'#578f87');r(1,5,16,3,'#9ed7ae');r(4,1,10,5,'#9ed7ae');r(5,2,3,2,'#f3ebbd');r(12,4,3,2,'#649d90');}
    else if(i===2){r(4,2,10,10,'#ad8654');r(2,4,14,6,'#e8bb6b');r(5,2,8,2,'#ffe3a1');r(7,5,4,5,dark);r(8,5,1,3,shine);r(0,9,5,2,'#dc8b9f');r(13,3,5,2,'#dc8b9f');r(4,8,10,2,'#dc8b9f');}
    else if(i===3){r(6,6,6,8,'#a38aca');r(4,4,10,4,'#c6a7e4');r(2,1,14,4,'#dfbcea');r(4,1,10,2,'#f4d2f3');r(5,2,8,1,'#9979b7');r(7,8,4,2,'#e8cbf2');}
    else if(i===4){r(4,3,10,11,'#d88165');r(2,5,14,7,'#f5a477');r(4,4,9,2,'#ffd1a0');r(6,7,1,4,'#ca745d');r(12,7,1,4,'#ca745d');r(8,0,2,4,leaf);r(9,0,4,1,leaf);}
    else{for(let j=0;j<3;j++){r(2+j*5,2+j%2*3,3,7,'#559f9b');r(1+j*5,3+j%2*3,5,4,'#8de2cc');r(2+j*5,3+j%2*3,2,1,'#d1f8da');}r(7,5,2,10,'#669f93');}
    if(grown&&i!==2){r(6,6,1,2,dark);r(11,6,1,2,dark);r(8,9,2,1,dark);}return a;
  }
  const api={robot,portrait,crop,draw};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PixelArt=api;
})(typeof window==='undefined'?this:window);
