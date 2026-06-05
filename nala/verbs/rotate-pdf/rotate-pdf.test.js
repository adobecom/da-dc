import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './rotate-pdf.spec.js';
import RotatePdf from './rotate-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-rotate-pdf.pdf');

let rotatePdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Rotate PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    rotatePdf = new RotatePdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Rotate PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await rotatePdf.gnav.waitFor({ state: 'visible' });
      await expect(rotatePdf.gnav).toBeVisible();
      await expect(rotatePdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Rotate PDF widget content/specs', async () => {
      await expect(rotatePdf.widget).toBeVisible();
      await expect(rotatePdf.dropZone).toBeVisible();
      await expect(rotatePdf.verbImage).toBeVisible();
      await expect(rotatePdf.acrobatIcon).toBeVisible();
      const actualText = await rotatePdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(rotatePdf.verbTitle).toContainText(data.verbTitle);
      await expect(rotatePdf.verbCopy).toContainText(data.verbCopy);
      await expect(rotatePdf.selectFilesButton).toBeVisible();
      await expect(rotatePdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await rotatePdf.howToSection.scrollIntoViewIfNeeded();
      await expect(rotatePdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await rotatePdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(rotatePdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = rotatePdf;
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
      await rotatePdf.caasSection.scrollIntoViewIfNeeded();
      await expect(rotatePdf.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await rotatePdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(rotatePdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await rotatePdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(rotatePdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(rotatePdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = rotatePdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await rotatePdf.footer.scrollIntoViewIfNeeded();
      await expect(rotatePdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        rotatePdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('rotate-pages');
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
