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
     * “Compare Acrobat plans” merch container — the merch-card-collection element
     * (Acrobat Pro individual + Acrobat Pro for teams).
     * @see https://www.adobe.com/acrobat/campaign/acrobats-got-it.html
     */

    this.footer = page.locator('footer[class="global-footer"]');
    this.fedsFooterOptions = this.footer.locator('div[class*="feds-footer-options"]');
    this.fedsFooterMiscLinks = this.fedsFooterOptions.locator('div[class*="feds-footer-miscLinks"]');
    this.fedsRegionPicker = this.fedsFooterOptions.locator('div[class*="feds-regionPicker"] a');
    this.fedsSocial = this.footer.locator('ul[class*="feds-social"] a');
    this.fedsFooterLegalWrapper = this.footer.locator('div[class*="feds-footer-legalWrapper"]');
    this.fedsFooterPrivacyListItems = this.fedsFooterLegalWrapper.locator('li[class*="feds-footer-privacy-list"]');
  }
}
