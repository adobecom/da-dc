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

    await test.step('Go to Flashcard maker test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('Verify global nav (smoke)', async () => {
      await expect(flashcardMaker.gnav).toBeVisible();
    });

    await test.step('Verify widget content and specs', async () => {
      await expect(flashcardMaker.widget).toBeVisible();
      await expect(flashcardMaker.dropZone).toBeVisible();
      await expect(flashcardMaker.acrobatIcon).toBeVisible();
      await expect(flashcardMaker.verbHeader).toBeVisible();
      await expect(flashcardMaker.verbTitle).toBeVisible();
      await expect(flashcardMaker.verbCopy).toBeVisible();
      await expect(flashcardMaker.promptInput).toBeVisible();
      await expect(flashcardMaker.securityTooltip).toBeVisible();
      await expect(flashcardMaker.ctaButton).toBeVisible();
      await expect(flashcardMaker.ctaButton).toBeEnabled();
    });

    await test.step('Verify editorial cards', async () => {
      const cards = flashcardMaker.editorialCards;
      expect(await cards.count(), 'page should render editorial cards').toBeGreaterThan(0);
      for (let i = 0; i < await cards.count(); i += 1) {
        const card = cards.nth(i);
        await card.scrollIntoViewIfNeeded();
        await expect(card).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify carousels', async () => {
      const { carousels } = flashcardMaker;
      expect(await carousels.count(), 'page should render at least one carousel').toBeGreaterThan(0);
      for (let i = 0; i < await carousels.count(); i += 1) {
        const carousel = carousels.nth(i);
        await carousel.scrollIntoViewIfNeeded();
        await expect(carousel).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify FAQ accordion opens and closes each item', async () => {
      const { faqSection, faqAccordionTriggers } = flashcardMaker;
      await faqSection.scrollIntoViewIfNeeded();
      await expect(faqSection).toBeVisible({ timeout: 60000 });

      const buttonCount = await faqAccordionTriggers.count();
      expect(buttonCount, 'FAQ should have at least one item').toBeGreaterThan(0);

      for (let i = 0; i < buttonCount; i += 1) {
        const button = faqAccordionTriggers.nth(i);
        const ariaControls = await button.getAttribute('aria-controls');
        const contentPanel = page.locator(`[id="${ariaControls}"]`);

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

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        flashcardMaker.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);
      await expect(page).toHaveURL(/acrobat\.adobe/, { timeout: 60000 });

      const urlObj = new URL(page.url());
      console.log(`[Post-upload URL]: ${page.url()}`);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('flashcard-maker');
    });
  });
});
