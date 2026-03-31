import { test, expect } from '@playwright/test';
import { testUsers, signIn, dismissGDPR } from './helpers';

test.describe('Client flows', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, testUsers.client.email, testUsers.client.password);
    await dismissGDPR(page);
  });

  test('client dashboard loads', async ({ page }) => {
    await page.goto('/client-dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
  });

  test('client dashboard shows KPI cards', async ({ page }) => {
    await page.goto('/client-dashboard');
    await page.waitForSelector('text=Welcome back', { timeout: 10000 });
    // KPI cards exist
    await expect(page.locator('text=Total')).toBeVisible();
  });

  test('client dashboard shows session sections', async ({ page }) => {
    await page.goto('/client-dashboard');
    await page.waitForSelector('text=Welcome back', { timeout: 10000 });
    await expect(page.locator('text=Upcoming Sessions').first()).toBeVisible();
    await expect(page.locator('text=Session History').first()).toBeVisible();
  });

  test('booking page loads with provider selector', async ({ page }) => {
    await page.goto('/booking');
    await expect(page.locator('text=Book a therapy session')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Select Date')).toBeVisible({ timeout: 15000 });
  });

  test('booking page shows booking summary', async ({ page }) => {
    await page.goto('/booking');
    await expect(page.locator('text=Booking summary')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Total')).toBeVisible();
  });

  test('session index redirects client to dashboard', async ({ page }) => {
    await page.goto('/session');
    await page.waitForURL('**/client-dashboard**', { timeout: 10000 });
    expect(page.url()).toContain('client-dashboard');
  });

  test('account section visible on dashboard', async ({ page }) => {
    await page.goto('/client-dashboard');
    await page.waitForSelector('text=Welcome back', { timeout: 10000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('text=Account').first()).toBeVisible({ timeout: 5000 });
  });
});
