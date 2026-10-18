import {expect,type Page} from '@playwright/test';
export async function nextChapter(page:Page){
  await page.waitForTimeout(1000);
  await page.mouse.move(8,Math.round((page.viewportSize()?.height??768)*.45));
  await page.mouse.wheel(0,900);
}
export async function incoming(page:Page){await nextChapter(page);await expect(page.getByTestId('mission-card')).toBeVisible();}
export async function accept(page:Page){await nextChapter(page);await expect(page.getByTestId('recon-terminal')).toBeVisible();}
export async function archives(page:Page){await expect(page.getByTestId('profile-reveal')).toBeVisible({timeout:18000});await page.waitForTimeout(700);await nextChapter(page);await expect(page.getByTestId('archive-carousel')).toBeVisible();}
