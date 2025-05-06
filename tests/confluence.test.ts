/**
 * Copyright 2024 Defense Unicorns
 * SPDX-License-Identifier: AGPL-3.0-or-later OR LicenseRef-Defense-Unicorns-Commercial
 */

import { test, expect, devices } from '@playwright/test';
import path from 'path';

// Function to generate a unique screenshot filename with a custom base name
const getUniqueScreenshotPath = (baseName: string) => {
  let screenshotPath = path.resolve(__dirname, 'screenshots', `${defaultBrowserType}-${baseName}.png`);
  return screenshotPath;
};

let defaultBrowserType: string;

test.beforeEach(async ({ browserName }) => {
  // Use browserName provided by Playwright to determine the browser type
  defaultBrowserType = browserName;
});

test.describe('Confluence', () => {
  test('Reach Confluence setup page', async ({ page, baseURL }) => {

    console.log('🔄 Navigating to Confluence setup page...');
    await page.goto(baseURL);

    // Wait for the <h1 id="logo"> element
    console.log('⏳ Waiting for the setup page to be visible...');
    // Locate the <h1> element with both classes
    const confluenceLogoHeader = page.locator('h1#logo.aui-header-logo.aui-header-logo-confluence');
    await expect(confluenceLogoHeader).toBeVisible({ timeout: 300000 });

    // Check for the <span> with expected text inside the link
    const confluenceLogoText = confluenceLogoHeader.locator('a > span.aui-header-logo-device');
    await expect(confluenceLogoText).toHaveText('Confluence');

    console.log('📸 Taking screenshot of setup page...');
    let screenshotPath = getUniqueScreenshotPath('1.setup-page');
    await page.screenshot({ path: screenshotPath });

    console.log('🎉 Successfully reached Confluence setup page!');

  });
});
