import { expect, test } from '@playwright/test';
import GenerativeAiPdfPage from './generative-ai-pdf.page.js';
import { features } from './generative-ai-pdf.spec.js';
import checkPageLinks from '../../../utils/link-checker.js';

let gai;

test.describe('Acrobat Generative AI PDF', () => {
  test.beforeEach(async ({ page }) => {
    gai = new GenerativeAiPdfPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Generative AI PDF] ${baseURL}${path}`);

    await test.step('Go to Generative AI PDF page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('load');
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await gai.gnav.waitFor({ state: 'visible' });
      await expect(gai.gnav).toBeVisible();
      await expect(gai.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(gai.heroMarquee).toBeVisible();
    });

    await test.step('Verify masonry section(s)', async () => {
      await gai.heroMarquee.scrollIntoViewIfNeeded();
      await gai.masonrySections.first().waitFor({ state: 'attached', timeout: 60000 });
      const masonryCount = await gai.masonrySections.count();
      expect(masonryCount).toBeGreaterThan(0);
      for (let i = 0; i < masonryCount; i += 1) {
        const el = gai.masonrySections.nth(i);
        await el.scrollIntoViewIfNeeded();
        await expect(el).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify three-up section(s)', async () => {
      await gai.masonrySections.last().scrollIntoViewIfNeeded();
      await gai.threeUpSections.first().waitFor({ state: 'attached', timeout: 60000 });
      const threeUpCount = await gai.threeUpSections.count();
      expect(threeUpCount).toBeGreaterThan(0);
      for (let i = 0; i < threeUpCount; i += 1) {
        const el = gai.threeUpSections.nth(i);
        await el.scrollIntoViewIfNeeded();
        await expect(el).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify merch card plans and compare tabs', async () => {
      const merchCardPlans = page.locator('div[data-path*="/dc-shared/fragments/merch-cards/compare-acrobat-plans"]');
      const tabs = merchCardPlans.locator('button[id^="tab-compare-plans-"]');

      // Scroll the first tab into view, then switch through each tab and verify merch cards render.
      await tabs.first().scrollIntoViewIfNeeded({ timeout: 30000 });
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThan(0);

      for (let i = 0; i < tabCount; i += 1) {
        const tab = tabs.nth(i);
        await expect(tab).toBeVisible();
        await tab.click();
        const visibleCard = merchCardPlans.locator('merch-card').filter({ visible: true }).first();
        await expect(visibleCard).toBeVisible();
      }
    });

    await test.step('Verify existing Acrobat customer block', async () => {
      const block = gai.existingCustomerBlade;
      await block.scrollIntoViewIfNeeded();
      await expect(block).toBeVisible({ timeout: 60000 });
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
      const checkoutLinks = page.locator('a[is="checkout-link"]').filter({ visible: true });
      const count = await checkoutLinks.count();
      for (let i = 0; i < count; i += 1) {
        const link = checkoutLinks.nth(i);
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
