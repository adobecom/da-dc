import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './rearrange.spec.js';
import RearrangePdf from './rearrange.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-rearrange-pdf.pdf');

let rearrangePdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Rearrange PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    rearrangePdf = new RearrangePdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Rearrange PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await rearrangePdf.gnav.waitFor({ state: 'visible' });
      await expect(rearrangePdf.gnav).toBeVisible();
      await expect(rearrangePdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Rearrange PDF widget content/specs', async () => {
      await expect(rearrangePdf.widget).toBeVisible();
      await expect(rearrangePdf.dropZone).toBeVisible();
      await expect(rearrangePdf.verbImage).toBeVisible();
      await expect(rearrangePdf.acrobatIcon).toBeVisible();
      const actualText = await rearrangePdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(rearrangePdf.verbTitle).toContainText(data.verbTitle);
      await expect(rearrangePdf.verbCopy).toContainText(data.verbCopy);
      await expect(rearrangePdf.selectFilesButton).toBeVisible();
      await expect(rearrangePdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await rearrangePdf.howToSection.scrollIntoViewIfNeeded();
      await expect(rearrangePdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await rearrangePdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(rearrangePdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = rearrangePdf;
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
      await rearrangePdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await rearrangePdf.caasSection.scrollIntoViewIfNeeded();
      await expect(rearrangePdf.caasSection).toBeVisible({ timeout: 60000 });
    });


    await test.step('Verify media block', async () => {
      await rearrangePdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(rearrangePdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await rearrangePdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(rearrangePdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(rearrangePdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = rearrangePdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await rearrangePdf.footer.scrollIntoViewIfNeeded();
      await expect(rearrangePdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        rearrangePdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('reorder-pages');
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
