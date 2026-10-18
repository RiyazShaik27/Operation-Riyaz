import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Stage } from '../store';

const UP = new THREE.Vector3(0, 1, 0);
function useCloth() {
  const texture=useMemo(()=>{
    const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d')!;
    for(let y=0;y<64;y++)for(let x=0;x<64;x++){const v=110+((x*17+y*31)%13)+(x%3===0?18:0)-(y%3===0?12:0);ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(x,y,1,1);}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(12,12);return t;
  },[]);
  useEffect(()=>()=>texture.dispose(),[texture]);return texture;
}
// Tailored cross sections break the primitive silhouette and catch light like cloth.
function Garment({hood=false}:{hood?:boolean}) {
  const cloth=useCloth();
  const geometry=useMemo(()=>{
    const rings=hood
      ? [[-.19,.20,.24,-.015],[-.14,.25,.29,0],[-.02,.265,.30,.015],[.12,.23,.27,.025],[.22,.15,.20,.03],[.265,.006,.012,.03]]
      : [[-.49,.28,.18,0],[-.40,.30,.20,0],[-.16,.27,.20,0],[.06,.33,.205,0],[.25,.385,.20,0],[.35,.29,.16,0],[.40,.15,.12,0]];
    const positions:number[]=[],indices:number[]=[],uv:number[]=[]; const segments=48;
    rings.forEach(([axis,rx,rz,offset],r)=>{
      for(let j=0;j<=segments;j++){
        const a=j/segments*Math.PI*2;
        const fold=1+.023*Math.sin(a*9+r*.8)+.012*Math.cos(a*17-r);
        if(hood)positions.push(Math.cos(a)*rx*fold,Math.sin(a)*rz*fold+offset,axis);
        else positions.push(Math.cos(a)*rx*fold,axis,Math.sin(a)*rz*fold);
        uv.push(j/segments,r/(rings.length-1));
        if(r<rings.length-1&&j<segments){const k=r*(segments+1)+j;indices.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}
      }
    });
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
  },[hood]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={hood?'#30383d':'#30383e'} roughness={.97} bumpMap={cloth} bumpScale={.003} side={THREE.DoubleSide}/></mesh>;
}
/** Two-bone reach keeps wrists on the keyboard while shoulders and elbows move.
 * This remains a procedural silhouette, not a scanned human asset. */
function Arm({ side, stage, reduced }: { side: number; stage: Stage; reduced: boolean }) {
  const cloth=useCloth();
  const upper = useRef<THREE.Mesh>(null), fore = useRef<THREE.Mesh>(null), joint = useRef<THREE.Mesh>(null), shoulderJoint = useRef<THREE.Mesh>(null), hand = useRef<THREE.Group>(null);
  const bones = useMemo(() => ({ shoulder: new THREE.Vector3(), elbow: new THREE.Vector3(), wrist: new THREE.Vector3(side * .24, 1.06, -.94), target: new THREE.Vector3(), direction: new THREE.Vector3(), pole: new THREE.Vector3(), axis: new THREE.Vector3() }), [side]);
  const blend = useRef({ typing: 0, recoil: 0, gesture: 0 });
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, .12), t = clock.elapsedTime;
    const b = blend.current;
    b.typing = THREE.MathUtils.damp(b.typing, stage === 'recon' ? 1 : 0, 5, dt);
    b.recoil = THREE.MathUtils.damp(b.recoil, stage === 'breach' ? 1 : 0, 7, dt);
    b.gesture = THREE.MathUtils.damp(b.gesture, side > 0 && (stage === 'profile' || stage === 'carousel') ? 1 : 0, 3, dt);
    const tap = reduced ? 0 : Math.pow(Math.max(0, Math.sin(t * 13 + side * 1.7)), 6) * .011 * b.typing;
    const { shoulder, elbow, wrist, target, direction, pole, axis } = bones;
    shoulder.set(side * .31, 1.49 - .035 * b.typing, -.30 - .075 * b.typing + .07 * b.recoil);
    target.set(side * (.24 + .28 * b.gesture + .08 * b.recoil), 1.055 + tap + .24 * b.recoil + .39 * b.gesture, -.94 + .17 * b.recoil + .02 * b.gesture);
    wrist.lerp(target, reduced ? 1 : 1 - Math.exp(-9 * dt));
    direction.subVectors(wrist, shoulder);
    const length = THREE.MathUtils.clamp(direction.length(), .15, .81);
    direction.normalize();
    const a = .40, c = .42, along = (a * a - c * c + length * length) / (2 * length);
    pole.set(side, -.2, .65);
    pole.addScaledVector(direction, -pole.dot(direction)).normalize();
    elbow.copy(shoulder).addScaledVector(direction, along).addScaledVector(pole, Math.sqrt(Math.max(0, a * a - along * along)));
    for (const [mesh, from, to] of [[upper.current, shoulder, elbow], [fore.current, elbow, wrist]] as const) {
      if (!mesh) continue;
      mesh.position.copy(from).lerp(to, .5);
      axis.subVectors(to, from); mesh.scale.y = axis.length(); mesh.quaternion.setFromUnitVectors(UP, axis.normalize());
    }
    joint.current?.position.copy(elbow);
    shoulderJoint.current?.position.copy(shoulder);
    if (hand.current) { hand.current.position.copy(wrist); hand.current.rotation.x = -.1 + b.gesture * .8; hand.current.rotation.z = side * b.gesture * -.35; }
  });
  return <group name={side < 0 ? 'left-articulated-arm' : 'right-articulated-arm'}>
    <mesh ref={shoulderJoint} castShadow scale={[1,1.15,1]}><sphereGeometry args={[.135,20,16]}/><meshStandardMaterial color="#30383e" roughness={.96} bumpMap={cloth} bumpScale={.003}/></mesh>
    <mesh ref={upper} castShadow><latheGeometry args={[[new THREE.Vector2(.112,-.5),new THREE.Vector2(.12,-.42),new THREE.Vector2(.115,-.33),new THREE.Vector2(.14,-.17),new THREE.Vector2(.135,.06),new THREE.Vector2(.155,.3),new THREE.Vector2(.13,.5)],20]}/><meshStandardMaterial color="#30383e" roughness={.96} bumpMap={cloth} bumpScale={.003}/></mesh>
    <mesh ref={joint} castShadow><sphereGeometry args={[.116, 20, 16]}/><meshStandardMaterial color="#30383e" roughness={.95} bumpMap={cloth} bumpScale={.003}/></mesh>
    <mesh ref={fore} castShadow><latheGeometry args={[[new THREE.Vector2(.105,-.5),new THREE.Vector2(.115,-.35),new THREE.Vector2(.10,-.17),new THREE.Vector2(.11,-.08),new THREE.Vector2(.095,.15),new THREE.Vector2(.08,.36),new THREE.Vector2(.077,.5)],20]}/><meshStandardMaterial color="#30383e" roughness={.95} bumpMap={cloth} bumpScale={.003}/></mesh>
    <group ref={hand}>
      <mesh scale={[.075, .035, .09]} castShadow><sphereGeometry args={[1, 14, 10]}/><meshStandardMaterial color="#56616b" roughness={.85}/></mesh>
      {[-1.5, -.5, .5, 1.5].map((f, i) => <mesh key={f} position={[f * .032, -.008, -.09 - (i === 1 || i === 2 ? .012 : 0)]} rotation={[-1.42, 0, 0]} castShadow><capsuleGeometry args={[.016, .065, 4, 7]}/><meshStandardMaterial color="#4b5964" roughness={.8}/></mesh>)}
      <mesh position={[-side * .077, -.01, -.027]} rotation={[-.6, 0, side * .55]}><capsuleGeometry args={[.022, .065, 4, 7]}/><meshStandardMaterial color="#4b5964" roughness={.8}/></mesh>
    </group>
  </group>;
}

