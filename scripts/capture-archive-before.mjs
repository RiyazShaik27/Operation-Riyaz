import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('evidence/archive-popups', {recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl']});
try {
 const page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4173/');
 await page.getByRole('button',{name:'Open portfolio archives'}).click();
 await page.getByTestId('carousel-projects').click();
 await page.getByTestId('archive-document').waitFor();
 await page.screenshot({path:'evidence/archive-popups/before-projects.png'});
} finally {await browser.close();}
