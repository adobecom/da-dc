import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './extract-pdf.spec.js';
import ExtractPages from './extract-pdf.page.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-extract-pages-pdf.pdf');

let extractPages;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Rearrange PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    extractPages = new ExtractPages(page);
  });

  // Test 0 : Extract PDF
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Extract Pages Pdf test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      // await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify Extract Pages PDF verb content/specs', async () => {
      await expect(await extractPages.extractPages).toBeVisible();
      await expect(await extractPages.dropZone).toBeVisible();
      await expect(await extractPages.verbImage).toBeVisible();
      await expect(await extractPages.acrobatIcon).toBeVisible();
      const actualText = await extractPages.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await extractPages.verbTitle).toContainText(data.verbTitle);
      await expect(await extractPages.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        extractPages.dropZone.click(),
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
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('extract-pages');
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
