import test from '@playwright/test';
import { joinGroup, login, logout, gotoGroup, createGroup, deleteGroup } from './generic';

test('Login', async ({ page }) => {
  await login(page)
})

test('Logout', async ({ page }) => {
  await login(page)
  await logout(page)
})

test('Create Group', async ({ page }) => {
  await login(page)
  await createGroup(page)
})

test('Go To Group', async ({ page }) => {
  await login(page)
  await gotoGroup(page)
})

test('Join Group', async ({ page }) => {
  await login(page)
  await joinGroup(page)
})

test('Delete Group', async ({ page }) => {
  await login(page)
  await deleteGroup(page)
})
