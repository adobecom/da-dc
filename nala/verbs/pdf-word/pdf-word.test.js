import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './pdf-word.spec.js';
import PdfToWord from './pdf-word.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-pdf-word.pdf');

let pdfToWord;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity PDF to Word test suite', () => {
  test.beforeEach(async ({ page }) => {
    pdfToWord = new PdfToWord(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to PDF to Word test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await pdfToWord.gnav.waitFor({ state: 'visible' });
      await expect(pdfToWord.gnav).toBeVisible();
      await expect(pdfToWord.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify PDF to Word widget content/specs', async () => {
      await expect(pdfToWord.widget).toBeVisible();
      await expect(pdfToWord.dropZone).toBeVisible();
      await expect(pdfToWord.verbImage).toBeVisible();
      await expect(pdfToWord.acrobatIcon).toBeVisible();
      const actualText = await pdfToWord.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(pdfToWord.verbTitle).toContainText(data.verbTitle);
      await expect(pdfToWord.verbCopy).toContainText(data.verbCopy);
      await expect(pdfToWord.selectFilesButton).toBeVisible();
    });

    await test.step('Verify how-to section', async () => {
      await pdfToWord.howToSection.scrollIntoViewIfNeeded();
      await expect(pdfToWord.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await pdfToWord.threeUpSection.scrollIntoViewIfNeeded();
      await expect(pdfToWord.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = pdfToWord;
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
    // await pdfToWord.caasSection.waitFor({ state: 'attached', timeout: 90000 });
    // await pdfToWord.caasSection.scrollIntoViewIfNeeded();
    // await expect(pdfToWord.caasSection).toBeVisible({ timeout: 60000 });
    // });


    await test.step('Verify media block', async () => {
      await pdfToWord.mediaSection.scrollIntoViewIfNeeded();
      await expect(pdfToWord.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await pdfToWord.rnrSection.scrollIntoViewIfNeeded();
      await expect(pdfToWord.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(pdfToWord.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = pdfToWord;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await pdfToWord.footer.scrollIntoViewIfNeeded();
      await expect(pdfToWord.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        pdfToWord.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('pdf-to-word');
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
