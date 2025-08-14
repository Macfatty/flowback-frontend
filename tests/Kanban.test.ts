import { test, expect } from '@playwright/test';

test('Kanban-User', async ({ page }) => {
  await page.goto(`/login`);

  const login = page.locator('#login-page');
  expect(login).toBeVisible();
  await page.waitForTimeout(400);

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
  await page.waitForTimeout(400);
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
  await page.waitForTimeout(400);

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


test('Kanban-Delete', async ({ page }) => {
  await page.goto(`/login`);

  const login = page.locator('#login-page');
  expect(login).toBeVisible();
  await page.waitForTimeout(600);

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

  //n-th member of done-kanban-lane
  const doneLane = await page.locator('#Done-kanban-lane');
  await page.waitForTimeout(1000);

  const kanbanEntry = page.locator('#Evaluation-kanban-lane > ul > button').first();
  await expect(kanbanEntry).toBeVisible();

  await kanbanEntry.click();
  await page.waitForTimeout(300);

  const editButton = await page.locator('#Edit');
  editButton.click();

  const deleteButton = await page.locator('#Delete');
  await expect(deleteButton).toBeVisible();
  
  page.locator('#cookies-accept').click();

  await deleteButton.click();
  await expect(kanbanEntry).toBeHidden();
});