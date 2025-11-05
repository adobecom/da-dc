import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './convert-pdf.spec.js';
import ConvertPdf from './convert-pdf.page.js';

const docFilePath = path.resolve(__dirname, '../../../assets/1-WORD-convert-pdf.doc');

let convertPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Convert PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    convertPdf = new ConvertPdf(page);
  });

  // Test 0 : Convert PDF
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Convert PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify Convert PDF content/specs', async () => {
      await expect(await convertPdf.widget).toBeVisible();
      await expect(await convertPdf.dropZone).toBeVisible();
      await expect(await convertPdf.verbImage).toBeVisible();
      await expect(await convertPdf.acrobatIcon).toBeVisible();
      const actualText = await convertPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
        await expect(await convertPdf.verbTitle).toContainText(data.verbTitle);
      await expect(await convertPdf.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a Microsoft Word file to convert', async () => {
      // upload and wait for some page change indicator (like a new element or URL change)
      const fileInput = page.locator('input[type="file"]#file-upload');
      await page.waitForTimeout(10000);
      console.log(`[DOC File Path]: ${docFilePath}`);
      await fileInput.setInputFiles(docFilePath);
      await page.waitForTimeout(15000);

      // Verify the URL parameters
      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('createpdf');
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
