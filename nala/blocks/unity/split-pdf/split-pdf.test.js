import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './split-pdf.spec.js';
import SplitPdf from './split-pdf.page.js';

const splitPdfFilePath = path.resolve(__dirname, '../../../assets/1-PDF-split-pdf.pdf');

let splitPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Split PDF pages test suite', () => {
  test.beforeEach(async ({ page }) => {
    splitPdf = new SplitPdf(page);
  });

  // Test 0 : Split PDF pages
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Split PDF pages test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify Split PDF pages content/specs', async () => {
      await expect(await splitPdf.widget).toBeVisible();
      await expect(await splitPdf.dropZone).toBeVisible();
      await expect(await splitPdf.verbImage).toBeVisible();
      await expect(await splitPdf.acrobatIcon).toBeVisible();
      const actualText = await splitPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await splitPdf.verbTitle).toContainText(data.verbTitle);
      await expect(await splitPdf.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a PDF file to split pages', async () => {
      // upload and wait for some page change indicator (like a new element or URL change)
      const fileInput = page.locator('input[type="file"]#file-upload');
      await page.waitForTimeout(15000);
      console.log(`[PDF File Path]: ${splitPdfFilePath}`);
      await fileInput.setInputFiles(splitPdfFilePath);
      await page.waitForTimeout(15000);

      // Verify the URL parameters
      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('split-pdf');
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
