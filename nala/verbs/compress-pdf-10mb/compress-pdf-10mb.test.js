import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './compress-pdf-10mb.spec.js';
import CompressPdf10mb from './compress-pdf-10mb.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-compress-pdf.pdf');

let compressPdf10mb;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Compress PDF to 10MB test suite', () => {
  test.beforeEach(async ({ page }) => {
    compressPdf10mb = new CompressPdf10mb(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Compress PDF to 10MB test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('Verify no link leads to 404', async () => {
      await page.waitForTimeout(5000);
      await checkPageLinks(page, expect);
    });

    await test.step('Verify Compress PDF to 10MB content/specs', async () => {
      await expect(compressPdf10mb.compressPdf).toBeVisible();
      await expect(compressPdf10mb.dropZone).toBeVisible();
      await expect(compressPdf10mb.verbImage).toBeVisible();
      await expect(compressPdf10mb.acrobatIcon).toBeVisible();
      const actualText = await compressPdf10mb.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(compressPdf10mb.verbTitle).toContainText(data.verbTitle);
      await expect(compressPdf10mb.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        compressPdf10mb.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('compress-pdf');
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
