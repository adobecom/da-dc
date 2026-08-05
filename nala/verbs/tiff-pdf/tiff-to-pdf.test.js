import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './tiff-to-pdf.spec.js';
import TiffToPdf from './tiff-to-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const filePath = path.resolve(__dirname, '../../assets/1-TIFF-tiff-pdf.tiff');

let tiffToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity TIFF to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    tiffToPdf = new TiffToPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to TIFF to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await tiffToPdf.gnav.waitFor({ state: 'visible' });
      await expect(tiffToPdf.gnav).toBeVisible();
      await expect(tiffToPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify TIFF to PDF widget content/specs', async () => {
      await expect(tiffToPdf.widget).toBeVisible();
      await expect(tiffToPdf.dropZone).toBeVisible();
      await expect(tiffToPdf.verbImage).toBeVisible();
      await expect(tiffToPdf.acrobatIcon).toBeVisible();
      const actualText = await tiffToPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(tiffToPdf.verbTitle).toContainText(data.verbTitle);
      await expect(tiffToPdf.verbCopy).toContainText(data.verbCopy);
      await expect(tiffToPdf.selectFilesButton).toBeVisible();
      await expect(tiffToPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await tiffToPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(tiffToPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await tiffToPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(tiffToPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = tiffToPdf;
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
      await tiffToPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(tiffToPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = tiffToPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await tiffToPdf.footer.scrollIntoViewIfNeeded();
      await expect(tiffToPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample TIFF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        tiffToPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(filePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('tiff-to-pdf');
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
