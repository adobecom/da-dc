import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './ppt-to-pdf.spec.js';
import PptToPdf from './ppt-to-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pptFilePath = path.resolve(__dirname, '../../assets/1-PPT-ppt-pdf.pptx');

let pptToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity PPT to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    pptToPdf = new PptToPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to PPT to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await pptToPdf.gnav.waitFor({ state: 'visible' });
      await expect(pptToPdf.gnav).toBeVisible();
      await expect(pptToPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify PPT to PDF widget content/specs', async () => {
      await expect(pptToPdf.widget).toBeVisible();
      await expect(pptToPdf.dropZone).toBeVisible();
      await expect(pptToPdf.verbImage).toBeVisible();
      await expect(pptToPdf.acrobatIcon).toBeVisible();
      const actualText = await pptToPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(pptToPdf.verbTitle).toContainText(data.verbTitle);
      await expect(pptToPdf.verbCopy).toContainText(data.verbCopy);
      await expect(pptToPdf.selectFilesButton).toBeVisible();
      await expect(pptToPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await pptToPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(pptToPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await pptToPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(pptToPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = pptToPdf;
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
      await pptToPdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await pptToPdf.caasSection.scrollIntoViewIfNeeded();
      await expect(pptToPdf.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await pptToPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(pptToPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await pptToPdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(pptToPdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(pptToPdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = pptToPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      // await expect(columnsATags).toHaveCount(32);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await pptToPdf.footer.scrollIntoViewIfNeeded();
      await expect(pptToPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PowerPoint file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        pptToPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pptFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('ppt-to-pdf');
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
