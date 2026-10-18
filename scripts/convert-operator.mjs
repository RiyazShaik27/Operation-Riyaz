import { chromium } from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
await mkdir('evidence/operator-source',{recursive:true});
if(process.argv.includes('--download')) {
  await mkdir('.asset-work/rocketbox',{recursive:true});
  const prefix='https://raw.githubusercontent.com/microsoft/Microsoft-Rocketbox/master/Assets/Avatars/Adults/Male_Adult_07/';
  for(const file of ['Export/Male_Adult_07_facial.fbx',...['body_color','body_normal','body_specular','head_color','head_normal','head_specular','opacity_color'].map(n=>'Textures/m013_'+n+'.tga')]) {
    const response=await fetch(prefix+file);if(!response.ok)throw new Error('Download failed: '+file);
    await writeFile('.asset-work/rocketbox/'+file.split('/').pop(),Buffer.from(await response.arrayBuffer()));
  }
}
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();
page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
try {
  await page.goto('http://127.0.0.1:4173/scripts/convert-operator.html');
  await page.waitForFunction(()=>window.convertOperator);
  const info=await page.evaluate(()=>window.convertOperator());
  await writeFile('evidence/operator-source/rig-info.json',JSON.stringify(info,null,2));
  console.log(JSON.stringify({meshes:info.meshes.map(({morphs,...mesh})=>({...mesh,morphCount:Object.keys(morphs||{}).length})),bounds:info.bounds,bones:info.bones.length},null,2));
  if(process.argv.includes('--export')) {
    const bytes=await page.evaluate(()=>window.exportOperator());
    await mkdir('public/assets/operator',{recursive:true});
    await writeFile('public/assets/operator/operator.glb',Buffer.from(bytes));
    console.log(`Exported ${bytes.length} bytes`);
  }
} finally {await browser.close();}

