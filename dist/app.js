const menu=document.querySelector('.menu');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');document.querySelector('nav').classList.toggle('open',open);});
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');document.querySelector('nav').classList.remove('open');}));
const scenes=[['A rooftop.<br>A new perspective.','A permanently mounted camera watches its local sky. A small computer looks for motion and classifies what appears.'],['A backyard.<br>A shared curiosity.','An observer brings their own patch of sky into view. Local detections become something people can examine, review, and learn from.'],['Farther out.<br>Still connected.','A remote station brings another viewpoint. The vision: collect evidence locally, then share useful observations when a connection is available.']];
document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.scene);document.querySelector('#station-title').innerHTML=scenes[n][0];document.querySelector('#station-copy').textContent=scenes[n][1];document.querySelectorAll('[data-scene]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});document.querySelectorAll('[data-node]').forEach(x=>x.classList.toggle('selected',Number(x.dataset.node)===n));}));

document.querySelectorAll('[data-detection]').forEach(button=>button.addEventListener('click',async()=>{
 const image=document.getElementById('heroDetection');const next=new Image();next.src=button.dataset.image;
 try{await next.decode();}catch{return;}
 image.src=button.dataset.image;image.alt=button.dataset.alt;
 document.querySelectorAll('[data-detection]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
}));

// Retry transient image fetch failures without disturbing layout.
document.querySelectorAll("img").forEach(img => { let attempts = 0; const retry = () => { if (attempts++ >= 2) return; setTimeout(() => { const url = new URL(img.src); url.searchParams.set("retry", String(attempts)); img.src = url.href; }, 500 * attempts); }; img.addEventListener("error", retry); if (img.complete && !img.naturalWidth) retry(); });

const archiveLoop=document.querySelector('.archive-loop');
if(archiveLoop){
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const visibility=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&!reducedMotion.matches)archiveLoop.play().catch(()=>{});else archiveLoop.pause();}},{threshold:.15});
 if(reducedMotion.matches){archiveLoop.removeAttribute('autoplay');archiveLoop.pause();}
 visibility.observe(archiveLoop);
}

if(archiveLoop){
 Promise.all([fetch('assets/archive-preview-track.json').then(r=>r.json()),fetch('assets/archive-preview-flashes.json').then(r=>r.json())]).then(([track,flashes])=>{
  const group=document.getElementById('archive-detection-box');
  const box=group.querySelector('.archive-target-box'),bg=group.querySelector('.archive-target-label-bg'),label=group.querySelector('.archive-target-label');
  function draw(t=archiveLoop.currentTime){
   group.style.display=flashes.some(([start,end])=>t>=start&&t<end)?'':'none';// Smooth least-squares trajectory fitted to the saved review centers.
   // Maximum displacement from an annotated center is under 5 source pixels.
   const cx=1555.765635909666-39.089565647136006*t+.2444940551412509*t*t;
   const cy=111.32192775528256+21.93152572881853*t+.08367564144384167*t*t;
   const [x,y,w,h]=[cx-1220,cy-60,40,40];
   box.setAttribute('x',x);box.setAttribute('y',y);box.setAttribute('width',w);box.setAttribute('height',h);
   const lx=Math.min(x,414),ly=Math.max(0,y-16);bg.setAttribute('x',lx);bg.setAttribute('y',ly);label.setAttribute('x',lx+4);label.setAttribute('y',ly+12);
  }
  draw();archiveLoop.addEventListener('seeked',()=>draw());
  if(!archiveLoop.requestVideoFrameCallback)archiveLoop.addEventListener('timeupdate',()=>draw());
  if(archiveLoop.requestVideoFrameCallback){const frame=(_,metadata)=>{draw(metadata.mediaTime);archiveLoop.requestVideoFrameCallback(frame)};archiveLoop.requestVideoFrameCallback(frame);}
 }).catch(()=>{const g=document.getElementById('archive-detection-box');if(g)g.style.display='none';});
}
