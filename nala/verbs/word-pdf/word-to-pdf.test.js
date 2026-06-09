import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './word-to-pdf.spec.js';
import WordToPdf from './word-to-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const wordFilePath = path.resolve(__dirname, '../../assets/1-WORD-word-pdf.doc');

let wordToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity WORD to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    wordToPdf = new WordToPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Word to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await wordToPdf.gnav.waitFor({ state: 'visible' });
      await expect(wordToPdf.gnav).toBeVisible();
      await expect(wordToPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Word to PDF widget content/specs', async () => {
      await expect(wordToPdf.widget).toBeVisible();
      await expect(wordToPdf.dropZone).toBeVisible();
      await expect(wordToPdf.verbImage).toBeVisible();
      await expect(wordToPdf.acrobatIcon).toBeVisible();
      const actualText = await wordToPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(wordToPdf.verbTitle).toContainText(data.verbTitle);
      await expect(wordToPdf.verbCopy).toContainText(data.verbCopy);
      await expect(wordToPdf.selectFilesButton).toBeVisible();
      await expect(wordToPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await wordToPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(wordToPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await wordToPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(wordToPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = wordToPdf;
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
      await wordToPdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await wordToPdf.caasSection.scrollIntoViewIfNeeded();
      await expect(wordToPdf.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await wordToPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(wordToPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await wordToPdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(wordToPdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(wordToPdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = wordToPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await wordToPdf.footer.scrollIntoViewIfNeeded();
      await expect(wordToPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample Word file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        wordToPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(wordFilePath);
      await page.waitForTimeout(2000);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

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
