import { expect, test } from '@playwright/test';
import PricingCompareVersionsPage from './compare-versions.page.js';
import { features } from './compare-versions.spec.js';
import { checkPageLinks } from '../../../utils/link-checker.js';

const CHECKOUT_OSI = 'ueZxdqCMpxWZewzvKQb5qmlffllcKzDkTj-kYwtKJ1c';

let pricing;

test.describe('Acrobat Pricing — Compare versions', () => {
  test.beforeEach(async ({ page }) => {
    pricing = new PricingCompareVersionsPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Pricing Compare versions] ${baseURL}${path}`);

    await test.step('Go to compare versions', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await pricing.gnav.waitFor({ state: 'visible' });
      await expect(pricing.gnav).toBeVisible();
      await expect(pricing.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(pricing.heroMarquee).toBeVisible();
    });

    await test.step('Verify first three-up section', async () => {
      const firstThreeUp = pricing.firstThreeUpSection;
      await firstThreeUp.scrollIntoViewIfNeeded();
      await expect(firstThreeUp).toBeVisible();
    });

    await test.step('Verify compare versions table', async () => {
      const table = pricing.compareVersionsTable;
      await expect(table).toBeVisible();

      const headingRow = table.locator('div.row-heading');
      await expect(headingRow).toBeVisible();

      const colHeadings = headingRow.locator('div[role="columnheader"]');
      await expect(colHeadings).toHaveCount(4);

      const headingLinks = headingRow.locator('a');
      const headingLinkCount = await headingLinks.count();
      for (let i = 0; i < headingLinkCount; i += 1) {
        await expect(headingLinks.nth(i)).toBeVisible();
        await expect(headingLinks.nth(i)).toBeEnabled();
      }

      const headingButtons = headingRow.locator('button');
      const headingButtonCount = await headingButtons.count();
      for (let i = 0; i < headingButtonCount; i += 1) {
        await expect(headingButtons.nth(i)).toBeVisible();
        await expect(headingButtons.nth(i)).toBeEnabled();
      }

      const featureRows = table.locator('div.section-row');
      const rowCount = await featureRows.count();
      expect(rowCount).toBeGreaterThan(0);

      const checkmarks = table.locator('span.icon-checkmark');
      const checkmarkCount = await checkmarks.count();
      expect(checkmarkCount).toBeGreaterThan(0);
    });

    await test.step('Verify checkout link (OSI)', async () => {
      const checkoutLink = pricing.checkoutLinkByOsi(CHECKOUT_OSI);
      await expect(checkoutLink).toBeVisible();
      await expect(checkoutLink).toBeEnabled();
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = pricing;
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
      await pricing.footer.scrollIntoViewIfNeeded();
      await expect(pricing.footer).toBeVisible({ timeout: 60000 });
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
