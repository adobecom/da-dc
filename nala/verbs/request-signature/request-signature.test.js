import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './request-signature.spec.js';
import RequestSignature from './request-signature.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-request-signature-pdf.pdf');

let requestSignature;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Request Signature test suite', () => {
  test.beforeEach(async ({ page }) => {
    requestSignature = new RequestSignature(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Request Signature test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await requestSignature.gnav.waitFor({ state: 'visible' });
      await expect(requestSignature.gnav).toBeVisible();
      await expect(requestSignature.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Request Signature widget content/specs', async () => {
      await expect(requestSignature.widget).toBeVisible();
      await expect(requestSignature.dropZone).toBeVisible();
      await expect(requestSignature.verbImage).toBeVisible();
      await expect(requestSignature.acrobatIcon).toBeVisible();
      const actualText = await requestSignature.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(requestSignature.verbTitle).toContainText(data.verbTitle);
      await expect(requestSignature.verbCopy).toContainText(data.verbCopy);
      await expect(requestSignature.selectFilesButton).toBeVisible();
      await expect(requestSignature.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await requestSignature.howToSection.scrollIntoViewIfNeeded();
      await expect(requestSignature.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await requestSignature.threeUpSection.scrollIntoViewIfNeeded();
      await expect(requestSignature.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = requestSignature;
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
      await requestSignature.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await requestSignature.caasSection.scrollIntoViewIfNeeded();
      await expect(requestSignature.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await requestSignature.mediaSection.scrollIntoViewIfNeeded();
      await expect(requestSignature.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await requestSignature.rnrSection.scrollIntoViewIfNeeded();
      await expect(requestSignature.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(requestSignature.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = requestSignature;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await requestSignature.footer.scrollIntoViewIfNeeded();
      await expect(requestSignature.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        requestSignature.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('sendforsignature');
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
