import { expect } from '@playwright/test';

export async function login(page: any, {
  email = process.env.E2E_EMAIL ?? 'a@a.se',
  password = process.env.E2E_PASSWORD ?? 'a',
} = {}) {
  await page.goto('/login');
  await expect(page.locator('#login-page')).toBeVisible();
  await page.waitForTimeout(700);

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/home');

  // page.locator('#cookies-accept').click();
  await page.getByRole('button', { name: 'Ok' }).click();
}

export async function logout(page: any) {
  await page.getByRole('button', { name: 'default pfp' }).click();
  await page.getByRole('button', { name: 'Log Out', exact: true }).click();
  await expect(page.getByRole('img', { name: 'flowback logo' })).toBeVisible();
};

export async function gotoGroup(page: any, groupId: string = "0") {
  await page.locator('#groups').click();
  await expect(page.locator('#groups-list')).toBeVisible();
  const groupLink = page.locator('#groups-list a[href^="/groups/"]').first();
  await expect(groupLink).toBeVisible();
  await groupLink.click();
}


export async function createGroup(page: any, groupName:string = 'Test Group') {
  await page.getByRole('link', { name: 'Groups' }).click();
  await page.getByRole('button', { name: 'Create Group' }).click();
  await page.getByLabel('Title * 0/').click();
  await page.getByLabel('Title * 0/').fill(groupName);
  await page.getByLabel('Description  0/').click();
  await page.getByLabel('Description  0/').fill('Test Group Description');
  await page.locator(".image-upload > input").nth(0).setInputFiles('./tests/forward-facing-niko-oneshot-isnt-real-it-cant-hurt-you-v0-3ggf23q4ijcf1.webp');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.locator(".image-upload > input").nth(1).setInputFiles('./tests/forward-facing-niko-oneshot-isnt-real-it-cant-hurt-you-v0-3ggf23q4ijcf1.webp');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.locator('fieldset').filter({ hasText: 'Public? Yes No' }).getByLabel('No').check();
  await page.locator('fieldset').filter({ hasText: 'Hide creators? Yes No' }).getByLabel('No').check();
  await page.getByRole('button', { name: 'Create' }).click();

}