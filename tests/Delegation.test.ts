import { test, expect } from '@playwright/test';
import { createGroup, gotoGroup, login, logout } from './generic';
import { createPoll, createProposal, delegateVote, fastForward } from './poll';

test('Delegation', async ({ page }) => {
    await login(page);

    await createGroup(page);

    await page.getByRole('link', { name: 'Delegations' }).click();
    await page.getByRole('button', { name: 'Become delegate' }).click();
    await page.getByRole('button', { name: 'Become delegate' }).nth(1).click();
    await page.getByRole('button', { name: 'Stop being delegate' }).click();
    await page.getByRole('button', { name: 'Become delegate' }).nth(1).click();
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