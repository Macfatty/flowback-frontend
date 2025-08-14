import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto(`/login`);

  const login = page.locator('#login-page');
  expect(login).toBeVisible();
  await page.waitForTimeout(600);
  
  await page.fill('input[name="email"]', 'a@a.se');
  await page.fill('input[name="password"]', 'a');
  
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/home');

  await page.locator('#groups').click();

  // Click the first button in the group list
  await page.locator('#groups-list > div').first().first().click();

  await expect(page).toHaveURL('/groups/6');

  await page.getByRole('button', { name: 'Create a post' }).click();
  await page.getByLabel('Title * 0/').click();
  await page.getByLabel('Title * 0/').fill('Test Poll');
  await page.getByLabel('Description  0/').fill('Test Description');
  await page.getByRole('button', { name: 'Display advanced time settings' }).click();
  await page.locator('fieldset').filter({ hasText: 'Public? Yes No' }).getByLabel('Yes').check();
  await page.locator('fieldset').filter({ hasText: 'Fast Forward? Yes No' }).getByLabel('Yes').check();
  page.locator('#cookies-accept').click();
  await page.getByRole('button', { name: 'Post' }).click();
  await expect(page.getByRole('heading', { name: 'Test Poll' })).toBeVisible();
  await expect(page).toHaveURL(/\/groups\/6\/polls\/\d+$/);

  
});