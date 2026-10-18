/**
 * Operation Riyaz — cinematic environment layer.
 * All geometry and monitor visuals are generated locally; no remote 3D assets.
 * Never intercepts pointer events: the React UI owns navigation.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Stage } from '../store';
import { THEME_COLORS, type VisualTheme } from '../data/themes';
import { identity } from '../data/portfolio';
import { useMission } from '../store';
import { identityProjection } from './archiveLayout';

/** Animated terminal imagery drawn onto a small GPU texture (6-8 updates/sec). */
export function DynamicMonitor({ stage, width, channel }: { stage: Stage; width: number; channel: number }) {
  const portrait = useMemo(() => { const image = new Image(); image.src = identity.portrait; return image; }, []);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, []);
  const elapsed = useRef(-1);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (t - elapsed.current < 0.14) return;
    elapsed.current = t;
    const c = texture.image as HTMLCanvasElement;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const breach = stage === 'breach';
    const active = stage === 'recon' || breach;
    ctx.fillStyle = breach ? '#230a17' : '#061b29';
    ctx.fillRect(0, 0, 512, 320);
    const gradient = ctx.createLinearGradient(0, 0, 512, 320);
    gradient.addColorStop(0, breach ? '#7b1b2b33' : '#1a9ca733');
    gradient.addColorStop(1, '#07131b00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 320);
    ctx.strokeStyle = breach ? '#ff456627' : '#62e9e121';
    ctx.lineWidth = 1;
    for(let x = 0; x < 512; x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,320);ctx.stroke();}
    for(let y = 0; y < 320; y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke();}
    const accent = breach ? '#ff7a87' : '#7bf8e5';
    ctx.fillStyle = accent;
    ctx.font = 'bold 17px monospace';
    ctx.fillText(breach ? '!! SECURITY OVERRIDE !!' : channel === 1 ? 'OPERATOR / MAINFRAME' : channel === 0 ? 'OSINT // ANALYSIS' : 'NETWORK // TELEMETRY', 20, 32);
    ctx.fillStyle = breach ? '#e06c79' : '#6ba1ab';
    ctx.font = '12px monospace';
    ctx.fillText(`NODE_${channel + 1}  ::  ${active ? 'ACTIVE' : 'STANDBY'}    /    00:0${Math.floor(t)%10}`, 22, 57);
    if(channel === 1 && (stage === 'profile' || stage === 'carousel') && portrait.complete && portrait.naturalWidth){
      ctx.drawImage(portrait, 27, 77, 143, 190);
      ctx.fillStyle=accent;ctx.font='bold 19px monospace';ctx.fillText('PROFILE FOUND',192,118);
      ctx.font='15px monospace';ctx.fillText('SHAIK RIYAZ',192,158);ctx.fillText('07 ARCHIVES',192,198);
      ctx.strokeStyle='#7bf8e5';ctx.strokeRect(23,73,151,198);
    } else if(channel === 1){
      const lines = active ? ['> scanning public metadata...', '> compiling identity records...', '> matching project signatures...', '> access protocol validated', '> identity index recovered', '> archives: 07 / 07'] : ['> connection secure', '> awaiting operation', '> operator authentication: OK', '> initialization complete', '> secure channel established'];
      ctx.font = '13px monospace';
      lines.forEach((line,i)=>{
        ctx.fillStyle = i < (Math.floor(t*3)% (lines.length+1)) || !active ? accent : '#30616c';
        ctx.fillText(line, 23, 96+i*31);
      });
    } else if(channel === 0) {
      // Scrolling hex-like data stream.
      for(let i=0;i<8;i++){
        const code = Array.from({length:24},(_,j)=>'0123456789ABCDEF'[(i*9+j*7+Math.floor(t*2))%16]).join('');
        ctx.fillStyle = i%3===0 ? accent : '#467783';
        ctx.font = '12px monospace';ctx.fillText(code,22,95+i*26);
      }
    } else {
      // Telemetry waveform changes with the cinematic stage.
      ctx.strokeStyle = accent;ctx.lineWidth = 2;
      ctx.beginPath();
      for(let x=18;x<493;x+=4){const y = 186 + Math.sin(x*.032+t*2.8)*28 + Math.cos(x*.094-t*1.4)*15;
        if(x===18)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
      ctx.stroke();
      ctx.font='12px monospace';ctx.fillStyle='#78afb6';
      ctx.fillText('TRACE OUTPUT',22,100);ctx.fillText('NETWORK ACTIVITY',22,255);
      for(let i=0;i<10;i++){
        ctx.fillStyle = i < (Math.floor(t*5)%11) ? accent : '#174b54';
        ctx.fillRect(24+i*46,276,30,12);
      }
    }
    ctx.fillStyle = breach ? '#e94057' : '#2d968f';
    ctx.fillRect(18,303,476,2);
    ctx.fillStyle = accent;
    ctx.fillRect(18,303,active ? 476*((t*.22)%1) : 88,2);
    texture.needsUpdate = true;
  });
  return <mesh position={[0,0,.059]}>
    <planeGeometry args={[width-.115,.81]}/>
    <meshBasicMaterial map={texture} toneMapped={false}/>
  </mesh>;
}

