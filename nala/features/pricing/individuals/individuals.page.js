export default class PricingIndividualsPage {
  constructor(page) {
    this.page = page;

    // Comparison table (plans matrix below merch)
    this.comparisonTableSection = page.locator('div.section.table-section');
    this.comparisonTable = this.comparisonTableSection.locator('div.table[role="table"]');
    this.comparisonTableHeadingRow = this.comparisonTable.locator('div.row-heading');
    this.comparisonTableColumnHeaders = this.comparisonTableHeadingRow.locator('h3.tracking-header');
    this.comparisonTableSectionHeads = this.comparisonTable.locator('div.section-head');
    this.comparisonTableFeatureRows = this.comparisonTable.locator('div.section-row');
    this.comparisonTableCompareLink = this.comparisonTableSection.locator('div.text-block a');

    // Merch — `/acrobat/pricing` individuals ABM cards
    this.pricingPageIndividuals = page.locator(
      'div[data-path="/dc-shared/fragments/merch/acrobat/pricing/acrobat-individual-abm-merch-card-product"]',
    );
    this.pricingPageIndividualsMerchCards = this.pricingPageIndividuals.locator('merch-card');
    this.pricingPageIndividualsMerchCardAcrobatStandard = this.pricingPageIndividualsMerchCards.nth(0);
    this.pricingPageIndividualsMerchCardAcrobatStandardPrice =
      this.pricingPageIndividualsMerchCardAcrobatStandard.locator('span[is*="inline-price"]');
    this.pricingPageIndividualsMerchCardAcrobatStandardBuyNow =
      this.pricingPageIndividualsMerchCardAcrobatStandard.locator('a[is="checkout-link"][href*="ot=BASE"]');
    this.pricingPageIndividualsMerchCardAcrobatPro = this.pricingPageIndividualsMerchCards.nth(1);
    this.pricingPageIndividualsMerchCardAcrobatProPrice =
      this.pricingPageIndividualsMerchCardAcrobatPro.locator('span[is*="inline-price"]');
    this.pricingPageIndividualsMerchCardAcrobatProFreeTrial =
      this.pricingPageIndividualsMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.pricingPageIndividualsMerchCardAcrobatProBuyNow =
      this.pricingPageIndividualsMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.pricingPageIndividualsMerchCardAcrobatStudio = this.pricingPageIndividualsMerchCards.nth(2);
    this.pricingPageIndividualsMerchCardAcrobatStudioPrice =
      this.pricingPageIndividualsMerchCardAcrobatStudio.locator('span[is*="inline-price"]');
    this.pricingPageIndividualsMerchCardAcrobatStudioFreeTrial =
      this.pricingPageIndividualsMerchCardAcrobatStudio.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.pricingPageIndividualsMerchCardAcrobatStudioBuyNow =
      this.pricingPageIndividualsMerchCardAcrobatStudio.locator('a[is*="checkout-link"][href*="ot=BASE"]');

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
