import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './extract-pdf.spec.js';
import ExtractPages from './extract-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-extract-pages-pdf.pdf');

let extractPages;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Extract PDF Pages test suite', () => {
  test.beforeEach(async ({ page }) => {
    extractPages = new ExtractPages(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Extract PDF Pages test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await extractPages.gnav.waitFor({ state: 'visible' });
      await expect(extractPages.gnav).toBeVisible();
      await expect(extractPages.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Extract PDF Pages widget content/specs', async () => {
      await expect(extractPages.widget).toBeVisible();
      await expect(extractPages.dropZone).toBeVisible();
      await expect(extractPages.verbImage).toBeVisible();
      await expect(extractPages.acrobatIcon).toBeVisible();
      const actualText = await extractPages.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(extractPages.verbTitle).toContainText(data.verbTitle);
      await expect(extractPages.verbCopy).toContainText(data.verbCopy);
      await expect(extractPages.selectFilesButton).toBeVisible();
      await expect(extractPages.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await extractPages.howToSection.scrollIntoViewIfNeeded();
      await expect(extractPages.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await extractPages.threeUpSection.scrollIntoViewIfNeeded();
      await expect(extractPages.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = extractPages;
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
      await extractPages.caasSection.scrollIntoViewIfNeeded();
      await expect(extractPages.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await extractPages.mediaSection.scrollIntoViewIfNeeded();
      await expect(extractPages.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await extractPages.rnrSection.scrollIntoViewIfNeeded();
      await expect(extractPages.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(extractPages.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = extractPages;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await extractPages.footer.scrollIntoViewIfNeeded();
      await expect(extractPages.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        extractPages.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

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