/** The physical set dressing that adds depth and visual interest to the lab. */
export function LabDetails({stage}:{stage:Stage}) {
  const alert = stage === 'breach';
  const cable = useMemo(() => [
    new THREE.CatmullRomCurve3([new THREE.Vector3(-2.1,.7,-1.8),new THREE.Vector3(-2.6,.42,-1.2),new THREE.Vector3(-2.4,.12,-.6)]),
    new THREE.CatmullRomCurve3([new THREE.Vector3(2.1,.7,-1.8),new THREE.Vector3(2.7,.42,-1.2),new THREE.Vector3(2.4,.12,-.6)]),
    new THREE.CatmullRomCurve3([new THREE.Vector3(0,.72,-2.1),new THREE.Vector3(.3,.38,-2.55),new THREE.Vector3(.2,.10,-2.9)]),
  ], []);
  return <group>
    {/* Raised central floor and illuminated platform edges. */}
    <mesh position={[0,-.05,-.8]} receiveShadow><boxGeometry args={[6.4,.12,4.2]}/><meshStandardMaterial color="#101f2b" roughness={.47} metalness={.65}/></mesh>
    {[-3.18,3.18].map(x=><mesh key={x} position={[x,.028,-.8]}><boxGeometry args={[.018,.02,4.2]}/><meshBasicMaterial color={alert?'#ff4d60':'#187c86'} toneMapped={false}/></mesh>)}
    {/* Structural columns, overhead piping and elongated light fixtures. */}
    {[-5.6,5.6].map(x=><group key={x}>
      <mesh position={[x,3.15,-4.3]}><boxGeometry args={[.35,6.1,.4]}/><meshStandardMaterial color="#192e3b" metalness={.78} roughness={.35}/></mesh>
      <mesh position={[x,3.15,-4.04]}><boxGeometry args={[.048,5.8,.035]}/><meshBasicMaterial color={alert?'#a52b43':'#177985'}/></mesh>
    </group>)}
    {[-3.7,-1.25,1.25,3.7].map(x=><group key={x}>
      <mesh position={[x,6.02,-1]}><boxGeometry args={[.13,.1,11.4]}/><meshStandardMaterial color="#253847" metalness={.8}/></mesh>
      <mesh position={[x,5.93,-1.5]}><boxGeometry args={[.10,.027,3.4]}/><meshBasicMaterial color={alert?'#fa5366':'#56b9bc'} toneMapped={false}/></mesh>
    </group>)}
    {/* Keyboard, desk accessories, mouse, cable harnesses. */}
    <mesh position={[0,.935,-.86]} rotation={[-.13,0,0]}><boxGeometry args={[1.25,.055,.35]}/><meshStandardMaterial color="#0a151d" roughness={.5} metalness={.45}/></mesh>
    {Array.from({length:14},(_,i)=><mesh key={i} position={[-.54+i*.083,.969,-.82]}>
      <boxGeometry args={[.056,.012,.15]}/><meshBasicMaterial color={i%3===0?'#58c8c4':'#193f46'}/>
    </mesh>)}
    <mesh position={[1.16,.945,-.78]}><sphereGeometry args={[.09,8,7]}/><meshStandardMaterial color="#111e28" metalness={.65}/></mesh>
    {cable.map((path,i)=><mesh key={i}><tubeGeometry args={[path,28,.018,5,false]}/><meshStandardMaterial color="#173846" roughness={.75}/></mesh>)}
    {/* Suspended back wall camera-like surveillance consoles. */}
    {[-3.5,3.5].map(x=><group key={x} position={[x,3.85,-5.63]}>
      <mesh><boxGeometry args={[1.15,.68,.16]}/><meshStandardMaterial color="#101e2b" metalness={.75}/></mesh>
      <mesh position={[0,0,.086]}><planeGeometry args={[1.02,.54]}/><meshBasicMaterial color={alert?'#7d2031':'#104b5a'}/></mesh>
      {Array.from({length:6},(_,i)=><mesh key={i} position={[-.41, .17-i*.071,.092]}><planeGeometry args={[.28+i*.055,.007]}/><meshBasicMaterial color={alert?'#ff6670':'#45d3d0'}/></mesh>)}
    </group>)}
    {/* Side warning beacons and floor pathway pins. */}
    {[-4.3,4.3].map(x=><group key={x}>
      <mesh position={[x,1.72,-3.8]}><cylinderGeometry args={[.11,.11,.16,12]}/><meshBasicMaterial color={alert?'#ff4f68':'#1b8995'}/></mesh>
      {[-2.5,-1.2,.1,1.4,2.7].map(z=><mesh key={z} position={[x*.68,.015,z]}><boxGeometry args={[.07,.013,.18]}/><meshBasicMaterial color={alert?'#ca3348':'#23717d'}/></mesh>)}
    </group>)}
  </group>;
}

