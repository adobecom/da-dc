import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './quiz-maker.spec.js';
import QuizMakerPage from './quiz-maker.page.js';
import checkPageLinks from '../../utils/link-checker.js';

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

    await test.step('Go to Quiz maker test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await quizMaker.gnav.waitFor({ state: 'visible' });
      await expect(quizMaker.gnav).toBeVisible();
      await expect(quizMaker.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Quiz maker widget content/specs', async () => {
      await expect(quizMaker.widget).toBeVisible();
      await expect(quizMaker.dropZone).toBeVisible();
      await expect(quizMaker.studyMarqueeMedia).toBeVisible();
      await expect(quizMaker.acrobatIcon).toBeVisible();
      const actualText = await quizMaker.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(quizMaker.verbTitle).toContainText(data.verbTitle);
      await expect(quizMaker.verbCopy).toContainText(data.verbCopy);
      await expect(quizMaker.ctaButton).toBeVisible();
      await expect(quizMaker.ctaButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await quizMaker.howToHeading.scrollIntoViewIfNeeded();
      await expect(quizMaker.howToHeading).toBeVisible({ timeout: 60000 });
    });

    await test.step(`Verify three-up sections (${data.sectionCounts.threeUp})`, async () => {
      const { threeUpSections } = quizMaker;
      const { threeUp } = data.sectionCounts;

      await expect(threeUpSections).toHaveCount(threeUp);

      for (let i = 0; i < threeUp; i += 1) {
        const section = threeUpSections.nth(i);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step(`Verify two-up sections (${data.sectionCounts.twoUp})`, async () => {
      const { twoUpSections } = quizMaker;
      const { twoUp } = data.sectionCounts;

      await expect(twoUpSections).toHaveCount(twoUp);

      for (let i = 0; i < twoUp; i += 1) {
        const section = twoUpSections.nth(i);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify Student Spaces carousel', async () => {
      const { carousels, studentSpacesHeading } = quizMaker;

      await studentSpacesHeading.scrollIntoViewIfNeeded();
      await expect(studentSpacesHeading).toBeVisible({ timeout: 60000 });
      await expect(carousels).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = quizMaker;
      await faqSection.scrollIntoViewIfNeeded();
      await expect(faqSection).toBeVisible({ timeout: 60000 });

      const buttonCount = await faqAccordionTriggers.count();

      for (let i = 0; i < buttonCount; i += 1) {
        const button = faqAccordionTriggers.nth(i);
        const ariaControls = await button.getAttribute('aria-controls');
        const contentPanel = faqSection.locator(`#${ariaControls}`);

        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'true');
        await expect(contentPanel).toBeVisible();

        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'false');
      }
    });

    await test.step('Verify footer', async () => {
      await quizMaker.footer.scrollIntoViewIfNeeded();
      await expect(quizMaker.footer).toBeVisible({ timeout: 60000 });
    });

    // await test.step('Verify no link leads to 404', async () => {
    //   await checkPageLinks(page, expect);
    // });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        quizMaker.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('quiz-maker');
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
