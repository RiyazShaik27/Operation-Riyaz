import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
import type { Stage } from '../store';

const MODEL_URL = `${import.meta.env.BASE_URL}assets/operator/operator.glb`;
const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0);

/** Real skinned anatomy: pose the skeleton, never scale disconnected limb meshes. */
function createPoseSolver() {
  const origin = new THREE.Vector3(), tip = new THREE.Vector3(), direction = new THREE.Vector3();
  const current = new THREE.Quaternion(), parent = new THREE.Quaternion(), delta = new THREE.Quaternion();
  const elbow = new THREE.Vector3(), pole = new THREE.Vector3(), end = new THREE.Vector3();
  const jointTarget = new THREE.Vector3(), wristTarget = new THREE.Vector3();
  const worldRotation = (bone: THREE.Object3D, rotation: THREE.Quaternion) => {
    bone.parent!.getWorldQuaternion(parent).invert();
    bone.quaternion.copy(parent).multiply(rotation); bone.updateWorldMatrix(false, true);
  };
  const aim = (bone: THREE.Bone, child: THREE.Bone, target: THREE.Vector3) => {
    bone.getWorldPosition(origin); child.getWorldPosition(tip);
    tip.sub(origin).normalize(); direction.subVectors(target, origin).normalize();
    delta.setFromUnitVectors(tip, direction); bone.getWorldQuaternion(current).premultiply(delta);
    worldRotation(bone, current);
  };
  return {
    worldRotation,
    turn(bone: THREE.Bone, axis: THREE.Vector3, angle: number) {
      bone.getWorldQuaternion(current); delta.setFromAxisAngle(axis, angle); current.premultiply(delta); worldRotation(bone, current);
    },
    reach(upper: THREE.Bone, lower: THREE.Bone, extremity: THREE.Bone, target: THREE.Vector3, bend: THREE.Vector3) {
      upper.getWorldPosition(origin); lower.getWorldPosition(tip); extremity.getWorldPosition(end);
      const a=origin.distanceTo(tip), b=tip.distanceTo(end);
      direction.subVectors(target, origin);
      const length=THREE.MathUtils.clamp(direction.length(), Math.abs(a-b)+.001, a+b-.001);
      direction.normalize();
      const along=(a*a-b*b+length*length)/(2*length);
      pole.copy(bend).addScaledVector(direction,-bend.dot(direction)).normalize();
      elbow.copy(origin).addScaledVector(direction,along).addScaledVector(pole,Math.sqrt(Math.max(0,a*a-along*along)));
      end.copy(origin).addScaledVector(direction,length);
      // aim() reuses scratch vectors, so keep the computed target in separate storage.
      wristTarget.copy(end); jointTarget.copy(elbow);
      aim(upper,lower,jointTarget); aim(lower,extremity,wristTarget);
    },
  };
}

