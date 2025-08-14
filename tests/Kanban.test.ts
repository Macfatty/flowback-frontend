import { test, expect } from '@playwright/test';

test('Kanban-User', async ({ page }) => {
  await page.goto(`/login`);

  const login = page.locator('#login-page');
  expect(login).toBeVisible();
  await page.waitForTimeout(2000);

  await page.fill('input[name="email"]', 'a@a.se');
  await page.fill('input[name="password"]', 'a');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/home');

  // Navigate to the kanban page
  await page.goto('/kanban');
  await expect(page).toHaveURL('/kanban');

  // Check if the kanban board is visible
  const kanbanBoard = await page.locator('#kanban-board');
  await expect(kanbanBoard).toBeVisible();

  const doneButton = await page.locator('#Done-add');
  await expect(doneButton).toBeVisible();
  await page.waitForTimeout(2000);
  await doneButton.click();

  const createModal = await page.locator('#create-kanban-entry-modal');
  await expect(createModal).toBeVisible();
  await page.locator('#textinput-Title').fill('test kanban');
  await page.locator('#textarea-default').fill('test kanban description');

  await page.click('button[type="submit"]');
  await expect(createModal).toBeHidden();
});

test('Kanban-Group', async ({ page }) => {
  await page.goto(`/login`);

  const login = page.locator('#login-page');
  expect(login).toBeVisible();
  await page.waitForTimeout(2000);

  await page.fill('input[name="email"]', 'a@a.se');
  await page.fill('input[name="password"]', 'a');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/home');

  // Navigate to the kanban page
  // Click on the group button on the header

  await page.locator('#groups').click();

  // Click the first button in the group list
  await page.locator('#groups-list > div').first().first().click();

  await expect(page).toHaveURL('/groups/6');

  await page.locator('#group-tasks-sidebar-button').click();

  await expect(page).toHaveURL('/kanban?groupId=6');

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

  page.locator('#cookies-accept').click();

  await page.click('button[type="submit"]');
  await expect(createModal).toBeHidden();
});