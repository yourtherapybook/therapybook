import { Page, expect } from '@playwright/test';

const TEST_PASSWORD = 'TherapyBook123!';

export const testUsers = {
  client: { email: 'qa.client.verified@therapybook.test', password: TEST_PASSWORD },
  clientReturning: { email: 'qa.client.returning@therapybook.test', password: TEST_PASSWORD },
  clientUnverified: { email: 'qa.client.unverified@therapybook.test', password: TEST_PASSWORD },
  trainee: { email: 'qa.trainee.available@therapybook.test', password: TEST_PASSWORD },
  traineeBooked: { email: 'qa.trainee.booked@therapybook.test', password: TEST_PASSWORD },
  admin: { email: 'qa.admin@therapybook.test', password: TEST_PASSWORD },
  supervisor: { email: 'qa.supervisor@therapybook.test', password: TEST_PASSWORD },
};

export async function signIn(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Sign in")');
  // Wait for redirect away from sign-in page
  await page.waitForURL((url) => !url.pathname.includes('/auth/signin'), { timeout: 10000 });
}

export async function signOut(page: Page) {
  // Navigate to homepage and look for sign-out mechanism
  await page.goto('/');
  // Clear cookies to sign out
  await page.context().clearCookies();
}

export async function dismissGDPR(page: Page) {
  const decline = page.locator('button:has-text("Decline")');
  if (await decline.isVisible({ timeout: 2000 }).catch(() => false)) {
    await decline.click();
  }
}
