export default class CampaignPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('header');
    this.gnavBreadcrumbs = page.locator('.feds-breadcrumbs');

    this.heroMarquee = page.locator('div.hero-marquee');
    this.mediaBlocks = page.locator('main div.media');

    this.studyMarquee = page.locator('div.study-marquee');
    this.studyMarqueeMedia = this.studyMarquee.locator('.study-marquee-media');
    this.studyMarqueePausePlay = this.studyMarqueeMedia.locator('.pause-play-wrapper');

    /** “Compare Acrobat plans” merch cards fragment. */
    this.compareAcrobatPlans = page.locator(
      'div[data-path*="/dc-shared/fragments/merch-cards/compare-acrobat-plans"]',
    );

    this.footer = page.locator('footer[class="global-footer"]');
    this.fedsFooterOptions = this.footer.locator('div[class*="feds-footer-options"]');
    this.fedsFooterMiscLinks = this.fedsFooterOptions.locator('div[class*="feds-footer-miscLinks"]');
    this.fedsRegionPicker = this.fedsFooterOptions.locator('div[class*="feds-regionPicker"] a');
    this.fedsSocial = this.footer.locator('ul[class*="feds-social"] a');
    this.fedsFooterLegalWrapper = this.footer.locator('div[class*="feds-footer-legalWrapper"]');
    this.fedsFooterPrivacyListItems = this.fedsFooterLegalWrapper.locator('li[class*="feds-footer-privacy-list"]');
  }
}
