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

  if (await page.getByRole('button', { name: 'Ok' }).isVisible()) {
    await page.getByRole('button', { name: 'Ok' }).click();
  }
}

export async function logout(page: any) {
  await page.getByRole('button', { name: 'default pfp' }).click();
  await page.getByRole('button', { name: 'Log Out', exact: true }).click();
  await expect(page.getByRole('img', { name: 'flowback logo' })).toBeVisible();
};

export async function gotoGroup(page: any, group = { name: 'Test Group' }) {
  await page.locator('#groups').click();
  await expect(page.locator('#groups-list')).toBeVisible();
  const groupLink = page.locator('#groups-list > div').nth(0)
  await expect(groupLink).toBeVisible();
  await groupLink.click();
}

export async function joinGroup(page: any, group = { name: 'Test Group' }) {
  await page.locator('#groups').click();
  await expect(page.locator('#groups-list')).toBeVisible();
  const groupLink = page.locator('#test-group')
  await expect(groupLink).toBeVisible();
  await groupLink.click();
  await page.locator('#groups-list div').filter({ hasText: 'Test Group Test Group' }).locator('#group-join-button').click();

}

export async function createGroup(page: any, group = { name: 'Test Group', public_group: false }) {
  await page.getByRole('link', { name: 'Groups' }).click();
  await page.getByRole('button', { name: 'Create Group' }).click();
  await page.getByLabel('Title * 0/').click();
  await page.getByLabel('Title * 0/').fill(group.name);
  await page.getByLabel('Description  0/').click();
  await page.getByLabel('Description  0/').fill('Test Group Description');
  await page.locator(".image-upload > input").nth(0).setInputFiles('./tests/forward-facing-niko-oneshot-isnt-real-it-cant-hurt-you-v0-3ggf23q4ijcf1.webp');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.locator(".image-upload > input").nth(1).setInputFiles('./tests/forward-facing-niko-oneshot-isnt-real-it-cant-hurt-you-v0-3ggf23q4ijcf1.webp');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.locator('fieldset').filter({ hasText: 'Public? Yes No' }).getByLabel(group.public_group ? 'Yes' : 'No').check();
  await page.locator('fieldset').filter({ hasText: 'Hide creators? Yes No' }).getByLabel('No').check();
  await page.getByRole('button', { name: 'Create' }).click();


}


export async function deleteGroup(page: any, group = { name: 'Test Group', public_group: false }) {
  gotoGroup(page, group)
  // Deleting Group
  await page.getByRole('button', { name: 'Edit Group' }).click();
  await page.getByRole('button', { name: 'Delete Group' }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Delete Group' }).click();
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await expect(page).toHaveURL('/groups');
}