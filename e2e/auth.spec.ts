import { test, expect } from '@playwright/test';
import { testUsers, signIn, dismissGDPR } from './helpers';

test.describe('Authentication flows', () => {
  test('sign in page renders', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('sign in with valid credentials redirects', async ({ page }) => {
    await signIn(page, testUsers.client.email, testUsers.client.password);
    // Should not be on sign-in page anymore
    expect(page.url()).not.toContain('/auth/signin');
  });

  test('sign in with invalid credentials shows error', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'wrong@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Sign in")');
    // Should show error message
    await expect(page.locator('text=incorrect')).toBeVisible({ timeout: 5000 });
  });

  test('register page renders', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('forgot password page renders', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('booking redirects unauthenticated users to sign-in', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/booking');
    await page.waitForURL('**/auth/signin**', { timeout: 10000 });
    expect(page.url()).toContain('/auth/signin');
  });

  test('client dashboard redirects unauthenticated users', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/client-dashboard');
    await page.waitForURL('**/auth/signin**', { timeout: 10000 });
    expect(page.url()).toContain('/auth/signin');
  });

  test('admin redirects non-admin users', async ({ page }) => {
    await signIn(page, testUsers.client.email, testUsers.client.password);
    await page.goto('/admin');
    await page.waitForURL('**/unauthorized**', { timeout: 10000 });
    expect(page.url()).toContain('unauthorized');
  });
});
