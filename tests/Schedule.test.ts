import { test, expect } from '@playwright/test';
import { login } from './generic';

test('Create-Delete-Schedule-Event', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Ok' }).click();

    await page.getByRole('link', { name: 'Schedule' }).click();
    await page.getByRole('button', { name: '15' }).dblclick();
    await page.getByLabel('Title').fill('Event at 15:th');
    await page.getByLabel('Description').fill('This is a test event at 15:th');
    await page.getByLabel('End Date').click();
    await page.getByLabel('End Date').fill('2026-08-18T00:01');
    await page.getByLabel('Meeting Link').click();
    await page.getByLabel('Meeting Link').fill('hshshsh');
    
    // await page.getByRole('button', { name: 'Create', exact: true }).click();


});