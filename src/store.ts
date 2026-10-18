import { create } from 'zustand';
import type { ArchiveId } from './data/portfolio';

export type OrbitSpeed = 'gentle' | 'cinematic' | 'quick';
export type Stage = 'landing' | 'mission' | 'recon' | 'breach' | 'profile' | 'carousel' | 'document';
interface MissionState {
  stage: Stage;
  navigationRevision: number;
  activeArchive: ArchiveId;
  soundEnabled: boolean;
  motionReduced: boolean;
  orbitSpeed: OrbitSpeed;
  orbitFocus: number;
  setStage: (stage: Stage) => void;
  acceptMission: () => void;
  openArchive: (id: ArchiveId) => void;
  showArchives: () => void;
  restart: () => void;
  toggleSound: () => void;
  setMotionReduced: (value: boolean) => void;
  setOrbitSpeed: (speed: OrbitSpeed) => void;
  setOrbitFocus: (index: number) => void;
}
export const useMission = create<MissionState>((set) => ({
  stage: 'landing', navigationRevision: 0, activeArchive: 'projects', soundEnabled: true, motionReduced: false, orbitSpeed: 'cinematic', orbitFocus: 3,
  setStage: (stage) => set(s=>({ stage, navigationRevision:s.navigationRevision+1 })),
  acceptMission: () => set(s=>s.stage==='mission'?{stage:'recon',soundEnabled:true,navigationRevision:s.navigationRevision+1}:{}),
  openArchive: (activeArchive) => set(s=>({ activeArchive, stage: 'document', navigationRevision:s.navigationRevision+1 })),
  showArchives: () => set(s=>({ stage: 'carousel', navigationRevision:s.navigationRevision+1 })),
  restart: () => set(s=>({ stage: 'landing', activeArchive: 'projects', navigationRevision:s.navigationRevision+1 })),
  toggleSound: () => set((current) => ({ soundEnabled: !current.soundEnabled })),
  setMotionReduced: (motionReduced) => set({ motionReduced }),
  setOrbitSpeed: (orbitSpeed) => set({ orbitSpeed }),
  setOrbitFocus: (orbitFocus) => set({ orbitFocus }),
}));
