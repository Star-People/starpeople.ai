(()=>{
  const system=document.querySelector('.observation-system');if(!system)return;
  const canvas=system.querySelector('.flow-canvas'),svg=system.querySelector('.flow-wires'),paths=system.querySelector('#network-paths');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function rect(el){const r=el.getBoundingClientRect(),c=canvas.getBoundingClientRect();return {x:r.left-c.left,y:r.top-c.top,w:r.width,h:r.height,cx:r.left-c.left+r.width/2,cy:r.top-c.top+r.height/2}}
  const box=id=>rect(document.getElementById(id));
  function node(tag,attrs){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);paths.append(e);return e}
  function wire(d,stage,{offline=false,packet=true}={}){
    const active=system.dataset.stage===stage;
    node('path',{d,class:'flow-wire'+(active?' is-active':'')+(offline?' is-offline':'')});
    if(active&&packet&&!offline&&!reduced.matches){const dot=node('circle',{r:2.3,class:'flow-packet'}),motion=document.createElementNS('http://www.w3.org/2000/svg','animateMotion');motion.setAttribute('path',d);motion.setAttribute('dur',stage==='learn'?'6s':'3.5s');motion.setAttribute('repeatCount','indefinite');dot.append(motion)}
  }
  function port(x,y,stage){node('circle',{cx:x,cy:y,r:3,class:'flow-port'+(system.dataset.stage===stage?' is-active':'')})}
  function arrow(x,y,dir,stage){const d=dir==='right'?`M${x-5},${y-3} L${x},${y} L${x-5},${y+3}`:dir==='left'?`M${x+5},${y-3} L${x},${y} L${x+5},${y+3}`:`M${x-3},${y-5} L${x},${y} L${x+3},${y-5}`;wire(d,stage,{packet:false})}
  function draw(){
    const w=canvas.clientWidth,h=canvas.clientHeight;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);paths.replaceChildren();
    const stations=[0,1,2].map(i=>box('observer-'+i)),shared=box('shared-review'),film=rect(system.querySelector('.shared-frame-strip')),broadcast=box('network-youtube'),archive=box('network-archive'),files=box('network-files'),model=box('network-model'),back=box('model-return'),review=rect(system.querySelector('.review-people'));
    if(innerWidth>900){
      const joinX=(stations[0].x+stations[0].w+shared.x)/2,joinY=film.cy;
      stations.forEach((n,i)=>{wire(`M${n.x+n.w},${n.cy} C${joinX-18},${n.cy} ${joinX-18},${joinY} ${joinX},${joinY}`,'capture',{offline:i===2});port(n.x+n.w,n.cy,'capture')});
      wire(`M${joinX},${joinY} H${shared.x-4}`,'capture');arrow(shared.x-4,joinY,'right','capture');
      wire(`M${shared.x-20},${joinY} V${broadcast.cy-8} Q${shared.x-20},${broadcast.cy} ${shared.x-12},${broadcast.cy} H${broadcast.x-4}`,'capture');arrow(broadcast.x-4,broadcast.cy,'right','capture');
      [archive,files,model].forEach((n,i)=>{const sy=review.cy,mid=(shared.x+shared.w+n.x)/2;wire(`M${shared.x+shared.w},${sy} C${mid},${sy} ${mid},${n.cy} ${n.x-4},${n.cy}`,'review');if(i===0)port(shared.x+shared.w,sy,'review');arrow(n.x-4,n.cy,'right','review')});
      const bracketX=stations[0].x-12,top=stations[0].y+8,bottom=stations[2].y+stations[2].h-8,mid=(top+bottom)/2,rail=bracketX-14;
      wire(`M${bracketX+5},${top} H${bracketX} V${bottom} H${bracketX+5}`,'learn',{packet:false});
      wire(`M${model.cx},${model.y+model.h} V${back.cy-12} Q${model.cx},${back.cy} ${model.cx-12},${back.cy} H${rail+12} Q${rail},${back.cy} ${rail},${back.cy-12} V${mid+10} Q${rail},${mid} ${rail+10},${mid} H${bracketX-3}`,'learn');arrow(bracketX-3,mid,'right','learn');
    }else{
      const mergeY=shared.y-23;
      stations.forEach((n,i)=>{const end=shared.cx;wire(`M${n.cx},${n.y+n.h} C${n.cx},${mergeY} ${end},${mergeY} ${end},${shared.y-5}`,'capture',{offline:i===2});port(n.cx,n.y+n.h,'capture')});arrow(shared.cx,shared.y-5,'down','capture');
      const liveRail=w-18;wire(`M${shared.cx},${mergeY} H${liveRail-8} Q${liveRail},${mergeY} ${liveRail},${mergeY+8} V${broadcast.cy-8} Q${liveRail},${broadcast.cy} ${liveRail-8},${broadcast.cy} H${broadcast.x+broadcast.w+4}`,'capture');arrow(broadcast.x+broadcast.w+4,broadcast.cy,'left','capture');
      [archive,files,model].forEach((n,i)=>{wire(`M${shared.x+shared.w},${review.cy} H${w-12} Q${w-7},${review.cy} ${w-7},${review.cy+5} V${n.cy-5} Q${w-7},${n.cy} ${w-12},${n.cy} H${n.x+n.w+4}`,'review');if(i===0)port(shared.x+shared.w,review.cy,'review');arrow(n.x+n.w+4,n.cy,'left','review')});
      const top=stations[0].y-10,left=stations[0].x,right=stations[2].x+stations[2].w;
      wire(`M${left},${top+4} V${top} H${right} V${top+4}`,'learn',{packet:false});
      wire(`M${model.cx},${model.y+model.h} V${back.cy-10} Q${model.cx},${back.cy} ${model.cx-10},${back.cy} H16 Q8,${back.cy} 8,${back.cy-8} V${top+8} Q8,${top} 16,${top} H${left-3}`,'learn');arrow(left-3,top,'right','learn');
    }
  }
  system.querySelectorAll('[data-flow]').forEach(button=>button.addEventListener('click',()=>{system.dataset.stage=button.dataset.flow;system.querySelectorAll('[data-flow]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));draw()}));
  let queued=false,visible=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;draw();syncMotion()})};
  function syncMotion(){if(visible&&!document.hidden&&!reduced.matches)svg.unpauseAnimations();else svg.pauseAnimations()}
  new ResizeObserver(schedule).observe(canvas);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncMotion()}).observe(canvas);document.addEventListener('visibilitychange',syncMotion);reduced.addEventListener('change',schedule);document.fonts.ready.then(schedule);window.addEventListener('resize',schedule);draw();
})();
