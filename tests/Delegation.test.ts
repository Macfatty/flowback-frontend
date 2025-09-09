import { test, expect, firefox, chromium } from '@playwright/test';
import { login, logout } from './generic';
import { createPoll, createProposal, delegateVote, fastForward, goToPost } from './poll';
import { createGroup, gotoGroup, joinGroup } from './group';

test('Delegation', async ({ page }) => {
    await login(page);

    const group = { name: "Test Group Delegation", public: false }

    await createGroup(page, group);

    await page.waitForTimeout(2000);

    await page.getByRole('link', { name: 'Delegations' }).click();
    await page.locator('#delegate-group-select').selectOption({ label: group.name });
    await expect(page.getByRole('button', { name: 'Become delegate' })).toBeVisible();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Become delegate' }).click();
    // await page.waitForTimeout(300);

    // Check if already a delegate
    if (await page.getByRole('button', { name: 'Stop being delegate' }).isVisible()) {
        await page.getByRole('button', { name: 'Stop being delegate' }).click();
    }

    // await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Become delegate' }).nth(1).click();
    // await page.waitForTimeout(300);
    // await expect(page.getByRole('button', { name: 'Stop being delegate' })).toBeVisible();
    // await page.getByRole('button', { name: 'Stop being delegate' }).click();
    // await page.getByRole('button', { name: 'Become delegate' }).nth(1).click();
    await expect(page.getByRole('button', { name: 'Stop being delegate' })).toBeVisible();

    await gotoGroup(page, group);

    const title = `Test Poll for Delegation ${Math.floor(Math.random() * 10000)}`;
    await createPoll(page, { title });

    await fastForward(page, 1);

    await createProposal(page);

    await fastForward(page, 3);

    await delegateVote(page);

    const browser = await chromium.launch();
    const bContext = await browser.newContext();
    const bPage = await bContext.newPage();

    await login(bPage, { email: 'b@b.se', password: 'b' });
    await joinGroup(bPage, group);


    await bPage.getByRole('link', { name: 'Delegations' }).click();
    await bPage.locator('#delegate-group-select').selectOption({ label: group.name });
    await bPage.getByRole('button', { name: 'Uncategorised' }).click();
    await bPage.getByRole('radio').first().check();

    await goToPost(bPage, { title });

    

});