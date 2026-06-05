import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './jpg-to-pdf.spec.js';
import JpgToPdf from './jpg-to-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const jpgFilePath = path.resolve(__dirname, '../../assets/1-JPG-jpg-pdf.jpg');

let jpgToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity JPG to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    jpgToPdf = new JpgToPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to JPG to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await jpgToPdf.gnav.waitFor({ state: 'visible' });
      await expect(jpgToPdf.gnav).toBeVisible();
      await expect(jpgToPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify JPG to PDF widget content/specs', async () => {
      await expect(jpgToPdf.widget).toBeVisible();
      await expect(jpgToPdf.dropZone).toBeVisible();
      await expect(jpgToPdf.verbImage).toBeVisible();
      await expect(jpgToPdf.acrobatIcon).toBeVisible();
      const actualText = await jpgToPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(jpgToPdf.verbTitle).toContainText(data.verbTitle);
      await expect(jpgToPdf.verbCopy).toContainText(data.verbCopy);
      await expect(jpgToPdf.selectFilesButton).toBeVisible();
      await expect(jpgToPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await jpgToPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(jpgToPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await jpgToPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(jpgToPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = jpgToPdf;
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

    // TODO: Investigate CaaS section flakiness on Chrome (async hydration / late attach).
    // await test.step('Verify CaaS section', async () => {
    // await jpgToPdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
    // await jpgToPdf.caasSection.scrollIntoViewIfNeeded();
    // await expect(jpgToPdf.caasSection).toBeVisible({ timeout: 60000 });
    // });


    await test.step('Verify media block', async () => {
      await jpgToPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(jpgToPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await jpgToPdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(jpgToPdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(jpgToPdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = jpgToPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await jpgToPdf.footer.scrollIntoViewIfNeeded();
      await expect(jpgToPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample image file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        jpgToPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(jpgFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('jpg-to-pdf');
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
