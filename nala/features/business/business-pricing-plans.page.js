/**
 * Locators for `/acrobat/business/pricing-plans`.
 * @see https://www.adobe.com/acrobat/business/pricing-plans.html
 */
export default class BusinessPricingPlansPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('nav.feds-topnav');
    this.footer = page.locator('footer[class="global-footer"]');

    /** Hero (“Explore PDF and e-signature plans for business.”). */
    this.heroMarqueeSection = page.locator('div[class*="hero-marquee"]');

    /** Both “Feature comparison” sticky highlight tables (merch blocks, top then “Discover more features”). */
    this.stickyComparisonTables = page.locator('div.table.sticky.highlight[role="table"]');

    /** e.g. “More solutions for large organizations.” */
    this.twoUpSection = page.locator('div[class*="two-up"]').first();

    /** e.g. “What’s included in Acrobat plans for business.” */
    this.threeUpSection = page.locator('div[class*="three-up"]').first();

    /** FAQ block (first accordion region on the page). */
    this.accordionSection = page.locator('div[class*="accordion-container"]').first();
    this.accordionTriggers = this.accordionSection.locator('button.accordion-trigger');

    /** Testimonial / pull-quote strip. */
    this.quoteBlock = page.locator('div[class*="quote"]').first();
  }
}
