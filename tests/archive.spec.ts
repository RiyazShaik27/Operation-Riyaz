import {incoming as enterMission,accept as acceptMission,archives as revealArchives} from './story-helpers';
import { test, expect } from '@playwright/test';

const files=['identity','education','certifications','projects','skills','experience','achievements'] as const;

test('scroll mission cue stays visible at desktop and small viewport sizes',async({page})=>{
  for(const viewport of [{width:1649,height:928},{width:1366,height:768},{width:1280,height:720},{width:390,height:844},{width:375,height:667}]){
    await page.setViewportSize(viewport);
    await page.goto('/');
    await enterMission(page);
    const action=page.locator('.communicator .scroll-action');
    await expect(action).toBeVisible();
    const b=await action.boundingBox();
    expect(b).not.toBeNull();
    expect(b!.y).toBeGreaterThanOrEqual(0);
    expect(b!.y+b!.height).toBeLessThanOrEqual(viewport.height);
    await acceptMission(page);
    await expect(page.getByTestId('recon-terminal')).toBeVisible();
  }
});

test('hovering a folder rotates carousel to it; clicking opens the archive',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:/open portfolio archives/i}).click();
  await expect(page.getByTestId('archive-carousel')).toBeVisible();
  // Projects is initially in front; Skills is the immediate next orbit position.
  await page.getByTestId('carousel-skills').hover();
  await expect(page.getByTestId('carousel-skills')).toHaveClass(/is-focused/);
  await page.getByTestId('carousel-skills').click();
  await expect(page.getByTestId('archive-document')).toBeVisible();
  await expect(page.getByTestId('nav-skills')).toHaveAttribute('aria-current','page');
});

test('all seven archives open, remain clickable, and return to overview',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:/open portfolio archives/i}).click();
  for(const [index,file] of files.entries()){
    if(index===0){
      // Dot selectors also allow navigating without mouse hover or arrows.
      await page.getByRole('button',{name:/rotate to identity/i}).click();
      await page.getByRole('button',{name:/open identity archive/i}).first().click();
    }else{
      await page.getByTestId(`nav-${file}`).click();
    }
    await expect(page.getByTestId('archive-document')).toBeVisible();
    await expect(page.getByTestId(`nav-${file}`)).toHaveAttribute('aria-current','page');
  }
  await page.getByRole('button',{name:/all files/i}).click();
  await expect(page.getByTestId('archive-carousel')).toBeVisible();
});

test('mission advances to biometric reveal and archives',async({page})=>{
  await page.goto('/');
  await enterMission(page);
  await acceptMission(page);
  await expect(page.getByTestId('recon-terminal')).toBeVisible();
  await expect(page.getByTestId('profile-reveal')).toBeVisible({timeout:16000});
  await revealArchives(page);
  await expect(page.getByTestId('archive-carousel')).toBeVisible();
});

test('orbit rotates at cinematic pace and speed is adjustable',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:/open portfolio archives/i}).click();
  const skills=page.getByTestId('carousel-skills');
  const focused=page.getByTestId('carousel-projects');
  const before=await skills.evaluate(e=>getComputedStyle(e).transform);
  await skills.hover();
  await expect(skills).toHaveClass(/is-focused/);
  // Position should be advancing around the ring, not teleported to its final value.
  await page.waitForTimeout(350);
  const during=await skills.evaluate(e=>getComputedStyle(e).transform);
  expect(during).not.toBe(before);
  await page.waitForTimeout(2100);
  const after=await skills.evaluate(e=>getComputedStyle(e).transform);
  expect(after).not.toBe(during);
  await page.getByRole('button',{name:/accessibility options/i}).click();
  const speed=page.getByRole('combobox',{name:'Carousel rotation speed'});
  await expect(speed).toHaveValue('cinematic');
  await speed.selectOption('gentle');
  await expect(speed).toHaveValue('gentle');
  await page.getByRole('button',{name:'CLOSE'}).click();
  await page.getByRole('button',{name:/open skills archive/i}).first().click();
  await expect(page.getByTestId('archive-document')).toBeVisible();
  await expect(page.getByTestId('nav-skills')).toHaveAttribute('aria-current','page');
});
