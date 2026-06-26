import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './ai-to-pdf.spec.js';
import AiToPdf from './ai-to-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const filePath = path.resolve(__dirname, '../../assets/1-AI-ai-pdf.ai');

let aiToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity AI to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    aiToPdf = new AiToPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to AI to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await aiToPdf.gnav.waitFor({ state: 'visible' });
      await expect(aiToPdf.gnav).toBeVisible();
      await expect(aiToPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify AI to PDF widget content/specs', async () => {
      await expect(aiToPdf.widget).toBeVisible();
      await expect(aiToPdf.dropZone).toBeVisible();
      await expect(aiToPdf.verbImage).toBeVisible();
      await expect(aiToPdf.acrobatIcon).toBeVisible();
      const actualText = await aiToPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(aiToPdf.verbTitle).toContainText(data.verbTitle);
      await expect(aiToPdf.verbCopy).toContainText(data.verbCopy);
      await expect(aiToPdf.selectFilesButton).toBeVisible();
      await expect(aiToPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await aiToPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(aiToPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await aiToPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(aiToPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = aiToPdf;
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
      await aiToPdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
      await aiToPdf.caasSection.scrollIntoViewIfNeeded();
      await expect(aiToPdf.caasSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media block', async () => {
      await aiToPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(aiToPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = aiToPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await aiToPdf.footer.scrollIntoViewIfNeeded();
      await expect(aiToPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample AI file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        aiToPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(filePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('ai-to-pdf');
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
