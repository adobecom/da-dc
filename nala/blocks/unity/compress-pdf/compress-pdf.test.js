import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './compress-pdf.spec.js';
import CompressPdf from './compress-pdf.page.js';

const pdfFilePath = path.resolve(__dirname, '../../../assets/1-PDF-compress-pdf.pdf');

let compressPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Compress PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    compressPdf = new CompressPdf(page);
  });

  // Test 0 : Compress PDF
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Compress PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify Compress PDF content/specs', async () => {
      await expect(await compressPdf.widget).toBeVisible();
      await expect(await compressPdf.dropZone).toBeVisible();
      await expect(await compressPdf.verbImage).toBeVisible();
      await expect(await compressPdf.acrobatIcon).toBeVisible();
      const actualText = await compressPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
        await expect(await compressPdf.verbTitle).toContainText(data.verbTitle);
      await expect(await compressPdf.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a PDF file to compress', async () => {
      // upload and wait for some page change indicator (like a new element or URL change)
      const fileInput = page.locator('input[type="file"]#file-upload');
      await page.waitForTimeout(10000);
      console.log(`[PDF File Path]: ${pdfFilePath}`);
      await fileInput.setInputFiles(pdfFilePath);
      await page.waitForTimeout(15000);

      // Verify the URL parameters
      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('compress-pdf');
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
