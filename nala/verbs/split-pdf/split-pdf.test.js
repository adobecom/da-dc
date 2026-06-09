import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './split-pdf.spec.js';
import SplitPdf from './split-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-split-pdf.pdf');

let splitPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Split PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    splitPdf = new SplitPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Split PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await splitPdf.gnav.waitFor({ state: 'visible' });
      await expect(splitPdf.gnav).toBeVisible();
      await expect(splitPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Split PDF widget content/specs', async () => {
      await expect(splitPdf.widget).toBeVisible();
      await expect(splitPdf.dropZone).toBeVisible();
      await expect(splitPdf.verbImage).toBeVisible();
      await expect(splitPdf.acrobatIcon).toBeVisible();
      const actualText = await splitPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(splitPdf.verbTitle).toContainText(data.verbTitle);
      await expect(splitPdf.verbCopy).toContainText(data.verbCopy);
      await expect(splitPdf.selectFilesButton).toBeVisible();
      await expect(splitPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await splitPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(splitPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await splitPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(splitPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = splitPdf;
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
      await splitPdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await splitPdf.caasSection.scrollIntoViewIfNeeded();
      await expect(splitPdf.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await splitPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(splitPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await splitPdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(splitPdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(splitPdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = splitPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await splitPdf.footer.scrollIntoViewIfNeeded();
      await expect(splitPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        splitPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('split-pdf');
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
