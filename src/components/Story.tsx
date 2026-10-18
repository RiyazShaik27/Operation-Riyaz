import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CheckCircle2, Fingerprint, Lock, RadioTower, ShieldAlert, Terminal, Maximize2, Minimize2, Volume2 } from 'lucide-react';
import { identity } from '../data/portfolio';
import { useMission } from '../store';
import { requestAudioUnlock } from '../audio/control';
import { BREACH_CLIP } from '../audio/clips';

const terminalLines=[
  '> SECURE TERMINAL INITIALIZED',
  '> OBJECTIVE: SHA[I]K_RIYAZ',
  '[01] Searching simulated public records...',
  '[02] Cross-referencing academic metadata...',
  '[03] Enumerating professional project archives...',
  '[04] Identifying technology fingerprints...',
  '[05] Locating available credential records...',
  '[06] Assembling identity intelligence dossier...',
  '[07] Simulated security perimeter engaged...',
  '[08] ACCESS OVERRIDE // CINEMATIC SIMULATION',
  '[09] PROFILE IDENTIFIED',
];
export function Story(){
  const stage=useMission(s=>s.stage);
  const setStage=useMission(s=>s.setStage);
  const acceptMission=useMission(s=>s.acceptMission);
  const reduced=useMission(s=>s.motionReduced);
  const [lineCount,setLineCount]=useState(0);
  const [expanded,setExpanded]=useState(false);
  useEffect(()=>setExpanded(false),[stage]);
  const current=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!current.current||reduced)return;
    // IMPORTANT: centered story cards rely on translate(-50%, -50%) for positioning.
    // Animating their y transform directly with GSAP overwrote that translate and
    // pushed ACCEPT MISSION below the viewport on shorter desktop screens.
    const ctx=gsap.context(()=>{
      if(stage==='landing'){
        gsap.fromTo('.landing-inner .story-reveal', {opacity:0,y:18},
          {opacity:1,y:0,duration:.65,stagger:.10,ease:'power3.out'});
      }else{
        gsap.fromTo('.story-reveal', {opacity:0},
          {opacity:1,duration:.58,ease:'power2.out'});
      }
    },current);
    return()=>ctx.revert();
  },[stage,reduced]);
  useEffect(()=>{
    if(stage!=='recon'){setLineCount(0);return;}
    let count=0;
    const interval=window.setInterval(()=>{count++;setLineCount(count);if(count>=terminalLines.length){window.clearInterval(interval);}},reduced?95:420);
    return()=>window.clearInterval(interval);
  },[stage,reduced]);
  useEffect(()=>{
    if(stage!=='recon'||lineCount<terminalLines.length)return;
    const timeout=window.setTimeout(()=>setStage('breach'),reduced?180:750);
    return()=>window.clearTimeout(timeout);
  },[lineCount,stage,setStage,reduced]);
  useEffect(()=>{
    if(stage!=='breach')return;
    const timeout=window.setTimeout(()=>setStage('profile'),BREACH_CLIP.holdMs);
    return()=>window.clearTimeout(timeout);
  },[stage,setStage,reduced]);
  if(!['landing','mission','recon','breach','profile'].includes(stage))return null;
  return <main className={`story-layer story-${stage}`} ref={current} aria-label={`Operation Riyaz: ${stage}`} data-testid={`story-${stage}`}>
    {stage==='landing'&&<div className="landing-inner">
      <div className="left-rule story-reveal"><span className="status-dot"/> AN INTERACTIVE IDENTITY INVESTIGATION</div>
      <p className="eyebrow micro story-reveal">CLASSIFIED OPERATION / CASE 001</p>
      <h1 className="story-reveal">OPERATION<br/><em>RIYAZ</em><span className="blink-caret">_</span></h1>
      <p className="landing-description story-reveal">A mysterious request. A hidden identity. Seven classified archives. Enter the cyberlab to uncover the story behind the subject.</p>
      <div className="entry-scroll story-reveal"><span className="scroll-stem"/> SCROLL TO INTERCEPT THE TRANSMISSION <small>SWIPE UP / ↓ / PAGE DOWN</small></div>
      <div className="hero-coordinates story-reveal">LOCATION // ENCRYPTED<br/>MISSION STATUS // STANDBY<br/>SIMULATION // NOT A REAL INTRUSION</div>
    </div>}
    {stage==='mission'&&<div className={`mission-card communicator story-reveal ${expanded?'is-expanded':''}`} data-testid="mission-card">
      <div className="device-header"><span>SECURE HANDSET / 01</span><button aria-label={expanded?'Collapse incoming message':'Expand incoming message'} aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button></div>
      <div className="message-meta"><span><RadioTower size={18}/> INCOMING TRANSMISSION</span><span className="live-blink">● PRIORITY 01</span></div>
      <div className="message-sender"><span>FROM</span><strong>UNKNOWN CLIENT <small>••••••@REDACTED</small></strong></div>
      <div className="message-content"><span className="eyebrow micro">INCOMING MESSAGE // DECRYPTED</span><p>“I need everything you can find about a particular person.”</p><h2>SHAIK RIYAZ</h2><p>“Who is he? What has he built? What is he capable of?”</p></div>
      <div className="message-footer"><button data-testid="accept-mission" className="primary-action" aria-label="Accept mission and enable sound" onClick={()=>{acceptMission();requestAudioUnlock();}}>ACCEPT MISSION <Volume2 size={15}/></button><small className="accept-audio-hint scroll-action">SOUND ON · OR SCROLL / SWIPE TO ACCEPT</small><span><Lock size={14}/> FICTIONAL PUBLIC-RECORD SIMULATION</span></div>
    </div>}
    {stage==='recon'&&<div className={`terminal-card field-terminal story-reveal ${expanded?'is-expanded':''}`} data-testid="recon-terminal">
      <div className="device-header"><span>LIVE WORKSTATION FEED</span><button aria-label={expanded?'Collapse investigation log':'Expand investigation log'} aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button></div>
      <div className="mission-accepted" role="status"><CheckCircle2 size={16}/> MISSION ACCEPTED</div><div className="terminal-header"><span><Terminal size={18}/> RECONNAISSANCE TERMINAL</span><span>SESSION_07 // RUNNING</span></div>
      <div className="terminal-rows" aria-live="polite">{terminalLines.slice(expanded?0:Math.max(0,lineCount-2),lineCount).map((line,i)=><div key={i} className={line.includes('OVERRIDE')?'warning-text':''}>{line}</div>)}<span className="terminal-caret">▍</span></div>
      <div className="terminal-footer"><span>SIMULATED OPERATIONS / NO REAL SYSTEMS ACCESSED</span><strong>{Math.round(lineCount/terminalLines.length*100)}%</strong></div>
      <div className="progress-track"><div style={{width:`${lineCount/terminalLines.length*100}%`}}/></div>
    </div>}
    {stage==='breach'&&<div className="breach-display" data-testid="breach-screen"><div className="breach-rings"/><ShieldAlert size={60}/><p className="eyebrow micro">SECURITY OVERRIDE / SIMULATED</p><h2 data-text="SYSTEM BREACHED">SYSTEM<br/>BREACHED</h2><p>IDENTITY RECORD FOUND • ACCESS GRANTED</p></div>}
    {stage==='profile'&&<div className="profile-reveal story-reveal" data-testid="profile-reveal">
      <div className="eyebrow micro profile-top"><Fingerprint size={16}/> BIOMETRIC RECONSTRUCTION COMPLETE</div>
      <div className="reveal-image"><div className="reveal-radar"/><img src={identity.portrait} alt="Shaik Riyaz — identified subject"/><div className="reconstruction-mesh" aria-hidden="true"/><div className="scan-bar"/><div className="scanner-corner tl"/><div className="scanner-corner br"/></div>
      <div className="profile-data"><div className="profile-confirm"><CheckCircle2 size={17}/> PROFILE FOUND</div><h2>SHAIK <em>RIYAZ</em></h2><p>{identity.role}</p><div className="scan-chars">SCAN COMPLETED // IDENTITY CONFIRMED // 07 ARCHIVES RECOVERED</div></div>
      <p className="scroll-action profile-scroll">SCROLL TO REVEAL THE ARCHIVES <span aria-hidden="true">↓</span></p>
    </div>}
  </main>;
}


