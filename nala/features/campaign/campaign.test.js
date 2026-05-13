import { expect, test } from '@playwright/test';
import CampaignPage from './campaign.page.js';
import { features } from './campaign.spec.js';

let campaign;

test.describe('Acrobat Campaign — Acrobats got it', () => {
  test.beforeEach(async ({ page }) => {
    campaign = new CampaignPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Campaign Acrobats got it] ${baseURL}${path}`);

    await test.step('Go to campaign page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav without breadcrumbs', async () => {
      await campaign.gnav.waitFor({ state: 'visible' });
      await expect(campaign.gnav).toBeVisible();
      await expect(campaign.gnavBreadcrumbs).not.toBeVisible();
    });

    await test.step('Verify Acrobats got it marquee (desktop)', async () => {
      const marquee = campaign.acrobatsGotItMarqueeDesktop;
      await marquee.scrollIntoViewIfNeeded();
      await expect(marquee).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify Acrobats got it body fragment', async () => {
      const body = campaign.acrobatsGotItBody;
      await body.scrollIntoViewIfNeeded();
      await expect(body).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify Compare Acrobat plans merch (2 cards visible)', async () => {
      await expect(campaign.compareAcrobatPlansSection).toBeVisible();
      await expect(campaign.compareAcrobatPlansHeading).toBeVisible();

      await expect(campaign.campaignMerchCards).toHaveCount(2);
      await expect(campaign.acrobatProCard).toBeVisible();
      await expect(campaign.acrobatProTeamsCard).toBeVisible();
    });

    await test.step('Verify footer options', async () => {
      await campaign.footer.scrollIntoViewIfNeeded();
      await expect(campaign.fedsFooterOptions).toBeVisible();
      await expect(campaign.fedsFooterMiscLinks).toBeVisible();
      await expect(campaign.fedsRegionPicker.first()).toBeVisible();
      await expect(campaign.fedsSocial.first()).toBeVisible();
      await expect(campaign.fedsSocial).toHaveCount(4);
      await expect(campaign.fedsFooterLegalWrapper).toBeVisible();
      await expect(campaign.fedsFooterPrivacyListItems.first()).toBeVisible();
      await expect(campaign.fedsFooterPrivacyListItems).toHaveCount(6);
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
