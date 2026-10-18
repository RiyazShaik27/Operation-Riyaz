import React, { useEffect, useState } from 'react';
import { FolderOpen, Headphones, RotateCcw, Volume2, VolumeX, Accessibility, AlertCircle } from 'lucide-react';
import { CyberLab } from './scene/CyberLab';
import { Story } from './components/Story';
import { Archive } from './components/Archive';
import { useMission } from './store';
import type { OrbitSpeed } from './store';
import { useStoryScroll } from './hooks/useStoryScroll';
import { useSound } from './hooks/useSound';

class SceneErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<div className="webgl-fallback"><AlertCircle/><p>3D graphics are unavailable in this browser. The portfolio archive remains accessible through OPEN ARCHIVES.</p></div>:this.props.children;}
}
export default function App(){
  const stage=useMission(s=>s.stage);
  const showArchives=useMission(s=>s.showArchives);
  const restart=useMission(s=>s.restart);
  const toggleSound=useMission(s=>s.toggleSound);
  const sound=useMission(s=>s.soundEnabled);
  const reduced=useMission(s=>s.motionReduced);
  const setReduced=useMission(s=>s.setMotionReduced);
  const orbitSpeed=useMission(s=>s.orbitSpeed);
  const setOrbitSpeed=useMission(s=>s.setOrbitSpeed);
  const [help,setHelp]=useState(false);
  const audioStatus=useSound();
  useStoryScroll();
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const handler=(ev:MediaQueryListEvent)=>setReduced(ev.matches);
    media.addEventListener('change',handler);
    return ()=>media.removeEventListener('change',handler);
  },[setReduced]);
  return <div className={`app-frame phase-${stage} theme-nocturne ${reduced?'reduce-motion':''}`}>
    <SceneErrorBoundary><CyberLab/></SceneErrorBoundary>
    <div className="cinematic-frame" aria-hidden="true"><span className="film-bar top"/><span className="film-bar bottom"/><span className="hud-corner a"/><span className="hud-corner b"/><span className="hud-corner c"/><span className="hud-corner d"/><span className="live-readout">OR // {stage.toUpperCase()} <i/></span></div>
    <header className="site-header">
      <div className="brand"><span className="brand-mark">OR<span className="brand-dot">.</span></span><span className="brand-name">OPERATION RIYAZ <small>PERSONNEL INTELLIGENCE SYSTEM</small></span></div>
      <div className="top-controls"><button aria-label="Open portfolio archives" title="Open archives" onClick={showArchives}><FolderOpen size={17}/><span>ARCHIVES</span></button><button aria-label="Restart cinematic" title="Restart cinematic" onClick={restart}><RotateCcw size={16}/><span>REPLAY</span></button><button aria-label={sound?'Mute sound':'Enable sound'} title={sound?'Mute':'Enable sound'} onClick={toggleSound}>{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}<span>{!sound?'MUTED':audioStatus==='running'?'SOUND ON':'SOUND AUTO'}</span></button><button aria-label="Accessibility options" title="Accessibility options" onClick={()=>setHelp(v=>!v)}><Accessibility size={17}/></button></div>
    </header>
    {help&&<div className="accessibility-menu"><h3>Experience settings</h3><p>Scroll, swipe up, or press ↓ / Page Down to continue the story. Sound starts automatically when your browser permits it.</p><label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Reduce motion and camera movement</label><label className="speed-preference">Carousel rotation speed<select aria-label="Carousel rotation speed" value={orbitSpeed} onChange={e=>setOrbitSpeed(e.target.value as OrbitSpeed)}><option value="gentle">Gentle — 3 seconds</option><option value="cinematic">Cinematic — 2.15 seconds</option><option value="quick">Quick — 1.25 seconds</option></select></label><button onClick={()=>setHelp(false)}>CLOSE</button></div>}
    <Story/>
    <Archive/>
    {stage!=='document'&&<footer className="site-footer"><span><span className="status-dot"/> CYBERLAB ONLINE <span className="footer-divider">/</span> SIMULATED INVESTIGATION</span><span><Headphones size={13}/> {sound&&audioStatus==='pending'?'TAP OR PRESS A KEY FOR SOUND':sound?'CINEMATIC AUDIO':'SOUND MUTED'} <span className="footer-divider">/</span> BUILD 1.8.1</span></footer>}
    <div className="global-noise" aria-hidden="true"/>
  </div>;
}


