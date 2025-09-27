import { test, expect } from '@playwright/test';

test('Business User Simple Journey', async ({ page }) => {
  // Step 1: Landing page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/simple-01-landing-page.png' });
  await expect(page.locator('text=KOL Matching Platform')).toBeVisible();
  await page.click('text=Sign In');

  // Step 2: Sign in
  await page.waitForURL(/.*signin/);
  await page.screenshot({ path: 'test-results/simple-02-signin-page.png' });
  
  await page.fill('input[name="email"]', 'techcorp@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // Wait for navigation after login
  await Promise.all([
    page.waitForURL(/.*dashboard/, { timeout: 15000 }),
    page.click('button[type="submit"]')
  ]);

  // Step 3: Dashboard
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/simple-03-business-dashboard.png' });
  
  // Check if we're logged in by looking for navigation
  const navigation = page.locator('[data-testid="nav-campaigns"]');
  await expect(navigation).toBeVisible();

  // Step 4: Navigate to Campaigns
  await navigation.click();
  await page.waitForURL(/.*campaigns/);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/simple-04-campaigns-page.png' });

  // Step 5: Check if Create Campaign button exists
  const createButton = page.locator('text=Create Campaign');
  await expect(createButton).toBeVisible();
  await page.screenshot({ path: 'test-results/simple-05-create-button-visible.png' });

  // Step 6: Navigate to Discover
  const discoverButton = page.locator('[data-testid="nav-discover"]');
  await discoverButton.click();
  await page.waitForURL(/.*discover/);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/simple-06-discover-page.png' });

  // Step 7: Check if search functionality exists
  const searchInput = page.locator('input[placeholder*="Search"]');
  await expect(searchInput).toBeVisible();

  // Step 8: Sign out
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Sign Out');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/simple-07-signed-out.png' });

  console.log('Simple business user journey completed successfully');
});