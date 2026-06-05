import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './add-pdf-number.spec.js';
import AddPdfNumberPage from './add-pdf-number.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-AddPageNumbers-pdf.pdf');

let addPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Add PDF page number test suite', () => {
  test.beforeEach(async ({ page }) => {
    addPdf = new AddPdfNumberPage(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Add PDF page numbers test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await addPdf.gnav.waitFor({ state: 'visible' });
      await expect(addPdf.gnav).toBeVisible();
      await expect(addPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Add PDF page numbers widget content/specs', async () => {
      await expect(addPdf.widget).toBeVisible();
      await expect(addPdf.dropZone).toBeVisible();
      await expect(addPdf.verbImage).toBeVisible();
      await expect(addPdf.acrobatIcon).toBeVisible();
      const actualText = await addPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(addPdf.verbTitle).toContainText(data.verbTitle);
      await expect(addPdf.verbCopy).toContainText(data.verbCopy);
      await expect(addPdf.selectFilesButton).toBeVisible();
      await expect(addPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await addPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(addPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await addPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(addPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = addPdf;
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
      await addPdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await addPdf.caasSection.scrollIntoViewIfNeeded();
      await expect(addPdf.caasSection).toBeVisible({ timeout: 60000 });
    });


    await test.step('Verify media block', async () => {
      await addPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(addPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await addPdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(addPdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(addPdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = addPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await addPdf.footer.scrollIntoViewIfNeeded();
      await expect(addPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        addPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('number-pages');
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
