import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './password-protect-pdf.spec.js';
import ProtectPdf from './password-protect-pdf.page.js';

const protectPdfFilePath = path.resolve(__dirname, '../../../assets/1-PDF-protect-pdf.pdf');

let protectPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Password protect PDF files test suite', () => {
  test.beforeEach(async ({ page }) => {
    protectPdf = new ProtectPdf(page);
  });

  // Test 0 : Password protect PDF files
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Password protect PDF files test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify Password protect PDF files content/specs', async () => {
      await expect(await protectPdf.widget).toBeVisible();
      await expect(await protectPdf.dropZone).toBeVisible();
      await expect(await protectPdf.verbImage).toBeVisible();
      await expect(await protectPdf.acrobatIcon).toBeVisible();
      const actualText = await protectPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
        await expect(await protectPdf.verbTitle).toContainText(data.verbTitle);
      await expect(await protectPdf.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a PDF file to protect', async () => {
      // upload and wait for some page change indicator (like a new element or URL change)
      const fileInput = page.locator('input[type="file"]#file-upload');
      await page.waitForTimeout(10000);
      console.log(`[PDF File Path]: ${protectPdfFilePath}`);
      await fileInput.setInputFiles(protectPdfFilePath);
      await page.waitForTimeout(15000);

      // Verify the URL parameters
      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('protect-pdf');
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
