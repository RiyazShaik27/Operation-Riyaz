let unlock: (()=>void)|null=null;
/** Called synchronously inside the real click/touch/key handler. */
export function requestAudioUnlock(){unlock?.();}
export function registerAudioUnlock(handler:()=>void){
  unlock=handler;
  return()=>{if(unlock===handler)unlock=null;};
}
