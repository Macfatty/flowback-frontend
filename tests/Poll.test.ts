import { test, expect } from '@playwright/test';
import { uiLogin } from './fixtures';

test('Create-Poll', async ({ page }) => {
    await uiLogin(page);

    await page.locator('#groups').click();

    await expect(page.locator('#groups-list')).toBeVisible();

    const groupLink = page.locator('#groups-list a[href^="/groups/"]').nth(0);
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

    await page.locator('#poll-header-multiple-choices').nth(0).click();
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
    // await page.getByRole('button', { name: 'Add Proposal' }).click();

    await page.getByRole('textbox', { name: 'Title * 0/' }).click();
    await page.getByRole('textbox', { name: 'Title * 0/' }).fill('Proposal Test 3');
    await page.getByText('Description 0/').click();
    await page.getByLabel('Description  0/').click();
    await page.getByLabel('Description  0/').fill('Proposal Test 3');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Successfully added proposal')).toBeVisible();
    // await page.getByRole('button', { name: 'Proposal Test 3 Proposal Test' }).click();

    await page.locator('#poll-header-multiple-choices').nth(0).click();
    await page.getByRole('button', { name: 'Fast Forward' }).click();

    // Prediction Statement Phase
    await page.waitForTimeout(600);
    await page.getByRole('button', { name: 'See More' }).nth(1).click();
    await page.getByRole('button', { name: 'See More' }).nth(0).click();

    await page.locator('.border-b-2 > .dark\\:bg-darkobject > div > button').nth(0).click();
    await page.locator('.mt-4 > div:nth-child(2) > .dark\\:bg-darkobject > div > button').nth(0).click();

    await page.getByRole('button', { name: 'Create Consequence' }).nth(0).click();
    await page.getByRole('textbox', { name: 'Title * 0/' }).click();
    await page.getByRole('textbox', { name: 'Title * 0/' }).fill('Prediction 1');
    await page.getByLabel('Description  0/').click();
    await page.getByLabel('Description  0/').fill('Prediction 1');
    await page.getByPlaceholder('-12-31 23:00:00').click();
    await page.getByRole('combobox').nth(2).selectOption('2029');
    await page.locator('div').filter({ hasText: /^18$/ }).click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Successfully created')).toBeVisible();


    await page.locator('#poll-header-multiple-choices').nth(0).click();
    await page.getByRole('button', { name: 'Fast Forward' }).click();

    //Prediction Betting
    await page.locator('div').filter({ hasText: 'Current: Phase 4. Consequence' }).nth(2).click();
    await page.locator('div').filter({ hasText: 'See More' }).nth(0).click();

    await page.getByRole('button', { name: 'See More' }).nth(1).click();
    await page.locator('#track-container > div:nth-child(3)').click();
    await expect(page.getByText('Probability successfully sent')).toBeVisible();
    await page.locator('#track-container > div:nth-child(5)').click();
    await page.getByRole('button', { name: 'See More' }).nth(0).click();
    await expect(page.locator('#track-container')).toBeVisible();

    await page.locator('#track-container > div').nth(5).click();
    await expect(page.getByText('Probability successfully sent').nth(0)).toBeVisible();
    await page.getByRole('button', { name: 'See More' }).nth(1).click();
    await expect(page.locator('#track-container > div:nth-child(8)')).toBeVisible();
    await page.locator('#track-container > div:nth-child(6)').click();
    await page.locator('#track-container > div:nth-child(5)').click();
    await page.getByRole('button', { name: 'Clear probability' }).click();
    await page.locator('#track-container > div:nth-child(4)').click();
    await expect(page.locator('#popup-4').getByText('Probability successfully sent')).toBeVisible();
    await page.locator('#popup-5').getByText('Probability successfully sent').click();
    await page.locator('#popup-6').getByText('Probability successfully sent').click();



    await page.locator('#poll-header-multiple-choices').nth(0).click();
    await page.getByRole('button', { name: 'Fast Forward' }).click();

    // Delegate Voting Phase
    await page.locator('div').filter({ hasText: 'Current: Phase 5. Delegate' }).nth(2).click();
    await page.getByRole('button', { name: 'See more' }).nth(0).click();
    await page.getByText('Successfully voted').isVisible();


    await page.locator('#track-container > div:nth-child(4)').first().click();
    await page.locator('div:nth-child(2) > div > div:nth-child(3) > #track-container > div:nth-child(6)').click();

    await page.getByRole('button', { name: 'See More' }).nth(0).click();
    // await expect(page.getByText('Probability: 80%')).toBeVisible();
    await page.getByRole('button', { name: 'See More' }).nth(1).click();
    // await expect(page.getByText('Probability: 40%')).toBeVisible();


    
    await page.locator('#poll-header-multiple-choices').nth(0).click();
    await page.getByRole('button', { name: 'Fast Forward' }).click();
    // Voting Phase

    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Fast Forward' }).click();
    // Results Phase

    await expect(page.getByText('Results', { exact: true })).toBeVisible();

    await page.locator('canvas').click({
        position: {
            x: 43,
            y: 92
        }
    });
    await expect(page.getByText('Current: Phase 7. Results and')).toBeVisible();
});