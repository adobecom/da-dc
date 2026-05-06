import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './ocr-pdf.spec.js';
import OcrPdf from './ocr-pdf.page.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-ocr-pdf.pdf');

let ocrPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity OCR PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    ocrPdf = new OcrPdf(page);
  });

  // Test 0 : OCR PDF
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to OCR PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      // await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify OCR PDF content/specs', async () => {
      await expect(await ocrPdf.widget).toBeVisible();
      await expect(await ocrPdf.dropZone).toBeVisible();
      await expect(await ocrPdf.verbImage).toBeVisible();
      await expect(await ocrPdf.acrobatIcon).toBeVisible();
      const actualText = await ocrPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await ocrPdf.verbTitle).toContainText(data.verbTitle);

      // Handle different copy text for mobile vs desktop
      const userAgent = await page.evaluate(() => navigator.userAgent);
      const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);

      if (isMobile) {
        await expect(await ocrPdf.verbCopy).toContainText(data.verbCopyMobile);
      } else {
        await expect(await ocrPdf.verbCopy).toContainText(data.verbCopy);
      }
    });

    await test.step('step-3: Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        ocrPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
        waitUntil: 'domcontentloaded',
      });

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
