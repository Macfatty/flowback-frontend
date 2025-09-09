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

    await expect(page).toHaveURL('/home?chatOpen=false');

    if (await page.getByRole('button', { name: 'Ok' }).isVisible()) {
        await page.getByRole('button', { name: 'Ok' }).click();
    }
}

export async function loginEnter(page: any, {
    email = process.env.E2E_EMAIL ?? 'a@a.se',
    password = process.env.E2E_PASSWORD ?? 'a',
} = {}) {
    await page.goto('/login');
    await expect(page.locator('#login-page')).toBeVisible();
    await page.waitForTimeout(700);

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.getByLabel('Password * 1/').press('Enter');

    await expect(page).toHaveURL('/home?chatOpen=false');
}

export async function logout(page: any) {
    await page.getByRole('button', { name: 'default pfp' }).click();
    await page.getByRole('button', { name: 'Log Out', exact: true }).click();
    await expect(page.getByRole('img', { name: 'flowback logo' })).toBeVisible();
};

export async function createGroup(page: any, group = { name: 'Test Group', public: false }) {
    await page.locator("#groups").click();
    await page.getByPlaceholder('Search groups').click();
    await page.getByPlaceholder('Search groups').fill(group.name);

    // await expect(page.getByRole('heading', { name: group.name, exact: true }).first()).toBeVisible();
    const button = await page.getByRole('heading', { name: group.name, exact: true }).first()
    
    if (await button.isVisible()) {
        await button.click();
    }
    else {
        await page.getByRole('link', { name: 'Groups' }).click();
        await page.getByRole('button', { name: 'Create Group' }).click();
        await page.getByLabel('Title * 0/').click();
        await page.getByLabel('Title * 0/').fill(group.name);
        await page.getByLabel('Description  0/').click();
        await page.getByLabel('Description  0/').fill('Test Group Description');
        await page.locator(".image-upload > input").nth(0).setInputFiles('./tests/forward-facing-niko-oneshot-isnt-real-it-cant-hurt-you-v0-3ggf23q4ijcf1.webp');
        await page.getByRole('button', { name: 'Confirm' }).click();
        await page.waitForTimeout(500);
        await page.locator(".image-upload > input").nth(1).setInputFiles('./tests/forward-facing-niko-oneshot-isnt-real-it-cant-hurt-you-v0-3ggf23q4ijcf1.webp');
        await page.locator("#cropper-confirm").click();
        await page.locator('fieldset').filter({ hasText: 'Public? Yes No' }).getByLabel(group.public ? 'Yes' : 'No').check();
        await page.locator('fieldset').filter({ hasText: 'Hide creators? Yes No' }).getByLabel('No').check();
        await page.getByRole('button', { name: 'Create' }).click();
        try {
            await expect(page.getByRole('button', { name: group.name })).toBeVisible();
        }
        catch {
            await page.getByRole('button', { name: 'Cancel' }).click();
        }
    }
}

export async function gotoGroup(page: any, group = { name: 'Test Group' }) {
    await page.locator("#groups").click();
    await page.getByPlaceholder('Search groups').click();
    await page.getByPlaceholder('Search groups').fill(group.name);
    await page.getByRole('heading', { name: group.name, exact: true }).click();
}

export async function joinGroup(page: any, group = { name: 'Test Group' }) {
    await page.locator('#groups').click();
    await expect(page.locator('#groups-list')).toBeVisible();
    const groupLink = page.locator('#test-group')
    await expect(groupLink).toBeVisible();
    await groupLink.click();
    await page.locator('#groups-list div').filter({ hasText: 'Test Group Test Group' }).locator('#group-join-button').click();
}

export async function deleteGroup(page: any, group = { name: 'Test Group', public: false }) {
    // Deleting Group
    await page.getByRole('button', { name: 'Edit Group' }).click();
    await page.getByRole('button', { name: 'Delete Group' }).click();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Delete Group' }).click();
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await expect(page).toHaveURL('/groups');
}

export async function createArea(page: any, group = { name: 'Test Group', public: false }, tag = "Test Tag") {
    await page.getByRole('button', { name: 'Edit Group' }).click();
    await expect(page.getByRole('button', { name: 'Areas' })).toBeVisible();
    await page.getByRole('button', { name: 'Areas' }).click();
    await page.getByLabel('Tag * 0/').click();
    await page.getByLabel('Tag * 0/').fill(tag);
    await page.getByLabel('Description  0/').click();
    await page.getByLabel('Description  0/').fill('Tag description');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.locator('div:nth-child(3) > div').filter({ hasText: tag })).toHaveText(tag);
}