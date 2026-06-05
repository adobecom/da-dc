import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './add-pages-to-pdf.spec.js';
import AddPagesToPdf from './add-pages-to-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-add-pages-to-pdf.pdf');

let addPagesToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Add Pages to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    addPagesToPdf = new AddPagesToPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Add Pages to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await addPagesToPdf.gnav.waitFor({ state: 'visible' });
      await expect(addPagesToPdf.gnav).toBeVisible();
      await expect(addPagesToPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Add Pages to PDF widget content/specs', async () => {
      await expect(addPagesToPdf.widget).toBeVisible();
      await expect(addPagesToPdf.dropZone).toBeVisible();
      await expect(addPagesToPdf.verbImage).toBeVisible();
      await expect(addPagesToPdf.acrobatIcon).toBeVisible();
      const actualText = await addPagesToPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(addPagesToPdf.verbTitle).toContainText(data.verbTitle);
      await expect(addPagesToPdf.verbCopy).toContainText(data.verbCopy);
      await expect(addPagesToPdf.selectFilesButton).toBeVisible();
      await expect(addPagesToPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await addPagesToPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(addPagesToPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await addPagesToPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(addPagesToPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = addPagesToPdf;
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
    // await addPagesToPdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
    // await addPagesToPdf.caasSection.scrollIntoViewIfNeeded();
    // await expect(addPagesToPdf.caasSection).toBeVisible({ timeout: 60000 });
    // });


    await test.step('Verify media block', async () => {
      await addPagesToPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(addPagesToPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await addPagesToPdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(addPagesToPdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(addPagesToPdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = addPagesToPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await addPagesToPdf.footer.scrollIntoViewIfNeeded();
      await expect(addPagesToPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        addPagesToPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('insert-pdf');
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
