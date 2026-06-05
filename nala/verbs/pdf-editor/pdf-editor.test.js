import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './pdf-editor.spec.js';
import PdfEditor from './pdf-editor.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-pdf-editor.pdf');

let pdfEditor;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity PDF Editor test suite', () => {
  test.beforeEach(async ({ page }) => {
    pdfEditor = new PdfEditor(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    // Skip this test if running on webkit or firefox
    test.skip(({ browserName }) => browserName === 'webkit' || browserName === 'firefox', 'PDF Editor test only runs on Chromium');
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to PDF Editor test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await pdfEditor.gnav.waitFor({ state: 'visible' });
      await expect(pdfEditor.gnav).toBeVisible();
      await expect(pdfEditor.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify PDF Editor widget content/specs', async () => {
      await expect(pdfEditor.widget).toBeVisible();
      await expect(pdfEditor.dropZone).toBeVisible();
      await expect(pdfEditor.verbImage).toBeVisible();
      await expect(pdfEditor.acrobatIcon).toBeVisible();
      const actualText = await pdfEditor.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(pdfEditor.verbTitle).toContainText(data.verbTitle);
      await expect(pdfEditor.verbCopy).toContainText(data.verbCopy);
      await expect(pdfEditor.selectFilesButton).toBeVisible();
      await expect(pdfEditor.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await pdfEditor.howToSection.scrollIntoViewIfNeeded();
      await expect(pdfEditor.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await pdfEditor.threeUpSection.scrollIntoViewIfNeeded();
      await expect(pdfEditor.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify four-up section', async () => {
      await pdfEditor.fourUpSection.scrollIntoViewIfNeeded();
      await expect(pdfEditor.fourUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify quote block', async () => {
      await pdfEditor.quoteBlock.scrollIntoViewIfNeeded();
      await expect(pdfEditor.quoteBlock).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = pdfEditor;
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
      await pdfEditor.caasSection.scrollIntoViewIfNeeded();
      await expect(pdfEditor.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await pdfEditor.mediaSection.scrollIntoViewIfNeeded();
      await expect(pdfEditor.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await pdfEditor.rnrSection.scrollIntoViewIfNeeded();
      await expect(pdfEditor.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(pdfEditor.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = pdfEditor;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await pdfEditor.footer.scrollIntoViewIfNeeded();
      await expect(pdfEditor.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        pdfEditor.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('add-comment');
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
