import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './pdf-to-png.spec.js';
import PdfToPng from './pdf-to-png.page.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-pdf-png.pdf');

let pdfToPng;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity PDF to PNG test suite', () => {
  test.beforeEach(async ({ page }) => {
    pdfToPng = new PdfToPng(page);
  });

  // Test 0 : PDF to PNG
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to PDF to PNG test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      // await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify PDF to PNG content/specs', async () => {
      await expect(await pdfToPng.widget).toBeVisible();
      await expect(await pdfToPng.dropZone).toBeVisible();
      await expect(await pdfToPng.verbImage).toBeVisible();
      await expect(await pdfToPng.acrobatIcon).toBeVisible();
      const actualText = await pdfToPng.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await pdfToPng.verbTitle).toContainText(data.verbTitle);
      // Todo:vipulg enable below expectation once ...dc-shared/placeholders.json is published
      // await expect(await pdfToPng.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        pdfToPng.dropZone.click(),
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
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('pdf-to-png');
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
