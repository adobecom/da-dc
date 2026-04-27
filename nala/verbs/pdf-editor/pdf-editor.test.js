import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './pdf-editor.spec.js';
import PdfEditor from './pdf-editor.page.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-pdf-editor.pdf');

let pdfEditor;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity PDF Editor test suite', () => {
  test.beforeEach(async ({ page }) => {
    pdfEditor = new PdfEditor(page);
  });

  // Test 0 : PDF Editor or Add-Comment
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    // Skip test for Firefox browser till further investigation
    test.skip(browserName === 'firefox', 'Skipping on Firefox till further investigation');

    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to PDF Editor test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      // await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify PDF Editor or Add Comment content/specs', async () => {
      await expect(await pdfEditor.PdfEditor).toBeVisible();
      await expect(await pdfEditor.dropZone).toBeVisible();
      await expect(await pdfEditor.verbImage).toBeVisible();
      await expect(await pdfEditor.acrobatIcon).toBeVisible();
      const actualText = await pdfEditor.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await pdfEditor.verbTitle).toContainText(data.verbTitle);
      await expect(await pdfEditor.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        pdfEditor.dropZone.click(),
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
