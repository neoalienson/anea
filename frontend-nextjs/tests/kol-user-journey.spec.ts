import { test, expect } from '@playwright/test';

test('KOL User Journey', async ({ page }) => {
  // Step 1: Landing page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/kol-01-landing-page.png' });
  await expect(page.locator('text=KOL Matching Platform')).toBeVisible();
  await expect(page.locator('text=Connect SMBs with Key Opinion Leaders')).toBeVisible();
  await page.click('text=Sign In');

  // Step 2: Sign in as KOL
  await expect(page).toHaveURL(/.*signin/);
  await page.screenshot({ path: 'test-results/kol-02-signin-page.png' });
  
  await page.fill('input[name="email"]', 'techreviewer@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Step 3: KOL Dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for dashboard data to load
  await page.screenshot({ path: 'test-results/kol-03-dashboard.png' });
  await expect(page.locator('text=Content Creator Dashboard')).toBeVisible();
  await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();
  await expect(page.locator('[data-testid="nav-campaigns"]')).toBeVisible();

  // Step 4: Navigate to Profile
  await page.click('[data-testid="nav-profile"]');
  await expect(page).toHaveURL(/.*profile/);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/kol-04-profile-page.png' });
  await expect(page.locator('text=KOL Profile')).toBeVisible();

  // Step 5: Update Profile
  await page.fill('input[name="displayName"]', 'Tech Reviewer Pro - E2E Updated');
  await page.fill('textarea[name="bio"]', 'Updated bio during E2E testing - Professional tech reviewer with expertise in consumer electronics');
  await page.fill('input[name="youtubeUrl"]', 'https://youtube.com/@techreviewerpro-e2e');
  await page.fill('input[name="twitterHandle"]', '@techreviewer_e2e');
  await page.fill('input[name="language"]', 'English');
  
  await page.click('text=Update Profile');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/kol-05-profile-updated.png' });
  await expect(page.locator('text=Profile updated successfully')).toBeVisible();

  // Step 6: Load YouTube Metrics
  await page.click('text=Load YouTube Metrics');
  await page.waitForTimeout(3000); // Wait for API call
  await page.screenshot({ path: 'test-results/kol-06-metrics-loaded.png' });
  await expect(page.locator('text=YouTube metrics loaded successfully')).toBeVisible();

  // Step 7: Browse Available Campaigns
  await page.click('[data-testid="nav-campaigns"]');
  await expect(page).toHaveURL(/.*campaigns/);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/kol-07-browse-campaigns.png' });
  await expect(page.locator('text=Available Campaigns')).toBeVisible();

  // Step 8: Check My Applications
  await page.click('[data-testid="nav-my-applications"]');
  await expect(page).toHaveURL(/.*my-applications/);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/kol-08-my-applications.png' });

  // Step 9: Navigate back to dashboard
  await page.click('text=Dashboard');
  await expect(page).toHaveURL(/.*dashboard/);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/kol-09-back-to-dashboard.png' });

  // Step 10: Sign out
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Sign Out');
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('/');
  await page.screenshot({ path: 'test-results/kol-10-signed-out.png' });
});