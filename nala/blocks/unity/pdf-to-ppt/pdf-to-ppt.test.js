import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './pdf-to-ppt.spec.js';
import PdfToPpt from './pdf-to-ppt.page.js';

const pdfToPptFilePath = path.resolve(__dirname, '../../../assets/1-PDF-pdf-to-ppt.pdf');

let pdfToPpt;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Convert PDF to PPT test suite', () => {
  test.beforeEach(async ({ page }) => {
    pdfToPpt = new PdfToPpt(page);
  });

  // Test 0 : Convert PDF to PPT
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Convert PDF to PPT test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify Convert PDF to PPT content/specs', async () => {
      await expect(await pdfToPpt.widget).toBeVisible();
      await expect(await pdfToPpt.dropZone).toBeVisible();
      await expect(await pdfToPpt.verbImage).toBeVisible();
      await expect(await pdfToPpt.acrobatIcon).toBeVisible();
      const actualText = await pdfToPpt.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await pdfToPpt.verbTitle).toContainText(data.verbTitle);
      await expect(await pdfToPpt.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a PDF file to convert to PPT', async () => {
      // upload and wait for some page change indicator (like a new element or URL change)
      const fileInput = page.locator('input[type="file"]#file-upload');
      await page.waitForTimeout(10000);
      console.log(`[PDF File Path]: ${pdfToPptFilePath}`);
      await fileInput.setInputFiles(pdfToPptFilePath);
      await page.waitForTimeout(15000);

      // Verify the URL parameters
      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('pdf-to-ppt');
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
