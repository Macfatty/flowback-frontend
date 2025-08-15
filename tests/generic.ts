import { expect } from '@playwright/test';

export async function login(page: any, {
  email = process.env.E2E_EMAIL ?? 'a@a.se',
  password = process.env.E2E_PASSWORD ?? 'a',
} = {}) {
  await page.goto('/login');
  await expect(page.locator('#login-page')).toBeVisible();
  await page.waitForTimeout(600);

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/home');

  page.locator('#cookies-accept').click();
  await page.getByRole('button', { name: 'Ok' }).click();
}

export async function gotoGroup(page: any, groupId: string = "0") {
  await page.locator('#groups').click();
  await expect(page.locator('#groups-list')).toBeVisible();
  const groupLink = page.locator('#groups-list a[href^="/groups/"]').first();
  await expect(groupLink).toBeVisible();
  await groupLink.click();
}