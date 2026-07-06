import BasePage from '../../../libs/basepage.js';

export default class ModifyPdfsPage extends BasePage {
  constructor(page) {
    super(page);

    this.heroMarquee = page.locator('div[class*="hero-marquee"]');

    /** Media + con-block promos (expect 4). */
    this.mediaConBlocks = page.locator('div[class*="con-block"][class*="media"]');

    /** Aside strip with Reader + Chrome extension CTAs (aside1-desktop fragment). */
    this.asideBlocks = page.locator('div[class*="aside"]');

    this.editorialCards = page.locator('div.editorial-card');

    this.splitImageBlock = page.locator('div.image.split-image');

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
