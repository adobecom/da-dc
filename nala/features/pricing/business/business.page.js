export default class PricingBusinessPage {
  constructor(page) {
    this.page = page;

    // Comparison table (section with expand/collapse — same block as individuals pricing)
    this.comparisonTableSection = page.locator('div.section.table-section');
    this.comparisonTable = this.comparisonTableSection.locator('div.table[role="table"]');
    this.comparisonTableSectionHeads = this.comparisonTable.locator('div.section-head');

    // Sticky business comparison table
    this.businessComparisonTable = page.locator('div.table.sticky.highlight[role="table"]');

    // Merch — `/acrobat/pricing/business` ABM cards
    this.pricingPageBusiness = page.locator(
      'div[data-path="/dc-shared/fragments/merch/acrobat/pricing/acrobat-business-abm-merch-card-product"]',
    );
    this.pricingPageBusinessMerchCards = this.pricingPageBusiness.locator('merch-card').filter({ visible: true });
    this.pricingPageBusinessMerchCardAcrobatStandardForTeams = this.pricingPageBusinessMerchCards.nth(0);
    this.pricingPageBusinessMerchCardAcrobatStandardForTeamsPrice = this.pricingPageBusinessMerchCardAcrobatStandardForTeams.locator('p[slot="heading-m-price"]');
    this.pricingPageBusinessMerchCardAcrobatStandardForTeamsBuyNow = this.pricingPageBusinessMerchCardAcrobatStandardForTeams.locator('a[is*="checkout-link"][data-wcs-osi="AW-jV275GNYtPao6Q7XWENqyv_Stkc1BbzF7ak2u1dk"]');
    this.pricingPageBusinessMerchCardAcrobatProForTeams = this.pricingPageBusinessMerchCards.nth(1);
    this.pricingPageBusinessMerchCardAcrobatProForTeamsPrice = this.pricingPageBusinessMerchCardAcrobatProForTeams.locator('p[slot="heading-m-price"]');
    this.pricingPageBusinessMerchCardAcrobatProForTeamsFreeTrial = this.pricingPageBusinessMerchCardAcrobatProForTeams.locator('a[is*="checkout-link"][data-wcs-osi="8Lr09qx_PHqAJUwvUNiof4FFFEKjsR1TTbvBUncV2b0"]');
    this.pricingPageBusinessMerchCardAcrobatProForTeamsBuyNow = this.pricingPageBusinessMerchCardAcrobatProForTeams.locator('a[is*="checkout-link"][data-wcs-osi="vV01ci-KLH6hYdRfUKMBFx009hdpxZcIRG1-BY_PutE"]');
    this.pricingPageBusinessMerchCardAcrobatStudioForTeams = this.pricingPageBusinessMerchCards.nth(2);
    this.pricingPageBusinessMerchCardAcrobatStudioForTeamsPrice = this.pricingPageBusinessMerchCardAcrobatStudioForTeams.locator('p[slot="heading-m-price"]');
    this.pricingPageBusinessMerchCardAcrobatStudioForTeamsFreeTrial = this.pricingPageBusinessMerchCardAcrobatStudioForTeams.locator('a[is*="checkout-link"][data-wcs-osi="PVhDPYXq4fsy15OdlEE-XyIlvcxaPMxGs73pw39Cx-s"]');
    this.pricingPageBusinessMerchCardAcrobatStudioForTeamsBuyNow = this.pricingPageBusinessMerchCardAcrobatStudioForTeams.locator('a[is*="checkout-link"][data-wcs-osi="SfkorgyrBAsqBVpyKddQQEn6jR0ItBohpXc74sZcKHg"]');

    // Contact Sales CTA — inside editorial card; anchor card by `href*="acrobat/contact"` (no visible-text filter)
    this.contactSalesEditorialCard = page.locator('div[class*="editorial-card"]').filter({
      has: page.locator('a.con-button[href*="acrobat/contact"]'),
    });
    this.contactSalesLink = this.contactSalesEditorialCard.locator('a.con-button[href*="acrobat/contact"]');

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