export function OperatorRig({stage,reduced}:{stage:Stage;reduced:boolean}) {
  const {scene}=useGLTF(MODEL_URL);
  const rig=useMemo(()=>{
    const model=clone(scene);
    model.name='seated-human-operator'; model.scale.setScalar(.012);
    model.rotation.y=Math.PI; model.position.set(0,-.234,-.15); model.updateMatrixWorld(true);
    const bones:Record<string,THREE.Bone>={}, rest=new Map<THREE.Bone,THREE.Quaternion>(), meshes:THREE.SkinnedMesh[]=[];
    model.traverse(o=>{
      if(o instanceof THREE.Bone){bones[o.name]=o;rest.set(o,o.quaternion.clone());}
      if(o instanceof THREE.SkinnedMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;meshes.push(o);}
    });
    const get=(name:string)=>{const bone=bones[`Bip01_${name}`];if(!bone)throw new Error(`Operator rig missing ${name}`);return bone;};
    const limbs=(['L','R'] as const).map((name,index)=>{
      const hand=get(`${name}_Hand`), forward=get(`${name}_Finger2`).getWorldPosition(new THREE.Vector3()).sub(hand.getWorldPosition(new THREE.Vector3())).normalize();
      const across=get(`${name}_Finger1`).getWorldPosition(new THREE.Vector3()).sub(get(`${name}_Finger4`).getWorldPosition(new THREE.Vector3()));
      across.addScaledVector(forward,-across.dot(forward)).normalize();
      const normal=new THREE.Vector3().crossVectors(forward,across).normalize();
      const inverse=hand.getWorldQuaternion(new THREE.Quaternion()).invert();
      const localBasis=new THREE.Matrix4().makeBasis(across.applyQuaternion(inverse),normal.applyQuaternion(inverse),forward.applyQuaternion(inverse));
      const side=index===0?-1:1;
      const targetBasis=new THREE.Matrix4().makeBasis(new THREE.Vector3(-side,0,0),new THREE.Vector3(0,side,0),new THREE.Vector3(0,0,-1));
      const palm=new THREE.Quaternion().setFromRotationMatrix(targetBasis.multiply(localBasis.invert()));
      return {side,upper:get(`${name}_UpperArm`),fore:get(`${name}_Forearm`),hand,palm,
        thigh:get(`${name}_Thigh`),calf:get(`${name}_Calf`),foot:get(`${name}_Foot`),footRotation:get(`${name}_Foot`).getWorldQuaternion(new THREE.Quaternion()),
        fingers:[1,2,3,4].map(n=>get(`${name}_Finger${n}`)),
        wrist:new THREE.Vector3(side*.25,1.075,-.78),ankle:new THREE.Vector3(side*.17,.14,-.61),
        armPole:new THREE.Vector3(side,-.35,.15),legPole:new THREE.Vector3(side*.1,.1,-1)};
    });
    return {model,bones,rest,meshes,limbs,get,solver:createPoseSolver()};
  },[scene]);
  const blend=useRef({typing:0,recoil:0,gesture:0,look:0});
  useEffect(()=>()=>{rig.meshes.forEach(mesh=>mesh.skeleton.dispose());},[rig]);
  useFrame(({clock},delta)=>{
    const dt=Math.min(delta,.1),t=clock.elapsedTime,b=blend.current;
    const follow=(value:number,target:number)=>reduced?target:THREE.MathUtils.damp(value,target,5,dt);
    b.typing=follow(b.typing,stage==='recon'?1:0);b.recoil=follow(b.recoil,stage==='breach'?1:0);
    b.gesture=follow(b.gesture,stage==='profile'||stage==='carousel'?1:0);b.look=follow(b.look,stage==='mission'?.17:stage==='profile'?-.12:0);
    rig.rest.forEach((rotation,bone)=>bone.quaternion.copy(rotation));
    rig.model.updateMatrixWorld(true);
    const breath=reduced?0:Math.sin(t*1.4)*.006;
    rig.solver.turn(rig.get('Spine1'),X,-.10-.025*b.typing+.05*b.recoil+breath);
    rig.solver.turn(rig.get('Spine2'),X,-.10-.025*b.typing+.05*b.recoil);
    rig.solver.turn(rig.get('Head'),Y,b.look);
    rig.solver.turn(rig.get('Head'),X,-.055-.06*b.typing+.06*b.recoil);
    for(const limb of rig.limbs){
      rig.solver.reach(limb.thigh,limb.calf,limb.foot,limb.ankle,limb.legPole);
      rig.solver.worldRotation(limb.foot,limb.footRotation);
      const gesture=limb.side>0?b.gesture:0;
      const tap=reduced?0:Math.pow(Math.max(0,Math.sin(t*11+limb.side*1.5)),6)*.005*b.typing;
      limb.wrist.set(limb.side*(.25+.16*gesture),1.075+tap+.13*b.recoil+.24*gesture,-.78+.12*b.recoil+.08*gesture);
      rig.solver.reach(limb.upper,limb.fore,limb.hand,limb.wrist,limb.armPole);
      rig.solver.worldRotation(limb.hand,limb.palm);
      if(!reduced)limb.fingers.forEach((finger,i)=>{finger.rotateZ(Math.max(0,Math.sin(t*11+i*1.3+limb.side))*.055*b.typing);});
    }
    // Short asymmetric blinks rather than a permanently frozen face.
    const phase=t%4.7,blink=reduced?0:phase<.16?Math.sin(phase/.16*Math.PI):0;
    for(const mesh of rig.meshes){if(mesh.morphTargetInfluences){mesh.morphTargetInfluences[0]=blink;mesh.morphTargetInfluences[1]=blink*.96;}}
    rig.model.updateMatrixWorld(true);
  });
  return <primitive object={rig.model} dispose={null}/>;
}
useGLTF.preload(MODEL_URL);
