/**
 * Copyright 2024 Defense Unicorns
 * SPDX-License-Identifier: AGPL-3.0-or-later OR LicenseRef-Defense-Unicorns-Commercial
 */

import { test, expect } from '@playwright/test';

test('create new confluence page', async ({ page }) => {
  // Navigate to Confluence homepage
  await page.goto('https://confluence.uds.dev');

  // Click the "Create" button using XPath
  await page.click('//a[@id="quick-create-page-button"]');

  // Generate a unique title with timestamp
  const timestamp = Date.now();
  const expectedTitle = `New Page ${timestamp}`;

  // Wait for and fill in the page title using XPath
  await page.waitForSelector('//input[@id="content-title"]');
  await page.fill('//input[@id="content-title"]', expectedTitle);

  // Click the Publish button and wait for it to complete
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.click('//button[@id="rte-button-publish"]')
  ]);

  // Add a small delay to ensure page transition is complete
  await page.waitForTimeout(1000);

  // Verify we're in the correct space using the breadcrumb link
  await expect(page.locator('//h1[@id="title-text"]')).toBeVisible();
}); 