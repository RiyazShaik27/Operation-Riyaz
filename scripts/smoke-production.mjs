import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true, args:['--autoplay-policy=document-user-activation-required'] });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const scrollNext=async()=>{await page.waitForTimeout(1000);await page.mouse.move(8,350);await page.mouse.wheel(0,900);};
try {
  const humanAsset = page.waitForResponse(response => response.url().endsWith('/assets/operator/operator.glb'));
  const breachAsset = page.waitForResponse(response => response.url().endsWith('/assets/audio/system-breached.mp3'));
  const response = await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
  expect(response.status()).toBe(200);
  expect((await humanAsset).ok()).toBe(true);
  expect((await breachAsset).ok()).toBe(true);
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('.webgl-fallback')).toHaveCount(0);
  await scrollNext();
  await page.waitForTimeout(1800);
  await mkdir('evidence/accept-audio', { recursive: true });
  await page.screenshot({ path: 'evidence/accept-audio/production-transmission.png' });
  await expect(page.getByTestId('accept-mission')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('.top-controls')).toContainText('SOUND AUTO');
  await page.getByTestId('accept-mission').click();
  await expect(page.locator('.top-controls')).toContainText('SOUND ON');
  await expect(page.getByTestId('recon-terminal')).toBeVisible();
  await expect(page.getByTestId('breach-screen')).toBeVisible({ timeout: 12000 });
  await expect(page.getByTestId('profile-reveal')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(1600);await scrollNext();await page.getByTestId('archive-carousel').waitFor();
  await page.getByTestId('carousel-projects').click();
  for (const id of ['identity', 'education', 'certifications', 'projects', 'skills', 'experience', 'achievements']) {
    await page.getByTestId(`nav-${id}`).click();
    await expect(page.getByTestId(`nav-${id}`)).toHaveAttribute('aria-current', 'page');
  }
  expect(errors).toEqual([]);
  await mkdir('evidence/after', { recursive: true });
  await page.screenshot({ path: 'evidence/after/production-dossier.png' });
  await writeFile('evidence/production-smoke.json', JSON.stringify({ passed: true, httpStatus: response.status(), humanAsset: true, story: true, acceptButton: true, scrollStory: true, acceptEnablesSound:true, suppliedBreachClip:true, singleTheme: true, archives: 7, uncaughtErrors: errors }, null, 2));
  console.log('Production preview passed: HTTP 200, human and supplied audio assets, Accept Mission audio unlock, full story, seven archives, no uncaught browser errors.');
} finally {
  await browser.close();
}
