import { expect, test } from '@playwright/test';
import CampaignPage from './campaign.page.js';
import { features } from './campaign.spec.js';
import checkPageLinks from '../../utils/link-checker.js';

let campaign;

test.describe('Acrobat Campaign — Do that with Acrobat', () => {
  test.beforeEach(async ({ page }) => {
    campaign = new CampaignPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Campaign Do that with Acrobat] ${baseURL}${path}`);

    await test.step('Go to campaign page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav without breadcrumbs', async () => {
      await campaign.gnav.waitFor({ state: 'visible' });
      await expect(campaign.gnav).toBeVisible();
      // await expect(campaign.gnavBreadcrumbs).not.toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await campaign.heroMarquee.scrollIntoViewIfNeeded();
      await expect(campaign.heroMarquee).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify media blocks', async () => {
      const firstMedia = campaign.mediaBlocks.first();
      await firstMedia.scrollIntoViewIfNeeded();
      await expect(firstMedia).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify Compare Acrobat plans merch cards', async () => {
      const plans = campaign.compareAcrobatPlans;
      await plans.scrollIntoViewIfNeeded({ timeout: 60000 });
      await expect(plans).toBeVisible({ timeout: 60000 });
      const merchCard = plans.locator('merch-card').filter({ visible: true }).first();
      await merchCard.scrollIntoViewIfNeeded({ timeout: 60000 });
      await expect(merchCard).toBeVisible();
    });

    await test.step('Verify footer', async () => {
      await campaign.footer.scrollIntoViewIfNeeded();
      await expect(campaign.footer).toBeVisible({ timeout: 60000 });
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

test.describe('Acrobat Campaign — Interactive Report', () => {
  test.beforeEach(async ({ page }) => {
    campaign = new CampaignPage(page);
  });

  test(`${features[1].name}, ${features[1].tags}`, async ({ page, baseURL }) => {
    const { path } = features[1];
    console.info(`[Campaign Interactive Report] ${baseURL}${path}`);

    await test.step('Go to campaign page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify study marquee', async () => {
      await expect(campaign.studyMarquee).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify video pause/play control is in the bottom-right of the media', async () => {
      await expect(campaign.studyMarqueePausePlay).toBeVisible({ timeout: 60000 });
      const media = await campaign.studyMarqueeMedia.boundingBox();
      const control = await campaign.studyMarqueePausePlay.boundingBox();
      expect(control.width).toBeLessThan(media.width / 2);
      expect(control.x).toBeGreaterThan(media.x + media.width / 2);
      expect(control.y).toBeGreaterThan(media.y + media.height / 2);
      expect(control.x + control.width).toBeLessThanOrEqual(media.x + media.width);
      expect(control.y + control.height).toBeLessThanOrEqual(media.y + media.height);
    });
  });
});
