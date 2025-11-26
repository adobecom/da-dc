import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './png-to-pdf.spec.js';
import PngToPdf from './png-to-pdf.page.js';

const pngToPdfFilePath = path.resolve(__dirname, '../../../assets/1-PNG-png-pdf.png');

let pngToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Convert PNG to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    pngToPdf = new PngToPdf(page);
  });

  // Test 0 : Convert PNG to PDF
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Convert PNG to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify Convert PNG to PDF content/specs', async () => {
      await expect(await pngToPdf.widget).toBeVisible();
      await expect(await pngToPdf.dropZone).toBeVisible();
      await expect(await pngToPdf.verbImage).toBeVisible();
      await expect(await pngToPdf.acrobatIcon).toBeVisible();
      const actualText = await pngToPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await pngToPdf.verbTitle).toContainText(data.verbTitle);
      await expect(await pngToPdf.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a PNG file to convert to PDF', async () => {
      // upload and wait for some page change indicator (like a new element or URL change)
      const fileInput = page.locator('input[type="file"]#file-upload');
      await page.waitForTimeout(12000);
      console.log(`[PNG File Path]: ${pngToPdfFilePath}`);
      await fileInput.setInputFiles(pngToPdfFilePath);
      await page.waitForTimeout(12000);

      // Verify the URL parameters
      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('png-to-pdf');
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
