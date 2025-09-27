import { test, expect } from '@playwright/test';

test('KOL User Journey', async ({ page }) => {
  // Step 1: Landing page
  await page.goto('/');
  await page.screenshot({ path: 'test-results/kol-01-landing-page.png' });
  await expect(page.locator('text=KOL Matching Platform')).toBeVisible();
  await page.click('text=Sign In');

  // Step 2: Sign in as KOL
  await expect(page).toHaveURL(/.*signin/);
  await page.screenshot({ path: 'test-results/kol-02-signin-page.png' });
  
  await page.fill('input[name="email"]', 'techreviewer@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Step 3: KOL Dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  await page.screenshot({ path: 'test-results/kol-03-dashboard.png' });
  await expect(page.locator('text=Welcome, techreviewer@example.com')).toBeVisible();

  // Step 4: Navigate to Profile
  await page.click('[data-testid="nav-profile"]');
  await expect(page).toHaveURL(/.*profile/);
  await page.screenshot({ path: 'test-results/kol-04-profile-page.png' });

  // Step 5: Update Profile
  await page.fill('input[name="displayName"]', 'Tech Reviewer Pro - E2E Test');
  await page.fill('textarea[name="bio"]', 'Updated bio during E2E testing - Professional tech reviewer');
  await page.fill('input[name="youtubeUrl"]', 'https://youtube.com/@techreviewerpro-e2e');
  await page.fill('input[name="twitterHandle"]', '@techreviewer_e2e');
  await page.fill('input[name="language"]', 'English');
  
  await page.click('text=Update Profile');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/kol-05-profile-updated.png' });

  // Step 6: Load YouTube Metrics
  await page.click('text=Load YouTube Metrics');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/kol-06-metrics-loaded.png' });

  // Step 7: Browse Campaigns
  await page.click('[data-testid="nav-campaigns"]');
  await expect(page).toHaveURL(/.*campaigns/);
  await page.screenshot({ path: 'test-results/kol-07-browse-campaigns.png' });

  // Step 8: View Campaign Details
  const applyButton = page.locator('text=Apply').first();
  if (await applyButton.isVisible()) {
    await applyButton.click();
    await page.screenshot({ path: 'test-results/kol-08-campaign-application.png' });
  }

  // Step 9: Sign out
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Sign Out');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/kol-09-signed-out.png' });
});