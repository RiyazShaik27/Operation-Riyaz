import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { useMission } from '../store';
import { THEME_COLORS } from '../data/themes';
import { Facility } from './Facility';
import { OperatorRig } from './OperatorRig';
import { ShotDirector } from './ShotDirector';
import { SignalBridge } from './SignalBridge';
import { PortraitProjection } from './SceneEnhancements';
import { SpatialArchives } from './SpatialArchives';

function Quality() {
  const { gl, setDpr, size } = useThree();
  useEffect(() => {
    const context = gl.getContext(), ext = context.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? String(context.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    setDpr(/swiftshader|llvmpipe|software/i.test(renderer) || size.width < 700 ? 1 : Math.min(window.devicePixelRatio, 1.5));
  }, [gl, setDpr, size.width]);
  return null;
}

function World() {
  const stage = useMission(s => s.stage), reduced = useMission(s => s.motionReduced), theme = 'nocturne' as const;
  const palette = THEME_COLORS[theme], breach = stage === 'breach';
  return <>
    <color attach="background" args={[palette.bg]}/><fog attach="fog" args={[palette.fog, 12, 34]}/>
    <hemisphereLight intensity={1.05} color="#c4d2ed" groundColor="#222433"/>
    <ambientLight intensity={.24} color="#a6aec9"/>
    <directionalLight position={[-3, 5.5, 1.5]} color={breach ? '#df786e' : '#e2e4dc'} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-.0003} shadow-normalBias={.025} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7}/>
    <pointLight position={[0, 1.9, -1.25]} color={breach ? '#ef584c' : '#80d8d0'} intensity={3.8} distance={4} decay={2}/>
    <pointLight position={[3.8, 3.8, -3]} color={palette.warm} intensity={15} distance={10} decay={2}/>
    <pointLight position={[-4, 3, -3]} color={palette.rim} intensity={8} distance={9} decay={2}/>
    <Facility stage={stage} theme={theme} reduced={reduced}/>
    <OperatorRig stage={stage} reduced={reduced}/>
    <SignalBridge stage={stage} reduced={reduced}/>
    <PortraitProjection stage={stage}/><SpatialArchives/>
    <ShotDirector stage={stage} reduced={reduced}/><Quality/>
  </>;
}

export function CyberLab() {
  const stage = useMission(s => s.stage);
  return <div className={`scene-root ${stage === 'document' ? 'scene-muted' : ''}`} aria-hidden="true">
    {stage !== 'document' && <Suspense fallback={<div className="scene-loading">LOADING CYBERLAB...</div>}>
      <Canvas shadows dpr={1} camera={{ position: [5.5, 3.1, 7.8], fov: 43, near: .1, far: 45 }} gl={{ alpha: false, antialias: true, powerPreference: 'high-performance' }}>
        <World/>
      </Canvas>
    </Suspense>}
    <div className="scene-vignette"/>
  </div>;
}

