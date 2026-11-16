(()=>{
 const player=document.querySelector('#live iframe');if(!player)return;
 const valid=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{11}$/.test(id);
 let current=player.src.match(/\/embed\/([A-Za-z0-9_-]{11})/)?.[1];
 function apply(data){
  // A scheduled start does not prove YouTube has started that broadcast.
  // Retain the last confirmed stream until the station confirms its successor.
  const id=valid(data.active_video_id)?data.active_video_id:(data.sessions||[]).find(s=>s.state==='live'&&valid(s.video_id))?.video_id;
  if(valid(id)&&id!==current){current=id;player.src='https://www.youtube.com/embed/'+id+'?mute=1&playsinline=1'}
 }
 async function refresh(){try{const r=await fetch('https://data.starpeople.ai/snapshot/youtube.json',{cache:'no-store'});if(r.ok)apply(await r.json())}catch{}}
 fetch('live-sessions.json').then(r=>r.json()).then(apply).then(refresh).catch(refresh);
 setInterval(()=>{if(!document.hidden)refresh()},60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();
