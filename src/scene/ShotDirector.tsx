import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Stage } from '../store';

type Shot = { name: string; position: [number, number, number]; focus: [number, number, number]; fov: number; hold: number; cut?: boolean };
const SHOTS: Record<Stage, Shot[]> = {
  landing: [
    { name: 'LAB ESTABLISHING', position: [5.5, 3.1, 7.8], focus: [-1.6, 1.6, -1.25], fov: 43, hold: 3.2 },
    { name: 'WORKSTATION REVEAL', position: [4.7, 2.9, 6.8], focus: [-1.55, 1.55, -1.2], fov: 43, hold: 60 },
  ],
  mission: [{ name: 'FRONT THREE QUARTER / TRANSMISSION', position: [-2.8, 2.3, -.75], focus: [.45, 1.35, .1], fov: 40, hold: 60, cut: true }],
  recon: [
    { name: 'KEYBOARD INSERT', position: [-1.65, 2.45, -.1], focus: [.18, 1.06, -.9], fov: 43, hold: 2.8, cut: true },
    { name: 'OPERATOR RESPONSE', position: [-1.9, 2.5, -.75], focus: [.18, 1.6, .05], fov: 38, hold: 60, cut: true },
  ],
  breach: [{ name: 'BREACH RECOIL', position: [-3.8, 2.5, 2.9], focus: [1.1, 1.55, -.2], fov: 44, hold: 60, cut: true }],
  profile: [{ name: 'MONITOR TO IDENTITY', position: [.8, 2.8, 6.1], focus: [1.45, 2.4, -.9], fov: 43, hold: 60 }],
  carousel: [{ name: 'ARCHIVE DEPLOYMENT', position: [0, 2.95, 7.5], focus: [0, 2.35, -.8], fov: 44, hold: 60 }],
  document: [{ name: 'DOSSIER', position: [0, 2.95, 7.5], focus: [0, 2.35, -.8], fov: 44, hold: 60 }],
};
export const getShotLabels = (stage: Stage) => SHOTS[stage].map(s => s.name);

/** A monotonic shot clock cannot drift behind the text when rendering slows down.
 * Changes capture the current pose, so skip/replay interrupts without a stale tween. */
export function ShotDirector({ stage, reduced }: { stage: Stage; reduced: boolean }) {
  const { camera, size } = useThree();
  const state = useRef({ stage, started: performance.now(), index: -1, shotStarted: 0, fov: 43 });
  const vectors = useMemo(() => ({ start: camera.position.clone(), aim: new THREE.Vector3(-1.6, 1.6, -1.25), fromAim: new THREE.Vector3(), destination: new THREE.Vector3(), target: new THREE.Vector3() }), [camera]);
  useFrame(() => {
    const now = performance.now(), s = state.current;
    if (s.stage !== stage) { s.stage = stage; s.started = now; s.index = -1; }
    const elapsed = (now - s.started) / 1000;
    const shots = SHOTS[stage];
    let index = 0, offset = elapsed;
    // Reduced motion uses a single, stable composition for the whole stage.
    if (!reduced) while (index < shots.length - 1 && offset > shots[index].hold) { offset -= shots[index].hold; index++; }
    const changed = index !== s.index;
    if (changed) {
      s.index = index; s.shotStarted = now;
      vectors.start.copy(camera.position); vectors.fromAim.copy(vectors.aim); s.fov = (camera as THREE.PerspectiveCamera).fov;
    }
    const shot = shots[index], duration = stage === 'breach' ? .7 : stage === 'carousel' ? 1.8 : stage === 'landing' ? 3.4 : 1.4;
    const u = reduced ? 1 : Math.min(1, (now - s.shotStarted) / (duration * 1000));
    const ease = u * u * u * (u * (u * 6 - 15) + 10);
    vectors.destination.set(...shot.position); vectors.target.set(...shot.focus);
    if (size.width < 1000) {
      if (stage === 'mission' || stage === 'recon') {
        vectors.destination.set(-3.6, 2.5, -.8); vectors.target.set(0, .85, .1);
      } else { vectors.destination.set(3.8, 3.0, 7.6); vectors.target.set(0, 1.9, -1.2); }
    }
    // Cut across the workstation axis instead of interpolating through monitors.
    // A small lens-axis push then gives each composition a clear arrival and hold.
    if (shot.cut && changed) {
      vectors.start.copy(vectors.destination).sub(vectors.target).multiplyScalar(1.09).add(vectors.target);
      vectors.fromAim.copy(vectors.target); s.fov = shot.fov;
    }
    camera.position.copy(vectors.start).lerp(vectors.destination, ease);
    vectors.aim.copy(vectors.fromAim).lerp(vectors.target, ease);
    if (stage === 'breach' && !reduced) {
      const impact = Math.exp(-elapsed * 5);
      camera.position.x += Math.sin(elapsed * 47) * .028 * impact;
      camera.position.y += Math.sin(elapsed * 39) * .017 * impact;
    }
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = THREE.MathUtils.lerp(s.fov, shot.fov, ease); perspective.updateProjectionMatrix();
    camera.lookAt(vectors.aim); camera.updateMatrixWorld();
  }, -1);
  return null;
}

