import { test, expect } from '@playwright/test';
import { uiLogin } from './fixtures';

test('Create-Poll', async ({ page }) => {
    await uiLogin(page);

    await page.locator('#groups').click();

    await expect(page.locator('#groups-list')).toBeVisible();

    const groupLink = page.locator('#groups-list a[href^="/groups/"]').first();
    await expect(groupLink).toBeVisible();
    groupLink.click();

    //Create a Poll
    await page.getByRole('button', { name: 'Create a post' }).click();
    await page.getByLabel('Title * 0/').click();
    await page.getByLabel('Title * 0/').fill('Test Poll');
    await page.getByLabel('Description  0/').fill('Test Description');
    await page.getByRole('button', { name: 'Display advanced time settings' }).click();
    await page.locator('fieldset').filter({ hasText: 'Public? Yes No' }).getByLabel('Yes').check();
    await page.locator('fieldset').filter({ hasText: 'Fast Forward? Yes No' }).getByLabel('Yes').check();
    page.locator('#cookies-accept').click();
    await page.getByRole('button', { name: 'Post' }).click();
    await expect(page.getByRole('heading', { name: 'Test Poll' })).toBeVisible();
    await expect(page).toHaveURL(/\/groups\/6\/polls\/\d+$/);

    // Area Phase
    await page.getByRole('radio').check();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Successfully voted for area')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Vote cancelled')).toBeVisible();
    await page.getByRole('radio').check();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Successfully voted for area')).toBeVisible();

    await page.locator('#poll-header-multiple-choices').first().click();
    await page.getByRole('button', { name: 'Fast Forward' }).click();

    //Proposal phase
    await page.getByRole('button', { name: 'Add Proposal' }).click();
    await page.getByRole('textbox', { name: 'Title * 0/' }).click();
    await page.getByRole('textbox', { name: 'Title * 0/' }).fill('Proposal test');
    await page.getByLabel('Description  0/').click();
    await page.getByLabel('Description  0/').fill('Proposal Test');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Add Proposal' }).click();
    await page.getByRole('textbox', { name: 'Title * 0/' }).click();
    await page.getByRole('textbox', { name: 'Title * 0/' }).fill('Proposal Test 2');
    await page.getByText('Description 0/').click();
    await page.getByLabel('Description  0/').click();
    await page.getByLabel('Description  0/').fill('Proposal Test 2');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Successfully added proposal')).toBeVisible();
    await page.getByRole('button', { name: 'Proposal Test 2 Proposal Test' }).click();

    await page.getByRole('textbox', { name: 'Title * 0/' }).click();
    await page.getByRole('textbox', { name: 'Title * 0/' }).fill('Proposal Test 3');
    await page.getByText('Description 0/').click();
    await page.getByLabel('Description  0/').click();
    await page.getByLabel('Description  0/').fill('Proposal Test 3');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Successfully added proposal')).toBeVisible();
    await page.getByRole('button', { name: 'Proposal Test 3 Proposal Test' }).click();

    await page.locator('#poll-header-multiple-choices').first().click();
    await page.getByRole('button', { name: 'Fast Forward' }).click();

    // Prediction Statement Phase
    await page.waitForTimeout(600);
    await page.getByRole('button', { name: 'See More' }).nth(1).click();
    await page.getByRole('button', { name: 'Proposal test 3 Proposal test' }).getByRole('button').first().click();
    await page.getByRole('button', { name: 'See More' }).nth(3).click();
    await page.getByRole('button', { name: 'Proposal Test 2 Proposal Test' }).getByRole('button').first().click();
    await page.getByRole('button', { name: 'Create Consequence' }).click();
    await page.getByRole('textbox', { name: 'Title * 0/' }).click();
    await page.getByRole('textbox', { name: 'Title * 0/' }).fill('Prediction 1');
    await page.getByLabel('Description  0/').click();
    await page.getByLabel('Description  0/').fill('Prediction 1');
    await page.getByPlaceholder('-12-31 23:00:00').click();
    await page.getByRole('combobox').nth(2).selectOption('2029');
    await page.locator('div').filter({ hasText: /^18$/ }).click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Successfully created')).toBeVisible();
});