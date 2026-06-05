import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './png-to-pdf.spec.js';
import PngToPdf from './png-to-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pngFilePath = path.resolve(__dirname, '../../assets/1-PNG-png-pdf.png');

let pngToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity PNG to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    pngToPdf = new PngToPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to PNG to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await pngToPdf.gnav.waitFor({ state: 'visible' });
      await expect(pngToPdf.gnav).toBeVisible();
      await expect(pngToPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify PNG to PDF widget content/specs', async () => {
      await expect(pngToPdf.widget).toBeVisible();
      await expect(pngToPdf.dropZone).toBeVisible();
      await expect(pngToPdf.verbImage).toBeVisible();
      await expect(pngToPdf.acrobatIcon).toBeVisible();
      const actualText = await pngToPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(pngToPdf.verbTitle).toContainText(data.verbTitle);
      await expect(pngToPdf.verbCopy).toContainText(data.verbCopy);
      await expect(pngToPdf.selectFilesButton).toBeVisible();
      await expect(pngToPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await pngToPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(pngToPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await pngToPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(pngToPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = pngToPdf;
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
      await pngToPdf.caasSection.scrollIntoViewIfNeeded();
      await expect(pngToPdf.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await pngToPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(pngToPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await pngToPdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(pngToPdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(pngToPdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = pngToPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await pngToPdf.footer.scrollIntoViewIfNeeded();
      await expect(pngToPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PNG file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        pngToPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pngFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('png-to-pdf');
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
