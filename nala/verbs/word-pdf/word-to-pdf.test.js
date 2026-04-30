import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './word-to-pdf.spec.js';
import WordToPdf from './word-to-pdf.page.js';

const excelFilePath = path.resolve(__dirname, '../../assets/1-WORD-word-pdf.doc');

let wordToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity WORD to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    wordToPdf = new WordToPdf(page);
  });

  // Test 0 : WORD to PDF
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to WORD to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      // await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify WORD to PDF content/specs', async () => {
      await expect(await wordToPdf.widget).toBeVisible();
      await expect(await wordToPdf.dropZone).toBeVisible();
      await expect(await wordToPdf.verbImage).toBeVisible();
      await expect(await wordToPdf.acrobatIcon).toBeVisible();
      const actualText = await wordToPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await wordToPdf.verbTitle).toContainText(data.verbTitle);
      await expect(await wordToPdf.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a sample Word file', async () => {
      // Open the native file picker from the widget (same path as real users / uploadFileToVerbWidget).
      // Direct setInputFiles on the hidden input often never starts the Unity upload pipeline.
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        wordToPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(excelFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
        waitUntil: 'domcontentloaded',
      });

      // Verify the URL parameters (after redirect to Acrobat)
      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('word-to-pdf');
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
