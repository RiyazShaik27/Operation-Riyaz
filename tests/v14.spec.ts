import {incoming as enterMission,accept as acceptMission,archives as revealArchives} from './story-helpers';
import { test,expect } from '@playwright/test';

const archives=['identity','education','certifications','projects','skills','experience','achievements'];

test('critical scroll-to-accept cue remains visible and actionable',async({page})=>{
  await page.setViewportSize({width:1280,height:720});
  await page.goto('/');
  await enterMission(page);
  const accept=page.locator('.communicator .scroll-action');
  await expect(accept).toBeVisible();
  const rect=await accept.boundingBox();
  expect(rect).not.toBeNull();
  expect(rect!.y+rect!.height).toBeLessThanOrEqual(720);
  await acceptMission(page);
  await expect(page.getByTestId('recon-terminal')).toBeVisible();
});

test('cinematic hologram flies into opened dossier and folders remain navigable',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:/open portfolio archives/i}).click();
  await expect(page.getByTestId('archive-carousel')).toBeVisible();
  await page.getByTestId('carousel-projects').click();
  await expect(page.getByTestId('archive-document')).toBeVisible({timeout:5000});
  for(const id of archives){
    await page.getByTestId(`nav-${id}`).click();
    await expect(page.getByTestId(`nav-${id}`)).toHaveAttribute('aria-current','page');
  }
  await page.getByRole('button',{name:/all files/i}).click();
  await expect(page.getByTestId('archive-carousel')).toBeVisible();
});

test('archive speed default and reduced-motion setting remain functional',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:/accessibility options/i}).click();
  await expect(page.getByRole('combobox',{name:'Carousel rotation speed'})).toHaveValue('cinematic');
  await page.getByRole('checkbox',{name:/reduce motion/i}).check();
  await page.getByRole('button',{name:'CLOSE'}).click();
  await page.getByRole('button',{name:/open portfolio archives/i}).click();
  await page.getByTestId('carousel-skills').click();
  await expect(page.getByTestId('nav-skills')).toHaveAttribute('aria-current','page');
});