export function OperatorRig({ stage, reduced }: { stage: Stage; reduced: boolean }) {
  const torso = useRef<THREE.Group>(null), head = useRef<THREE.Group>(null);
  const lean = useRef(0);
  useFrame(({ clock }, delta) => {
    const target = stage === 'recon' ? -.075 : stage === 'breach' ? .07 : 0;
    lean.current = THREE.MathUtils.damp(lean.current, target, 5, Math.min(delta, .12));
    const breath = reduced ? 0 : Math.sin(clock.elapsedTime * 1.35) * .004;
    if (torso.current) { torso.current.position.z = -.08 + lean.current; torso.current.position.y = 1.18 + breath; torso.current.rotation.x = -.13-lean.current * .5; }
    if (head.current) { head.current.position.z = -.16 + lean.current; head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y,stage === 'mission' ? .28 : stage === 'profile' ? -.18 : 0,4,Math.min(delta,.12)); head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x,stage === 'recon' ? -.14 : -.025,4,Math.min(delta,.12)); }
  });
  return <group name="seated-operator">
    <group ref={torso} position={[0, 1.27, .13]}>
      <Garment/>
      <mesh position={[0,-.015,-.206]}><boxGeometry args={[.008,.64,.008]}/><meshStandardMaterial color="#7d8583" metalness={.3} roughness={.65}/></mesh>
      {[-.11,.11].map(x=><group key={x} position={[x,.20,-.20]} rotation={[0,0,x*.6]}><mesh><capsuleGeometry args={[.008,.22,3,6]}/><meshStandardMaterial color="#a2a49b" roughness={1}/></mesh><mesh position={[0,-.12,0]}><cylinderGeometry args={[.01,.01,.035,6]}/><meshStandardMaterial color="#67716f" metalness={.6}/></mesh></group>)}
      {[-.25, .25].map(x => <mesh key={x} position={[x, .22, .18]} rotation={[0, 0, x * .8]}><capsuleGeometry args={[.009, .27, 3, 5]}/><meshStandardMaterial color="#4c5765" roughness={1}/></mesh>)}
    </group>
    <group ref={head} position={[0, 1.82, -.16]} scale={.9}>
      <Garment hood/>
      <mesh position={[0,-.018,-.07]} scale={[.17,.224,.145]} castShadow><sphereGeometry args={[1,28,22]}/><meshStandardMaterial color="#51433b" roughness={.95}/></mesh>
      <mesh position={[0,-.028,-.205]} scale={[.025,.055,.025]} castShadow><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#51433b" roughness={.95}/></mesh>
      {[-.067,.067].map(x=><mesh key={x} position={[x,.025,-.198]} scale={[.039,.008,.004]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color="#252526" roughness={1}/></mesh>)}
      <mesh position={[0,-.115,-.155]} scale={[.153,.095,.08]} castShadow><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color="#1a242c" roughness={1}/></mesh>
    </group>
    <Arm side={-1} stage={stage} reduced={reduced}/><Arm side={1} stage={stage} reduced={reduced}/>
    {[-.23, .23].map(x => <group key={x}>
      <mesh position={[x, .72, -.06]} rotation={[Math.PI / 2, 0, 0]} castShadow><capsuleGeometry args={[.155, .42, 6, 12]}/><meshStandardMaterial color="#1a2635" roughness={.98}/></mesh>
      <mesh position={[x, .4, -.37]} rotation={[-.16, 0, 0]} castShadow><capsuleGeometry args={[.125, .42, 6, 12]}/><meshStandardMaterial color="#202b3b" roughness={.98}/></mesh>
      <mesh position={[x, .12, -.48]} scale={[.14, .09, .25]} castShadow><sphereGeometry args={[1, 14, 10]}/><meshStandardMaterial color="#111a26" roughness={.86}/></mesh>
    </group>)}
  </group>;
}


