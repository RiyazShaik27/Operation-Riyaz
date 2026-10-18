import {test,expect} from '@playwright/test';
import {incoming,accept,archives} from './story-helpers';

test('scroll chapters require fresh gestures and never skip the incoming message',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('button',{name:/enter the cyberlab|skip intro|access intelligence archives/i})).toHaveCount(0);
  await incoming(page);
  const cdp=await page.context().newCDPSession(page);
  const burst=()=>Promise.all(Array.from({length:12},()=>cdp.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:8,y:350,deltaX:0,deltaY:140})));
  await burst();
  await expect(page.getByTestId('mission-card')).toBeVisible();
  await accept(page);
  await expect(page.getByText('MISSION ACCEPTED',{exact:true})).toBeVisible();
  await burst();
  await archives(page);
  await page.waitForTimeout(1700);await page.mouse.wheel(0,900);
  await expect(page.getByTestId('carousel-skills')).toHaveClass(/is-focused/);
  await page.getByTestId('carousel-skills').click();
  await expect(page.getByTestId('nav-skills')).toHaveAttribute('aria-current','page');
  await page.mouse.move(170,400);await page.mouse.wheel(0,800);
  await expect(page.getByTestId('nav-skills')).toHaveAttribute('aria-current','page');
});

test('keyboard advances the story and unlocks default audio without an enable button',async({page})=>{
  await page.goto('/');await page.waitForTimeout(500);
  await expect(page.getByRole('button',{name:'Mute sound',exact:true})).toBeVisible();
  await page.keyboard.press('PageDown');await expect(page.getByTestId('mission-card')).toBeVisible();
  await expect(page.locator('.top-controls')).toContainText('SOUND ON');
  await page.getByRole('button',{name:'Mute sound',exact:true}).click();
  await expect(page.locator('.top-controls')).toContainText('MUTED');
  await page.waitForTimeout(950);await page.keyboard.press('ArrowDown');
  await expect(page.getByTestId('recon-terminal')).toBeVisible();
  await expect(page.locator('.top-controls')).toContainText('SOUND ON');
});

test('vertical touch gestures advance mobile chapters',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage();await page.goto('/');
  const cdp=await context.newCDPSession(page);
  const swipe=async()=>{await page.waitForTimeout(1000);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:370}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:201,y:240}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  await swipe();await expect(page.getByTestId('mission-card')).toBeVisible();
  await swipe();await expect(page.getByTestId('recon-terminal')).toBeVisible();
  await expect(page.getByTestId('profile-reveal')).toBeVisible({timeout:18000});await page.waitForTimeout(700);await swipe();
  await expect(page.getByTestId('archive-carousel')).toBeVisible();await context.close();
});

