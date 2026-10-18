import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Stage } from '../store';
import { THEME_COLORS, type VisualTheme } from '../data/themes';
import { DynamicMonitor } from './SceneEnhancements';

type Box = { p: [number, number, number]; s: [number, number, number] };
/** Repeated solid parts share a geometry, material and draw call. */
function Parts({ boxes, color, metalness = .45, roughness = .6 }: { boxes: Box[]; color: string; metalness?: number; roughness?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const object = new THREE.Object3D();
    boxes.forEach(({ p, s }, i) => { object.position.set(...p); object.scale.set(...s); object.updateMatrix(); mesh.current!.setMatrixAt(i, object.matrix); });
    mesh.current!.instanceMatrix.needsUpdate = true;
    mesh.current!.computeBoundingSphere();
  }, [boxes]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, boxes.length]} castShadow receiveShadow>
    <boxGeometry/><meshStandardMaterial color={color} metalness={metalness} roughness={roughness}/>
  </instancedMesh>;
}

function Rack({ x, z, stage, reduced }: { x: number; z: number; stage: Stage; reduced: boolean }) {
  const lamps = useRef<THREE.InstancedMesh>(null);
  const parts = useMemo<Box[]>(() => Array.from({ length: 10 }, (_, i) => ({ p: [0, .34 + i * .25, .15], s: [.96, .205, .72] })), []);
  const handles = useMemo<Box[]>(() => Array.from({ length: 10 }, (_, i) => [-.39, .39].map(dx => ({ p: [dx, .34 + i * .25, .55] as Box['p'], s: [.028, .115, .06] as Box['s'] }))).flat(), []);
  const vents = useMemo<Box[]>(() => Array.from({ length: 10 }, (_, i) => Array.from({ length: 9 }, (_, j) => ({ p: [-.27 + j * .06, .34 + i * .25, .516] as Box['p'], s: [.018, .105, .01] as Box['s'] }))).flat(), []);
  const last = useRef(-1);
  const tint = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    const object = new THREE.Object3D();
    for (let i = 0; i < 20; i++) { object.position.set(.31 + (i % 2) * .05, .34 + Math.floor(i / 2) * .25, .521); object.scale.set(.019, .024, .012); object.updateMatrix(); lamps.current!.setMatrixAt(i, object.matrix); lamps.current!.setColorAt(i, tint.set('#6ac6b5')); }
    lamps.current!.instanceMatrix.needsUpdate = true;
    lamps.current!.computeBoundingSphere();
  }, [tint]);
  useFrame(({ clock }) => {
    const tick = reduced ? 0 : Math.floor(clock.elapsedTime * 3);
    if (tick === last.current) return;
    last.current = tick;
    for (let i = 0; i < 20; i++) lamps.current!.setColorAt(i, tint.set(stage === 'breach' ? '#e96558' : (i + tick) % 7 === 0 ? '#cf9b5d' : (i + tick) % 3 ? '#33534f' : '#87d5c4'));
    if (lamps.current!.instanceColor) lamps.current!.instanceColor.needsUpdate = true;
  });
  return <group position={[x, 0, z]}>
    <RoundedBox args={[1.16, 3.12, .93]} radius={.045} position={[0, 1.58, 0]} castShadow receiveShadow><meshStandardMaterial color="#202b36" metalness={.6} roughness={.48}/></RoundedBox>
    <Parts boxes={parts} color="#3b4651"/><Parts boxes={handles} color="#637079"/><Parts boxes={vents} color="#080f18" metalness={.05}/>
    <instancedMesh ref={lamps} args={[undefined, undefined, 20]}><boxGeometry/><meshBasicMaterial toneMapped={false}/></instancedMesh>
    <mesh position={[0, .08, 0]} receiveShadow><boxGeometry args={[1.24, .12, 1.04]}/><meshStandardMaterial color="#161d26"/></mesh>
  </group>;
}

