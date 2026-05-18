export default class PricingCompareVersionsPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    this.heroMarquee = page.locator('div[class*="hero-marquee"]');
    // First three-up above the compare table; `.first()` avoids lower-page three-ups
    this.firstThreeUpSection = page.locator('div.section.three-up').first();

    this.compareVersionsTableRoot = page.locator(
      'div[data-path*="/dc-shared/fragments/merch/acrobat/pricing/compare-versions/table/default"]',
    );
    this.compareVersionsTable = this.compareVersionsTableRoot.locator('div.table[role="table"]');

    this.faqSection = page.locator('div[class*="accordion-container"]');
    this.faqAccordionTriggers = this.faqSection.locator('button.accordion-trigger');

    this.footer = page.locator('footer[class="global-footer"]');
    this.fedsMenuContent = this.footer.locator('div[class*="feds-menu-content"]');
    this.fedsMenuColumns = this.fedsMenuContent.locator('div[class*="feds-menu-column"]');
    this.fedsMenuItems = this.fedsMenuColumns.locator('a');
    this.fedsFeaturedProducts = this.footer.locator('div[class*="feds-featuredProducts"]');
    this.fedsFeaturedProductsItems = this.fedsFeaturedProducts.locator('a');
    this.fedsFooterOptions = this.footer.locator('div[class*="feds-footer-options"]');
    this.fedsFooterMiscLinks = this.fedsFooterOptions.locator('div[class*="feds-footer-miscLinks"]');
    this.fedsRegionPicker = this.fedsFooterOptions.locator('div[class*="feds-regionPicker"] a');
    this.fedsSocial = this.footer.locator('ul[class*="feds-social"] a');
    this.fedsFooterLegalWrapper = this.footer.locator('div[class*="feds-footer-legalWrapper"]');
    this.fedsFooterPrivacyListItems = this.fedsFooterLegalWrapper.locator('li[class*="feds-footer-privacy-list"]');
  }

  /** @param {string} osi */
  checkoutLinkByOsi(osi) {
    return this.page.locator(`a[is*="checkout-link"][data-wcs-osi="${osi}"]`);
  }
}
