import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

window.convertOperator = async () => {
  const manager = new THREE.LoadingManager();
  const loaded = new Promise((resolve,reject)=>{manager.onLoad=resolve;manager.onError=url=>reject(new Error(`Missing texture: ${url}`));});
  manager.addHandler(/\.tga$/i,new TGALoader(manager));
  const loader = new FBXLoader(manager).setResourcePath('/.asset-work/rocketbox/');
  const model = await loader.loadAsync('/.asset-work/rocketbox/Male_Adult_07_facial.fbx');
  await loaded;
  model.updateMatrixWorld(true);
  const meshes=[],bones=[];
  model.traverse(o=>{
    if(o.isMesh) meshes.push({name:o.name,vertices:o.geometry.attributes.position.count,materials:(Array.isArray(o.material)?o.material:[o.material]).map(m=>({name:m.name,map:m.map?.name,normal:m.normalMap?.name,alpha:m.alphaMap?.name})),skinned:o.isSkinnedMesh,morphs:o.morphTargetDictionary});
    if(o.isBone) bones.push({name:o.name,parent:o.parent?.name,position:o.getWorldPosition(new THREE.Vector3()).toArray(),local:o.position.toArray(),rotation:o.quaternion.toArray()});
  });
  window.operatorModel=model;
  window.operatorExporter=GLTFExporter;
  window.THREE=THREE;
  return {meshes,bones,bounds:new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3()).toArray()};
};

window.exportOperator=async()=>{
  const model=window.operatorModel;
  const resized=new Map();
  const resize=(texture,max,mime)=>{
    if(!texture)return null;
    if(resized.has(texture))return resized.get(texture);
    const image=texture.image;
    const source=document.createElement('canvas');source.width=image.width;source.height=image.height;
    const ctx=source.getContext('2d');
    if(image.data)ctx.putImageData(new ImageData(new Uint8ClampedArray(image.data),image.width,image.height),0,0);else ctx.drawImage(image,0,0);
    const c=document.createElement('canvas');const factor=Math.min(1,max/Math.max(image.width,image.height));c.width=Math.round(image.width*factor);c.height=Math.round(image.height*factor);c.getContext('2d').drawImage(source,0,0,c.width,c.height);
    const result=new THREE.CanvasTexture(c);result.colorSpace=texture.colorSpace;result.flipY=texture.flipY;result.wrapS=texture.wrapS;result.wrapT=texture.wrapT;result.userData.mimeType=mime;resized.set(texture,result);return result;
  };
  model.traverse(o=>{
    if(!o.isMesh)return;
    const old=Array.isArray(o.material)?o.material:[o.material];
    o.material=old.map(m=>{
      const hair=m.name.includes('opacity');const head=m.name.includes('head');
      const map=resize(m.map,head?2048:1024,hair?'image/png':'image/jpeg');if(map)map.colorSpace=THREE.SRGBColorSpace;
      return new THREE.MeshStandardMaterial({name:m.name,map,normalMap:resize(m.normalMap,1024,'image/jpeg'),normalScale:new THREE.Vector2(.55,.55),color:0xffffff,roughness:head?.66:.86,metalness:0,alphaTest:hair?.45:0,side:hair?THREE.DoubleSide:THREE.FrontSide});
    });
    // Keep only the two blinks; 175 unused facial targets would dominate transfer and VRAM.
    const names=['blendShape1.AK_09_EyeBlinkLeft','blendShape1.AK_10_EyeBlinkRight'];
    const ids=names.map(n=>o.morphTargetDictionary[n]);
    for(const key of Object.keys(o.geometry.morphAttributes))o.geometry.morphAttributes[key]=ids.map(i=>o.geometry.morphAttributes[key][i]);
    o.morphTargetDictionary={blinkLeft:0,blinkRight:1};o.morphTargetInfluences=[0,0];
    o.geometry.morphAttributes.position.forEach((a,i)=>a.name=i===0?'blinkLeft':'blinkRight');
    o.castShadow=true;o.receiveShadow=true;
  });
  model.animations=[];
  model.userData={source:'Microsoft Rocketbox / Male Adult 07',license:'MIT',copyright:'Copyright (c) 2020 Microsoft'};
  const bytes=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:false,maxTextureSize:2048,animations:[]});
  return Array.from(new Uint8Array(bytes));
};
