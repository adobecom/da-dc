import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './extract-pdf-pages.spec.js';
import ExtractPdfPages from './extract-pdf-pages.page.js';

const extractPdfPagesFilePath = path.resolve(__dirname, '../../../assets/1-PDF-extract-pdf-pages.pdf');

let extractPdfPages;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Extract PDF pages test suite', () => {
  test.beforeEach(async ({ page }) => {
    extractPdfPages = new ExtractPdfPages(page);
  });

  // Test 0 : Extract PDF pages
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Extract PDF pages test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify Extract PDF pages content/specs', async () => {
      await expect(await extractPdfPages.widget).toBeVisible();
      await expect(await extractPdfPages.dropZone).toBeVisible();
      await expect(await extractPdfPages.verbImage).toBeVisible();
      await expect(await extractPdfPages.acrobatIcon).toBeVisible();
      const actualText = await extractPdfPages.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await extractPdfPages.verbTitle).toContainText(data.verbTitle);
      await expect(await extractPdfPages.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a PDF file to extract pages', async () => {
      // upload and wait for some page change indicator (like a new element or URL change)
      const fileInput = page.locator('input[type="file"]#file-upload');
      await page.waitForTimeout(10000);
      console.log(`[PDF File Path]: ${extractPdfPagesFilePath}`);
      await fileInput.setInputFiles(extractPdfPagesFilePath);
      await page.waitForTimeout(15000);

      // Verify the URL parameters
      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('extract-pages');
      expect(urlObj.searchParams.get('user')).toBe('frictionless_new_user');
      expect(urlObj.searchParams.get('attempts')).toBe('1st');
      console.log({
        x_api_client_id: urlObj.searchParams.get('x_api_client_id'),
        x_api_client_location: urlObj.searchParams.get('x_api_client_location'),
        user: urlObj.searchParams.get('user'),
        attempts: urlObj.searchParams.get('attempts'),
      });
    });
  });
});
