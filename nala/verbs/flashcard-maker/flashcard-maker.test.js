import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './flashcard-maker.spec.js';
import FlashcardMakerPage from './flashcard-maker.page.js';

const pdfFilePath = path.resolve(__dirname, '../../test-files/testpdf.pdf');

let flashcardMaker;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Flashcard maker test suite', () => {
  test.beforeEach(async ({ page }) => {
    flashcardMaker = new FlashcardMakerPage(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Flashcard maker test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('step-2: Verify Flashcard maker content/specs', async () => {
      await expect(await flashcardMaker.widget).toBeVisible();
      await expect(await flashcardMaker.dropZone).toBeVisible();
      await expect(await flashcardMaker.studyMarqueeMedia).toBeVisible();
      await expect(await flashcardMaker.acrobatIcon).toBeVisible();
      const actualText = await flashcardMaker.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await flashcardMaker.verbTitle).toContainText(data.verbTitle);
      await expect(await flashcardMaker.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a sample PDF file', async () => {
      await page.waitForTimeout(5000);
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        flashcardMaker.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
        waitUntil: 'domcontentloaded',
      });
    });
  });
});
