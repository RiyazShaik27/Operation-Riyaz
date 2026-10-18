import {incoming as enterMission,accept as acceptMission,archives as revealArchives} from './story-helpers';
import { test, expect } from '@playwright/test';

// v1.3 adds decorative 3D and HUD elements without changing v1.2 click handling.
test('cinematic decorations never intercept mission actions', async ({page}) => {
  await page.setViewportSize({width:1366,height:768});
  await page.goto('/');
  await expect(page.locator('.cinematic-frame')).toHaveCSS('pointer-events','none');
  await enterMission(page);
  const accept = page.locator('.communicator .scroll-action');
  await expect(accept).toBeVisible();
  const dimensions = await accept.boundingBox();
  expect(dimensions).toBeTruthy();
  expect(dimensions!.y+dimensions!.height).toBeLessThanOrEqual(768);
  await acceptMission(page);
  await expect(page.getByTestId('recon-terminal')).toBeVisible();
});

test('3D archive decoration does not block folder navigation', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name:/open portfolio archives/i}).click();
  await expect(page.getByTestId('archive-carousel')).toBeVisible();
  await page.getByTestId('carousel-skills').click();
  await expect(page.getByTestId('archive-document')).toBeVisible();
  await page.getByTestId('nav-projects').click();
  await expect(page.getByTestId('nav-projects')).toHaveAttribute('aria-current','page');
  await page.getByTestId('nav-education').click();
  await expect(page.getByTestId('nav-education')).toHaveAttribute('aria-current','page');
});
