import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './ocr-pdf.spec.js';
import OcrPdf from './ocr-pdf.page.js';

const ocrPdfFilePath = path.resolve(__dirname, '../../../assets/1-PDF-ocr-pdf.pdf');

let ocrPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity OCR PDF files test suite', () => {
  test.beforeEach(async ({ page }) => {
    ocrPdf = new OcrPdf(page);
  });

  // Test 0 : OCR PDF files
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to OCR PDF files test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify OCR PDF files content/specs', async () => {
      await expect(await ocrPdf.widget).toBeVisible();
      await expect(await ocrPdf.dropZone).toBeVisible();
      await expect(await ocrPdf.verbImage).toBeVisible();
      await expect(await ocrPdf.acrobatIcon).toBeVisible();
      const actualText = await ocrPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await ocrPdf.verbTitle).toContainText(data.verbTitle);
      await expect(await ocrPdf.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a PDF file to OCR', async () => {
      // upload and wait for some page change indicator (like a new element or URL change)
      const fileInput = page.locator('input[type="file"]#file-upload');
      await page.waitForTimeout(12000);
      console.log(`[PDF File Path]: ${ocrPdfFilePath}`);
      await fileInput.setInputFiles(ocrPdfFilePath);
      await page.waitForTimeout(12000);

      // Verify the URL parameters
      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('ocr-pdf');
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
