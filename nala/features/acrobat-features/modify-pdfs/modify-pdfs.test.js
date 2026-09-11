import { expect, test } from '@playwright/test';
import ModifyPdfsPage from './modify-pdfs.page.js';
import { features } from './modify-pdfs.spec.js';
import checkPageLinks from '../../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/get-acrobat-support';

let modifyPdfsPage;

test.describe('Acrobat Features — Modify PDFs', () => {
  test.beforeEach(async ({ page }) => {
    modifyPdfsPage = new ModifyPdfsPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Acrobat Features — Modify PDFs] ${baseURL}${path}`);

    await test.step('Go to Modify PDFs feature page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await modifyPdfsPage.gnav.waitFor({ state: 'visible' });
      await expect(modifyPdfsPage.gnav).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(modifyPdfsPage.heroMarquee).toBeVisible();
    });

    await test.step('Verify media + con-block promos (4)', async () => {
      await expect(modifyPdfsPage.mediaConBlocks).toHaveCount(5);
      for (let i = 0; i < 4; i += 1) {
        const block = modifyPdfsPage.mediaConBlocks.nth(i);
        await block.scrollIntoViewIfNeeded();
        await expect(block).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify aside Reader + Chrome extension links', async () => {
      const count = await modifyPdfsPage.asideBlocks.count();
      expect(count).toEqual(2);
      const strip = modifyPdfsPage.asideBlocks.first();
      await strip.scrollIntoViewIfNeeded();
      await expect(strip).toBeVisible({ timeout: 60000 });
      const links = strip.locator('a');
      await expect(links).toHaveCount(2);
      await expect(links.nth(0)).toBeVisible();
      await expect(links.nth(0)).toBeEnabled();
      await expect(links.nth(0)).toHaveAttribute('href', /acrobat-reader/);
      await expect(links.nth(1)).toBeVisible();
      await expect(links.nth(1)).toBeEnabled();
      await expect(links.nth(1)).toHaveAttribute('href', /chrome\.google/);
      await expect(modifyPdfsPage.asideBlocks.last()).toBeVisible();
    });

    await test.step('Verify editorial cards (3)', async () => {
      await expect(modifyPdfsPage.editorialCards).toHaveCount(3);
      for (let i = 0; i < 3; i += 1) {
        const card = modifyPdfsPage.editorialCards.nth(i);
        await card.scrollIntoViewIfNeeded();
        await expect(card).toBeVisible({ timeout: 60000 });
        const cta = card.locator('a').first();
        await expect(cta).toBeVisible();
        await expect(cta).toBeEnabled();
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

    await test.step('Verify four-up section', async () => {
      const fourUp = modifyPdfsPage.fourUpSection.first();
      await fourUp.waitFor({ state: 'attached', timeout: 60000 });
      await fourUp.scrollIntoViewIfNeeded();
      await expect(fourUp).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify Questions about / get Acrobat support section', async () => {
      const section = modifyPdfsPage.page.locator(`div[data-path*="${QUESTIONS_ABOUT_DATA_PATH}"]`);
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
      await modifyPdfsPage.footer.scrollIntoViewIfNeeded();
      await expect(modifyPdfsPage.footer).toBeVisible({ timeout: 60000 });
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
