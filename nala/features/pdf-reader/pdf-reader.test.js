import { expect, test } from '@playwright/test';
import PdfReaderPage from './pdf-reader.page.js';
import { features } from './pdf-reader.spec.js';
import checkPageLinks from '../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/get-acrobat-support';

let pdfReader;

test.describe('Acrobat PDF Reader Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    pdfReader = new PdfReaderPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[PDF Reader Test] ${baseURL}${path}`);

    await test.step('Go to PDF Reader page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await pdfReader.gnav.waitFor({ state: 'visible' });
      await expect(pdfReader.gnav).toBeVisible();
      await expect(pdfReader.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(pdfReader.heroMarquee).toBeVisible();
    });

    await test.step('Verify Reader download link in hero (get.adobe.com)', async () => {
      const link = pdfReader.heroReaderDownloadLink.first();
      await expect(link).toBeVisible();
      await expect(link).toBeEnabled();
      await expect(link).toHaveAttribute('href', /get\.adobe\.com/);
    });

    await test.step('Verify first three-up section', async () => {
      const threeUp = pdfReader.firstThreeUpSection;
      await threeUp.scrollIntoViewIfNeeded();
      await expect(threeUp).toBeVisible();
    });

    await test.step('Verify split-image block', async () => {
      const block = pdfReader.splitImageBlock;
      await block.scrollIntoViewIfNeeded();
      await expect(block).toBeVisible({ timeout: 60000 });
    });

    // -------------------------------------------------------------------------
    // Skipped: “Download now” / install block — not part of this smoke (see product / scope).
    // -------------------------------------------------------------------------

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

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = pdfReader;
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

    await test.step('Verify system requirements and volume distribution links', async () => {
      const sysReq = pdfReader.systemRequirementsLink.first();
      await sysReq.scrollIntoViewIfNeeded();
      await expect(sysReq).toBeVisible();
      await expect(sysReq).toBeEnabled();
      await expect(sysReq).toHaveAttribute('href', /system-requirements/);

      const volDist = pdfReader.volumeDistributionLink.first();
      await volDist.scrollIntoViewIfNeeded();
      await expect(volDist).toBeVisible();
      await expect(volDist).toBeEnabled();
      await expect(volDist).toHaveAttribute('href', /volume-distribution/);
    });

    await test.step('Verify Questions about / get Acrobat support section', async () => {
      const section = pdfReader.questionsAboutSection(QUESTIONS_ABOUT_DATA_PATH);
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
      await pdfReader.footer.scrollIntoViewIfNeeded();
      await expect(pdfReader.footer).toBeVisible({ timeout: 60000 });
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
