import { useEffect, useRef, useState } from 'react';
import { useMission } from '../store';
import { createMaster, playCue } from '../audio/score';
import type { Stage } from '../store';
import { registerAudioUnlock } from '../audio/control';
import { BREACH_CLIP } from '../audio/clips';

type AudioStatus='pending'|'running'|'muted'|'unavailable';
type Engine={context:AudioContext;master:GainNode;cue:(stage:Stage)=>void;quiet:()=>void;sync:()=>void};
export function useSound(){
  const enabled=useMission(s=>s.soundEnabled),stage=useMission(s=>s.stage);
  const engine=useRef<Engine|null>(null);
  const [status,setStatus]=useState<AudioStatus>('pending');
  useEffect(()=>{
    if(!window.AudioContext){setStatus('unavailable');return;}
    const context=new AudioContext(),master=createMaster(context);
    let alive=true,lastStage:Stage|null=null,stopCue:(()=>void)|null=null;
    let breachBuffer:AudioBuffer|null=null,clipFailed=false;
    const download=new AbortController();
    const hum=context.createOscillator(),harmonic=context.createOscillator(),bed=context.createGain();
    hum.frequency.value=48;harmonic.frequency.value=72.2;harmonic.type='sine';bed.gain.value=.012;
    hum.connect(bed);harmonic.connect(bed);bed.connect(master);hum.start();harmonic.start();
    const quiet=()=>{stopCue?.();stopCue=null;lastStage=null;};
    const cue=(chapter:Stage)=>{
      if(context.state!=='running'||!useMission.getState().soundEnabled||document.hidden||chapter===lastStage)return;
      if(chapter==='breach'&&!breachBuffer&&!clipFailed)return;
      stopCue?.();lastStage=chapter;
      if(chapter==='breach'&&breachBuffer){
        const source=context.createBufferSource(),level=context.createGain();
        source.buffer=breachBuffer;level.gain.value=.9;source.connect(level);level.connect(master);
        source.onended=()=>{source.disconnect();level.disconnect();};
        source.start();
        stopCue=()=>{level.gain.setTargetAtTime(0,context.currentTime,.012);try{source.stop(context.currentTime+.04);}catch{/* Already ended. */}};
      }else stopCue=playCue(context,master,chapter);
    };
    const sync=()=>{
      if(!alive)return;
      const on=useMission.getState().soundEnabled&&!document.hidden;
      master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(on?.65:0,context.currentTime,.035);
      setStatus(!useMission.getState().soundEnabled?'muted':context.state==='running'?'running':'pending');
      if(on)cue(useMission.getState().stage);else quiet();
    };
    engine.current={context,master,cue,quiet,sync};
    const activate=()=>{
      if(!useMission.getState().soundEnabled)return;
      if(context.state==='suspended')void context.resume().then(sync).catch(()=>{});
      else sync();
    };
    const unregister=registerAudioUnlock(activate);
    // Preload during the landing so the timed breach cue is ready before acceptance.
    void fetch(BREACH_CLIP.url,{signal:download.signal}).then(async response=>{
      if(!response.ok)throw new Error('Breach audio unavailable');
      return context.decodeAudioData(await response.arrayBuffer());
    }).then(buffer=>{if(alive){breachBuffer=buffer;sync();}}).catch(()=>{
      if(alive&&!download.signal.aborted){clipFailed=true;sync();}
    });
    context.addEventListener('statechange',sync);
    // Try automatically; strict browsers resume on the first genuine activation.
    activate();sync();
    window.addEventListener('click',activate);window.addEventListener('keydown',activate);window.addEventListener('touchend',activate,{passive:true});
    document.addEventListener('visibilitychange',sync);
    return()=>{alive=false;download.abort();unregister();engine.current=null;quiet();hum.stop();harmonic.stop();hum.disconnect();harmonic.disconnect();bed.disconnect();context.removeEventListener('statechange',sync);window.removeEventListener('click',activate);window.removeEventListener('keydown',activate);window.removeEventListener('touchend',activate);document.removeEventListener('visibilitychange',sync);void context.close().catch(()=>{});};
  },[]);
  useEffect(()=>{engine.current?.sync();},[enabled]);
  useEffect(()=>{engine.current?.cue(stage);},[stage]);
  return status;
}

