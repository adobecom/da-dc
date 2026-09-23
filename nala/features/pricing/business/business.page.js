export default class PricingBusinessPage {
  constructor(page) {
    this.page = page;

    // Comparison table (section with expand/collapse — same block as individuals pricing)
    this.comparisonTableSection = page.locator('div.section.table-section');
    this.comparisonTable = this.comparisonTableSection.locator('div.table[role="table"]');
    this.comparisonTableSectionHeads = this.comparisonTable.locator('div.section-head');

    // Sticky business comparison table
    this.businessComparisonTable = page.locator('div.table.sticky.highlight[role="table"]');

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
