import { test, expect } from '@playwright/test';
import { uiLogin } from './fixtures';

test('Create-Poll', async ({ page }) => {
    await uiLogin(page);

    await page.locator('#groups').click();

    await expect(page.locator('#groups-list')).toBeVisible();

    const groupLink = page.locator('#groups-list a[href^="/groups/"]').first();
    await expect(groupLink).toBeVisible();
    groupLink.click();

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