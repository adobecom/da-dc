import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './study-with-acrobat.spec.js';
import StudyWithAcrobat from './study-with-acrobat.page.js';

const studyWithAcrobatFilePath = path.resolve(__dirname, '../../../assets/1-PDF-study-with-acrobat.pdf');

let studyWithAcrobat;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Study with Acrobat test suite', () => {
  test.beforeEach(async ({ page }) => {
    studyWithAcrobat = new StudyWithAcrobat(page);
  });

  // Test 0 : Study with Acrobat
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Study with Acrobat test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}${unityLibs}`);
    });

    await test.step('step-2: Verify Study with Acrobat content/specs', async () => {
      await expect(await studyWithAcrobat.widget).toBeVisible();
      await expect(await studyWithAcrobat.dropZone).toBeVisible();
      await expect(await studyWithAcrobat.verbImage).toBeVisible();
      await expect(await studyWithAcrobat.acrobatIcon).toBeVisible();
      const actualText = await studyWithAcrobat.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await studyWithAcrobat.verbTitle).toContainText(data.verbTitle);
      await expect(await studyWithAcrobat.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a PDF file to study with Acrobat', async () => {
      // upload and wait for some page change indicator (like a new element or URL change)
      const fileInput = page.locator('input[type="file"]#file-upload');
      await page.waitForTimeout(10000);
      console.log(`[PDF File Path]: ${studyWithAcrobatFilePath}`);
      await fileInput.setInputFiles(studyWithAcrobatFilePath);
      await page.waitForTimeout(15000);

      // Verify the URL parameters
      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('chat-pdf-student');
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
