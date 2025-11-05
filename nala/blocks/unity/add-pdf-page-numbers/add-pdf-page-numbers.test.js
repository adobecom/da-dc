import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './add-pdf-page-numbers.spec.js';
import AddPdfPageNumbers from './add-pdf-page-numbers.page.js';

const pdfFilePath = path.resolve(__dirname, '../../../assets/1-PDF-add-page-numbers-to-pdf.pdf');

let addPdfPageNumbers;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Add PDF Page Numbers test suite', () => {
  test.beforeEach(async ({ page }) => {
    addPdfPageNumbers = new AddPdfPageNumbers(page);
  });

  // Test 0 : Add PDF Page Numbers
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Add PDF Page Numbers test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify Add PDF Page Numbers content/specs', async () => {
      await expect(await addPdfPageNumbers.widget).toBeVisible();
      await expect(await addPdfPageNumbers.dropZone).toBeVisible();
      await expect(await addPdfPageNumbers.verbImage).toBeVisible();
      await expect(await addPdfPageNumbers.acrobatIcon).toBeVisible();
      const actualText = await addPdfPageNumbers.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await addPdfPageNumbers.verbTitle).toContainText(data.verbTitle);
      await expect(await addPdfPageNumbers.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a PDF file with page numbers', async () => {
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
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('number-pages');
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
