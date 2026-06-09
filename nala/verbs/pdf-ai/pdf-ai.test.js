import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './pdf-ai.spec.js';
import PdfAi from './pdf-ai.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-ai-chat-pdf.pdf');

let pdfAi;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity PDF AI test suite', () => {
  test.beforeEach(async ({ page }) => {
    pdfAi = new PdfAi(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to PDF AI test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await pdfAi.gnav.waitFor({ state: 'visible' });
      await expect(pdfAi.gnav).toBeVisible();
      await expect(pdfAi.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify PDF AI widget content/specs', async () => {
      await expect(pdfAi.widget).toBeVisible();
      await expect(pdfAi.dropZone).toBeVisible();
      await expect(pdfAi.verbImage).toBeVisible();
      await expect(pdfAi.acrobatIcon).toBeVisible();
      const actualText = await pdfAi.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(pdfAi.verbTitle).toContainText(data.verbTitle);
      await expect(pdfAi.verbCopy).toContainText(data.verbCopy);
      await expect(pdfAi.selectFilesButton).toBeVisible();
    });

    await test.step('Verify how-to section', async () => {
      await pdfAi.howToSection.scrollIntoViewIfNeeded();
      await expect(pdfAi.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await pdfAi.threeUpSection.scrollIntoViewIfNeeded();
      await expect(pdfAi.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = pdfAi;
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
      await pdfAi.mediaSection.scrollIntoViewIfNeeded();
      await expect(pdfAi.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await pdfAi.rnrSection.scrollIntoViewIfNeeded();
      await expect(pdfAi.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(pdfAi.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = pdfAi;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await pdfAi.footer.scrollIntoViewIfNeeded();
      await expect(pdfAi.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        pdfAi.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('chat-pdf-pdf-ai');
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
