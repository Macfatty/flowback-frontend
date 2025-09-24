import test, { expect } from "@playwright/test";
import { createGroup, createPermission, deleteGroup, gotoGroup, joinGroup } from "./group";
import { login, newWindow } from "./generic";

test('Create-Permission-Full', async ({ page }) => {
    await login(page);

    const rand = Math.random().toString(36).slice(2, 10);
    const group = { name: 'Test Group Permissions ' + rand, public: true };
    await createGroup(page, group);

    await expect(page.locator('#group-header-title')).toHaveText(group.name);
    await page.getByRole('button', { name: 'Edit Group' }).dispatchEvent('click');;

    await createPermission(page, group, [4, 5, 6, 11, 12, 13, 14, 16, 17, 18, 9, 8, 7, 10, 15, 19]);

});

test('Create-Permission-None', async ({ page }) => {
    await login(page);

    const rand = Math.random().toString(36).slice(2, 10);
    const group = { name: 'Test Group Permissions ' + rand, public: true };
    await createGroup(page, group);

    await expect(page.locator('#group-header-title')).toHaveText(group.name);

    const bPage = await newWindow();

    await login(bPage, { email: 'b@b.se', password: 'b' });
    await joinGroup(bPage, group);

    await page.getByRole('button', { name: 'Edit Group' }).click();

    await createPermission(page, group, []);

    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Assign' }).click();
    await page.getByRole('listitem').filter({ hasText: 'b Member Make admin b default' }).locator('path').click();
    await page.getByRole('button', { name: 'Test Permission' }).click();

    await page.waitForTimeout(500);
    await gotoGroup(bPage, group);

    await bPage.locator('#create-a-post-sidebar-button').waitFor();
    await expect(bPage.locator('#create-a-post-sidebar-button').isDisabled()).toBeTruthy();

    await deleteGroup(page, group);
});