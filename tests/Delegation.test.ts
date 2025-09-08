import { test, expect } from '@playwright/test';
import { createGroup, gotoGroup, login, logout } from './generic';
import { createPoll, createProposal, delegateVote, fastForward } from './poll';

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

    await gotoGroup(page);

    await createPoll(page, { title: 'Test Poll for Delegation' });

    await fastForward(page, 1);

    await createProposal(page);

    await fastForward(page, 3);

    await delegateVote(page);

    await logout(page);

    await login(page, { email: 'b@b.se', password: 'b' });

});