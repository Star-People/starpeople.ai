(()=>{
 const player=document.querySelector('#live iframe');if(!player)return;
 const endpoint='https://raw.githubusercontent.com/starpeopleai/field-station/live-status/live.json';
 const channel='https://www.youtube.com/channel/UCQA8_F18kJhUA1hE0MpyHug/live';
 const links=document.querySelectorAll('[data-live-watch]'),notice=document.querySelector('#live-status');
 let current=null,confirmedAt=0,busy=false;
 const valid=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{11}$/.test(id);
 function clear(message){current=null;player.removeAttribute('src');player.hidden=true;notice.hidden=false;notice.textContent=message;for(const a of links)a.href=channel;}
 function apply(data){
  const age=Date.now()/1000-Number(data.confirmed_at);
  if(data.state!=='live'||!valid(data.active_video_id)||!Number.isFinite(age)||age< -60||age>=900){clear('Live stream is not currently confirmed. Check YouTube for the latest broadcast.');return;}
  confirmedAt=Number(data.confirmed_at);
  if(current!==data.active_video_id){current=data.active_video_id;player.src='https://www.youtube.com/embed/'+current+'?mute=1&playsinline=1';}
  player.hidden=false;notice.hidden=true;for(const a of links)a.href='https://www.youtube.com/watch?v='+current;
 }
 async function refresh(){
  if(busy)return;busy=true;
  try{const r=await fetch(endpoint+'?minute='+Math.floor(Date.now()/60000),{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('Broadcast status unavailable');apply(await r.json());}
  catch{if(!current||Date.now()/1000-confirmedAt>=900)clear('Live stream status is temporarily unavailable. Watch on YouTube.');}
  finally{busy=false;}
 }
 void refresh();setInterval(()=>{if(!document.hidden)void refresh()},60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh()});
})();
