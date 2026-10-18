import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4173/');
 const render=await page.evaluate(async()=>{
  const {createMaster,playCue}=await import('/src/audio/score.ts');
  const context=new OfflineAudioContext(2,44100*3,44100);playCue(context,createMaster(context),'breach');
  const buffer=await context.startRendering();let peak=0,sum=0;
  const length=buffer.length*buffer.numberOfChannels,bytes=new Uint8Array(44+length*2),v=new DataView(bytes.buffer);
  const str=(at,s)=>{for(let i=0;i<s.length;i++)v.setUint8(at+i,s.charCodeAt(i));};
  str(0,'RIFF');v.setUint32(4,bytes.length-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,44100,true);v.setUint32(28,44100*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,length*2,true);
  for(let i=0;i<buffer.length;i++)for(let ch=0;ch<2;ch++){const sample=buffer.getChannelData(ch)[i];peak=Math.max(peak,Math.abs(sample));sum+=sample*sample;v.setInt16(44+(i*2+ch)*2,Math.round(Math.max(-1,Math.min(1,sample))*32767),true);}
  return {bytes:Array.from(bytes),peak,rms:Math.sqrt(sum/length),seconds:3};
 });
 if(render.peak<=.02||render.peak>=.98||render.rms<=.003)throw new Error('Audio render is silent or clips');
 await mkdir('evidence/scroll',{recursive:true});await writeFile('evidence/scroll/cinematic-alert.wav',Buffer.from(render.bytes));
 const metrics={peak:render.peak,rms:render.rms,durationSeconds:render.seconds,clipping:false};
 await writeFile('evidence/scroll/audio-verification.json',JSON.stringify(metrics,null,2));console.log(metrics);
}finally{await browser.close();}
