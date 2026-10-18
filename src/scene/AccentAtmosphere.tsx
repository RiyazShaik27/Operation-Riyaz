import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { Stage } from '../store';
import { THEME_COLORS, type VisualTheme } from '../data/themes';

/** Low-poly practical fixtures with complementary colored light.
 * The actual geometry and light sources exist inside the WebGL lab; CSS
 * only adds a very faint atmospheric grade on top of the scene. */
export function AccentAtmosphere({theme,stage,reduced}:{theme:VisualTheme;stage:Stage;reduced:boolean}) {
  const color=THEME_COLORS[theme];
  const left=useRef<THREE.PointLight>(null);
  const right=useRef<THREE.PointLight>(null);
  const isBreach=stage==='breach';
  useFrame(({clock})=>{
    if(reduced)return;
    const pulse=Math.sin(clock.elapsedTime*.65);
    if(left.current)left.current.intensity=isBreach?0:theme==='original'?0.4:2.7+0.35*pulse;
    if(right.current)right.current.intensity=isBreach?0:theme==='original'?0.35:2.0+.27*pulse;
  });
  return <group>
    <pointLight ref={left} position={[-4.5,4.25,-2.8]} color={color.rim} intensity={theme==='original'?.4:2.7} distance={13} decay={2}/>
    <pointLight ref={right} position={[4.9,2.65,-1]} color={color.warm} intensity={theme==='original'?.35:2} distance={12} decay={2}/>
    {[-5.9,5.9].map((x,i)=><group key={x} position={[x,0,-5.72]}>
      <mesh position={[0,3.1,0]}><boxGeometry args={[.048,3.6,.075]}/>
        <meshBasicMaterial color={isBreach?'#ff516d':i===0?color.rim:color.warm} transparent opacity={theme==='original'?.20:.8} toneMapped={false}/></mesh>
      <mesh position={[0,4.97,.02]}><boxGeometry args={[1.72,.025,.06]}/>
        <meshBasicMaterial color={isBreach?'#ff516d':i===0?color.rim:color.warm} transparent opacity={theme==='original'?.20:.7} toneMapped={false}/></mesh>
    </group>)}
    {[-2.85,2.85].map((x,i)=><mesh key={x} position={[x,.013,1.9]}>
      <boxGeometry args={[.04,.014,6.5]}/>
      <meshBasicMaterial color={isBreach?'#ff516d':i===0?color.rim:color.warm} transparent opacity={theme==='original'?.16:.52} toneMapped={false}/>
    </mesh>)}
    <mesh position={[0,4.5,-5.75]}>
      <boxGeometry args={[2.8,.025,.05]}/>
      <meshBasicMaterial color={isBreach?'#ff516d':color.rim} transparent opacity={theme==='original'?.16:.65} toneMapped={false}/>
    </mesh>
  </group>;
}
