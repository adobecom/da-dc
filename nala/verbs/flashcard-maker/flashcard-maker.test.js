import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './flashcard-maker.spec.js';
import FlashcardMakerPage from './flashcard-maker.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-split-pdf.pdf');

let flashcardMaker;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Flashcard maker test suite', () => {
  test.beforeEach(async ({ page }) => {
    flashcardMaker = new FlashcardMakerPage(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Flashcard maker test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await flashcardMaker.gnav.waitFor({ state: 'visible' });
      await expect(flashcardMaker.gnav).toBeVisible();
      await expect(flashcardMaker.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Flashcard maker widget content/specs', async () => {
      await expect(flashcardMaker.widget).toBeVisible();
      await expect(flashcardMaker.dropZone).toBeVisible();
      await expect(flashcardMaker.studyMarqueeMedia).toBeVisible();
      await expect(flashcardMaker.acrobatIcon).toBeVisible();
      const actualText = await flashcardMaker.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(flashcardMaker.verbTitle).toContainText(data.verbTitle);
      await expect(flashcardMaker.verbCopy).toContainText(data.verbCopy);
      await expect(flashcardMaker.ctaButton).toBeVisible();
      await expect(flashcardMaker.ctaButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await flashcardMaker.howToHeading.scrollIntoViewIfNeeded();
      await expect(flashcardMaker.howToHeading).toBeVisible({ timeout: 60000 });
    });

    await test.step(`Verify three-up sections (${data.sectionCounts.threeUp})`, async () => {
      const { threeUpSections } = flashcardMaker;
      const { threeUp } = data.sectionCounts;

      await expect(threeUpSections).toHaveCount(threeUp);

      for (let i = 0; i < threeUp; i += 1) {
        const section = threeUpSections.nth(i);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step(`Verify two-up sections (${data.sectionCounts.twoUp})`, async () => {
      const { twoUpSections } = flashcardMaker;
      const { twoUp } = data.sectionCounts;

      await expect(twoUpSections).toHaveCount(twoUp);

      for (let i = 0; i < twoUp; i += 1) {
        const section = twoUpSections.nth(i);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step(`Verify Student Spaces carousel (${data.sectionCounts.carousels})`, async () => {
      const { carousels, studentSpacesHeading } = flashcardMaker;

      await studentSpacesHeading.scrollIntoViewIfNeeded();
      await expect(studentSpacesHeading).toBeVisible({ timeout: 60000 });
      await expect(carousels).toBeVisible({ timeout: 60000 });

    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = flashcardMaker;
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
      await flashcardMaker.footer.scrollIntoViewIfNeeded();
      await expect(flashcardMaker.footer).toBeVisible({ timeout: 60000 });
    });

    // await test.step('Verify no link leads to 404', async () => {
    //   await checkPageLinks(page, expect);
    // });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        flashcardMaker.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('flashcard-maker');
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
