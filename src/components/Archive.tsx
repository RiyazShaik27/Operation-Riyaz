import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ArrowLeft, ArrowRight, FileArchive, FolderClosed, FolderOpen } from 'lucide-react';
import { archiveDefinitions, identity } from '../data/portfolio';
import { useMission } from '../store';
import { ArchiveContent } from './ArchiveContent';
import { archiveElements, archiveMotion, identityProjection } from '../scene/archiveLayout';

gsap.registerPlugin(Flip);

export function Archive(){
  const stage=useMission(s=>s.stage);
  const navigationRevision=useMission(s=>s.navigationRevision);
  const openArchive=useMission(s=>s.openArchive);
  const showArchives=useMission(s=>s.showArchives);
  const activeArchive=useMission(s=>s.activeArchive);
  const reduced=useMission(s=>s.motionReduced);
  // Rather than snapping the transforms from folder to folder, interpolate the
  // orbit angle itself. Every folder follows the same elliptical ring.
  const [focused,setFocused]=useState(3);
  const focusRef=useRef(3);
  const angleRef=useRef(archiveMotion);
  const [orbitPosition,setOrbitPosition]=useState(3);
  const tweenRef=useRef<gsap.core.Tween|null>(null);
  const hoverTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const rotationLockUntil=useRef(0);
  const swipeStartX=useRef<number|null>(null);
  const swipeConsumed=useRef(false);
  const speed=useMission(s=>s.orbitSpeed);
  const setOrbitFocus=useMission(s=>s.setOrbitFocus);
  const seconds=speed==='gentle'?2.95:speed==='quick'?1.25:2.15;
  const root=useRef<HTMLElement>(null);
  const entering=useRef(false);
  const [opening,setOpening]=useState<typeof activeArchive|null>(null);
  const flipState=useRef<ReturnType<typeof Flip.getState>|null>(null);
  useLayoutEffect(()=>{
    if(stage!=='carousel'||opening||reduced||!identityProjection.ready||!root.current)return;
    const portrait=root.current.querySelector<HTMLElement>('.central-portrait');
    if(!portrait)return;
    const bounds=portrait.getBoundingClientRect();
    const origin={...identityProjection};
    identityProjection.ready=false;
    const ctx=gsap.context(()=>{
      gsap.fromTo(portrait,{x:origin.left-bounds.left,y:origin.top-bounds.top,scale:origin.width/bounds.width,transformOrigin:'top left'},
        {x:0,y:0,scale:1,duration:1.8,ease:'power3.inOut'});
      gsap.from('.central-meta',{opacity:0,duration:.65,delay:.9});
    },root);
    return()=>ctx.revert();
  },[stage,opening,reduced]);

  const cancelPendingHover=useCallback(()=>{
    if(hoverTimer.current!==null){clearTimeout(hoverTimer.current);hoverTimer.current=null;}
  },[]);
  const rotateTo=useCallback((index:number,mode:'hover'|'direct'='direct')=>{
    if(entering.current)return;
    if(mode==='hover'&&performance.now()<rotationLockUntil.current)return;
    if(mode==='hover'&&index===focusRef.current)return;
    focusRef.current=index;
    setFocused(index);
    setOrbitFocus(index);
    tweenRef.current?.kill();
    const count=archiveDefinitions.length;
    const current=angleRef.current.position;
    const normalized=((current%count)+count)%count;
    const forward=((index-normalized+count)%count);
    const delta=forward>count/2?forward-count:forward;
    if(reduced||Math.abs(delta)<0.001){
      angleRef.current.position=current+delta;
      setOrbitPosition(angleRef.current.position);
      rotationLockUntil.current=0;
      return;
    }
    rotationLockUntil.current=performance.now()+seconds*1000+170;
    tweenRef.current=gsap.to(angleRef.current,{
      position:current+delta,duration:seconds,ease:'sine.inOut',overwrite:true,
      onUpdate:()=>setOrbitPosition(angleRef.current.position),
      onComplete:()=>{rotationLockUntil.current=0;tweenRef.current=null;},
    });
  },[reduced,seconds,setOrbitFocus]);
  const queueHover=useCallback((index:number)=>{
    cancelPendingHover();
    // A deliberate 170ms dwell stops one moving folder triggering another.
    if(reduced)return;
    hoverTimer.current=setTimeout(()=>{hoverTimer.current=null;rotateTo(index,'hover');},170);
  },[cancelPendingHover,rotateTo,reduced]);
  useEffect(()=>()=>{cancelPendingHover();tweenRef.current?.kill();},[cancelPendingHover]);
  function handleSwipeEnd(e:React.PointerEvent<HTMLDivElement>){
    if(swipeStartX.current===null)return;
    const change=e.clientX-swipeStartX.current;
    swipeStartX.current=null;
    if(Math.abs(change)>38){
      swipeConsumed.current=true;
      window.setTimeout(()=>{swipeConsumed.current=false;},350);
      cancelPendingHover();
      rotateTo((focusRef.current+(change<0?1:archiveDefinitions.length-1))%archiveDefinitions.length);
    }
  }
  const openCinematically=useCallback((id:typeof archiveDefinitions[number]['id'],_source?:HTMLElement)=>{
    cancelPendingHover();
    if(entering.current)return;
    if(reduced || window.innerWidth<1000){openArchive(id);return;}
    tweenRef.current?.kill();
    entering.current=true;
    archiveMotion.opening=true;
    flipState.current=Flip.getState(root.current!.querySelectorAll('.holo-folder,.central-identity'));
    setOpening(id);
  },[openArchive,cancelPendingHover,reduced]);
  useLayoutEffect(()=>{
    if(!opening||!flipState.current||stage!=='carousel')return;
    const revision=useMission.getState().navigationRevision;
    let flight:gsap.core.Timeline|undefined;
    const ctx=gsap.context(()=>{
      flight=Flip.from(flipState.current!,{duration:1.15,ease:'power3.inOut',absolute:true,prune:true,
        onComplete:()=>{
          const current=useMission.getState();
          if(current.stage!=='carousel'||current.navigationRevision!==revision||!entering.current)return;
          entering.current=false;archiveMotion.opening=false;openArchive(opening);setOpening(null);
        }});
      gsap.from('.is-opening-file strong',{fontSize:31,duration:1.15,ease:'power3.inOut'});
    },root);
    return()=>{flight?.eventCallback('onComplete',null);flight?.kill();ctx.revert();};
  },[opening,stage,openArchive,navigationRevision]);
  useEffect(()=>{
    entering.current=false;archiveMotion.opening=false;setOpening(null);cancelPendingHover();
  },[stage,navigationRevision,cancelPendingHover]);
  useEffect(()=>()=>{archiveMotion.opening=false;archiveElements.clear();},[]);
  const panel=useRef<HTMLDivElement>(null);
  const full=stage==='document';
  const visible=stage==='carousel'||stage==='document';
  useEffect(()=>{
    if(!full||!panel.current)return;
    panel.current.scrollTop=0;
    if(reduced)return;
    const heading=panel.current.querySelector('.dossier-heading');
    const records=panel.current.querySelectorAll('.intel-record');
    const ctx=gsap.context(()=>{
      gsap.fromTo(heading,{opacity:0,y:18},{opacity:1,y:0,duration:.5,ease:'power3.out'});
      gsap.fromTo(records,{opacity:0,y:16},{opacity:1,y:0,duration:.5,stagger:.065,ease:'power2.out',delay:.15});
    },panel);
    return ()=>ctx.revert();
  },[full,activeArchive,reduced]);
  useEffect(()=>{
    if(stage!=='carousel')return;
    let last=0,total=0,consumed=false,until=performance.now()+1500;
    const wheel=(event:WheelEvent)=>{
      if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.target instanceof HTMLElement&&event.target.closest('.accessibility-menu,.image-modal,.site-header'))return;
      event.preventDefault();const now=performance.now();
      if(now-last>180){total=0;consumed=false;}last=now;
      if(consumed||now<until)return;
      total+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?window.innerHeight:1);
      if(Math.abs(total)<70)return;
      consumed=true;until=now+seconds*1000+150;cancelPendingHover();
      rotateTo((focusRef.current+(total>0?1:archiveDefinitions.length-1))%archiveDefinitions.length);
    };
    window.addEventListener('wheel',wheel,{passive:false});
    return()=>window.removeEventListener('wheel',wheel);
  },[stage,seconds,rotateTo,cancelPendingHover]);
  useEffect(()=>{
    function key(e:KeyboardEvent){
      if(!visible)return;
      if(document.querySelector('.record-dialog[open]'))return;
      if(e.key==='Escape' && !document.querySelector('.image-modal')){setOpening(null);entering.current=false;archiveMotion.opening=false;showArchives();}
      if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement)return;
      if(stage==='carousel'&&['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','PageDown','PageUp'].includes(e.key)){
        e.preventDefault();
        const next=(focusRef.current+(['ArrowRight','ArrowDown','PageDown'].includes(e.key)?1:archiveDefinitions.length-1))%archiveDefinitions.length;
        rotateTo(next);archiveElements.get(next)?.focus({preventScroll:true});
      }
    }
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[stage,visible,showArchives,rotateTo]);
  if(!visible)return null;
  const selected=archiveDefinitions.find(f=>f.id===activeArchive)!;
  return <section ref={root} className={`archive-ui ${full?'archive-full':'archive-carousel'} ${opening?'is-opening':''}`} aria-label="Professional intelligence archive">
    {!full?<div className="carousel-content" data-testid="archive-carousel">
      <div className="archive-kicker"><span className="status-dot"/> PROFILE FOUND <span className="divider-vert"/> ARCHIVES UNLOCKED</div>
      <div className="central-identity"><div className="central-portrait"><img src={identity.portrait} alt="Shaik Riyaz"/><div className="scan-bar"/><div className="scanner-corner tl"/><div className="scanner-corner br"/></div><div className="central-meta"><div className="eyebrow micro">SUBJECT // IDENTIFICATION COMPLETE</div><h2>SHAIK <em>RIYAZ</em></h2><p>{identity.role}</p></div></div>
      <div className="carousel-title"><span className="eyebrow micro">FILE SELECTION INTERFACE</span><span>{String(focused+1).padStart(2,'0')} / 07</span></div>
      <div className="folder-gallery" aria-label="Rotating archive carousel">
        <div className="folder-stage" onPointerDown={e=>{if(e.pointerType==='touch')swipeStartX.current=e.clientX;}} onPointerUp={handleSwipeEnd} onPointerCancel={()=>{swipeStartX.current=null;}}>
          <div className="orbit-track" aria-hidden="true"><span>ROTATING ARCHIVE // SELECT A FILE</span></div>
          <div className="orbit-hud" aria-hidden="true"><span className="orbit-hud-a"/><span className="orbit-hud-b"/><span className="orbit-hud-c"/><div className="orbit-core">OR<br/><small>07</small></div></div>
          {archiveDefinitions.map((folder,i)=>{
            const total=archiveDefinitions.length;
            const angle=(i-orbitPosition)*(2*Math.PI/total);
            const near=(Math.cos(angle)+1)/2;
            const centered=i===focused;
            const orbitStyle={
              '--file-index':i,
              '--orbit-x':Math.sin(angle).toFixed(6),
              '--orbit-y':((1-Math.cos(angle))/2).toFixed(6),
              '--orbit-z':(Math.cos(angle)-1).toFixed(6),
              '--orbit-angle':(-Math.sin(angle)*33).toFixed(3),
              '--orbit-scale':(0.65+near*0.35).toFixed(4),
              '--orbit-opacity':(0.43+near*0.57).toFixed(4),
              zIndex:Math.round(50+50*Math.cos(angle)),
            } as React.CSSProperties;
            return <button ref={element=>{if(element)archiveElements.set(i,element);else archiveElements.delete(i);}} key={folder.id} data-testid={`carousel-${folder.id}`} type="button"
              className={`holo-folder ${centered?'is-focused':''} ${opening===folder.id?'is-opening-file':''}`} style={orbitStyle}
              onPointerEnter={e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')queueHover(i);}}
              onPointerLeave={cancelPendingHover}
              onFocus={e=>{cancelPendingHover();if(e.currentTarget.matches(':focus-visible')&&focusRef.current!==i)rotateTo(i);}}
              onClick={e=>{cancelPendingHover();if(!swipeConsumed.current)openCinematically(folder.id,e.currentTarget);}}
              aria-label={`Open ${folder.label} archive`} aria-current={centered?'true':undefined}>
              <span className="folder-ghost back" aria-hidden="true"/><span className="folder-ghost mid" aria-hidden="true"/><span className="folder-data" aria-hidden="true"><i/><i/><i/><i/></span>{centered?<FolderOpen size={38}/>:<FolderClosed size={30}/>}<span className="folder-serial">FILE_{folder.serial}</span><strong>{folder.label}</strong><span className="folder-code">{folder.code}</span><span className="folder-tech" aria-hidden="true"><b/><b/><b/><b/><b/><b/><b/><b/></span>
            </button>;
          })}
        </div>
      </div>
      <button className="open-folder primary-action" onClick={e=>openCinematically(archiveDefinitions[focused].id,e.currentTarget)}><FileArchive size={17}/> OPEN {archiveDefinitions[focused].label.toUpperCase()} ARCHIVE <ArrowRight size={16}/></button>
      <div className="orbit-indicators" aria-label="Choose archive">{archiveDefinitions.map((f,i)=><button key={f.id} type="button" aria-label={`Rotate to ${f.label}`} aria-pressed={i===focused} className={i===focused?'current':''} onClick={()=>{cancelPendingHover();rotateTo(i);}}/>)}</div>
      <span className="carousel-hint">SCROLL TO ORBIT • CLICK TO OPEN • SWIPE OR USE ← → TO BROWSE</span>
    </div>:<div className="archive-workspace" data-testid="archive-document">
      <div className="archive-main" ref={panel}>
        <div className="dossier-heading"><span className="eyebrow micro">OPERATION RIYAZ / DECLASSIFIED INTELLIGENCE</span><h2>{selected.label}<span className="dot">.</span></h2><div className="dossier-subtitle"><span>FILE_{selected.serial} // {selected.code}</span><span className="access-label">● ACCESS GRANTED</span></div><p>{selected.subtitle}</p></div>
        <p className="archive-detail-hint">SELECT A RECORD TO OPEN ITS FULL DETAILS</p>
        <ArchiveContent key={selected.id} id={selected.id}/>
      </div>
      <aside className="archive-sidebar" aria-label="Archive folders">
        <div className="identity-mini"><div className="mini-img"><img src={identity.portrait} alt="Shaik Riyaz"/></div><div><span className="eyebrow micro">TARGET VERIFIED</span><strong>SHAIK RIYAZ</strong><small>IDENTITY: CONFIRMED</small></div></div>
        <div className="sidebar-label">ENCRYPTED FILE DIRECTORY <span>07</span></div>
        <nav className="sidebar-nav" aria-label="Folders">
          {archiveDefinitions.map(file=><button key={file.id} data-testid={`nav-${file.id}`} type="button" className={`sidebar-folder ${file.id===activeArchive?'active':''}`} onClick={()=>openArchive(file.id)} aria-current={file.id===activeArchive?'page':undefined}><FolderClosed size={18}/><span>{file.label}</span><small>{file.serial}</small></button>)}
        </nav>
        <button className="back-folders" onClick={showArchives}><ArrowLeft size={15}/> ALL FILES</button>
      </aside>
    </div>}
  </section>;
}
