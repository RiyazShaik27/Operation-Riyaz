import type { Stage } from '../store';

type AudioClock = AudioContext | OfflineAudioContext;
/** Layered, band-limited cues shared by live playback and offline audio verification. */
export function playCue(context: AudioClock, destination: AudioNode, stage: Stage) {
  const nodes: AudioScheduledSourceNode[] = [];
  const bus = context.createGain(); bus.gain.value = .9; bus.connect(destination);
  let disposed=false;
  const at=context.currentTime+.015;
  const tone=(frequency:number,endFrequency:number,start:number,length:number,level:number,type:OscillatorType='sine',pan=0)=>{
    const osc=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter(),stereo=context.createStereoPanner();
    osc.type=type;osc.frequency.setValueAtTime(frequency,at+start);osc.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),at+start+length);
    filter.type='lowpass';filter.frequency.value=1900;filter.Q.value=.4;stereo.pan.value=pan;
    gain.gain.setValueAtTime(0,at+start);gain.gain.linearRampToValueAtTime(level,at+start+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+start+length);
    osc.connect(filter);filter.connect(gain);gain.connect(stereo);stereo.connect(bus);
    osc.onended=()=>{osc.disconnect();filter.disconnect();gain.disconnect();stereo.disconnect();};
    osc.start(at+start);osc.stop(at+start+length+.025);nodes.push(osc);
  };
  const sweep=(start:number,length:number,level:number)=>{
    const noise=context.createBuffer(1,Math.ceil(context.sampleRate*length),context.sampleRate),data=noise.getChannelData(0);
    let seed=1789;
    for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=(seed/2147483647*2-1);}
    const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=noise;
    filter.type='bandpass';filter.Q.value=.65;filter.frequency.setValueAtTime(180,at+start);filter.frequency.exponentialRampToValueAtTime(1600,at+start+length);
    gain.gain.setValueAtTime(0,at+start);gain.gain.linearRampToValueAtTime(level,at+start+length*.6);gain.gain.exponentialRampToValueAtTime(.0001,at+start+length);
    source.connect(filter);filter.connect(gain);gain.connect(bus);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start(at+start);source.stop(at+start+length);nodes.push(source);
  };
  if(stage==='mission'||stage==='breach'){
    const urgent=stage==='breach';
    sweep(0,urgent?.9:.65,.10);
    tone(105,42,0,1.6,.20,'sine');tone(160,65,.03,1.1,.045,'triangle');
    for(let i=0;i<(urgent?5:3);i++){
      tone(i%2?740:530,i%2?620:710,.12+i*.26,.28,.105,'triangle',i%2?.25:-.25);
      tone(i%2?1480:1060,i%2?1240:1420,.12+i*.26,.24,.022,'sine',i%2?-.2:.2);
    }
  } else if(stage==='recon') {
    tone(72,52,0,.9,.10);sweep(0,.42,.045);
    for(let i=0;i<3;i++)tone(260+i*90,240+i*90,.08+i*.11,.18,.035,'triangle',i%2?.15:-.15);
  } else if(stage==='profile'||stage==='carousel') {
    sweep(0,.8,.045);
    [220,330,440,660].forEach((f,i)=>tone(f,f, i*.11,1.25,.05,'sine',(i-1.5)*.13));
    tone(65,48,0,1.5,.09);
  } else if(stage==='document') {
    tone(160,90,0,.35,.08,'triangle');tone(520,390,.04,.3,.035);
  } else {tone(65,42,0,1.4,.12);sweep(0,.65,.04);}
  const timer=window.setTimeout(()=>{bus.disconnect();},2600);
  return()=>{
    if(disposed)return;disposed=true;window.clearTimeout(timer);
    // Stop outgoing chapter cues as soon as the visitor skips, mutes or leaves.
    bus.gain.cancelScheduledValues(context.currentTime);bus.gain.setTargetAtTime(0,context.currentTime,.015);
    for(const node of nodes){try{node.stop(context.currentTime+.05);}catch{/* Already ended. */}}
    window.setTimeout(()=>bus.disconnect(),100);
  };
}

export function createMaster(context:AudioClock) {
  const master=context.createGain(),highpass=context.createBiquadFilter(),compressor=context.createDynamicsCompressor();
  master.gain.value=.65;highpass.type='highpass';highpass.frequency.value=28;
  compressor.threshold.value=-18;compressor.knee.value=18;compressor.ratio.value=4;compressor.attack.value=.008;compressor.release.value=.18;
  master.connect(highpass);highpass.connect(compressor);compressor.connect(context.destination);
  return master;
}

