/**
 * Copyright 2024 Defense Unicorns
 * SPDX-License-Identifier: AGPL-3.0-or-later OR LicenseRef-Defense-Unicorns-Commercial
 */

import { test as setup, expect } from "@playwright/test";
import { authFile } from "./playwright.config";

setup("authenticate", async ({ page, context }) => {
  // Go to Confluence homepage
  await page.goto("https://confluence.uds.dev");
  
  // Wait for the login form elements using the exact IDs
  await page.waitForSelector('#username-field');
  await page.fill('#username-field', 'doug');
  await page.fill('#password-field', '##gb123X##');
  
  // Click the login button using the exact text content
  await page.locator('span', { hasText: 'Log in' }).click();

  try {
    // Wait for successful login and redirect to all-updates
    await page.waitForURL('https://confluence.uds.dev/index.action#all-updates', { timeout: 10000 });
    
    // Additional success checks
    const isLoggedIn = await page.locator('#user-menu-link').isVisible();
    if (!isLoggedIn) {
      throw new Error('Login seemed to succeed but user menu not found');
    }

    // Save authentication state
    await page.context().storageState({ path: authFile });

    console.log('Login successful! Reached all-updates page.');
  } catch (error) {
    // Take a screenshot and log URL on failure
    await page.screenshot({ path: 'failure.png' });
    console.error('Failed at URL:', page.url());
    throw error;
  }
});