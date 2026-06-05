import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './password-protect-pdf.spec.js';
import PasswordProtectPdf from './password-protect-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-password-protect-pdf.pdf');

let passwordProtectPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Password Protect PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    passwordProtectPdf = new PasswordProtectPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Password Protect PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await passwordProtectPdf.gnav.waitFor({ state: 'visible' });
      await expect(passwordProtectPdf.gnav).toBeVisible();
      await expect(passwordProtectPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Password Protect PDF widget content/specs', async () => {
      await expect(passwordProtectPdf.widget).toBeVisible();
      await expect(passwordProtectPdf.dropZone).toBeVisible();
      await expect(passwordProtectPdf.verbImage).toBeVisible();
      await expect(passwordProtectPdf.acrobatIcon).toBeVisible();
      const actualText = await passwordProtectPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(passwordProtectPdf.verbTitle).toContainText(data.verbTitle);
      await expect(passwordProtectPdf.verbCopy).toContainText(data.verbCopy);
      await expect(passwordProtectPdf.selectFilesButton).toBeVisible();
      await expect(passwordProtectPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await passwordProtectPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(passwordProtectPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await passwordProtectPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(passwordProtectPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = passwordProtectPdf;
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
      await passwordProtectPdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await passwordProtectPdf.caasSection.scrollIntoViewIfNeeded();
      await expect(passwordProtectPdf.caasSection).toBeVisible({ timeout: 60000 });
    });


    await test.step('Verify media block', async () => {
      await passwordProtectPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(passwordProtectPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await passwordProtectPdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(passwordProtectPdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(passwordProtectPdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = passwordProtectPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await passwordProtectPdf.footer.scrollIntoViewIfNeeded();
      await expect(passwordProtectPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        passwordProtectPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('protect-pdf');
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
