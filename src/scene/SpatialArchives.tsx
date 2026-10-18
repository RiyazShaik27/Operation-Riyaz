import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useMission } from '../store';
import { archiveElements, archiveMotion } from './archiveLayout';

/** Project the seven real React buttons from one world-space orbit.
 * The panels stay upright; their depth, scale and screen position follow the camera.
 * Small screens retain the tested compact CSS orbit. */
export function SpatialArchives() {
  const stage = useMission(s => s.stage), reduced = useMission(s => s.motionReduced);
  const { camera, size } = useThree();
  const entered = useRef(0), previous = useRef(stage);
  const world = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const cameraSpace = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const now = performance.now() / 1000;
    if (stage !== previous.current) { previous.current = stage; entered.current = now; }
    if (stage !== 'carousel' || archiveMotion.opening) return;
    const progress = reduced ? 1 : THREE.MathUtils.smoothstep(now - entered.current, .1, 1.8);
    const spatial = size.width >= 1000 && size.height >= 700;
    const fov = (camera as THREE.PerspectiveCamera).fov;
    for (const [i, element] of archiveElements) {
      element.classList.toggle('is-spatial', spatial);
      if (!spatial) continue;
      const angle = (i - archiveMotion.position) * Math.PI * 2 / 7;
      const x = Math.sin(angle) * 2.65, y = 2.65 + (1 - Math.cos(angle)) * .27, z = -.25 + (Math.cos(angle) - 1) * 1.25;
      world.set(x * progress, THREE.MathUtils.lerp(2.2, y, progress), THREE.MathUtils.lerp(-1.68, z, progress));
      cameraSpace.copy(world).applyMatrix4(camera.matrixWorldInverse);
      projected.copy(world).project(camera);
      const px = projected.x * size.width / 2, py = -projected.y * size.height / 2;
      const width = 1.19 * size.height / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * Math.max(.1, -cameraSpace.z));
      element.style.setProperty('--project-x', px.toFixed(2) + 'px');
      element.style.setProperty('--project-y', py.toFixed(2) + 'px');
      element.style.setProperty('--project-scale', String(width / Math.max(element.offsetWidth, 1) * (.25 + progress * .75)));
      element.style.setProperty('--project-yaw', (-Math.sin(angle) * 18).toFixed(2) + 'deg');
    }
  });
  return null;
}

