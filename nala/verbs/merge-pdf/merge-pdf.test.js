import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './merge-pdf.spec.js';
import MergePdf from './merge-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-merge-pdf.pdf');

let mergePdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Merge PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    mergePdf = new MergePdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Merge PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await mergePdf.gnav.waitFor({ state: 'visible' });
      await expect(mergePdf.gnav).toBeVisible();
      await expect(mergePdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Merge PDF widget content/specs', async () => {
      await expect(mergePdf.widget).toBeVisible();
      await expect(mergePdf.dropZone).toBeVisible();
      await expect(mergePdf.verbImage).toBeVisible();
      await expect(mergePdf.acrobatIcon).toBeVisible();
      const actualText = await mergePdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(mergePdf.verbTitle).toContainText(data.verbTitle);
      await expect(mergePdf.verbCopy).toContainText(data.verbCopy);
      await expect(mergePdf.selectFilesButton).toBeVisible();
      await expect(mergePdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await mergePdf.howToSection.scrollIntoViewIfNeeded();
      await expect(mergePdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await mergePdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(mergePdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = mergePdf;
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

    await test.step('Verify three-up section last', async () => {
      await mergePdf.threeUpSectionLast.scrollIntoViewIfNeeded();
      await expect(mergePdf.threeUpSectionLast).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify CaaS section', async () => {
      await mergePdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await mergePdf.caasSection.scrollIntoViewIfNeeded();
      await expect(mergePdf.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await mergePdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(mergePdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await mergePdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(mergePdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(mergePdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = mergePdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await mergePdf.footer.scrollIntoViewIfNeeded();
      await expect(mergePdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        mergePdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('combine-pdf');
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
