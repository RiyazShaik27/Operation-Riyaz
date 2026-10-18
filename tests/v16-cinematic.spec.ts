import {incoming as enterMission,accept as acceptMission,archives as revealArchives} from './story-helpers';
import { test, expect } from '@playwright/test';

const archives=['identity','education','certifications','projects','skills','experience','achievements'];

test('cinematic flow preserves mission actions and all dossier navigation',async ({page})=>{
  await page.setViewportSize({width:1649,height:928});
  await page.goto('/');
  await enterMission(page);
  const button=page.locator('.communicator .scroll-action');
  await expect(button).toBeVisible();
  const rect=await button.boundingBox();
  expect(rect).not.toBeNull();
  expect(rect!.y+rect!.height).toBeLessThanOrEqual(928);
  await acceptMission(page);
  await expect(page.getByTestId('recon-terminal')).toBeVisible();
  await expect(page.getByTestId('profile-reveal')).toBeVisible({timeout:16000});
  await revealArchives(page);
  await expect(page.getByTestId('archive-carousel')).toBeVisible();
  await page.getByTestId('carousel-projects').click();
  await expect(page.getByTestId('archive-document')).toBeVisible({timeout:5000});
  for(const archive of archives){
    await page.getByTestId(`nav-${archive}`).click();
    await expect(page.getByTestId(`nav-${archive}`)).toHaveAttribute('aria-current','page');
  }
});

test('orbit and presentation options preserve click behavior',async ({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:/accessibility options/i}).click();
  await page.getByRole('combobox',{name:'Carousel rotation speed'}).selectOption('gentle');
  await page.getByRole('checkbox',{name:/reduce motion/i}).check();
  await page.getByRole('button',{name:'CLOSE'}).click();
  await page.getByRole('button',{name:/open portfolio archives/i}).click();
  await page.getByTestId('carousel-skills').click();
  await expect(page.getByTestId('nav-skills')).toHaveAttribute('aria-current','page');
  await page.getByRole('button',{name:/all files/i}).click();
  await expect(page.getByTestId('archive-carousel')).toBeVisible();
});
