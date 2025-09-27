import { test, expect } from '@playwright/test';

test('Simple navigation test', async ({ page }) => {
  // Test basic page loading
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/simple-01-landing.png' });
  
  // Check if the main heading is visible
  const heading = page.locator('h1:has-text("KOL Matching Platform")');
  await expect(heading).toBeVisible();
  
  // Check if Sign In button exists
  const signInButton = page.locator('text=Sign In');
  await expect(signInButton).toBeVisible();
  
  // Click Sign In
  await signInButton.click();
  await page.waitForURL(/.*signin/);
  await page.screenshot({ path: 'test-results/simple-02-signin.png' });
  
  // Check if signin form exists
  const emailField = page.locator('input[name="email"]');
  const passwordField = page.locator('input[name="password"]');
  const submitButton = page.locator('button[type="submit"]');
  
  await expect(emailField).toBeVisible();
  await expect(passwordField).toBeVisible();
  await expect(submitButton).toBeVisible();
  
  console.log('Basic navigation test passed');
});