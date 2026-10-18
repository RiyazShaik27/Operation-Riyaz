import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Stage } from '../store';

/** A restrained four-corner frustum physically links the mounted projector
 * to the emerging portrait. No independent particle cloud or rotating rings. */
export function SignalBridge({ stage, reduced }: { stage: Stage; reduced: boolean }) {
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const entered = useRef(performance.now()), prior = useRef(stage);
  const geometry = useMemo(() => {
    const source = [0, 2.2, -1.68], corners = [[-.57, 2.23, -.8], [.57, 2.23, -.8], [.57, 3.67, -.8], [-.57, 3.67, -.8]];
    const vertices: number[] = [];
    for (let i = 0; i < 4; i++) vertices.push(...source, ...corners[i], ...corners[(i + 1) % 4]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); return g;
  }, []);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  useFrame(() => {
    if (prior.current !== stage) { prior.current = stage; entered.current = performance.now(); }
    const elapsed = (performance.now() - entered.current) / 1000;
    if (group.current) group.current.visible = stage === 'profile' || stage === 'carousel';
    if (material.current) material.current.opacity = reduced ? .025 : stage === 'profile' ? .07 * THREE.MathUtils.smoothstep(elapsed, .4, 1.5) : .028;
  });
  return <group ref={group} visible={false}><mesh geometry={geometry}><meshBasicMaterial ref={material} color="#79cdc8" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide}/></mesh></group>;
}

