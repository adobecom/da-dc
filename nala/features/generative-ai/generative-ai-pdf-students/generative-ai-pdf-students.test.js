import { expect, test } from '@playwright/test';
import GenerativeAiPdfStudentsPage from './generative-ai-pdf-students.page.js';
import { features } from './generative-ai-pdf-students.spec.js';
import { checkPageLinks } from '../../../utils/link-checker.js';

let gai;

test.describe('Acrobat Generative AI PDF — Students', () => {
  test.beforeEach(async ({ page }) => {
    gai = new GenerativeAiPdfStudentsPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Generative AI PDF Students] ${baseURL}${path}`);

    await test.step('Go to Generative AI PDF (students) page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await gai.gnav.waitFor({ state: 'visible' });
      await expect(gai.gnav).toBeVisible();
      await expect(gai.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(gai.heroMarquee).toBeVisible();
    });

    await test.step('Verify section with spacing utility classes', async () => {
      const section = gai.sectionSpacingSection.first();
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      const threeUp = gai.threeUpSection;
      await threeUp.scrollIntoViewIfNeeded();
      await expect(threeUp).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify AI prompt tabs (students)', async () => {
      await expect(gai.genAiStudentsTabs).toBeVisible();
      await expect(gai.genAiStudentsTabButtons).toHaveCount(5);

      await expect(gai.genAiStudentsTabAsk).toBeVisible();
      await expect(gai.genAiStudentsTabAsk).toHaveAttribute('aria-selected', 'true');
      await expect(gai.genAiStudentsPanelAsk).toBeVisible();
      await expect(gai.genAiStudentsPanelAsk.locator('.prompt-card')).toHaveCount(4);
      await expect(gai.genAiStudentsPanelAsk.locator('a[href*="ai-prompts"]')).toBeVisible();

      await gai.genAiStudentsTabAnalyze.click();
      await expect(gai.genAiStudentsTabAnalyze).toHaveAttribute('aria-selected', 'true');
      await expect(gai.genAiStudentsPanelAnalyze).toBeVisible();
      await expect(gai.genAiStudentsPanelAnalyze.locator('.prompt-card')).toHaveCount(4);
      await expect(gai.genAiStudentsPanelAnalyze.locator('a[href*="ai-prompts"]')).toBeVisible();

      await gai.genAiStudentsTabModify.click();
      await expect(gai.genAiStudentsTabModify).toHaveAttribute('aria-selected', 'true');
      await expect(gai.genAiStudentsPanelModify).toBeVisible();
      await expect(gai.genAiStudentsPanelModify.locator('.prompt-card')).toHaveCount(4);
      await expect(gai.genAiStudentsPanelModify.locator('a[href*="ai-prompts"]')).toBeVisible();

      await gai.genAiStudentsTabGenerate.click();
      await expect(gai.genAiStudentsTabGenerate).toHaveAttribute('aria-selected', 'true');
      await expect(gai.genAiStudentsPanelGenerate).toBeVisible();
      await expect(gai.genAiStudentsPanelGenerate.locator('.prompt-card')).toHaveCount(4);
      await expect(gai.genAiStudentsPanelGenerate.locator('a[href*="ai-prompts"]')).toBeVisible();

      await gai.genAiStudentsTabBrainstorm.click();
      await expect(gai.genAiStudentsTabBrainstorm).toHaveAttribute('aria-selected', 'true');
      await expect(gai.genAiStudentsPanelBrainstorm).toBeVisible();
      await expect(gai.genAiStudentsPanelBrainstorm.locator('.prompt-card')).toHaveCount(4);
      await expect(gai.genAiStudentsPanelBrainstorm.locator('a[href*="ai-prompts"]')).toBeVisible();
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = gai;
      await expect(faqSection).toBeVisible();

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

    await test.step('Verify footer', async () => {
      await gai.footer.scrollIntoViewIfNeeded();
      await expect(gai.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify visible checkout links are visible and enabled', async () => {
      const checkoutLinks = page.locator('a[is="checkout-link"]');
      const count = await checkoutLinks.count();
      for (let i = 0; i < count; i += 1) {
        const link = checkoutLinks.nth(i);
        if (!(await link.isVisible())) continue;
        await link.scrollIntoViewIfNeeded();
        await expect(link).toBeVisible();
        await expect(link).toBeEnabled();
      }
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });
  });
});