/** Key/fill/rim lights deliberately pulse in response to the story state. */
export function ReactiveLighting({stage, reduced, theme}:{stage:Stage; reduced:boolean; theme:VisualTheme}){
  const palette=THEME_COLORS[theme];
  const spot=useRef<THREE.SpotLight>(null);
  const left=useRef<THREE.PointLight>(null);
  const right=useRef<THREE.PointLight>(null);
  const consoleLight=useRef<THREE.PointLight>(null);
  useFrame(({clock})=>{
    const t=clock.elapsedTime;
    const breach=stage==='breach';
    const active=stage==='recon';
    const pulse=reduced?0:Math.sin(t*(breach?15:active?3.2:.7));
    if(spot.current)spot.current.intensity=breach?12+5*pulse:10+(active?2.8:1.0)*pulse;
    if(left.current)left.current.intensity=breach?10+3*Math.abs(pulse):4.8+.4*pulse;
    if(right.current)right.current.intensity=stage==='profile'||stage==='carousel'?7.5:3.9;
    if(consoleLight.current)consoleLight.current.intensity=breach?7.5:4.1+(active?1.3:0.25)*pulse;
  });
  const breach=stage==='breach';
  return <>
    <spotLight ref={spot} position={[0,6,1]} color={breach?'#ff5268':palette.spot} intensity={10} angle={.56} penumbra={.85} distance={16} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512}/>
    <pointLight ref={left} position={[-5,3.1,.6]} color={breach?'#fb355a':palette.left} intensity={5} distance={10}/>
    <pointLight ref={right} position={[5,2.8,1.2]} color={palette.right} intensity={4} distance={9}/>
    <pointLight ref={consoleLight} position={[0,2.6,-1.4]} color={breach?'#f9435b':palette.console} intensity={4} distance={5}/>
  </>;
}

/** The identity lifts out of the physical monitor before its dossier is revealed. */
export function PortraitProjection({stage}:{stage:Stage}){
  const {camera,size}=useThree();
  const screen=useMemo(()=>new THREE.Vector3(),[]);
  const image=useTexture(identity.portrait);
  const reduced=useMission(s=>s.motionReduced);
  const group=useRef<THREE.Group>(null);
  const photo=useRef<THREE.MeshBasicMaterial>(null);
  const wire=useRef<THREE.MeshBasicMaterial>(null);
  const scan=useRef<THREE.Mesh>(null);
  const entered=useRef(performance.now()),previous=useRef(stage);
  useFrame(()=>{
    if(previous.current!==stage){previous.current=stage;entered.current=performance.now();}
    const elapsed=(performance.now()-entered.current)/1000;
    const rise=reduced?1:THREE.MathUtils.smoothstep(elapsed,.35,2.25);
    const reveal=reduced?1:THREE.MathUtils.smoothstep(elapsed,1.15,2.65);
    if(group.current){
      group.current.visible=stage==='profile';
      group.current.position.set(0,THREE.MathUtils.lerp(1.68,2.95,rise),THREE.MathUtils.lerp(-1.6,-.8,rise));
      group.current.scale.setScalar(.35+rise*.65);
    }
    if(photo.current)photo.current.opacity=reveal;
    if(wire.current)wire.current.opacity=(1-reveal)*.55;
    if(scan.current){scan.current.position.y=.7-reveal*1.4;scan.current.visible=!reduced&&reveal<1;}
    if(stage==='profile'&&group.current){
      const scale=.35+rise*.65;
      screen.set(-.6*scale,group.current.position.y+.76*scale,group.current.position.z).project(camera);
      identityProjection.left=(screen.x+1)*size.width/2;identityProjection.top=(1-screen.y)*size.height/2;
      screen.set(.6*scale,group.current.position.y+.76*scale,group.current.position.z).project(camera);
      identityProjection.width=(screen.x+1)*size.width/2-identityProjection.left;
      identityProjection.ready=size.width>=1000;
    }else if(stage!=='carousel'){identityProjection.ready=false;}
  });
  return <group ref={group} visible={false}>
    <mesh position={[0,0,-.025]}><boxGeometry args={[1.18,1.5,.018]}/><meshBasicMaterial color="#0b2632" transparent opacity={.68}/></mesh>
    <mesh><planeGeometry args={[1.10,1.44]}/><meshBasicMaterial ref={photo} map={image} transparent opacity={0} toneMapped={false}/></mesh>
    <mesh position={[0,.08,.02]} scale={[.4,.59,.12]}><sphereGeometry args={[1,16,12]}/><meshBasicMaterial ref={wire} color="#78ddd3" wireframe transparent opacity={.55}/></mesh>
    <mesh ref={scan} position={[0,.7,.03]}><boxGeometry args={[1.12,.012,.008]}/><meshBasicMaterial color="#b5eee4" toneMapped={false}/></mesh>
    {[-.6,.6].map(x=><mesh key={x} position={[x,0,.015]}><boxGeometry args={[.012,1.53,.014]}/><meshBasicMaterial color="#84c9ca"/></mesh>)}
    {[-.76,.76].map(y=><mesh key={y} position={[0,y,.015]}><boxGeometry args={[1.21,.012,.014]}/><meshBasicMaterial color="#84c9ca"/></mesh>)}
  </group>;
}
