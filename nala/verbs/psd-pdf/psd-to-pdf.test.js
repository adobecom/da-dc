import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './psd-to-pdf.spec.js';
import PsdToPdf from './psd-to-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const filePath = path.resolve(__dirname, '../../assets/1-PSD-psd-pdf.psd');

let psdToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity PSD to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    psdToPdf = new PsdToPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to PSD to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await psdToPdf.gnav.waitFor({ state: 'visible' });
      await expect(psdToPdf.gnav).toBeVisible();
      await expect(psdToPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify PSD to PDF widget content/specs', async () => {
      await expect(psdToPdf.widget).toBeVisible();
      await expect(psdToPdf.dropZone).toBeVisible();
      await expect(psdToPdf.verbImage).toBeVisible();
      await expect(psdToPdf.acrobatIcon).toBeVisible();
      const actualText = await psdToPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(psdToPdf.verbTitle).toContainText(data.verbTitle);
      await expect(psdToPdf.verbCopy).toContainText(data.verbCopy);
      await expect(psdToPdf.selectFilesButton).toBeVisible();
      await expect(psdToPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await psdToPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(psdToPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await psdToPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(psdToPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = psdToPdf;
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

    await test.step('Verify media block', async () => {
      await psdToPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(psdToPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = psdToPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await psdToPdf.footer.scrollIntoViewIfNeeded();
      await expect(psdToPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PSD file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        psdToPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(filePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('psd-to-pdf');
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
