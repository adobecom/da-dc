import { expect, test } from '@playwright/test';
import AcrobatBusinessPage from './acrobat-business.page.js';
import { features } from './acrobat-business.spec.js';

let acrobatBusiness;

test.describe('Acrobat Business — Landing', () => {
  test.beforeEach(async ({ page }) => {
    acrobatBusiness = new AcrobatBusinessPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Acrobat Business] ${baseURL}${path}`);

    await test.step('Go to Acrobat Business page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await acrobatBusiness.gnav.waitFor({ state: 'visible' });
      await expect(acrobatBusiness.gnav).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(acrobatBusiness.heroMarqueeSection).toBeVisible();
    });

    await test.step('Verify business size tabs (2) and panel content changes', async () => {
      const tabs = acrobatBusiness.businessSizeTabs;
      await tabs.scrollIntoViewIfNeeded();
      await expect(tabs).toBeVisible({ timeout: 60000 });

      const tabButtons = tabs.locator('button[role="tab"]');
      await expect(tabButtons).toHaveCount(2);

      let previousPanelHeading = null;
      const tabCount = await tabButtons.count();

      for (let i = 0; i < tabCount; i += 1) {
        const tab = tabButtons.nth(i);
        await expect(tab).toBeVisible();
        await expect(tab).toBeEnabled();

        await tab.click();
        await expect(tab).toHaveAttribute('aria-selected', 'true');

        const panelId = await tab.getAttribute('aria-controls');
        const panel = page.locator(`#${panelId}`);
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

    await test.step('Verify sticky comparison table', async () => {
      const table = acrobatBusiness.stickyBusinessComparisonTable;
      await table.scrollIntoViewIfNeeded();
      await expect(table).toBeVisible();

      const headingRow = table.locator('div.row-heading');
      await expect(headingRow).toBeVisible();

      const colHeadings = headingRow.locator('div[role="columnheader"]');
      await expect(colHeadings).toHaveCount(3);

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

    await test.step('Verify four-up section', async () => {
      const fourUp = acrobatBusiness.fourUpSection;
      await fourUp.scrollIntoViewIfNeeded();
      await expect(fourUp).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      const threeUp = acrobatBusiness.threeUpSection;
      await threeUp.scrollIntoViewIfNeeded();
      await expect(threeUp).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = acrobatBusiness;
      await faqSection.scrollIntoViewIfNeeded();
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
      await acrobatBusiness.footer.scrollIntoViewIfNeeded();
      await expect(acrobatBusiness.footer).toBeVisible({ timeout: 60000 });
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
