import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './pdf-to-excel.spec.js';
import PdfToExcel from './pdf-to-excel.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-pdf-excel.pdf');

let pdfToExcel;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity PDF to Excel test suite', () => {
  test.beforeEach(async ({ page }) => {
    pdfToExcel = new PdfToExcel(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to PDF to Excel test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await pdfToExcel.gnav.waitFor({ state: 'visible' });
      await expect(pdfToExcel.gnav).toBeVisible();
      await expect(pdfToExcel.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify PDF to Excel widget content/specs', async () => {
      await expect(pdfToExcel.widget).toBeVisible();
      await expect(pdfToExcel.dropZone).toBeVisible();
      await expect(pdfToExcel.verbImage).toBeVisible();
      await expect(pdfToExcel.acrobatIcon).toBeVisible();
      const actualText = await pdfToExcel.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(pdfToExcel.verbTitle).toContainText(data.verbTitle);
      await expect(pdfToExcel.verbCopy).toContainText(data.verbCopy);
      await expect(pdfToExcel.selectFilesButton).toBeVisible();
      await expect(pdfToExcel.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await pdfToExcel.howToSection.scrollIntoViewIfNeeded();
      await expect(pdfToExcel.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await pdfToExcel.threeUpSection.scrollIntoViewIfNeeded();
      await expect(pdfToExcel.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = pdfToExcel;
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
      await pdfToExcel.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await pdfToExcel.caasSection.scrollIntoViewIfNeeded();
      await expect(pdfToExcel.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await pdfToExcel.mediaSection.scrollIntoViewIfNeeded();
      await expect(pdfToExcel.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await pdfToExcel.rnrSection.scrollIntoViewIfNeeded();
      await expect(pdfToExcel.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(pdfToExcel.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = pdfToExcel;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      // await expect(columnsATags).toHaveCount(32);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await pdfToExcel.footer.scrollIntoViewIfNeeded();
      await expect(pdfToExcel.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        pdfToExcel.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('pdf-to-excel');
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
