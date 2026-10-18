import {test,expect,type Page} from '@playwright/test';
import {incoming} from './story-helpers';

test.use({launchOptions:{args:['--enable-webgl','--autoplay-policy=document-user-activation-required']}});

async function probeAudio(page:Page){
  await page.addInitScript(()=>{
    const target=window as any;
    const probe=target.__audioProbe={clips:[] as any[],analysers:[] as AnalyserNode[],peak:()=>0};
    const connect=AudioNode.prototype.connect;
    AudioNode.prototype.connect=function(...args:any[]){
      const result=(connect as any).apply(this,args);
      if(args[0] instanceof AudioDestinationNode&&this.context instanceof AudioContext){
        const analyser=this.context.createAnalyser();analyser.fftSize=2048;
        connect.call(this,analyser);probe.analysers.push(analyser);
      }
      return result;
    } as typeof connect;
    probe.peak=()=>{
      let peak=0;
      for(const analyser of probe.analysers){
        if(analyser.context.state!=='running')continue;
        const samples=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(samples);
        for(const sample of samples)peak=Math.max(peak,Math.abs(sample));
      }
      return peak;
    };
    const start=AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start=function(...args:any[]){
      if(this.buffer&&this.buffer.duration>2&&this.buffer.duration<3){
        const clip={duration:this.buffer.duration,state:this.context.state,startedAt:this.context.currentTime,endedAt:null as number|null};
        probe.clips.push(clip);this.addEventListener('ended',()=>{clip.endedAt=this.context.currentTime;},{once:true});
      }
      return start.apply(this,args as [number?,number?,number?]);
    };
  });
}

for(const viewport of [{width:1366,height:768},{width:390,height:844},{width:375,height:667}]){
  test(`accept click unlocks live audio and plays the full supplied breach clip at ${viewport.width}`,async({page})=>{
    test.setTimeout(45000);await page.setViewportSize(viewport);await probeAudio(page);
    const clipResponse=page.waitForResponse(r=>r.url().endsWith('/assets/audio/system-breached.mp3'));
    await page.goto('/');expect((await clipResponse).ok()).toBe(true);await incoming(page);
    await expect(page.locator('.top-controls')).toContainText('SOUND AUTO');
    const accept=page.getByTestId('accept-mission');await expect(accept).toBeInViewport({ratio:1});
    await accept.click();
    await expect(page.getByText('MISSION ACCEPTED',{exact:true})).toBeVisible();
    await expect(page.locator('.top-controls')).toContainText('SOUND ON');
    await expect.poll(()=>page.evaluate(()=>(window as any).__audioProbe.peak())).toBeGreaterThan(.0003);
    await expect(page.getByTestId('breach-screen')).toBeVisible({timeout:12000});
    await expect.poll(()=>page.evaluate(()=>(window as any).__audioProbe.clips.length)).toBe(1);
    const clip=await page.evaluate(()=>(window as any).__audioProbe.clips[0]);
    expect(clip.state).toBe('running');expect(clip.duration).toBeGreaterThan(2.49);expect(clip.duration).toBeLessThan(2.53);
    await expect.poll(()=>page.evaluate(()=>(window as any).__audioProbe.peak())).toBeGreaterThan(.001);
    await expect(page.getByTestId('profile-reveal')).toBeVisible({timeout:10000});
    const played=await page.evaluate(()=>(window as any).__audioProbe.clips[0]);
    expect(played.endedAt-played.startedAt).toBeGreaterThanOrEqual(played.duration-.1);
  });
}

test('accept re-enables muted audio; muting or replaying stops the voice cue',async({page})=>{
  await probeAudio(page);await page.goto('/');await incoming(page);
  await page.getByRole('button',{name:'Mute sound',exact:true}).click();
  await expect(page.locator('.top-controls')).toContainText('MUTED');
  await page.getByTestId('accept-mission').click();
  await expect(page.locator('.top-controls')).toContainText('SOUND ON');
  await expect(page.getByTestId('breach-screen')).toBeVisible({timeout:12000});
  await expect.poll(()=>page.evaluate(()=>(window as any).__audioProbe.clips.length)).toBe(1);
  await page.getByRole('button',{name:'Mute sound',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>(window as any).__audioProbe.clips[0].endedAt!==null)).toBe(true);
  await expect(page.locator('.top-controls')).toContainText('MUTED');
  await page.getByRole('button',{name:/restart cinematic/i}).click();
  await page.waitForTimeout(3000);await expect(page.getByTestId('story-landing')).toBeVisible();
  expect(await page.evaluate(()=>(window as any).__audioProbe.clips.length)).toBe(1);
});
