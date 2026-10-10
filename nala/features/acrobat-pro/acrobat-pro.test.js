import { expect, test } from '@playwright/test';
import AcrobatProPage from './acrobat-pro.page.js';
import { features } from './acrobat-pro.spec.js';
import checkPageLinks from '../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/get-acrobat-support';

let acrobatPro;

test.describe('Acrobat Pro Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    acrobatPro = new AcrobatProPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Acrobat Pro Test] ${baseURL}${path}`);

    await test.step('Go to Acrobat Pro page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await acrobatPro.gnav.waitFor({ state: 'visible' });
      await expect(acrobatPro.gnav).toBeVisible();
      await expect(acrobatPro.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(acrobatPro.heroMarquee).toBeVisible();
    });

    await test.step('Verify Launch demo CTA', async () => {
      await expect(acrobatPro.editOrganizeDiscoverLink).toBeVisible();
      await expect(acrobatPro.editOrganizeDiscoverLink).toBeEnabled();
      await expect(acrobatPro.editOrganizeDiscoverLink).toHaveAttribute('href', /EditOrganizeDiscover/);
    });

    await test.step('Verify first three-up section', async () => {
      const firstThreeUp = acrobatPro.firstThreeUpSection;
      await firstThreeUp.scrollIntoViewIfNeeded();
      await expect(firstThreeUp).toBeVisible();
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

    await test.step('Verify Acrobat Pro standard icon block fragment', async () => {
      const iconBlock = acrobatPro.acrobatProStandardIconBlock;
      await iconBlock.scrollIntoViewIfNeeded();
      await expect(iconBlock).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = acrobatPro;
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

    await test.step('Verify Questions about / get Acrobat support section', async () => {
      const section = acrobatPro.questionsAboutSection(QUESTIONS_ABOUT_DATA_PATH);
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
      await acrobatPro.footer.scrollIntoViewIfNeeded();
      await expect(acrobatPro.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify visible checkout links are visible and enabled', async () => {
      const checkoutLinks = page.locator('a[is="checkout-link"]').filter({ visible: true });
      const count = await checkoutLinks.count();
      for (let i = 0; i < count; i += 1) {
        const link = checkoutLinks.nth(i);
        // Hidden inactive tabs / collapsed panels: skip — scrollIntoViewIfNeeded times out when not visible.
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
