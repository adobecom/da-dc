import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './pdf-to-png.spec.js';
import PdfToPng from './pdf-to-png.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-pdf-png.pdf');

let pdfToPng;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity PDF to PNG test suite', () => {
  test.beforeEach(async ({ page }) => {
    pdfToPng = new PdfToPng(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to PDF to PNG test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await pdfToPng.gnav.waitFor({ state: 'visible' });
      await expect(pdfToPng.gnav).toBeVisible();
      await expect(pdfToPng.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify PDF to PNG widget content/specs', async () => {
      await expect(pdfToPng.widget).toBeVisible();
      await expect(pdfToPng.dropZone).toBeVisible();
      await expect(pdfToPng.verbImage).toBeVisible();
      await expect(pdfToPng.acrobatIcon).toBeVisible();
      const actualText = await pdfToPng.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(pdfToPng.verbTitle).toContainText(data.verbTitle);
      await expect(pdfToPng.verbCopy).toContainText(data.verbCopy);
      await expect(pdfToPng.selectFilesButton).toBeVisible();
      await expect(pdfToPng.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await pdfToPng.howToSection.scrollIntoViewIfNeeded();
      await expect(pdfToPng.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await pdfToPng.threeUpSection.scrollIntoViewIfNeeded();
      await expect(pdfToPng.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = pdfToPng;
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
      await pdfToPng.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await pdfToPng.caasSection.scrollIntoViewIfNeeded();
      await expect(pdfToPng.caasSection).toBeVisible({ timeout: 60000 });
    });


    await test.step('Verify media block', async () => {
      await pdfToPng.mediaSection.scrollIntoViewIfNeeded();
      await expect(pdfToPng.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await pdfToPng.rnrSection.scrollIntoViewIfNeeded();
      await expect(pdfToPng.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(pdfToPng.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = pdfToPng;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await pdfToPng.footer.scrollIntoViewIfNeeded();
      await expect(pdfToPng.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        pdfToPng.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('pdf-to-png');
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
