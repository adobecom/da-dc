import BasePage from '../../../libs/basepage.js';

export default class ExportPdfPage extends BasePage {
  constructor(page) {
    super(page);

    this.heroMarquee = page.locator('div[class*="hero-marquee"]');

    /**
     * Media + con-block promos that are not the hero marquee wrapper
     * (`hero-marquee` must not appear on the same element).
     */
    this.mediaConBlocksOutsideHero = page.locator(
      'div[class*="con-block"][class*="media"]:not([class*="hero-marquee"])',
    );

    /** Aside strips with Reader + Chrome CTAs (expect 2 on Export PDF). */
    this.asideBlocks = page.locator('div[class*="aside"]');

    this.editorialCards = page.locator('div.editorial-card');

    this.fourUpSection = page.locator('div.four-up');

    const mc = this.merchCards;
    this.merchIndividualsComparePlansLink = mc.individualMerchCardsContainer.locator(
      'a.con-button[href*="compare-versions"]',
    );
    this.merchBusinessViewPlansLink = mc.businessMerchCardsContainer.locator(
      'a.con-button[href*="/acrobat/pricing/business"]',
    );
    this.merchStudentsViewPlansLink = mc.studentsAndTeachersContainer.locator(
      'a.con-button[href*="/acrobat/pricing/students"]',
    );
  }
}
