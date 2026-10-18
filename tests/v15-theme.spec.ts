import {test,expect} from '@playwright/test';
test('Neon Nocturne is the only atmosphere and archives remain usable',async({page})=>{
 await page.goto('/');await expect(page.locator('.app-frame')).toHaveClass(/theme-nocturne/);
 await expect(page.getByRole('button',{name:/visual theme|switch theme/i})).toHaveCount(0);
 await page.getByRole('button',{name:/accessibility options/i}).click();
 await expect(page.getByRole('combobox',{name:'Visual atmosphere'})).toHaveCount(0);
 await page.getByRole('button',{name:'CLOSE',exact:true}).click();
 await page.getByRole('button',{name:/open portfolio archives/i}).click();
 await page.getByTestId('carousel-skills').click();
 await expect(page.getByTestId('nav-skills')).toHaveAttribute('aria-current','page');
});
test('old saved themes cannot override Neon Nocturne',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('operation-riyaz-theme','ember'));
 await page.goto('/');await expect(page.locator('.app-frame')).toHaveClass(/theme-nocturne/);
 await page.reload();await expect(page.locator('.app-frame')).toHaveClass(/theme-nocturne/);
});
