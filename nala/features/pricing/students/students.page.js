export default class PricingStudentsPage {
  constructor(page) {
    this.page = page;

    this.comparisonTableSection = page.locator('div.section.table-section');
    this.comparisonTable = this.comparisonTableSection.locator('div.table[role="table"]');
    this.comparisonTableHeadingRow = this.comparisonTable.locator('div.row-heading');
    this.comparisonTableSectionHeads = this.comparisonTable.locator('div.section-head');

    this.editorialCard = page.locator('div.editorial-card');

    // Merch — `/acrobat/pricing/students` ABM cards
    this.pricingPageStudents = page.locator(
      'div[data-path="/dc-shared/fragments/merch/acrobat/pricing/acrobat-students-abm-merch-card-product"]',
    );
    this.pricingPageStudentsMerchCards = this.pricingPageStudents.locator('merch-card');
    this.pricingPageStudentsMerchCardAcrobatPro = this.pricingPageStudentsMerchCards.nth(0);
    this.pricingPageStudentsMerchCardAcrobatProPrice =
      this.pricingPageStudentsMerchCardAcrobatPro.locator('p[slot="heading-xs"] span[is*="inline-price"]');
    this.pricingPageStudentsMerchCardAcrobatProFreeTrial =
      this.pricingPageStudentsMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.pricingPageStudentsMerchCardAcrobatProBuyNow =
      this.pricingPageStudentsMerchCardAcrobatPro.locator('a[is*="checkout-link"]');
    this.pricingPageStudentsMerchCardCreativeCloud = this.pricingPageStudentsMerchCards.nth(1);
    this.pricingPageStudentsMerchCardCreativeCloudPrice =
      this.pricingPageStudentsMerchCardCreativeCloud.locator('p[slot="heading-xs"] span[is*="inline-price"]');
    this.pricingPageStudentsMerchCardCreativeCloudFreeTrial =
      this.pricingPageStudentsMerchCardCreativeCloud.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.pricingPageStudentsMerchCardCreativeCloudBuyNow =
      this.pricingPageStudentsMerchCardCreativeCloud.locator('a[is*="checkout-link"]');

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
