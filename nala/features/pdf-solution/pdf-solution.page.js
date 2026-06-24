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

    // Plans & pricing — mini-compare-chart (PDF Solution)
    this.plansAndPricingSection = page.locator(
      'div[data-path*="/dc-shared/fragments/acrobat/complete-pdf-solution/mini-compare-chart"]',
    );
    this.plansAndPricingTabs = this.plansAndPricingSection.locator('div.tabs#tabs-plans-and-pricing');
    this.plansAndPricingTabButtons = this.plansAndPricingTabs.locator('button[role="tab"]');
    this.plansAndPricingTabIndividuals = this.plansAndPricingTabs.locator('button#tab-plans-and-pricing-1');
    this.plansAndPricingTabBusiness = this.plansAndPricingTabs.locator('button#tab-plans-and-pricing-2');
    this.plansAndPricingTabStudents = this.plansAndPricingTabs.locator('button#tab-plans-and-pricing-3');
    this.plansAndPricingPanelIndividuals = this.plansAndPricingTabs.locator('div#tab-panel-plans-and-pricing-1');
    this.plansAndPricingPanelBusiness = this.plansAndPricingTabs.locator('div#tab-panel-plans-and-pricing-2');
    this.plansAndPricingPanelStudents = this.plansAndPricingTabs.locator('div#tab-panel-plans-and-pricing-3');

    this.plansIndividualsMerchCards = this.plansAndPricingPanelIndividuals.locator('merch-card');
    this.plansIndividualsReaderCard = this.plansIndividualsMerchCards.nth(0);
    this.plansIndividualsReaderDownload = this.plansIndividualsReaderCard.locator('a[href*="get.adobe.com/reader"]');
    this.plansIndividualsProCard = this.plansIndividualsMerchCards.nth(1);
    this.plansIndividualsProPrice = this.plansIndividualsProCard.locator('span[is*="inline-price"]');
    this.plansIndividualsProFreeTrial = this.plansIndividualsProCard.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.plansIndividualsProBuyNow = this.plansIndividualsProCard.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.plansIndividualsStudioCard = this.plansIndividualsMerchCards.nth(2);
    this.plansIndividualsStudioPrice = this.plansIndividualsStudioCard.locator('span[is*="inline-price"]');
    this.plansIndividualsStudioFreeTrial = this.plansIndividualsStudioCard.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.plansIndividualsStudioBuyNow = this.plansIndividualsStudioCard.locator('a[is*="checkout-link"][href*="ot=BASE"]');

    this.plansBusinessMerchCards = this.plansAndPricingPanelBusiness.locator('merch-card');
    this.plansBusinessProCard = this.plansBusinessMerchCards.nth(0);
    this.plansBusinessProPrice = this.plansBusinessProCard.locator('span[is*="inline-price"]');
    this.plansBusinessProFreeTrial = this.plansBusinessProCard.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.plansBusinessProBuyNow = this.plansBusinessProCard.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.plansBusinessStudioCard = this.plansBusinessMerchCards.nth(1);
    this.plansBusinessStudioPrice = this.plansBusinessStudioCard.locator('span[is*="inline-price"]');
    this.plansBusinessStudioFreeTrial = this.plansBusinessStudioCard.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.plansBusinessStudioBuyNow = this.plansBusinessStudioCard.locator('a[is*="checkout-link"][href*="ot=BASE"]');

    this.plansStudentsMerchCards = this.plansAndPricingPanelStudents.locator('merch-card');
    this.plansStudentsProCard = this.plansStudentsMerchCards.nth(0);
    this.plansStudentsProPrice = this.plansStudentsProCard.locator('span[is*="inline-price"]');
    this.plansStudentsProFreeTrial = this.plansStudentsProCard.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.plansStudentsProBuyNow = this.plansStudentsProCard.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.plansStudentsCCCard = this.plansStudentsMerchCards.nth(1);
    this.plansStudentsCCPrice = this.plansStudentsCCCard.locator('span[is*="inline-price"]');
    this.plansStudentsCCFreeTrial = this.plansStudentsCCCard.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.plansStudentsCCBuyNow = this.plansStudentsCCCard.locator('a[is*="checkout-link"][href*="ot=BASE"]');

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
