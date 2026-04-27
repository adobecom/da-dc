import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './quiz-maker.spec.js';
import QuizMakerPage from './quiz-maker.page.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-split-pdf.pdf');

let quizMaker;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Quiz maker test suite', () => {
  test.beforeEach(async ({ page }) => {
    quizMaker = new QuizMakerPage(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('step-1: Go to Quiz maker test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('step-2: Verify Quiz maker content/specs', async () => {
      await expect(await quizMaker.widget).toBeVisible();
      await expect(await quizMaker.dropZone).toBeVisible();
      await expect(await quizMaker.studyMarqueeMedia).toBeVisible();
      await expect(await quizMaker.acrobatIcon).toBeVisible();
      const actualText = await quizMaker.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(await quizMaker.verbTitle).toContainText(data.verbTitle);
      await expect(await quizMaker.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('step-3: Upload a sample PDF file', async () => {
      await page.waitForTimeout(5000);
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        quizMaker.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
        waitUntil: 'domcontentloaded',
      });
    });
  });
});
