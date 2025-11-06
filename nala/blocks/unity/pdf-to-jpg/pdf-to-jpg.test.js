import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './pdf-to-jpg.spec.js';
import PdfToJpg from './pdf-to-jpg.page.js';

const pdfToJpgFilePath = path.resolve(__dirname, '../../../assets/1-PDF-pdf-to-jpg.pdf');

let pdfToJpg;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Convert PDF to JPG test suite', () => {
  test.beforeEach(async ({ page }) => {
    pdfToJpg = new PdfToJpg(page);
  });

  // Test 0 : Convert PDF to JPG
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Convert PDF to JPG test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify Convert PDF to JPG content/specs', async () => {
      await expect(await pdfToJpg.widget).toBeVisible();
      await expect(await pdfToJpg.dropZone).toBeVisible();
      await expect(await pdfToJpg.verbImage).toBeVisible();
      await expect(await pdfToJpg.acrobatIcon).toBeVisible();
      const actualText = await pdfToJpg.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await pdfToJpg.verbTitle).toContainText(data.verbTitle);
      await expect(await pdfToJpg.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a PDF file to convert to JPG', async () => {
      // upload and wait for some page change indicator (like a new element or URL change)
      const fileInput = page.locator('input[type="file"]#file-upload');
      await page.waitForTimeout(10000);
      console.log(`[PDF File Path]: ${pdfToJpgFilePath}`);
      await fileInput.setInputFiles(pdfToJpgFilePath);
      await page.waitForTimeout(15000);

      // Verify the URL parameters
      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('pdf-to-image');
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
