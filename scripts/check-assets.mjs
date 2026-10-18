import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const assets=['portrait.jpg','resume.pdf','ibm-cyber.png','oracle-java.png','dsa-java.png','generative-ai.png','operator/operator.glb','operator/LICENSE.txt','audio/system-breached.mp3'];
let ok=true;
for(const name of assets){const file=path.join(root,'public/assets',name);const valid=existsSync(file);console.log(valid?'OK  ':'MISS',file); if(!valid)ok=false;}
try {
  const buffer=readFileSync(path.join(root,'public/assets/operator/operator.glb'));
  if(buffer.toString('ascii',0,4)!=='glTF'||buffer.readUInt32LE(4)!==2||buffer.readUInt32LE(8)!==buffer.length)throw new Error('Invalid GLB header or length');
  const gltf=JSON.parse(buffer.toString('utf8',20,20+buffer.readUInt32LE(12)));
  if(!gltf.skins?.length||!gltf.nodes.some(n=>n.name==='Bip01_Head'))throw new Error('Human skeleton missing');
  if(gltf.images.some(image=>image.uri)||gltf.buffers.some(b=>b.uri))throw new Error('Human asset must embed all textures and geometry');
  console.log(`OK   Self-contained rigged human: ${(buffer.length/1024/1024).toFixed(2)} MiB`);
} catch(error){console.error('Invalid operator asset:',error.message);ok=false;}
const data=readFileSync(path.join(root,'src/data/portfolio.ts'),'utf8');
const expected=['identity','education','certifications','projects','skills','experience','achievements'];
for(const id of expected){if(!data.includes(`id: '${id}'`)){console.error('Missing archive:',id);ok=false;}}
process.exit(ok?0:1);

