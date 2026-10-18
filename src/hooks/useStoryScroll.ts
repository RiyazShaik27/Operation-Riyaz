import { useEffect } from 'react';
import { useMission } from '../store';
import { requestAudioUnlock } from '../audio/control';

/** Preserve native scrolling inside messages and documents. */
function scrollsInside(target: EventTarget | null, delta: number) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest('.accessibility-menu,.image-modal')) return true;
  for (let element: HTMLElement | null = target; element && element !== document.body; element = element.parentElement) {
    if (!/(auto|scroll)/.test(getComputedStyle(element).overflowY) || element.scrollHeight <= element.clientHeight + 2) continue;
    if (delta > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 2 : element.scrollTop > 1) return true;
  }
  return false;
}

export function useStoryScroll() {
  useEffect(() => {
    let lastWheel = 0, total = 0, consumed = false, lockedUntil = performance.now() + 350;
    let touch: {x:number;y:number;target:EventTarget|null} | null = null;
    const unsub = useMission.subscribe((state, previous) => {
      if (state.stage !== previous.stage) {
        total = 0;
        lockedUntil = performance.now() + (state.stage === 'profile' ? 1500 : 850);
      }
    });
    const advance = (direction: number) => {
      if (performance.now() < lockedUntil) return;
      const {stage,setStage,showArchives,acceptMission} = useMission.getState();
      if(direction > 0) {
        if(stage === 'landing') setStage('mission');
        else if(stage === 'mission') {acceptMission();requestAudioUnlock();}
        else if(stage === 'profile') showArchives();
      } else {
        if(stage === 'mission') setStage('landing');
        else if(stage === 'profile') setStage('mission');
      }
    };
    const wheel = (event: WheelEvent) => {
      const stage=useMission.getState().stage;
      if(stage==='document'||stage==='carousel'||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||scrollsInside(event.target,event.deltaY))return;
      event.preventDefault();
      const now=performance.now();
      if(now-lastWheel>300){total=0;consumed=false;}
      lastWheel=now;
      // A long wheel/trackpad burst cannot skip the transmission or the reveal.
      if(consumed)return;
      if(stage==='recon'||stage==='breach'||now<lockedUntil){consumed=true;return;}
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?window.innerHeight:1);
      if(Math.sign(delta)!==Math.sign(total))total=0;
      total+=delta;
      if(Math.abs(total)>=70){consumed=true;advance(Math.sign(total));total=0;}
    };
    const key = (event:KeyboardEvent) => {
      if(event.repeat||event.altKey||event.metaKey||event.ctrlKey)return;
      const target=event.target;
      if(target instanceof HTMLElement){
        if(target.closest('input,select,textarea,[contenteditable=true],.accessibility-menu,.image-modal'))return;
        if(event.key===' '&&target.closest('button,a'))return;
      }
      const stage=useMission.getState().stage;
      if(stage==='document'||stage==='carousel')return;
      const direction=['ArrowDown','PageDown',' '].includes(event.key)?(event.shiftKey?-1:1):['ArrowUp','PageUp'].includes(event.key)?-1:0;
      if(!direction)return;
      event.preventDefault();advance(direction);
    };
    const start = (event:TouchEvent) => {const p=event.touches[0];touch=p?{x:p.clientX,y:p.clientY,target:event.target}:null;};
    const end = (event:TouchEvent) => {
      if(!touch)return;
      const p=event.changedTouches[0],start=touch;touch=null;
      if(!p)return;
      const dy=start.y-p.clientY,dx=start.x-p.clientX;
      if(Math.abs(dy)>55&&Math.abs(dy)>Math.abs(dx)*1.3&&!scrollsInside(start.target,dy))advance(Math.sign(dy));
    };
    window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('keydown',key);
    window.addEventListener('touchstart',start,{passive:true});window.addEventListener('touchend',end,{passive:true});
    return()=>{unsub();window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key);window.removeEventListener('touchstart',start);window.removeEventListener('touchend',end);};
  },[]);
}