function Monitor({ x, yaw, stage }: { x: number; yaw: number; stage: Stage }) {
  return <group position={[x, 1.68, -1.68]} rotation={[0, yaw, 0]}>
    <RoundedBox args={[1.27, .78, .085]} radius={.025} castShadow><meshStandardMaterial color="#242f3a" metalness={.35} roughness={.4}/></RoundedBox>
    <group scale={[1, .86, 1]}><DynamicMonitor stage={stage} width={1.27} channel={x < 0 ? 0 : x > 0 ? 2 : 1}/></group>
    <mesh position={[0, -.405, .035]}><boxGeometry args={[.15, .014, .008]}/><meshStandardMaterial color="#85939a"/></mesh>
    <mesh position={[.52, -.37, .05]}><sphereGeometry args={[.009, 6, 6]}/><meshBasicMaterial color="#7ed9c9"/></mesh>
    <mesh position={[0, -.48, -.12]} castShadow><cylinderGeometry args={[.035, .035, .45, 10]}/><meshStandardMaterial color="#717980" metalness={.8} roughness={.3}/></mesh>
    <mesh position={[0, -.71, -.13]} castShadow><boxGeometry args={[.38, .025, .24]}/><meshStandardMaterial color="#3b4650" metalness={.7} roughness={.4}/></mesh>
  </group>;
}

