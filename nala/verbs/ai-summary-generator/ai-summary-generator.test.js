import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './ai-summary-generator.spec.js';
import AiSummaryGenerator from './ai-summary-generator.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-ai-summary-generator.pdf');

let aiSummaryGenerator;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity AI Summary Generator test suite', () => {
  test.beforeEach(async ({ page }) => {
    aiSummaryGenerator = new AiSummaryGenerator(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to AI Summary Generator test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await aiSummaryGenerator.gnav.waitFor({ state: 'visible' });
      await expect(aiSummaryGenerator.gnav).toBeVisible();
      await expect(aiSummaryGenerator.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify AI Summary Generator widget content/specs', async () => {
      await expect(aiSummaryGenerator.widget).toBeVisible();
      await expect(aiSummaryGenerator.dropZone).toBeVisible();
      await expect(aiSummaryGenerator.verbImage).toBeVisible();
      await expect(aiSummaryGenerator.acrobatIcon).toBeVisible();
      const actualText = await aiSummaryGenerator.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(aiSummaryGenerator.verbTitle).toContainText(data.verbTitle);
      await expect(aiSummaryGenerator.verbCopy).toContainText(data.verbCopy);
    });

    await test.step('Verify how-to section', async () => {
      await aiSummaryGenerator.howToSection.scrollIntoViewIfNeeded();
      await expect(aiSummaryGenerator.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify four-up prompt cards copy to clipboard and Select files is visible', async () => {
      const { fourUpSection, promptCards, selectFilesButton, promptToast } = aiSummaryGenerator;

      await fourUpSection.scrollIntoViewIfNeeded();
      await expect(fourUpSection).toBeVisible({ timeout: 60000 });

      const cardCount = await promptCards.count();
      expect(cardCount).toBeGreaterThan(0);

      for (let i = 0; i < cardCount; i += 1) {
        const card = promptCards.nth(i);
        await card.scrollIntoViewIfNeeded();
        await expect(card).toBeVisible();

        const promptText = await card.locator('input#prompt').inputValue();
        expect(promptText.length).toBeGreaterThan(0);

        const blade = card.locator('.prompt-blade');
        await expect(blade).toHaveAttribute('title', promptText);
        await blade.click();

        await expect(promptToast).toHaveClass(/prompt-toast--show/);
        await expect(promptToast).toContainText(/copied to clipboard/i);

        await expect(selectFilesButton).toBeVisible();
      }
    });

    await test.step('Verify three-up section', async () => {
      await aiSummaryGenerator.threeUpSection.scrollIntoViewIfNeeded();
      await expect(aiSummaryGenerator.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = aiSummaryGenerator;
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

    await test.step('Verify CaaS section', async () => {
      if (browserName === 'chromium') {
        // TODO: Investigate CaaS section flakiness on Chrome (async hydration / late attach).
        return;
      }
      await aiSummaryGenerator.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await aiSummaryGenerator.caasSection.scrollIntoViewIfNeeded();
      await expect(aiSummaryGenerator.caasSection).toBeVisible({ timeout: 60000 });
    });


    await test.step('Verify media block', async () => {
      await aiSummaryGenerator.mediaSection.scrollIntoViewIfNeeded();
      await expect(aiSummaryGenerator.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await aiSummaryGenerator.rnrSection.scrollIntoViewIfNeeded();
      await expect(aiSummaryGenerator.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(aiSummaryGenerator.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = aiSummaryGenerator;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await aiSummaryGenerator.footer.scrollIntoViewIfNeeded();
      await expect(aiSummaryGenerator.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        aiSummaryGenerator.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('summarize-pdf');
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
