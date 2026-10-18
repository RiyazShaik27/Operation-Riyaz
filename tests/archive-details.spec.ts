import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test.use({ reducedMotion: 'reduce', ...(process.env.ARCHIVE_TEST_URL ? {baseURL:process.env.ARCHIVE_TEST_URL} : {}) });
const archives = ['identity','education','certifications','projects','skills','experience','achievements'];

async function openProjects(page: Page) {
  await page.goto('/');
  await page.getByRole('button',{name:'Open portfolio archives',exact:true}).click();
  await page.getByTestId('carousel-projects').click();
  await expect(page.getByTestId('archive-document')).toBeVisible();
}

for (const viewport of [{width:1366,height:768},{width:375,height:667}]) {
  test(`every record across seven archives expands at ${viewport.width}`,async({page})=>{
    test.setTimeout(120000);
    await page.setViewportSize(viewport);
    const errors:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    await openProjects(page);
    for(const archive of archives) {
      await page.getByTestId(`nav-${archive}`).click();
      const records=page.locator('.archive-main .intel-record');
      expect(await records.count()).toBeGreaterThan(0);
      for(let index=0;index<await records.count();index++) {
        const card=records.nth(index);
        const title=await card.locator('h3').first().innerText();
        const trigger=card.locator('.record-expand');
        await trigger.click();
        const dialog=page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('heading',{level:2})).toHaveText(title,{ignoreCase:true});
        await expect(dialog).toBeInViewport({ratio:1});
        await expect(dialog.locator('.record-dialog-toolbar button')).toBeInViewport({ratio:1});
        expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
        expect(await dialog.locator('.record-dialog-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
        await expect(page.getByTestId(`nav-${archive}`)).toHaveAttribute('aria-current','page');
      }
    }
    expect(errors).toEqual([]);
  });
}

test('project popup scrolls independently, exposes source links, traps focus and restores the archive',async({page})=>{
  await page.setViewportSize({width:1366,height:768});
  await openProjects(page);
  await mkdir('evidence/archive-popups',{recursive:true});
  const panel=page.locator('.archive-main');
  const card=panel.locator('.intel-record').nth(1);
  await card.locator('h3').click(); // Whole record is clickable, not just its action.
  const dialog=page.getByRole('dialog');
  const scroll=dialog.locator('.record-dialog-scroll');
  const saved=await panel.evaluate(el=>el.scrollTop);
  await expect(dialog.getByRole('heading',{name:'Ransomware Traffic Classification',exact:true})).toBeVisible();
  await expect(dialog.getByText('TOOLS & TECHNOLOGIES',{exact:true})).toBeVisible();
  const repo=dialog.getByRole('link',{name:'OPEN REPOSITORY'});
  await expect(repo).toHaveAttribute('href','https://github.com/RiyazShaik27/Ransomware-Traffic-Classification-Model');
  await expect(repo).toHaveAttribute('target','_blank');
  await page.screenshot({path:'evidence/archive-popups/desktop-detail.png'});
  await scroll.hover();await page.mouse.wheel(0,900);
  await expect.poll(()=>scroll.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  await expect(repo).toBeInViewport({ratio:1});
  await page.mouse.wheel(0,1600);await page.waitForTimeout(350);
  expect(await panel.evaluate(el=>el.scrollTop)).toBe(saved);
  await page.screenshot({path:'evidence/archive-popups/desktop-links.png'});
  for(let i=0;i<8;i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBeTruthy();
  }
  for(let i=0;i<5;i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBeTruthy();
  }
  await page.keyboard.press('Escape');
  await expect(card.locator('.record-expand')).toBeFocused();
  expect(await panel.evaluate(el=>el.scrollTop)).toBe(saved);
  await panel.locator('.intel-record').first().getByRole('button',{name:/view .* details/i}).click();
  await expect(page.getByRole('dialog').getByRole('link',{name:'OPEN REPOSITORY'})).toHaveAttribute('href','https://github.com/RiyazShaik27/ASRA');
  await page.screenshot({path:'evidence/archive-popups/asra-detail.png'});
  await page.mouse.click(5,5); // Backdrop closes without activating the underlying scene.
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByTestId('archive-document')).toBeVisible();
});

test('phone popup supports touch scrolling and keeps close reachable',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce',baseURL:process.env.ARCHIVE_TEST_URL||'http://127.0.0.1:4173'});
  try {
    const page=await context.newPage();await openProjects(page);
    await page.locator('.archive-main .intel-record').nth(1).locator('.record-expand').tap();
    const dialog=page.getByRole('dialog'),scroll=dialog.locator('.record-dialog-scroll');
    const saved=await page.locator('.archive-main').evaluate(el=>el.scrollTop);
    const session=await context.newCDPSession(page);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:680}]});
    for(const y of [620,540,460,380,300,220]) {
      await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y}]});
      await page.waitForTimeout(30);
    }
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect.poll(()=>scroll.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
    await dialog.getByRole('link',{name:'OPEN REPOSITORY'}).scrollIntoViewIfNeeded();
    await expect(dialog.getByRole('link',{name:'OPEN REPOSITORY'})).toBeInViewport({ratio:1});
    await expect(dialog.getByRole('button',{name:'Close details'})).toBeInViewport({ratio:1});
    await mkdir('evidence/archive-popups',{recursive:true});
    await page.screenshot({path:'evidence/archive-popups/phone-detail.png'});
    expect(await page.locator('.archive-main').evaluate(el=>el.scrollTop)).toBe(saved);
    await dialog.getByRole('button',{name:'Close details'}).tap();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId('nav-projects')).toHaveAttribute('aria-current','page');
  } finally {await context.close();}
});
