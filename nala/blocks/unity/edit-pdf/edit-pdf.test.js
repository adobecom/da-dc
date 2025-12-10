import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './edit-pdf.spec.js';
import EditPdf from './edit-pdf.page.js';

const editPdfFilePath = path.resolve(__dirname, '../../../assets/1-PDF-edit-pdf.pdf');

let editPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Edit PDF files test suite', () => {
  test.beforeEach(async ({ page }) => {
    editPdf = new EditPdf(page);
  });

  // Test 0 : Edit PDF files
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Edit PDF files test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify Edit PDF files content/specs', async () => {
      await expect(await editPdf.widget).toBeVisible();
      await expect(await editPdf.dropZone).toBeVisible();
      await expect(await editPdf.verbImage).toBeVisible();
      await expect(await editPdf.acrobatIcon).toBeVisible();
      const actualText = await editPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await editPdf.verbTitle).toContainText(data.verbTitle);
      await expect(await editPdf.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a PDF file to protect', async () => {
      // upload and wait for some page change indicator (like a new element or URL change)
      const fileInput = page.locator('input[type="file"]#file-upload');
      await page.waitForTimeout(12000);
      console.log(`[PDF File Path]: ${editPdfFilePath}`);
      await fileInput.setInputFiles(editPdfFilePath);
      await page.waitForTimeout(12000);

      // Verify the URL parameters
      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('add-comment');
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
