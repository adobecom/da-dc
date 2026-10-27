import { expect, test } from '@playwright/test';
import PlansPage from './plans.page.js';
import { features } from './plans.spec.js';
import checkPageLinks from '../../../utils/link-checker.js';

let plans;

test.describe('Acrobat Plans', () => {
  test.beforeEach(async ({ page }) => {
    plans = new PlansPage(page);
  });

  features.forEach((feature) => {
    test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
      const { path, data: { tabId } } = feature;
      console.info(`[Acrobat Plans] ${baseURL}${path}`);

      await test.step('Go to plans page', async () => {
        await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
      });

      await test.step('Verify global nav (smoke)', async () => {
        await plans.gnav.waitFor({ state: 'visible' });
        await expect(plans.gnav).toBeVisible();
      });

      await test.step('Verify plan tabs and selected tab', async () => {
        await expect(plans.tabs).toHaveCount(3, { timeout: 60000 });
        await expect(plans.tab(tabId)).toHaveAttribute('aria-selected', 'true');
      });

      await test.step('Verify merch cards in selected tab', async () => {
        const panel = plans.tabPanel(tabId);
        await expect(panel).toBeVisible();
        const card = panel.locator('merch-card').filter({ visible: true }).first();
        await card.scrollIntoViewIfNeeded({ timeout: 60000 });
        await expect(card).toBeVisible();
      });

      await test.step('Verify visible checkout links are visible and enabled', async () => {
        const checkoutLinks = plans.tabPanel(tabId).locator('a[is="checkout-link"]').filter({ visible: true });
        const count = await checkoutLinks.count();
        for (let i = 0; i < count; i += 1) {
          const link = checkoutLinks.nth(i);
          await link.scrollIntoViewIfNeeded();
          await expect(link).toBeVisible();
          await expect(link).toBeEnabled();
        }
      });

      await test.step('Verify footer', async () => {
        await plans.footer.scrollIntoViewIfNeeded();
        await expect(plans.footer).toBeVisible({ timeout: 60000 });
      });

      await test.step('Verify no link leads to 404', async () => {
        await checkPageLinks(page, expect);
      });
    });
  });
});
