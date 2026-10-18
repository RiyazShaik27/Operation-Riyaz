import {incoming as enterMission,accept as acceptMission,archives as revealArchives} from './story-helpers';
import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const files = [
  ['identity', 'Identity'], ['education', 'Education'], ['certifications', 'Credentials'],
  ['projects', 'Projects'], ['skills', 'Skills'], ['experience', 'Experience'], ['achievements', 'Achievements'],
] as const;

for (const viewport of [{ width: 1920, height: 1080 }, { width: 1649, height: 928 }, { width: 1366, height: 768 }, { width: 1280, height: 720 }, { width: 390, height: 844 }]) {
  test(`v1.7 full story and seven independent folder opens at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize(viewport);
    const humanAsset = page.waitForResponse(response => response.url().endsWith('/assets/operator/operator.glb'));
    await page.goto('/');
    expect((await humanAsset).ok()).toBeTruthy();
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('.webgl-fallback')).toHaveCount(0);
    await enterMission(page);
    await expect(page.getByText('INCOMING TRANSMISSION', { exact: true })).toBeVisible();
    const accept = page.locator('.communicator .scroll-action');
    await expect(accept).toBeInViewport({ ratio: 1 });
    await page.waitForTimeout(1600); // Capture the settled camera and panel, not their entrance fade.
    await mkdir('evidence/after', { recursive: true });
    await page.screenshot({ path: `evidence/after/mission-${viewport.width}x${viewport.height}.png` });
    await acceptMission(page);
    await expect(page.getByTestId('recon-terminal')).toBeVisible();
    await expect(page.getByTestId('breach-screen')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('profile-reveal')).toBeVisible({ timeout: 10000 });
    await revealArchives(page);
    for (const [id, label] of files) {
      await page.getByRole('button', { name: `Rotate to ${label}`, exact: true }).click();
      const folder = page.getByTestId(`carousel-${id}`);
      await expect(folder).toHaveClass(/is-focused/);
      await folder.click();
      await expect(page.getByTestId(`nav-${id}`)).toHaveAttribute('aria-current', 'page');
      await page.getByRole('button', { name: 'ALL FILES', exact: true }).click();
      await expect(page.getByTestId('archive-carousel')).toBeVisible();
    }
    await page.getByRole('button', { name: /restart cinematic/i }).click();
    await expect(page.getByTestId('story-landing')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('skip/replay interrupts a file transition without delayed navigation or leftover transforms', async ({ page }) => {
  await page.setViewportSize({ width: 1649, height: 928 });
  await page.goto('/');
  await page.getByRole('button', { name: /open portfolio archives/i }).click();
  await page.getByTestId('carousel-projects').click();
  await expect(page.locator('.archive-ui')).toHaveClass(/is-opening/);
  await page.getByRole('button', { name: /restart cinematic/i }).click();
  await page.waitForTimeout(1400);
  await expect(page.getByTestId('story-landing')).toBeVisible();
  await expect(page.locator('.archive-flight-ghost')).toHaveCount(0);
  await page.getByRole('button', { name: /open portfolio archives/i }).click();
  await page.getByTestId('carousel-projects').click();
  await page.getByRole('button', { name: /open portfolio archives/i }).click();
  await page.waitForTimeout(1400);
  await expect(page.getByTestId('archive-carousel')).toBeVisible();
  await page.getByTestId('carousel-projects').click();
  await expect(page.getByTestId('nav-projects')).toHaveAttribute('aria-current', 'page');
});

test('keyboard, settings, sound and certificate modal remain usable', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Mute sound' })).toBeVisible();
  await page.getByRole('button', { name: /accessibility options/i }).click();
  await page.getByRole('checkbox', { name: /reduce motion/i }).check();
  await page.getByRole('combobox', { name: 'Carousel rotation speed' }).selectOption('quick');
  await page.getByRole('button', { name: 'CLOSE', exact: true }).click();
  await page.getByRole('button', { name: /open portfolio archives/i }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('carousel-skills')).toHaveClass(/is-focused/);
  await page.getByTestId('carousel-skills').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('nav-skills')).toHaveAttribute('aria-current', 'page');
  for (const [id] of [...files, ...files].reverse()) {
    await page.getByTestId(`nav-${id}`).click();
    await expect(page.getByTestId(`nav-${id}`)).toHaveAttribute('aria-current', 'page');
  }
  await page.getByTestId('nav-certifications').click();
  await page.getByRole('button', { name: /enlarge IBM/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByTestId('archive-document')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('archive-carousel')).toBeVisible();
  await page.getByRole('button', { name: 'Mute sound' }).click();
  await expect(page.getByRole('button', { name: 'Enable sound' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile touch swipe rotates without opening an accidental folder', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('button', { name: /open portfolio archives/i }).click();
  const rect = await page.locator('.folder-stage').boundingBox();
  const session = await context.newCDPSession(page);
  const x = rect!.x + rect!.width * .7, y = rect!.y + rect!.height * .6;
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 80, y }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.getByTestId('carousel-skills')).toHaveClass(/is-focused/);
  await expect(page.getByTestId('archive-carousel')).toBeVisible();
  await context.close();
});

for (const viewport of [{width:1366,height:768},{width:390,height:844}]) {
  test(`compact communicator expands and keeps mission actionable at ${viewport.width}`, async ({page})=>{
    await page.setViewportSize(viewport);
    await page.goto('/');
    await enterMission(page);
    const card=page.getByTestId('mission-card');
    await expect(card).toBeVisible();
    const box=await card.boundingBox();
    if(viewport.width>1000) expect(box!.width).toBeLessThan(350);
    else expect(box!.height).toBeLessThan(viewport.height*.57);
    await page.getByRole('button',{name:'Expand incoming message',exact:true}).click();
    await expect(page.getByRole('button',{name:'Collapse incoming message'})).toHaveAttribute('aria-expanded','true');
    await expect(page.locator('.communicator .scroll-action')).toBeInViewport({ratio:1});
    await page.getByRole('button',{name:'Collapse incoming message'}).click();
    await acceptMission(page);
    await page.getByRole('button',{name:'Expand investigation log'}).click();
    await expect(page.getByRole('button',{name:'Collapse investigation log'})).toHaveAttribute('aria-expanded','true');
    await page.getByRole('button',{name:'Collapse investigation log'}).click();
    await expect(page.getByTestId('recon-terminal')).toBeVisible();
  });
}
