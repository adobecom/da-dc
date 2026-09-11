export default class AcrobatProPage {
  constructor(page) {
    this.page = page;

    // Global navigation (smoke)
    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    // Hero
    this.heroMarquee = page.locator('div[class*="hero-marquee"]');
    this.editOrganizeDiscoverLink = page.locator('a[href*="/go/EditOrganizeDiscover"]');

    // Upper three-up (before merch); separate from the lazy-loaded icon-block region lower on the page
    this.firstThreeUpSection = page.locator('div.section.three-up').first();

    // Icon block fragment (below merch) — scope by `data-path`; multiple `.three-up` on the page
    this.acrobatProStandardIconBlock = page.locator(
      'div[data-path*="/dc-shared/fragments/acrobat/acrobat-pro-standard/icon-block"]',
    );

    // FAQ accordion
    this.faqSection = page.locator('div[class*="accordion-container"]');
    this.faqAccordionTriggers = this.faqSection.locator('button.accordion-trigger');

    // Footer
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

  /** @param {string} dataPath fragment path substring */
  questionsAboutSection(dataPath) {
    return this.page.locator(`div[data-path*="${dataPath}"]`);
  }
}
