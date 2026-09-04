export default class PdfSolutionPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    /** CTA in global nav pointing at Acrobat web app */
    this.gnavAcrobatAppLink = this.gnav.locator('a[href*="acrobat.adobe.com"]');

    this.mqCompletePdfSolutionBlade = page.locator(
      'div[data-path*="/dc-shared/fragments/acrobat/complete-pdf-solution/mq-complete-pdf-solution"]',
    );

    this.aside1DesktopBlade = page.locator(
      'div[data-path*="/dc-shared/fragments/acrobat/complete-pdf-solution/aside1-desktop"]',
    );

    /** All daa-lh aside blades on the page (e.g. b3|aside, b4|aside, …). */
    this.asideBlocks = page.locator('div[class*="aside"]');

    this.threeUpSection = page.locator('div.section.three-up').first();

    this.featuresLink = page.locator('a[href*="acrobat/features"]');

    this.pcworldBestBlade = page.locator(
      'div[data-path*="/dc-shared/fragments/acrobat/pcworld-best-2025"]',
    );

    this.fourUpSection = page.locator('div.four-up');

    this.discoverSmallBusinessVideoBlade = page.locator(
      'div[data-path*="/dc-shared/fragments/acrobat/discover-small-business-video-blade"]',
    );

    this.faqSection = page.locator('div[class*="accordion-container"]');
    this.faqAccordionTriggers = this.faqSection.locator('button.accordion-trigger');

    this.footer = page.locator('footer[class="global-footer"]');
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
