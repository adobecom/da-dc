/**
 * Locators for `/acrobat/features` (merch + layout aligned with `acrobat/acrobat.page.js`).
 * Assertions live in `features.test.js`.
 */
export default class FeaturesPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    this.heroMarqueeSection = page.locator('div[class*="hero-marquee"]');
    this.heroTitle = this.heroMarqueeSection.locator('h1');
    this.heroDescription = this.heroMarqueeSection.locator('p');
    this.heroCheckoutLink = this.heroMarqueeSection.locator('a[is*="checkout-link"]');
    this.heroNonCheckoutLinks = this.heroMarqueeSection.locator('a:not([is*="checkout-link"])');

    this.tabsFeaturesSection = page.locator('div[class*="tablist-features-section"]');

    this.threeUpSections = page.locator('div.section.three-up');
    this.editorialCards = page.locator('div.editorial-card');

    this.pcworldBestBlock = page.locator('div[data-path*="/dc-shared/fragments/acrobat/pcworld-best-2025"]');

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
