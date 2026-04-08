import BasePage from '../../libs/basepage.js';

export default class CampaignPage extends BasePage {
  constructor(page) {
    super(page);
    this.heroTitle = this.page.locator('h1').first();

    // Merch Cards for acrobats-got-it page
    this.campaignMerchCards = this.page.locator('merch-card');

    // Acrobat Pro Card
    this.acrobatProCard = this.campaignMerchCards.nth(0);
    this.acrobatProPrice = this.acrobatProCard.locator('span[is*="inline-price"][data-wcs-osi="ZZQMV2cU-SWQoDxuznonUFMRdxSyTr4J3fB77YBNakY"]');
    this.acrobatProFreeTrial = this.acrobatProCard.locator('a[is*="checkout-link"][data-wcs-osi="-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ"]');
    this.acrobatProBuyNow = this.acrobatProCard.locator('a[is*="checkout-link"][data-wcs-osi="vQmS1H18A6_kPd0tYBgKnp-TQIF0GbT6p8SH8rWcLMs"]');

    // Acrobat Pro for Teams Card
    this.acrobatProTeamsCard = this.campaignMerchCards.nth(1);
    this.acrobatProTeamsPrice = this.acrobatProTeamsCard.locator('span[is*="inline-price"][data-wcs-osi="vV01ci-KLH6hYdRfUKMBFx009hdpxZcIRG1-BY_PutE"]');
    this.acrobatProTeamsFreeTrial = this.acrobatProTeamsCard.locator('a[is*="checkout-link"][data-wcs-osi="8Lr09qx_PHqAJUwvUNiof4FFFEKjsR1TTbvBUncV2b0"]');
    this.acrobatProTeamsPricingLink = this.acrobatProTeamsCard.locator('a[href*="pricing/business"]');
  }
}
