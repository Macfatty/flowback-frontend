import { test, expect } from '@playwright/test';
import { login, createGroup, deleteGroup } from './generic';

test('Create-Delete-Group', async ({ page }) => {
    await login(page);

    const group = { name: 'Test Group Group-Test', public: false };
    await createGroup(page, group);

    // Attempting to leave group as owner 
    await page.getByRole('button', { name: 'Leave group' }).click();
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await expect(page.getByText('Group owner isn\'t allowed to')).toBeVisible();
    await page.getByRole('button', { name: 'No', exact: true }).click();

    // Workgroup testing
    await page.getByRole('button', { name: 'Work Groups' }).click();
    await page.getByRole('button', { name: '+ Add Group' }).click();
    await page.getByLabel('Name * 0/').click();
    await page.getByLabel('Name * 0/').fill('Test Workgroup directjoin');
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await page.getByRole('button', { name: 'Join', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Group' }).click();
    await page.getByLabel('No').check();
    await page.getByLabel('Name * 0/').click();
    await page.getByLabel('Name * 0/').fill('Test group invite only');
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await page.getByRole('button', { name: 'Ask to join' }).click();
    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Leave', exact: true }).nth(0)).toBeVisible();
    await page.getByRole('button', { name: 'Add User' }).nth(0).click();
    await page.getByText('Test Workgroup directjoin Members: 1').nth(0);
    await page.getByText('Test Workgroup directjoin Members: 1').nth(0).getByRole('button').nth(1).click();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByText('Test Workgroup directjoin Members: 1').nth(0).getByRole('button').nth(1).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.locator('.dark\\:text-darkmodeText > .text-center').nth(1).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    // Editing Group
    await expect(page.locator('#group-header-title')).toHaveText(group.name);
    await page.getByRole('button', { name: 'Edit Group' }).click();

    // Create, deactive and delete permission
    await page.getByRole('button', { name: 'Permissions' }).click();
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByLabel('Role name * 0/').click();
    await page.getByLabel('Role name * 0/').fill('Test Permission');
    await page.getByLabel('Role name * 15/').click();
    await page.locator('.slider').first().click();
    const indexes = [4, 5, 6, 11, 12, 13, 14, 16, 17, 18, 9, 8, 7, 10, 15, 19];
    for (const index of indexes) {
        await page.locator(`div:nth-child(${index}) > .switch > .slider`).click();
    }

    await page.getByRole('button', { name: 'Create Role' }).click();
    await page.getByRole('button', { name: 'Assign' }).click();
    await page.getByRole('listitem').locator('svg').click();
    await page.getByRole('button', { name: 'Test Permission' }).nth(0).click();
    await expect(page.locator('li > div > div').filter({ hasText: "Test Permission Admin" }).getByRole('button')).toBeVisible();
    // await expect(page.getByRole('listitem', { name: "Test Permission" }).nth(0)).toBeVisible();
    await page.getByRole('listitem').getByRole('button').nth(1).click();
    // await page.getByRole('button', { name: 'Delete', exact: true }).click();

    // Create, deactive and delete area
    await page.getByRole('button', { name: 'Areas' }).click();
    await page.getByLabel('Tag * 0/').click();
    await page.getByLabel('Tag * 0/').fill('Test Tag');
    await page.getByLabel('Description  0/').click();
    await page.getByLabel('Description  0/').fill('Test tag description');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.locator('div:nth-child(3) > div').first()).toHaveText('Test Tag');
    await page.locator('.slider').first().click();
    await page.locator('.text-red-500').first().click();
    await page.getByRole('button', { name: 'No', exact: true }).click();
    await page.locator('.text-red-500').first().click();
    await page.getByRole('button', { name: 'Yes', exact: true }).click();

    await deleteGroup(page, group)

});