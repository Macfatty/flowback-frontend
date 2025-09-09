import { expect } from '@playwright/test';

export async function login(page: any, {
    email = process.env.E2E_EMAIL ?? 'a@a.se',
    password = process.env.E2E_PASSWORD ?? 'a',
} = {}) {
    await page.goto('/login');
    await expect(page.locator('#login-page')).toBeVisible();
    await page.waitForTimeout(700);

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/home?chatOpen=false');

    if (await page.getByRole('button', { name: 'Ok' }).isVisible()) {
        await page.getByRole('button', { name: 'Ok' }).click();
    }
}

export async function loginEnter(page: any, {
    email = process.env.E2E_EMAIL ?? 'a@a.se',
    password = process.env.E2E_PASSWORD ?? 'a',
} = {}) {
    await page.goto('/login');
    await expect(page.locator('#login-page')).toBeVisible();
    await page.waitForTimeout(700);

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.getByLabel('Password * 1/').press('Enter');

    await expect(page).toHaveURL('/home?chatOpen=false');
}

// Only works if PUBLIC_EMAIL_REGISTRATION=FALSE in .env
export async function register(page: any) {
    await page.goto('/login');
    await expect(page.locator('#login-page')).toBeVisible();
    await page.waitForTimeout(700);

    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByLabel('Email * 0/').click();
    await page.getByLabel('Email * 0/').fill('a@a.se');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('You must accept terms of')).toBeVisible();
    await page.getByLabel('Yes').check();
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('Email already exists.')).toBeVisible();

    const randomEmail = `${Math.random().toString(36).slice(2, 10)}@aaa.se`;
    await page.getByLabel('Email * 6/').fill(randomEmail);
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('Email Sent')).toBeVisible();
    await expect(page.getByText('Mail Sent')).toBeVisible();

    const registerResponse = await page.waitForResponse((response:any) =>
        response.url().includes('register') && response.status() === 200
    );
}

export async function logout(page: any) {
    await page.getByRole('button', { name: 'default pfp' }).click();
    await page.getByRole('button', { name: 'Log Out', exact: true }).click();
    await expect(page.getByRole('img', { name: 'flowback logo' })).toBeVisible();
};

