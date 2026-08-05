export default class CampaignPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    this.acrobatsGotItMarqueeDesktop = page.locator(
      'div[data-path*="/dc-shared/fragments/campaign/acrobats-got-it/acrobats-got-it-marquee-desktop"]',
    );

    this.acrobatsGotItBody = page.locator(
      'div[data-path*="/dc-shared/fragments/campaign/acrobats-got-it/acrobats-got-it-body"]',
    );

    /**
     * “Compare Acrobat plans” block — reuses the standard `compare-acrobat-plans` merch fragment
     * (see acrobat-pro / merch-cards). On this campaign only **two** `merch-card` rows render:
     * Acrobat Pro (individual) and Acrobat Pro for teams (no Individuals/Business/Students tab strip).
     * @see https://www.adobe.com/acrobat/campaign/acrobats-got-it.html
     */
    this.compareAcrobatPlansSection = page.locator(
      'div[class*="two-merch-cards"]',
    );
    /** In-page anchor for the compare heading (`#compare-acrobat-plans`) */
    this.compareAcrobatPlansHeading = page.locator('div[id="compare-acrobat-plans"]');
    this.campaignMerchCards = this.compareAcrobatPlansSection.locator('merch-card');

    this.acrobatProCard = this.campaignMerchCards.nth(0);
    this.acrobatProTeamsCard = this.campaignMerchCards.nth(1);

    this.footer = page.locator('footer[class="global-footer"]');
    this.fedsFooterOptions = this.footer.locator('div[class*="feds-footer-options"]');
    this.fedsFooterMiscLinks = this.fedsFooterOptions.locator('div[class*="feds-footer-miscLinks"]');
    this.fedsRegionPicker = this.fedsFooterOptions.locator('div[class*="feds-regionPicker"] a');
    this.fedsSocial = this.footer.locator('ul[class*="feds-social"] a');
    this.fedsFooterLegalWrapper = this.footer.locator('div[class*="feds-footer-legalWrapper"]');
    this.fedsFooterPrivacyListItems = this.fedsFooterLegalWrapper.locator('li[class*="feds-footer-privacy-list"]');
  }
}
