import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './ai-resume-builder.spec.js';
import AiResumeBuilderPage from './ai-resume-builder.page.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-WORD-word-pdf.doc');

let aiResumeBuilder;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity AI resume builder test suite', () => {
  test.beforeEach(async ({ page }) => {
    aiResumeBuilder = new AiResumeBuilderPage(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to AI resume builder test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await aiResumeBuilder.gnav.waitFor({ state: 'visible' });
      await expect(aiResumeBuilder.gnav).toBeVisible();
      await expect(aiResumeBuilder.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify AI resume builder widget content/specs', async () => {
      await expect(aiResumeBuilder.widget).toBeVisible();
      await expect(aiResumeBuilder.dropZone).toBeVisible();
      await expect(aiResumeBuilder.verbImage).toBeVisible();
      await expect(aiResumeBuilder.acrobatIcon).toBeVisible();
      const actualText = await aiResumeBuilder.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(aiResumeBuilder.verbTitle).toContainText(data.verbTitle);
      await expect(aiResumeBuilder.verbCopy).toBeVisible();
      await expect(aiResumeBuilder.selectFilesButton).toBeVisible();
      await expect(aiResumeBuilder.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify Adobe Express section', async () => {
      await aiResumeBuilder.adobeExpressHeading.scrollIntoViewIfNeeded();
      await expect(aiResumeBuilder.adobeExpressHeading).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify how-to section', async () => {
      await aiResumeBuilder.howToHeading.scrollIntoViewIfNeeded();
      await expect(aiResumeBuilder.howToHeading).toBeVisible({ timeout: 60000 });
    });

    await test.step(`Verify three-up sections (${data.sectionCounts.threeUp})`, async () => {
      const { threeUpSections } = aiResumeBuilder;
      const { threeUp } = data.sectionCounts;

      await expect(threeUpSections).toHaveCount(threeUp);

      for (let i = 0; i < threeUp; i += 1) {
        const section = threeUpSections.nth(i);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify four-up section', async () => {
      await aiResumeBuilder.fourUpSection.scrollIntoViewIfNeeded();
      await expect(aiResumeBuilder.fourUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify Try our free AI resume builder section', async () => {
      await aiResumeBuilder.tryFreeHeading.scrollIntoViewIfNeeded();
      await expect(aiResumeBuilder.tryFreeHeading).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = aiResumeBuilder;
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

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = aiResumeBuilder;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(32);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await aiResumeBuilder.footer.scrollIntoViewIfNeeded();
      await expect(aiResumeBuilder.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        aiResumeBuilder.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('resume-builder');
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
