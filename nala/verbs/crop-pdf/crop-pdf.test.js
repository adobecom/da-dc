import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './crop-pdf.spec.js';
import CropPdf from './crop-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-crop-pdf.pdf');

let cropPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Crop PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    cropPdf = new CropPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Crop PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await cropPdf.gnav.waitFor({ state: 'visible' });
      await expect(cropPdf.gnav).toBeVisible();
      await expect(cropPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Crop PDF widget content/specs', async () => {
      await expect(cropPdf.widget).toBeVisible();
      await expect(cropPdf.dropZone).toBeVisible();
      await expect(cropPdf.verbImage).toBeVisible();
      await expect(cropPdf.acrobatIcon).toBeVisible();
      const actualText = await cropPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(cropPdf.verbTitle).toContainText(data.verbTitle);
      await expect(cropPdf.verbCopy).toContainText(data.verbCopy);
      await expect(cropPdf.selectFilesButton).toBeVisible();
      await expect(cropPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await cropPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(cropPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await cropPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(cropPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = cropPdf;
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
      await cropPdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await cropPdf.caasSection.scrollIntoViewIfNeeded();
      await expect(cropPdf.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await cropPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(cropPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await cropPdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(cropPdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(cropPdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = cropPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await cropPdf.footer.scrollIntoViewIfNeeded();
      await expect(cropPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        cropPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('crop-pages');
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