export function Facility({ stage, theme, reduced }: { stage: Stage; theme: VisualTheme; reduced: boolean }) {
  const palette = THEME_COLORS[theme];
  const keys = useMemo<Box[]>(() => Array.from({ length: 5 }, (_, r) => Array.from({ length: 14 }, (_, c) => ({ p: [-.48 + c * .074, 1.029, -1.1 + r * .054] as Box['p'], s: [.062, .027, .041] as Box['s'] }))).flat(), []);
  const seams = useMemo<Box[]>(() => [
    ...Array.from({ length: 11 }, (_, i) => ({ p: [-7.5 + i * 1.5, .006, 0] as Box['p'], s: [.012, .005, 14] as Box['s'] })),
    ...Array.from({ length: 10 }, (_, i) => ({ p: [0, .006, -6.5 + i * 1.5] as Box['p'], s: [16, .005, .012] as Box['s'] })),
  ], []);
  const panels = useMemo<Box[]>(() => Array.from({ length: 9 }, (_, i) => ({ p: [-6.8 + i * 1.7, 2.65, -5.8], s: [1.65, 5.2, .17] })), []);
  const ribs = useMemo<Box[]>(() => [-5.4, -1.8, 1.8, 5.4].flatMap(x => [
    { p: [x, 2.9, -5.55] as Box['p'], s: [.16, 5.8, .22] as Box['s'] },
    { p: [x, 5.77, -.6] as Box['p'], s: [.16, .22, 10] as Box['s'] },
  ]), []);
  const cable = useMemo(() => [-1.3, 0, 1.3].map(x => new THREE.CatmullRomCurve3([new THREE.Vector3(x, 1.5, -1.83), new THREE.Vector3(x + .15, 1.08, -1.9), new THREE.Vector3(x, .79, -1.95), new THREE.Vector3(x * .4, .68, -1.8)])), []);
  const floor = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    let seed = 1707;
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) { seed = (seed * 16807) % 2147483647; const n = 95 + seed % 45; ctx.fillStyle = `rgb(${n},${n},${n})`; ctx.fillRect(x, y, 1, 1); }
    const texture = new THREE.CanvasTexture(canvas); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(12, 12); return texture;
  }, []);
  useEffect(() => () => floor.dispose(), [floor]);
  return <group name="physical-facility">
    {/* The reverse angle needs a real rear wall, service windows and grounded storage. */}
    <mesh position={[0,2.8,9.5]} receiveShadow><boxGeometry args={[16,5.6,.2]}/><meshStandardMaterial color="#323b43" roughness={.9}/></mesh>
    {[-4.8,-2.4,0,2.4,4.8].map(x=><group key={x} position={[x,2.85,9.35]}>
      <mesh><boxGeometry args={[2.2,2.65,.12]}/><meshStandardMaterial color="#101a21" metalness={.5} roughness={.4}/></mesh>
      <mesh position={[0,0,-.075]}><boxGeometry args={[2.02,2.45,.025]}/><meshStandardMaterial color="#455862" metalness={.45} roughness={.3}/></mesh>
      {[-.75,0,.75].map(y=><mesh key={y} position={[0,y,-.1]}><boxGeometry args={[2.03,.035,.04]}/><meshStandardMaterial color="#1b2830"/></mesh>)}
    </group>)}
    {[-3.5,3.5].map(x=><group key={x} position={[x,.65,8.7]}>
      <RoundedBox args={[1.55,1.25,.8]} radius={.035} castShadow receiveShadow><meshStandardMaterial color="#35414b" metalness={.4} roughness={.65}/></RoundedBox>
      {[.1,.48,.86].map(y=><group key={y} position={[0,y-.5,-.415]}><mesh><boxGeometry args={[1.44,.34,.025]}/><meshStandardMaterial color="#4c5861" roughness={.7}/></mesh><mesh position={[0,.06,-.03]}><boxGeometry args={[.35,.025,.04]}/><meshStandardMaterial color="#171f27"/></mesh></group>)}
    </group>)}
    <mesh position={[0, -.08, 0]} receiveShadow><boxGeometry args={[16, .15, 22]}/><meshStandardMaterial color="#343a47" roughnessMap={floor} roughness={.95} metalness={.18} bumpMap={floor} bumpScale={.012}/></mesh>
    <Parts boxes={seams} color="#101823" metalness={.2}/>
    <Parts boxes={panels} color="#29313e" metalness={.25} roughness={.75}/>
    <Parts boxes={ribs} color="#4d5663" metalness={.65} roughness={.4}/>
    {[-7.8, 7.8].map(x => <mesh key={x} position={[x, 2.8, 2]} receiveShadow><boxGeometry args={[.2, 5.6, 22]}/><meshStandardMaterial color="#27313e" roughness={.8}/></mesh>)}
    <mesh position={[0, 5.95, 2]}><boxGeometry args={[16, .2, 22]}/><meshStandardMaterial color="#181f2b" roughness={.85}/></mesh>
    {/* Practical lights have visible housings; the key light is motivated by these fixtures. */}
    {[-3.4, 3.4].map(x => <group key={x} position={[x, 5.6, -1.5]}>
      <mesh castShadow><boxGeometry args={[.7, .18, 4]}/><meshStandardMaterial color="#515d67" metalness={.7} roughness={.4}/></mesh>
      <mesh position={[0, -.098, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.54, 3.7]}/><meshBasicMaterial color={stage === 'breach' ? '#c36b69' : '#d2dedc'}/></mesh>
    </group>)}
    {[-4.8, -3.4, 3.4, 4.8].map(x => <Rack key={x} x={x} z={-4.4} stage={stage} reduced={reduced}/>)}
    <group position={[0, 2.4, -5.58]}>
      <mesh><boxGeometry args={[2.8, 3.9, .12]}/><meshStandardMaterial color="#15202b" roughness={.65}/></mesh>
      {[-.72, .72].map(x => <mesh key={x} position={[x, 0, .09]}><boxGeometry args={[1.39, 3.72, .08]}/><meshStandardMaterial color="#3e4854" metalness={.4} roughness={.55}/></mesh>)}
      <mesh position={[0, 1.96, .1]}><boxGeometry args={[2.8, .05, .07]}/><meshBasicMaterial color={palette.warm}/></mesh>
    </group>
    {/* Rounded, layered desk slab, edge band, real legs and a cable trough. */}
    <RoundedBox args={[4.5, .12, 1.4]} radius={.06} position={[0, .91, -1.3]} castShadow receiveShadow><meshStandardMaterial color="#53606a" roughness={.54} metalness={.3}/></RoundedBox>
    <RoundedBox args={[4.48, .055, 1.38]} radius={.025} position={[0, .98, -1.3]} receiveShadow><meshStandardMaterial color="#252e39" roughness={.76} metalness={.1}/></RoundedBox>
    {[-1.9, 1.9].map(x => <group key={x}>
      <mesh position={[x, .44, -1.4]} castShadow><boxGeometry args={[.13, .88, .85]}/><meshStandardMaterial color="#52616b" metalness={.65} roughness={.45}/></mesh>
      <mesh position={[x, .06, -1.32]} receiveShadow><boxGeometry args={[.35, .09, 1.14]}/><meshStandardMaterial color="#141d27"/></mesh>
    </group>)}
    <mesh position={[0, .72, -1.8]} castShadow><boxGeometry args={[3.8, .12, .22]}/><meshStandardMaterial color="#161e28"/></mesh>
    {cable.map((curve, i) => <mesh key={i}><tubeGeometry args={[curve, 16, .017, 6, false]}/><meshStandardMaterial color="#080d16" roughness={.85}/></mesh>)}
    <Monitor x={-1.3} yaw={.2} stage={stage}/><Monitor x={0} yaw={0} stage={stage}/><Monitor x={1.3} yaw={-.2} stage={stage}/>
    <RoundedBox args={[1.16, .035, .36]} radius={.02} position={[0, .995, -.99]}><meshStandardMaterial color="#0b141e" roughness={.7}/></RoundedBox>
    <Parts boxes={keys} color="#727c80" metalness={.1} roughness={.7}/>
    <mesh position={[.02, 1.017, -.82]}><boxGeometry args={[.4, .016, .037]}/><meshStandardMaterial color="#8b9494"/></mesh>
    <mesh position={[.86, 1.014, -.97]}><boxGeometry args={[.49, .008, .42]}/><meshStandardMaterial color="#101a23" roughness={1}/></mesh>
    <mesh position={[.85, 1.049, -.97]} scale={[.075, .039, .12]} castShadow><sphereGeometry args={[1, 16, 10]}/><meshStandardMaterial color="#687580" roughness={.6}/></mesh>
    {/* Small occupied-space details: insulated cup and a closed notebook. */}
    <mesh position={[-1.82, 1.13, -1.02]} castShadow><cylinderGeometry args={[.075, .065, .24, 20]}/><meshStandardMaterial color="#928578" roughness={.75}/></mesh>
    <mesh position={[-1.82, 1.255, -1.02]}><cylinderGeometry args={[.08, .08, .022, 20]}/><meshStandardMaterial color="#202a34"/></mesh>
    <mesh position={[1.72, 1.03, -.96]} rotation={[0, -.17, 0]} castShadow><boxGeometry args={[.35, .04, .47]}/><meshStandardMaterial color="#77634d" roughness={.95}/></mesh>
    {/* Projector physically clamped to the centre display, not suspended in air. */}
    <mesh position={[0, 2.13, -1.71]}><boxGeometry args={[.28, .12, .17]}/><meshStandardMaterial color="#4c5a66" metalness={.7} roughness={.4}/></mesh>
    <mesh position={[0, 2.2, -1.68]}><cylinderGeometry args={[.085, .1, .04, 20]}/><meshBasicMaterial color={palette.console}/></mesh>
    <Chair/>
    <group position={[2.12,1.02,-1.45]}>
      <mesh castShadow><cylinderGeometry args={[.12,.14,.035,20]}/><meshStandardMaterial color="#667078" metalness={.7} roughness={.35}/></mesh>
      <mesh position={[0,.33,0]} rotation={[0,0,-.16]} castShadow><cylinderGeometry args={[.018,.018,.65,10]}/><meshStandardMaterial color="#84918c" metalness={.8} roughness={.3}/></mesh>
      <mesh position={[-.1,.65,.03]} rotation={[0,0,.25]} castShadow><cylinderGeometry args={[.07,.17,.14,20]}/><meshStandardMaterial color="#5e6b67" metalness={.6} roughness={.45}/></mesh>
      <pointLight position={[-.1,.55,.03]} color="#ffe1b3" intensity={1.8} distance={2.8} decay={2}/>
    </group>
  </group>;
}

