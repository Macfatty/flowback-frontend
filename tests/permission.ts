import { expect } from "@playwright/test";
import { gotoGroup } from "./group";

export async function createPermission(page: any, group = { name: 'Test Group', public: false }, permissions = [0], permission_name = "Test Permission") {
    try {
        await expect(page.getByRole('heading', { name: 'Admin Settings' })).toBeVisible();
    }
    catch {
        gotoGroup(page, group)
        await page.getByRole('button', { name: 'Edit Group' }).click();
    }
    // Create, deactive and delete permission
    await page.getByRole('button', { name: 'Permissions' }).click();
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByLabel('Role name * 0/').click();
    await page.getByLabel('Role name * 0/').fill(permission_name);
    await page.getByLabel('Role name * 15/').click();
    await page.locator('.slider').first().click();
    for (const index of permissions) {
        await page.locator(`div:nth-child(${index}) > .switch > .slider`).click();
    }
    await page.getByRole('button', { name: 'Create Role' }).click();
}

export async function assignPermission(page: any, group = { name: 'Test Group', public: false }, permission_name = "Test Permission") {
    try {
        await expect(page.getByRole('heading', { name: 'Admin Settings' })).toBeVisible();
    }
    catch {
        gotoGroup(page, group)
        await page.getByRole('button', { name: 'Edit Group' }).click();
    }

    await page.getByRole('button', { name: 'Permissions' }).click();
    await page.getByRole('button', { name: 'Assign' }).click();
    await page.getByRole('listitem').filter({ hasText: 'b Member Make admin b default' }).locator('svg').click();
    await page.getByRole('listitem').locator(`id=permission-Test Permission`).nth(1).click();

    await expect(page.getByText('Successfully updated permission')).toBeVisible();
}