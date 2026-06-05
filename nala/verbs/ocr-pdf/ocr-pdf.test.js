import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './ocr-pdf.spec.js';
import OcrPdf from './ocr-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-ocr-pdf.pdf');

let ocrPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity OCR PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    ocrPdf = new OcrPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to OCR PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await ocrPdf.gnav.waitFor({ state: 'visible' });
      await expect(ocrPdf.gnav).toBeVisible();
      await expect(ocrPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify OCR PDF widget content/specs', async () => {
      await expect(ocrPdf.widget).toBeVisible();
      await expect(ocrPdf.dropZone).toBeVisible();
      await expect(ocrPdf.verbImage).toBeVisible();
      await expect(ocrPdf.acrobatIcon).toBeVisible();
      const actualText = await ocrPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(ocrPdf.verbTitle).toContainText(data.verbTitle);

      const userAgent = await page.evaluate(() => navigator.userAgent);
      const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);

      if (isMobile) {
        await expect(ocrPdf.verbCopy).toContainText(data.verbCopyMobile);
      } else {
        await expect(ocrPdf.verbCopy).toContainText(data.verbCopy);
      }

      await expect(ocrPdf.selectFilesButton).toBeVisible();
      await expect(ocrPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await ocrPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(ocrPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await ocrPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(ocrPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = ocrPdf;
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
      await ocrPdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await ocrPdf.caasSection.scrollIntoViewIfNeeded();
      await expect(ocrPdf.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await ocrPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(ocrPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await ocrPdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(ocrPdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(ocrPdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = ocrPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await ocrPdf.footer.scrollIntoViewIfNeeded();
      await expect(ocrPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        ocrPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('ocr-pdf');
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
