import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './add-pdf-number.spec.js';
import AddPdfNumberPage from './add-pdf-number.page.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-AddPageNumbers-pdf.pdf');

let addPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Add PDF page number test suite', () => {
  test.beforeEach(async ({ page }) => {
    addPdf = new AddPdfNumberPage(page);
  });

  // Test 0 : Add PDF Page Numbers
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Add Pdf page numbers test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      // await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify PDF Add page numbers content/specs', async () => {
      await expect(await addPdf.addPdf).toBeVisible();
      await expect(await addPdf.dropZone).toBeVisible();
      await expect(await addPdf.verbImage).toBeVisible();
      await expect(await addPdf.acrobatIcon).toBeVisible();
      const actualText = await addPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await addPdf.verbTitle).toContainText(data.verbTitle);
      await expect(await addPdf.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        addPdf.dropZone.click(),
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
