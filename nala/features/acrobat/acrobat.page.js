export default class AcrobatPage {
  constructor(page) {
    this.page = page;

    // Global navigation (smoke)
    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    // Hero
    this.heroMarquee = page.locator('div[class*="hero-marquee"]');

    // Editorial / marketing sections (no getByRole/getByText — strings vary by locale)
    this.threeUpSection = page.locator('div.section.three-up');
    this.twoUpSection = page.locator('div.section.two-up');
    this.seeAllFeaturesLink = page.locator('a.con-button.outline[href*="/acrobat/features"]');
    // Brick: layout / classes + media column — avoids heading copy and id slug per locale
    this.generatePresentationsBrick = page
      .locator('div.brick.light.rounded-corners.split.row.media-right')
      .filter({ has: page.locator('.brick-text h3.heading-xl') })
      .filter({ has: page.locator('.brick-media picture, .brick-media img') })
      .first();
    this.fourUpSection = page.locator('div.section.four-up');

    // Carousel
    this.carousel = page.locator('div.carousel');
    this.carouselSlides = this.carousel.locator('div.carousel-slide');
    this.carouselNext = this.carousel.locator('button.carousel-next');
    this.carouselPrevious = this.carousel.locator('button.carousel-previous');
    this.carouselIndicators = this.carousel.locator('li.carousel-indicator');

    this.acrobatSubscriptionFeature = page.locator('div[data-path="/dc-shared/fragments/acrobat/acrobat-subscription-features"]');

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
