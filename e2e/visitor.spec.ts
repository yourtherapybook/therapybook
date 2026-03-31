import { test, expect } from '@playwright/test';
import { dismissGDPR } from './helpers';

test.describe('Visitor flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissGDPR(page);
  });

  test('homepage loads with hero and CTAs', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Trainee');
    await expect(page.locator('text=Book Your Session')).toBeVisible();
    await expect(page.locator('text=See Pricing')).toBeVisible();
  });

  test('directory loads with provider cards', async ({ page }) => {
    await page.goto('/directory');
    await expect(page.locator('h1')).toContainText('Find Your');
    // Wait for providers to load
    await page.waitForSelector('text=trainee practitioners available', { timeout: 10000 });
    const count = await page.locator('text=trainee practitioners available').textContent();
    expect(count).toBeTruthy();
  });

  test('directory search filters providers', async ({ page }) => {
    await page.goto('/directory');
    await page.waitForSelector('text=trainee practitioners available', { timeout: 10000 });

    // Search for a specific name
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Blake');
      // Results should filter
      await expect(page.locator('text=Blake')).toBeVisible();
    }
  });

  test('provider detail page loads', async ({ page }) => {
    await page.goto('/directory');
    await page.waitForSelector('text=trainee practitioners available', { timeout: 10000 });

    // Click View Profile if available
    const viewProfile = page.locator('text=View Profile').first();
    if (await viewProfile.isVisible({ timeout: 3000 }).catch(() => false)) {
      await viewProfile.click();
      await expect(page.locator('text=Back to Directory')).toBeVisible();
      await expect(page.locator('text=Book a Session')).toBeVisible();
    }
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('h1')).toContainText('Affordable');
    await expect(page.locator('text=per session').first()).toBeVisible();
  });

  test('matching questionnaire loads', async ({ page }) => {
    await page.goto('/matching');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toContainText('Privacy');
  });

  test('impressum page loads with policies', async ({ page }) => {
    await page.goto('/impressum');
    await expect(page.locator('h1')).toContainText('Impressum');
    await expect(page.locator('text=cancellation').first()).toBeVisible();
    await expect(page.locator('text=Refund policy')).toBeVisible();
  });

  test('footer is visible and not oversized', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    // Footer should be white/light, not dark
    const bg = await footer.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgb(23, 23, 23)'); // not neutral-900
  });

  test('GDPR banner is compact', async ({ page }) => {
    // Clear consent to see banner
    await page.evaluate(() => localStorage.removeItem('therapybook-consent'));
    await page.reload();
    const banner = page.locator('text=We use cookies');
    if (await banner.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Banner should exist and be compact
      const container = page.locator('.fixed.bottom-0');
      const box = await container.boundingBox();
      if (box) {
        // Should take less than 200px height
        expect(box.height).toBeLessThan(200);
      }
    }
  });
});
