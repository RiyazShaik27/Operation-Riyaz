import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Stage } from '../store';
import type { VisualTheme } from '../data/themes';
import { THEME_COLORS } from '../data/themes';

/** Physical props for foreground parallax and film-like layers: control arms,
 * projector housings, glass display covers, animated lens iris and edge lights.
 * Kept low-poly/instanced where possible so ordinary laptops can run the scene. */
export function PhysicalSet({stage,theme,reduced}:{stage:Stage;theme:VisualTheme;reduced:boolean}){
  const palette=THEME_COLORS[theme];
  const iris=useRef<THREE.Group>(null);
  const scanner=useRef<THREE.Group>(null);
  const beam=useRef<THREE.MeshBasicMaterial>(null);
  const rings=useMemo(()=>[-.25,0,.25],[]);
  useFrame(({clock},dt)=>{
    const t=clock.elapsedTime;
    if(iris.current&&!reduced)iris.current.rotation.z+=dt*(stage==='recon'?1.9:.5);
    if(scanner.current&&!reduced)scanner.current.rotation.z=Math.sin(t*.8)*.26;
    if(beam.current)beam.current.opacity=stage==='breach'?.2:stage==='profile'||stage==='carousel'?.13:.045;
  });
  const impact=stage==='breach';
  return <group name="physical-cyberlab-details">
    {/* Left/right secondary equipment clusters flank the silhouette in close-up. */}
    {[-1,1].map(side=><group key={side} position={[side*3.1,.75,-1.65]} rotation={[0,side*.2,0]}>
      <mesh castShadow position={[0,.12,0]}><boxGeometry args={[1.2,.43,.82]}/><meshStandardMaterial color="#172535" metalness={.67} roughness={.28}/></mesh>
      <mesh position={[0,.36,-.04]} rotation={[-.19,0,0]}><boxGeometry args={[1.13,.09,.75]}/><meshStandardMaterial color="#050e18" metalness={.57}/></mesh>
      {Array.from({length:6},(_,i)=><group key={i} position={[-.43+i*.16,.42,-.11]}>
        <mesh><boxGeometry args={[.11,.04,.27]}/><meshStandardMaterial color="#263948" roughness={.6}/></mesh>
        <mesh position={[0,.024,.08]}><boxGeometry args={[.074,.008,.065]}/><meshBasicMaterial color={impact?'#ff527b':i%3===0?palette.warm:palette.console}/></mesh>
      </group>)}
      <mesh position={[0,.64,-.22]}><boxGeometry args={[.8,.14,.3]}/><meshStandardMaterial color="#0d1b2b" metalness={.84}/></mesh>
    </group>)}
    {/* Projector above central monitor, where the 3D files physically originate. */}
    <group position={[0,2.6,-1.88]}>
      <mesh castShadow><cylinderGeometry args={[.31,.39,.2,24]}/><meshStandardMaterial color="#152e40" metalness={.85} roughness={.28}/></mesh>
      <mesh position={[0,.13,0]}><cylinderGeometry args={[.21,.24,.06,32]}/><meshStandardMaterial color="#162838" metalness={.83}/></mesh>
      <group ref={iris} position={[0,.181,0]} rotation={[-Math.PI/2,0,0]}>
        <mesh><torusGeometry args={[.19,.024,7,32]}/><meshBasicMaterial color={impact?'#ff688c':palette.console}/></mesh>
        {Array.from({length:8},(_,i)=><mesh key={i} rotation={[0,0,i*Math.PI/4]} position={[0,.13,0]}>
          <boxGeometry args={[.021,.08,.02]}/><meshBasicMaterial color={palette.rim}/>
        </mesh>)}
      </group>
      <mesh position={[0,.5,0]}><cylinderGeometry args={[.31,.14,.85,22,1,true]}/><meshBasicMaterial ref={beam} color={palette.console} transparent opacity={.04} side={THREE.DoubleSide} depthWrite={false}/></mesh>
    </group>
    {/* Suspended glass data wall creates depth behind holographic objects. */}
    {rings.map((z,i)=><group key={z} position={[0,3.3,-4.4+z]}>
      <mesh rotation={[0,.04*(i-1),0]}><boxGeometry args={[6.1-i*.18,1.64,.025]}/><meshStandardMaterial color="#103044" metalness={.55} roughness={.21} transparent opacity={.11} depthWrite={false}/></mesh>
      <mesh position={[0,-.82,.03]}><boxGeometry args={[6.1-i*.18,.015,.02]}/><meshBasicMaterial color={palette.rim} transparent opacity={.24+i*.1}/></mesh>
    </group>)}
    {/* Instrument panel at the foot of the operator platform. */}
    <group position={[0,.34,1.02]}>
      <mesh castShadow rotation={[-.12,0,0]}><boxGeometry args={[3.18,.57,.49]}/><meshStandardMaterial color="#101a29" metalness={.72} roughness={.3}/></mesh>
      {[-1.24,-.6,0,.6,1.24].map((x,i)=><group key={x} position={[x,.22,-.253]}>
        <mesh><boxGeometry args={[.41,.21,.02]}/><meshBasicMaterial color="#0c3348"/></mesh>
        {Array.from({length:4},(_,j)=><mesh key={j} position={[-.135+j*.084,Math.sin(i+j)*.025,.012]}>
          <boxGeometry args={[.049,.01,.004]}/><meshBasicMaterial color={j%2?palette.warm:palette.console}/>
        </mesh>)}
      </group>)}
      <group ref={scanner} position={[1.4,.31,-.25]}>
        <mesh><torusGeometry args={[.10,.017,7,32]}/><meshBasicMaterial color={palette.console}/></mesh>
        <mesh><boxGeometry args={[.11,.019,.01]}/><meshBasicMaterial color={palette.warm}/></mesh>
      </group>
    </group>
    {/* Beveled pilasters and technical hazard strips enhance close-up parallax. */}
    {[-5.2,5.2].map(x=><group key={x} position={[x,0,-2.6]}>
      <mesh position={[0,2,0]}><boxGeometry args={[.4,4.1,.38]}/><meshStandardMaterial color="#1b2336" metalness={.75} roughness={.38}/></mesh>
      <mesh position={[x<0?.23:-.23,2.1,0]}><boxGeometry args={[.03,3.5,.19]}/><meshBasicMaterial color={palette.rim} transparent opacity={.46}/></mesh>
      {Array.from({length:9},(_,i)=><mesh key={i} position={[0,.34+i*.31,.198]}><boxGeometry args={[.32,.035,.01]}/><meshBasicMaterial color={i%2?palette.console:palette.warm} transparent opacity={.19}/></mesh>)}
    </group>)}
  </group>;
}
