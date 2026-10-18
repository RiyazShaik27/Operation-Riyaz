import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Stage } from '../store';

const cyan = '#5dece2';

/** Browser-friendly set dressing made from real meshes rather than a CSS background.
 * The geometric set is authored locally; no remote model downloads are needed. */
export function CinematicSet({ stage }: {stage:Stage}) {
  const isAlert = stage === 'breach';
  return <group>
    {/* Recessed ceiling sections, vents, and hanging light diffusers. */}
    {[-5.2,-2.6,0,2.6,5.2].map(x=><group key={x}>
      <mesh position={[x,6.08,-.8]}><boxGeometry args={[.8,.075,11.5]}/><meshStandardMaterial color="#07131b" metalness={.82} roughness={.35}/></mesh>
      {[-4,-1.5,1,3.5].map(z=><group key={z} position={[x,5.99,z]}>
        <mesh><boxGeometry args={[.52,.042,.94]}/><meshStandardMaterial color="#152f3b" metalness={.81} roughness={.33}/></mesh>
        {[-.17,0,.17].map(dx=><mesh key={dx} position={[dx,-.028,0]}><boxGeometry args={[.036,.014,.77]}/><meshBasicMaterial color={isAlert?'#ad3648':'#246b78'}/></mesh>)}
      </group>)}
    </group>)}
    {/* Industrial conduits and perimeter illumination. */}
    {[-7.5,7.5].map(x=><group key={x}>
      {[2.55,3.12,4.17].map(y=><mesh key={y} position={[x,y,-.4]}><cylinderGeometry args={[.05,.05,11.4,10]}/><meshStandardMaterial color="#213949" metalness={.94} roughness={.3}/></mesh>)}
      <mesh position={[x,1.53,-4.92]}><boxGeometry args={[.12,3.04,.09]}/><meshBasicMaterial color={isAlert?'#c83c50':'#135866'}/></mesh>
    </group>)}
    {/* Operator chair: shaped pedestal, backrest, cushions and articulated armrests. */}
    <group position={[0,0,.68]}>
      <mesh position={[0,.28,0]} castShadow><cylinderGeometry args={[.08,.18,.55,12]}/><meshStandardMaterial color="#0d1a24" metalness={.9}/></mesh>
      {[0,Math.PI/2,Math.PI/4,-Math.PI/4].map(a=><mesh key={a} rotation={[0,a,0]} position={[0,.07,0]} castShadow><boxGeometry args={[1.25,.07,.09]}/><meshStandardMaterial color="#0d1a24" metalness={.8}/></mesh>)}
      <mesh position={[0,.62,0]} castShadow><boxGeometry args={[1.17,.19,.9]}/><meshStandardMaterial color="#0a1219" roughness={.94}/></mesh>
      <mesh position={[0,1.23,.47]} rotation={[.10,0,0]} castShadow><boxGeometry args={[1.04,1.16,.19]}/><meshStandardMaterial color="#111c25" roughness={.92}/></mesh>
      {[ -.58,.58 ].map(x=><group key={x}>
        <mesh position={[x,1.03,-.05]} castShadow><boxGeometry args={[.14,.10,.82]}/><meshStandardMaterial color="#202d36" metalness={.35} roughness={.6}/></mesh>
        <mesh position={[x,.81,.15]}><boxGeometry args={[.075,.43,.075]}/><meshStandardMaterial color="#0d1c26" metalness={.8}/></mesh>
      </group>)}
    </group>
    {/* Monitor support arms, utility shelves, illuminated keyboard and desk clutter. */}
    {[-1.42,0,1.42].map((x,i)=><group key={x} position={[x,0,-1.9]}>
      <mesh position={[0,1.5,-.1]}><cylinderGeometry args={[.045,.045,.95,10]}/><meshStandardMaterial color="#263c49" metalness={.92} roughness={.28}/></mesh>
      <mesh position={[0,1.56,-.08]} rotation={[0,0,(i-1)*.24]}><boxGeometry args={[.7,.065,.12]}/><meshStandardMaterial color="#1a2c38" metalness={.93} roughness={.27}/></mesh>
    </group>)}
    <group position={[0,.978,-.90]} rotation={[-.07,0,0]}>
      {Array.from({length:5},(_,r)=>Array.from({length:15},(_,c)=><mesh key={`${r}-${c}`} position={[-.60+c*.087,.002, -.14+r*.071]}>
        <boxGeometry args={[.068,.015,.051]}/><meshStandardMaterial color={(r*13+c)%8===0?'#297d81':'#162a32'} emissive={cyan} emissiveIntensity={(r+c)%8===0?.4:.015} roughness={.65}/>
      </mesh>))}
    </group>
    <mesh position={[1.52,.92,-1.06]}><cylinderGeometry args={[.1,.08,.28,10]}/><meshStandardMaterial color="#253a43" roughness={.48} metalness={.72}/></mesh>
    <mesh position={[1.52,1.09,-1.06]}><cylinderGeometry args={[.09,.09,.02,10]}/><meshBasicMaterial color="#61b4bb"/></mesh>
    <mesh position={[-1.85,1.03,-1.2]} rotation={[.14,.24,-.12]}><boxGeometry args={[.29,.31,.033]}/><meshStandardMaterial color="#0b1e29" metalness={.8}/></mesh>
    {/* Optical sensor heads on walls, with tracking lamps. */}
    {[-5.2,5.2].map(x=><group key={x} position={[x,4.35,-5.57]}>
      <mesh><boxGeometry args={[.83,.21,.38]}/><meshStandardMaterial color="#202d3b" metalness={.92}/></mesh>
      <mesh position={[0,-.19,.20]}><sphereGeometry args={[.15,14,10]}/><meshStandardMaterial color="#07111a" metalness={.6}/></mesh>
      <mesh position={[0,-.19,.34]}><sphereGeometry args={[.055,12,8]}/><meshBasicMaterial color={isAlert?'#fc5364':'#3bd6d0'}/></mesh>
    </group>)}
    {/* Illuminated floor insets add parallax during camera motion. */}
    {[-5.5,-4.5,4.5,5.5].map(x=>[-3.2,-1.2,.8,2.8].map(z=><mesh key={`${x}-${z}`} position={[x,.016,z]}>
      <boxGeometry args={[.025,.008,.61]}/><meshBasicMaterial color={isAlert?'#943447':'#176773'} transparent opacity={.86}/>
    </mesh>))}
    <VentFans/>
  </group>;
}

function VentFans(){
  const rotor=useRef<THREE.Group>(null);
  useFrame((_,delta)=>{if(rotor.current)rotor.current.rotation.z+=delta*.7;});
  const shape=useMemo(()=>new THREE.BoxGeometry(.09,.78,.05),[]);
  return <group position={[0,5.9,-4]} rotation={[-Math.PI/2,0,0]}>
    <mesh><torusGeometry args={[.53,.045,8,28]}/><meshStandardMaterial color="#263d49" metalness={.8}/></mesh>
    <group ref={rotor}>
      {[0,Math.PI/2,Math.PI,Math.PI*1.5].map(a=><mesh key={a} geometry={shape} rotation={[0,0,a]} position={[Math.sin(a)*.2,Math.cos(a)*.2,0]}>
        <meshStandardMaterial color="#17303d" metalness={.78} side={THREE.DoubleSide}/>
      </mesh>)}
    </group>
  </group>;
}
