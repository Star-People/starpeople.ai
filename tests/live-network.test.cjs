const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('dist/live-network.js','utf8');
async function run(local,remote){const player={src:'https://www.youtube.com/embed/EHm0EectsVA?mute=1'};vm.runInNewContext(source,{document:{querySelector:()=>player,addEventListener(){},hidden:false},fetch:async url=>({ok:true,json:async()=>url.startsWith('https:')?remote:local}),setInterval(){}});await new Promise(r=>setImmediate(r));return player.src}
test('scheduled start never displaces confirmed live video',async()=>{assert.match(await run({active_video_id:'EHm0EectsVA'},{sessions:[{video_id:'p_FlW0xayM0',start:0,end:9999999999}]}),/EHm0EectsVA/)});
test('confirmed successor replaces old live session',async()=>{assert.match(await run({active_video_id:'EHm0EectsVA'},{active_video_id:'p_FlW0xayM0'}),/p_FlW0xayM0/)});
test('invalid IDs and empty snapshots retain working player',async()=>{assert.match(await run({}, {active_video_id:'not-a-valid-url',sessions:[]}),/EHm0EectsVA/)});
