import { expect, test } from '@playwright/test';
import CampaignPage from './campaign.page.js';
import { features } from './campaign.spec.js';

let campaignPage;

test.describe('Acrobat Campaign Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    campaignPage = new CampaignPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const { path } = features[0];
    console.info(`[Campaign Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    await expect(campaignPage.campaignMerchCards).toHaveCount(2);

    await expect(campaignPage.acrobatProCard).toBeVisible();
    await expect(campaignPage.acrobatProPrice.first()).toBeVisible();
    await expect(campaignPage.acrobatProFreeTrial).toBeVisible();
    await expect(campaignPage.acrobatProFreeTrial).toBeEnabled();
    await expect(campaignPage.acrobatProFreeTrial).toHaveAttribute('data-wcs-osi', '-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ');
    await expect(campaignPage.acrobatProBuyNow).toBeVisible();
    await expect(campaignPage.acrobatProBuyNow).toBeEnabled();
    await expect(campaignPage.acrobatProBuyNow).toHaveAttribute('data-wcs-osi', 'vQmS1H18A6_kPd0tYBgKnp-TQIF0GbT6p8SH8rWcLMs');

    await expect(campaignPage.acrobatProTeamsCard).toBeVisible();
    await expect(campaignPage.acrobatProTeamsPrice.first()).toBeVisible();
    await expect(campaignPage.acrobatProTeamsFreeTrial).toBeVisible();
    await expect(campaignPage.acrobatProTeamsFreeTrial).toBeEnabled();
    await expect(campaignPage.acrobatProTeamsFreeTrial).toHaveAttribute('data-wcs-osi', '8Lr09qx_PHqAJUwvUNiof4FFFEKjsR1TTbvBUncV2b0');
    await expect(campaignPage.acrobatProTeamsPricingLink).toBeVisible();
    await expect(campaignPage.acrobatProTeamsPricingLink).toBeEnabled();
    await expect(campaignPage.acrobatProTeamsPricingLink).toHaveAttribute('href', /pricing\/business/);
    await campaignPage.verifyAllCheckoutLinks();
  });
});
