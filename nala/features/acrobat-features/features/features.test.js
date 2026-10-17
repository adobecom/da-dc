import { expect, test } from '@playwright/test';
import FeaturesPage from './features.page.js';
import { features } from './features.spec.js';
import checkPageLinks from '../../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/get-acrobat-support';

let f;

test.describe('Acrobat Features', () => {
  test.beforeEach(async ({ page }) => {
    f = new FeaturesPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Acrobat Features] ${baseURL}${path}`);

    await test.step('Go to Acrobat features page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await f.gnav.waitFor({ state: 'visible' });
      await expect(f.gnav).toBeVisible();
      await expect(f.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(f.heroMarqueeSection).toBeVisible();
    });

    await test.step('Brief settle for below-the-fold', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Verify feature tabs and panel content changes', async () => {
      const tabsContainer = f.tabsFeaturesSection;
      await tabsContainer.scrollIntoViewIfNeeded();
      await expect(tabsContainer).toBeVisible();

      const tabButtons = tabsContainer.locator('button[role="tab"]');
      await expect(tabButtons).toHaveCount(5);

      const tabCount = await tabButtons.count();
      let previousPanelHeading = null;

      for (let i = 0; i < tabCount; i += 1) {
        const tab = tabButtons.nth(i);
        await expect(tab).toBeVisible();
        await expect(tab).toBeEnabled();

        await tab.click();
        await expect(tab).toHaveAttribute('aria-selected', 'true');

        const panelId = await tab.getAttribute('aria-controls');
        const panel = tabsContainer.locator(`#${panelId}`);
        await expect(panel).toBeVisible();

        const heading = panel.locator('h2, h3, h4').first();
        await expect(heading).toBeVisible({ timeout: 60000 });
        const headingText = (await heading.textContent())?.trim() ?? '';
        expect(headingText.length).toBeGreaterThan(0);
        if (previousPanelHeading !== null) {
          expect(headingText).not.toBe(previousPanelHeading);
        }
        previousPanelHeading = headingText;

        await expect(panel.locator('img, h2, h3, h4, p, a, li').first()).toBeVisible({ timeout: 60000 });
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

    await test.step('Verify Questions about / get Acrobat support section', async () => {
      const section = f.questionsAboutSection(QUESTIONS_ABOUT_DATA_PATH);
      await section.scrollIntoViewIfNeeded();
      const title = section.locator('h2');
      const description = section.locator('p');
      const links = section.locator('a');

      await expect(section).toBeVisible();
      await expect(title).toBeVisible();
      await expect(description.first()).toBeVisible();
      await expect(links.first()).toBeVisible();
      await expect(links.first()).toBeEnabled();
      await expect(links.first()).toHaveAttribute('href', expect.stringContaining('/acrobat/contact'));
      await expect(links.last()).toBeVisible();
      await expect(links.last()).toBeEnabled();
      await expect(links.last()).toHaveAttribute('href', /tel:/);
      await expect(links).toHaveCount(2);
    });

    await test.step('Verify footer', async () => {
      await f.footer.scrollIntoViewIfNeeded();
      await expect(f.footer).toBeVisible({ timeout: 60000 });
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
