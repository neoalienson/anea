import { test, expect } from '@playwright/test';

test('Business User Journey', async ({ page }) => {
  // Step 1: Landing page
  await page.goto('/');
  await page.screenshot({ path: 'test-results/01-landing-page.png' });
  await expect(page.locator('text=KOL Matching Platform')).toBeVisible();
  await page.click('text=Sign In');

  // Step 2: Sign in
  await expect(page).toHaveURL(/.*signin/);
  await page.screenshot({ path: 'test-results/02-signin-page.png' });
  
  await page.fill('input[name="email"]', 'techcorp@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Step 3: Dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  await page.screenshot({ path: 'test-results/03-business-dashboard.png' });
  await expect(page.locator('text=Welcome, techcorp@example.com')).toBeVisible();

  // Step 4: Navigate to Campaigns
  await page.click('[data-testid="nav-campaigns"]');
  await expect(page).toHaveURL(/.*campaigns/);
  await page.screenshot({ path: 'test-results/04-campaigns-page.png' });

  // Step 5: Create Campaign
  await page.click('text=Create Campaign');
  await page.screenshot({ path: 'test-results/05-create-campaign-dialog.png' });
  
  await page.fill('input[name="title"]', 'Test E2E Campaign');
  await page.fill('textarea[name="description"]', 'This is a test campaign created during E2E testing');
  await page.fill('input[name="budget"]', '10000');
  await page.fill('input[name="minFollowers"]', '50000');
  
  await page.click('text=Create Campaign');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/06-campaign-created.png' });

  // Step 6: Navigate to Discover KOLs
  await page.click('[data-testid="nav-discover"]');
  await expect(page).toHaveURL(/.*discover/);
  await page.screenshot({ path: 'test-results/07-discover-kols.png' });

  // Step 7: Search and filter KOLs
  await page.fill('input[placeholder*="Search"]', 'tech');
  await page.selectOption('select[name="category"]', 'technology');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/08-filtered-kols.png' });

  // Step 8: View KOL profile
  const viewProfileButton = page.locator('text=View Profile').first();
  if (await viewProfileButton.isVisible()) {
    await viewProfileButton.click();
    await page.screenshot({ path: 'test-results/09-kol-profile-view.png' });
  }

  // Step 9: Sign out
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Sign Out');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/10-signed-out.png' });
});