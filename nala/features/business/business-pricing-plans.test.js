import { expect, test } from '@playwright/test';
import BusinessPricingPlansPage from './business-pricing-plans.page.js';
import { features } from './business-pricing-plans.spec.js';

let pricingPlans;

test.describe('Acrobat Business — Pricing plans', () => {
  test.beforeEach(async ({ page }) => {
    pricingPlans = new BusinessPricingPlansPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Acrobat Business — Pricing plans] ${baseURL}${path}`);

    await test.step('Go to Acrobat Business pricing plans page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await pricingPlans.gnav.waitFor({ state: 'visible' });
      await expect(pricingPlans.gnav).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(pricingPlans.heroMarqueeSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify first sticky comparison table', async () => {
      const tables = pricingPlans.stickyComparisonTables;
      await expect.poll(async () => tables.count(), { timeout: 60000 }).toBeGreaterThanOrEqual(2);
      const firstTable = tables.nth(0);
      await firstTable.scrollIntoViewIfNeeded();
      await expect(firstTable).toBeVisible({ timeout: 60000 });
      const firstHeadingRow = firstTable.locator('div.row-heading');
      await expect(firstHeadingRow).toBeVisible();
      const firstFeatureRows = firstTable.locator('div.section-row');
      expect(await firstFeatureRows.count()).toBeGreaterThan(0);
    });

    await test.step('Verify two-up section', async () => {
      const twoUp = pricingPlans.twoUpSection;
      await twoUp.scrollIntoViewIfNeeded();
      await expect(twoUp).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      const threeUp = pricingPlans.threeUpSection;
      await threeUp.scrollIntoViewIfNeeded();
      await expect(threeUp).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify second sticky comparison table', async () => {
      const secondTable = pricingPlans.stickyComparisonTables.nth(1);
      await secondTable.scrollIntoViewIfNeeded();
      await expect(secondTable).toBeVisible({ timeout: 60000 });
      const secondHeadingRow = secondTable.locator('div.row-heading');
      await expect(secondHeadingRow).toBeVisible();
      const secondFeatureRows = secondTable.locator('div.section-row');
      expect(await secondFeatureRows.count()).toBeGreaterThan(0);
    });

    await test.step('Verify FAQ accordion', async () => {
      const { accordionSection, accordionTriggers } = pricingPlans;
      await accordionSection.scrollIntoViewIfNeeded();
      await expect(accordionSection).toBeVisible({ timeout: 60000 });

      const buttonCount = await accordionTriggers.count();
      expect(buttonCount).toBeGreaterThan(0);

      for (let i = 0; i < buttonCount; i += 1) {
        const button = accordionTriggers.nth(i);
        const ariaControls = await button.getAttribute('aria-controls');
        expect(ariaControls).toBeTruthy();
        const contentPanel = accordionSection.locator(`#${ariaControls}`);

        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'true');
        await expect(contentPanel).toBeVisible();

        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'false');
      }
    });

    await test.step('Verify quote block', async () => {
      const quote = pricingPlans.quoteBlock;
      await quote.scrollIntoViewIfNeeded();
      await expect(quote).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify footer', async () => {
      await pricingPlans.footer.scrollIntoViewIfNeeded();
      await expect(pricingPlans.footer).toBeVisible({ timeout: 60000 });
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
  });
});
