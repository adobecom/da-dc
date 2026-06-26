import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './bmp-to-pdf.spec.js';
import BmpToPdf from './bmp-to-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const filePath = path.resolve(__dirname, '../../assets/1-BMP-bmp-pdf.bmp');

let bmpToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity BMP to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    bmpToPdf = new BmpToPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to BMP to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await bmpToPdf.gnav.waitFor({ state: 'visible' });
      await expect(bmpToPdf.gnav).toBeVisible();
      await expect(bmpToPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify BMP to PDF widget content/specs', async () => {
      await expect(bmpToPdf.widget).toBeVisible();
      await expect(bmpToPdf.dropZone).toBeVisible();
      await expect(bmpToPdf.verbImage).toBeVisible();
      await expect(bmpToPdf.acrobatIcon).toBeVisible();
      const actualText = await bmpToPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(bmpToPdf.verbTitle).toContainText(data.verbTitle);
      await expect(bmpToPdf.verbCopy).toContainText(data.verbCopy);
      await expect(bmpToPdf.selectFilesButton).toBeVisible();
      await expect(bmpToPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await bmpToPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(bmpToPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await bmpToPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(bmpToPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = bmpToPdf;
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
      await bmpToPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(bmpToPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = bmpToPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await bmpToPdf.footer.scrollIntoViewIfNeeded();
      await expect(bmpToPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample BMP file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        bmpToPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(filePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('bmp-to-pdf');
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
