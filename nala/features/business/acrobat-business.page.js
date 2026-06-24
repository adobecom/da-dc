/**
 * Locators for `/acrobat/business` (landing).
 * @see https://www.adobe.com/acrobat/business.html
 */
export default class AcrobatBusinessPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('nav.feds-topnav');
    this.footer = page.locator('footer[class="global-footer"]');

    /** Hero (“Solutions for businesses of all sizes.”). */
    this.heroMarqueeSection = page.locator('div[class*="hero-marquee"]');

    /**
     * “Small businesses” vs “Medium & large businesses” (Milo tabs; id `tabs-business-size` on live).
     */
    this.businessSizeTabs = page.locator('div.tabs#tabs-business-size, div#tabs-business-size').first();

    /**
     * “Compare Acrobat plans for business.” sticky highlight table (team-size / feature matrix).
     */
    this.comparePlansTableSection = page.locator('div.section.table-section').filter({
      has: page.locator('div.table.sticky.highlight[role="table"]'),
    }).first();
    this.stickyBusinessComparisonTable = this.comparePlansTableSection.locator(
      'div.table.sticky.highlight[role="table"]',
    );

    /** “Explore Acrobat features.” — four-up, xl spacing. */
    this.fourUpSection = page.locator('div.section.four-up[class*="xl-spacing"]').first();

    /** “The Adobe difference.” — three-up, xxl spacing (below four-up on live). */
    this.threeUpSection = page.locator('div.section.three-up[class*="xxl-spacing"]').first();

    /** “Frequently asked questions” accordion block. */
    this.faqSection = page.locator('div[class*="accordion-container"]');
    this.faqAccordionTriggers = this.faqSection.locator('button.accordion-trigger');

    this.heroTitle = page.locator('h1').first();
  }
}
