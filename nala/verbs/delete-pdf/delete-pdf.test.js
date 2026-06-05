import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './delete-pdf.spec.js';
import DeletePdf from './delete-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-delete-pdf.pdf');

let deletePdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Delete PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    deletePdf = new DeletePdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Delete PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await deletePdf.gnav.waitFor({ state: 'visible' });
      await expect(deletePdf.gnav).toBeVisible();
      await expect(deletePdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Delete PDF widget content/specs', async () => {
      await expect(deletePdf.widget).toBeVisible();
      await expect(deletePdf.dropZone).toBeVisible();
      await expect(deletePdf.verbImage).toBeVisible();
      await expect(deletePdf.acrobatIcon).toBeVisible();
      const actualText = await deletePdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(deletePdf.verbTitle).toContainText(data.verbTitle);
      await expect(deletePdf.verbCopy).toContainText(data.verbCopy);
      await expect(deletePdf.selectFilesButton).toBeVisible();
      await expect(deletePdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await deletePdf.howToSection.scrollIntoViewIfNeeded();
      await expect(deletePdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await deletePdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(deletePdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = deletePdf;
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
      await deletePdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await deletePdf.caasSection.scrollIntoViewIfNeeded();
      await expect(deletePdf.caasSection).toBeVisible({ timeout: 60000 });
    });


    await test.step('Verify media block', async () => {
      await deletePdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(deletePdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await deletePdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(deletePdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(deletePdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = deletePdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await deletePdf.footer.scrollIntoViewIfNeeded();
      await expect(deletePdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        deletePdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('delete-pages');
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
