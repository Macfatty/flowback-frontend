import { test, expect } from '@playwright/test';
import { login } from './generic';
import { createGroup, createPermission, deleteGroup, gotoGroup, joinGroup } from './group';

const group = { name: "Test Group Group-Testing", public: true }

test('Create Group', async ({ page }) => {
    await login(page)
    await createGroup(page, group)
})

test('Go To Group', async ({ page }) => {
    await login(page)
    await gotoGroup(page, group)
})

test('Join Group', async ({ page }) => {
    await login(page, { email: "b@b.se", password: "b" })
    await joinGroup(page, group)
})

test('Delete Group', async ({ page }) => {
    await login(page)
    await gotoGroup(page, group)
    await deleteGroup(page)
})


test('Create-Delete-Group', async ({ page }) => {
    await login(page);

    const rand = Math.random().toString(36).slice(2, 10);
    const group = { name: 'Test Group Group-Test-' + rand, public: false };
    await createGroup(page, group);

    // Attempting to leave group as owner 
    await page.getByRole('button', { name: 'Leave group' }).click();
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await expect(page.getByText('Group owner isn\'t allowed to')).toBeVisible();
    await page.getByRole('button', { name: 'No', exact: true }).click();

    // Workgroup testing
    await page.getByRole('button', { name: 'Work Groups' }).click();
    await page.getByRole('button', { name: '+ Add Workgroup' }).click();
    await page.getByLabel('Name * 0/').click();
    await page.getByLabel('Name * 0/').fill('Test Workgroup directjoin');
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await page.getByRole('button', { name: 'Join', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Workgroup' }).click();
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
    await createPermission(page, group, [4, 5, 6, 11, 12, 13, 14, 16, 17, 18, 9, 8, 7, 10, 15, 19]);

    await page.getByRole('button', { name: 'Assign' }).click();
    await page.getByRole('button', { name: 'List' }).click();
    await page.locator('[id="delete-permission-button Test Permission"]').click();
    await page.getByRole('button', { name: 'Delete', exact: true }).nth(1).click();
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