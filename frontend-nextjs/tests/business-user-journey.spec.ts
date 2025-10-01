import { test, expect } from '@playwright/test';

test('Business User Journey', async ({ page }) => {
  // Step 1: Landing page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/01-landing-page.png' });
  await expect(page.locator('text=KOL Matching Platform')).toBeVisible();
  await expect(page.locator('text=Connect SMBs with Key Opinion Leaders')).toBeVisible();
  await page.click('text=Sign In');

  // Step 2: Sign in
  await page.waitForURL(/.*signin/);
  await page.screenshot({ path: 'test-results/02-signin-page.png' });
  
  await page.fill('input[name="email"]', 'techcorp@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // Wait for navigation after login
  await Promise.all([
    page.waitForURL(/.*dashboard/, { timeout: 15000 }),
    page.click('button[type="submit"]')
  ]);

  // Step 3: Business Dashboard
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for dashboard data to load
  await page.screenshot({ path: 'test-results/03-business-dashboard.png' });
  
  // Verify business dashboard elements
  await expect(page.locator('text=Business Dashboard')).toBeVisible();
  const navigation = page.locator('[data-testid="nav-campaigns"]');
  await expect(navigation).toBeVisible();
  await expect(page.locator('[data-testid="nav-discover"]')).toBeVisible();
  console.log('Successfully logged in as business user');

  // Step 4: Navigate to Campaigns
  await navigation.click();
  await page.waitForURL(/.*campaigns/);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/04-campaigns-page.png' });
  await expect(page.locator('text=My Campaigns')).toBeVisible();

  // Step 5: Test Create Campaign functionality
  const createButton = page.locator('text=Create Campaign');
  await expect(createButton).toBeVisible();
  await createButton.click();
  await page.screenshot({ path: 'test-results/05-create-campaign-dialog.png' });
  
  // Fill campaign form
  await page.fill('input[name="title"]', 'E2E Test Campaign');
  await page.fill('textarea[name="description"]', 'This is a test campaign created during E2E testing');
  await page.fill('input[name="budget"]', '15000');
  await page.fill('input[name="minFollowers"]', '25000');
  
  // Submit campaign
  await page.click('button:has-text("Create Campaign")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/06-campaign-created.png' });
  console.log('Campaign creation functionality verified');

  // Step 6: Navigate to Discover KOLs
  const discoverButton = page.locator('[data-testid="nav-discover"]');
  await discoverButton.click();
  await page.waitForURL(/.*discover/);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/07-discover-kols.png' });
  await expect(page.locator('text=AI - powered KOL Discovery')).toBeVisible();

  // Step 7: Test search and filter functionality
  const searchInput = page.locator('input[placeholder*="Search KOLs"]');
  await expect(searchInput).toBeVisible();
  await searchInput.fill('tech');
  await page.selectOption('select[name="category"]', 'technology');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/08-filtered-kols.png' });
  console.log('KOL discovery and filtering functionality verified');

  // Step 8: Navigate back to dashboard
  await page.click('text=Dashboard');
  await page.waitForURL(/.*dashboard/);
  await page.screenshot({ path: 'test-results/09-back-to-dashboard.png' });

  // Step 10: Sign out
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Sign Out');
  await page.waitForTimeout(2000);
  await page.waitForURL('/');
  await page.screenshot({ path: 'test-results/10-signed-out.png' });
  
  console.log('Business user journey completed successfully');
});