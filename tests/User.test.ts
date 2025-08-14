import { test, expect } from '@playwright/test';
import { login } from './generic';

test('Edit User', async ({ page }) => {
    login(page);
    await page.getByRole('button', { name: 'default pfp' }).click();
    await page.getByRole('button', { name: 'User Profile', exact: true }).click();
    await page.getByRole('button').nth(3).click();
    await page.getByLabel('Name  1/').click();
    await page.getByLabel('Name  1/').fill('a edited');
    await page.getByLabel('Website  0/').click();
    await page.getByLabel('Website  0/').fill('http://www.google.com');
    await page.getByLabel('Mail  0/').click();
    await page.getByLabel('Mail  0/').fill('email@email.com');
    await page.getByLabel('Bio  0/').click();
    await page.getByLabel('Bio  0/').fill('I like pancakes :3');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByLabel('Name  8/').click();
    await page.getByLabel('Name  8/').press('Control+ArrowLeft');
    await page.getByLabel('Name  8/').fill('a_edited');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Profile successfully updated')).toBeVisible();
    await expect(page.getByText('a_edited')).toBeVisible();
    await expect(page.getByText('I like pancakes :')).toBeVisible();
    await page.getByRole('button', { name: 'default pfp' }).click();
    await page.getByRole('button', { name: 'Log Out', exact: true }).click();
    await expect(page.getByRole('img', { name: 'flowback logo' })).toBeVisible();

});