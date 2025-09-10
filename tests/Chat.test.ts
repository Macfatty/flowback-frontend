import { test, expect, firefox, chromium } from '@playwright/test';
import { login, logout } from './generic';
import { createGroup, gotoGroup, joinGroup } from './group';

test('Group-Chat', async ({ page }) => {
    await login(page);

    const group = { name: "Test Group Delegation", public: false }

    await createGroup(page, group);

    await page.waitForTimeout(2000);

    const browser = await chromium.launch();
    const bContext = await browser.newContext();
    const bPage = await bContext.newPage();

    await login(bPage, { email: 'b@b.se', password: 'b' });
    await joinGroup(bPage, group);

    await page.getByRole('button', { name: 'open chat' }).click();
    await page.getByPlaceholder('Search chatters').click();
    await page.getByPlaceholder('Search chatters').fill('Test Group');
    await page.getByPlaceholder('Search chatters').press('Enter');
    await page.getByRole('button', { name: 'avatar Test Group Delegation' }).click();
    await page.getByPlaceholder('Write a message...').click();
    await page.getByPlaceholder('Write a message...').fill('Hello!! :D');
    await page.locator('form > button:nth-child(3)').click();
    await page.getByPlaceholder('Write a message...').click();

    await bPage.getByRole('button', { name: 'open chat' }).click();
    await bPage.getByPlaceholder('Search chatters').click();
    await bPage.getByPlaceholder('Search chatters').fill('Test Group');
    await bPage.getByPlaceholder('Write a message...').fill('Hello!! :D');
    await bPage.getByPlaceholder('Write a message...').press('Enter');
    
    await expect(page.getByText('Hello!! :D').nth(1)).toBeVisible();
    await expect(page.getByText('Hello!! :D').nth(2)).toBeVisible();
    
    await expect(bPage.getByText('Hello!! :D').nth(1)).toBeVisible();
    await expect(bPage.getByText('Hello!! :D').nth(2)).toBeVisible();

});