function Chair() {
  return <group position={[0, 0, -.14]}>
    <mesh position={[0, .35, 0]} castShadow><cylinderGeometry args={[.055, .075, .55, 12]}/><meshStandardMaterial color="#72808b" metalness={.85} roughness={.3}/></mesh>
    {[0, 1, 2, 3, 4].map(i => <group key={i} rotation={[0, i * Math.PI * 2 / 5, 0]}>
      <mesh position={[0, .12, .23]} castShadow><boxGeometry args={[.065, .07, .5]}/><meshStandardMaterial color="#4d5966" metalness={.65}/></mesh>
      <mesh position={[0, .07, .46]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.065, .065, .1, 10]}/><meshStandardMaterial color="#0b141f" roughness={.95}/></mesh>
    </group>)}
    <RoundedBox args={[.94, .16, .78]} radius={.07} position={[0, .67, -.03]} castShadow><meshStandardMaterial color="#293340" roughness={.95}/></RoundedBox>
    <RoundedBox args={[.83, .9, .16]} radius={.075} position={[0, 1.18, .37]} rotation={[.12, 0, 0]} castShadow><meshStandardMaterial color="#303c4c" roughness={.85}/></RoundedBox>
    {[-.5, .5].map(x => <group key={x}>
      <mesh position={[x, .88, .03]}><boxGeometry args={[.045, .42, .055]}/><meshStandardMaterial color="#68747d" metalness={.65}/></mesh>
      <RoundedBox args={[.12, .065, .48]} radius={.025} position={[x, 1.07, -.05]}><meshStandardMaterial color="#202e3b" roughness={.85}/></RoundedBox>
    </group>)}
  </group>;
}



