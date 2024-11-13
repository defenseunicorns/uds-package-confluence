/**
 * Copyright 2024 Defense Unicorns
 * SPDX-License-Identifier: AGPL-3.0-or-later OR LicenseRef-Defense-Unicorns-Commercial
 */

import { test, expect } from '@playwright/test';

test('create new confluence page', async ({ page }) => {
  // Navigate to Confluence homepage
  await page.goto('https://confluence.uds.dev/dashboard.action');

  // Click the "Create" button using XPath
  await page.click('//a[@id="quick-create-page-button"]');

  // Wait for and fill in the page title using XPath
  await page.fill('//input[@id="content-title"]', 'Test Page Created by Playwright');

  // Wait for the editor iframe to be ready
  await page.waitForSelector('iframe.confluence-embedded-page');
  
  // Get the editor iframe and interact with its content
  const editorFrame = page.frameLocator('.confluence-embedded-page');
  await editorFrame.locator('//*[@id="tinymce"]/p').fill('This is a test page created by automated testing.');

  // Click the Publish button using XPath
  await page.click('//button[@id="rte-button-publish"]');

  // Wait for the page to be saved and verify
  await page.waitForSelector('//input[@id="content-title"]');
  
  // Verify the page title
  const pageTitle = await page.inputValue('//input[@id="content-title"]');
  expect(pageTitle).toBe('Test Page Created by Playwright');
}); 