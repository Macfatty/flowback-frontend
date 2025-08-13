import { test, expect } from '@playwright/test';

test('Kanban', async ({ page }) => {
  await page.goto(`/login`);

  await page.fill('input[name="email"]', 'a@a.se');
  await page.fill('input[name="password"]', 'a');

  await page.click('button[type="submit"]');

  // await expect(page).toHaveURL('/home');

  // Navigate to the kanban page
  await page.goto('/kanban');
  await expect(page).toHaveURL('/kanban');

  // Check if the kanban board is visible
  const kanbanBoard = await page.locator('#kanban-board');
  await expect(kanbanBoard).toBeVisible();

  const doneButton = await page.locator('#Done-add');
  await expect(doneButton).toBeVisible();
  
  doneButton.click();
  const createModal = await page.locator('#create-kanban-entry-modal');
  await expect(createModal).toBeVisible();
  
  await page.locator('#textinput-Title').fill('test kanban');
  await page.locator('#textarea-default').fill('test kanban description');

  await page.click('button[type="submit"]');
  await expect(createModal).toBeHidden();

  // await page.locator('.flex > .text-sm').first().click();
  // await page.getByLabel('Title * 0/').click();
  // await page.getByLabel('Title * 0/').fill('test kanban');
  // await page.getByPlaceholder('No end date set').click();
  // await page.getByPlaceholder('No end date set').fill('2028-08-13T13:52');
  // await page.locator('form').filter({ hasText: 'Title * 11/100 Description 0/' }).getByRole('combobox').selectOption('5');
  // await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  // await page.getByRole('button', { name: 'test kanban Very high' }).click();
  // await expect(page.locator('ul').filter({ hasText: 'test kanban Thu, 10 september' }).locator('#popup-modal')).toBeVisible();
  // await page.getByRole('button', { name: 'Edit', exact: true }).click();

});