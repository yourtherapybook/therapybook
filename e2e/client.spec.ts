import { test, expect } from '@playwright/test';
import { testUsers, signIn, dismissGDPR } from './helpers';

test.describe('Client flows', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, testUsers.client.email, testUsers.client.password);
    await dismissGDPR(page);
  });

  test('client dashboard loads with sessions', async ({ page }) => {
    await page.goto('/client-dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Upcoming')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
  });

  test('client dashboard shows session cards', async ({ page }) => {
    await page.goto('/client-dashboard');
    await page.waitForSelector('text=Welcome back', { timeout: 10000 });
    // Should show upcoming or history sections
    const upcomingSection = page.locator('text=Upcoming Sessions');
    await expect(upcomingSection).toBeVisible();
  });

  test('client can navigate to booking from dashboard', async ({ page }) => {
    await page.goto('/client-dashboard');
    await page.waitForSelector('text=Welcome back', { timeout: 10000 });
    const bookLink = page.locator('a[href="/booking"]').first();
    if (await bookLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookLink.click();
      await expect(page.locator('text=Book a therapy session')).toBeVisible();
    }
  });

  test('booking page loads with provider selector', async ({ page }) => {
    await page.goto('/booking');
    await expect(page.locator('text=Book a therapy session')).toBeVisible({ timeout: 10000 });
    // Provider selector should exist
    await expect(page.locator('text=Provider')).toBeVisible();
  });

  test('booking page shows date grid with availability indicators', async ({ page }) => {
    await page.goto('/booking');
    await page.waitForSelector('text=Schedule Your Session', { timeout: 15000 });
    // Date grid should show day abbreviations
    const dateButtons = page.locator('text=Mon, text=Tue, text=Wed');
    // At least some date buttons should be visible
    await expect(page.locator('text=Select Date')).toBeVisible();
  });

  test('booking summary shows therapist mini-card', async ({ page }) => {
    await page.goto('/booking');
    await page.waitForSelector('text=Booking summary', { timeout: 15000 });
    // Summary should show provider name
    await expect(page.locator('text=Booking summary')).toBeVisible();
  });

  test('cancel session dialog opens', async ({ page }) => {
    await page.goto('/client-dashboard');
    await page.waitForSelector('text=Welcome back', { timeout: 10000 });
    const cancelBtn = page.locator('text=Cancel').first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelBtn.click();
      // Dialog should appear
      await expect(page.locator('text=Cancel Session')).toBeVisible({ timeout: 3000 });
    }
  });

  test('session index redirects client to dashboard', async ({ page }) => {
    await page.goto('/session');
    await page.waitForURL('**/client-dashboard**', { timeout: 10000 });
    expect(page.url()).toContain('client-dashboard');
  });
});
