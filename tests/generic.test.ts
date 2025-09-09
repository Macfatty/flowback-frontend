import test from '@playwright/test';
import { joinGroup, login, logout, gotoGroup, createGroup, deleteGroup, loginEnter, register } from './generic';

test('Login', async ({ page }) => {
  await login(page)
})

test('Login-Enter', async ({ page }) => {
  await loginEnter(page)
})

test('Register', async ({ page }) => {
  await register(page)
})

test('Logout', async ({ page }) => {
  await login(page)
  await logout(page)
})

const group = { name: "Test Group Group-Testing", public: false }

test('Create Group', async ({ page }) => {
  await login(page)
  await createGroup(page, group)
})

test('Go To Group', async ({ page }) => {
  await login(page)
  await gotoGroup(page, group)
})

test('Join Group', async ({ page }) => {
  await login(page)
  await joinGroup(page, group)
})

test('Delete Group', async ({ page }) => {
  await login(page)
  await gotoGroup(page, group)
  await deleteGroup(page)
})
