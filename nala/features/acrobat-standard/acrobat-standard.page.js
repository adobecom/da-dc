export default class AcrobatStandardPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    this.heroMarquee = page.locator('div[class*="hero-marquee"]');

    // Marketing row — four-up + xs-spacing (*-bottom on Standard authoring)
    this.fourUpSection = page.locator('div.section.four-up[class*="xs-spacing"]');

    // Opens modal; locale-safe (no link text)
    this.seeAllFeaturesModalTrigger = page.locator(
      '[data-modal-path*="/dc-shared/fragments/modals/acrobat/acrobat-standard/see-all-features"]',
    );

    this.launchDemoLink = page.locator('a[href*="/go/EditOrganizeDiscover"]');

    this.acrobatProStandardIconBlock = page.locator(
      'div[data-path*="/dc-shared/fragments/acrobat/acrobat-pro-standard/icon-block"]',
    );

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

  /** @param {string} dataPath */
  questionsAboutSection(dataPath) {
    return this.page.locator(`div[data-path*="${dataPath}"]`);
  }
}
