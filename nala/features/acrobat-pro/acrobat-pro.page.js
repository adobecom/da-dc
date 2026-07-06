export default class AcrobatProPage {
  constructor(page) {
    this.page = page;

    // Global navigation (smoke)
    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    // Hero
    this.heroMarquee = page.locator('div[class*="hero-marquee"]');
    this.editOrganizeDiscoverLink = page.locator('a[href*="/go/EditOrganizeDiscover"]');

    // Upper three-up (before merch); separate from the lazy-loaded icon-block region lower on the page
    this.firstThreeUpSection = page.locator('div.section.three-up').first();

    // Icon block fragment (below merch) — scope by `data-path`; multiple `.three-up` on the page
    this.acrobatProStandardIconBlock = page.locator(
      'div[data-path*="/dc-shared/fragments/acrobat/acrobat-pro-standard/icon-block"]',
    );

    // Merch — compare Acrobat plans (fragment + tabs + three panel bodies)
    this.merchCardPlans = page.locator('div[data-path*="/dc-shared/fragments/merch-cards/compare-acrobat-plans"]');
    this.merchCardPlansTitle = this.merchCardPlans.locator('h2');
    this.tabCompareIndividuals = this.merchCardPlans.locator('button[id="tab-compare-plans-1"]');
    this.tabCompareBusiness = this.merchCardPlans.locator('button[id="tab-compare-plans-2"]');
    this.tabCompareStudentsAndTeachers = this.merchCardPlans.locator('button[id="tab-compare-plans-3"]');

    this.individualMerchCardsContainer = page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-individuals"]');
    this.individualMerchCards = this.individualMerchCardsContainer.locator('merch-card');
    this.individualMerchCardAcrobatReader = this.individualMerchCards.nth(0);
    this.acrobatReaderPrice = this.individualMerchCardAcrobatReader.locator('p[id="free"]');
    this.acrobatReaderLink = this.individualMerchCardAcrobatReader.locator('a');
    this.individualMerchCardAcrobatPro = this.individualMerchCards.nth(1);
    this.acrobatProPrice = this.individualMerchCardAcrobatPro.locator('span[is*="inline-price"]');
    this.acrobatProFreeTrial = this.individualMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.acrobatProBuyNow = this.individualMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.individualMerchCardAcrobatStudio = this.individualMerchCards.nth(2);
    this.acrobatStudioPrice = this.individualMerchCardAcrobatStudio.locator('span[is*="inline-price"]');
    this.acrobatStudioFreeTrial = this.individualMerchCardAcrobatStudio.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.acrobatStudioBuyNow = this.individualMerchCardAcrobatStudio.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.individualMerchCardsPricingLink = this.individualMerchCardsContainer.locator('div[class="body-m action-area"] a');
    this.merchIndividualsComparePlansLink = this.individualMerchCardsContainer.locator(
      'a.con-button[href*="compare-versions"], a.con-button[href*="compare-pricing"]',
    );

    this.businessMerchCardsContainer = page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-business-contact"]');
    this.businessMerchCards = this.businessMerchCardsContainer.locator('merch-card');
    this.businessMerchCardAcrobatStandard = this.businessMerchCards.nth(0);
    this.acrobatProForTeamsPrice = this.businessMerchCardAcrobatStandard.locator('span[is*="inline-price"]');
    this.acrobatProForTeamsFreeTrial = this.businessMerchCardAcrobatStandard.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.acrobatProForTeamsBuyNow = this.businessMerchCardAcrobatStandard.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.acrobatStudioForTeams = this.businessMerchCards.nth(1);
    this.acrobatStudioForTeamsPrice = this.acrobatStudioForTeams.locator('span[is*="inline-price"]');
    this.acrobatStudioForTeamsFreeTrial = this.acrobatStudioForTeams.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.acrobatStudioForTeamsBuyNow = this.acrobatStudioForTeams.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.businessMerchCardsPricingLink = this.businessMerchCardsContainer.locator('div[class="body-m action-area"] a');
    this.merchBusinessViewPlansLink = this.businessMerchCardsContainer.locator(
      'a.con-button[href*="/acrobat/pricing/business"]',
    );

    this.studentsAndTeachersContainer = page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-students-and-teachers"]');
    this.studentsAndTeachersMerchCards = this.studentsAndTeachersContainer.locator('merch-card');
    this.acrobatProForStudentsAndTeachers = this.studentsAndTeachersMerchCards.nth(0);
    this.acrobatProForStudentsAndTeachersPrice = this.acrobatProForStudentsAndTeachers.locator('p[slot="heading-m-price"] span[is*="inline-price"]');
    this.acrobatProForStudentsAndTeachersFreeTrial = this.acrobatProForStudentsAndTeachers.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.acrobatProForStudentsAndTeachersBuyNow = this.acrobatProForStudentsAndTeachers.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.creativeCloudForStudentsAndTeachers = this.studentsAndTeachersMerchCards.nth(1);
    this.creativeCloudForStudentsAndTeachersPrice = this.creativeCloudForStudentsAndTeachers.locator('p[slot="heading-m-price"] span[is*="inline-price"]');
    this.creativeCloudForStudentsAndTeachersFreeTrial = this.creativeCloudForStudentsAndTeachers.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.creativeCloudForStudentsAndTeachersBuyNow = this.creativeCloudForStudentsAndTeachers.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.studentsAndTeachersPricingLink = this.studentsAndTeachersContainer.locator('div[class="body-m action-area"] a');
    this.merchStudentsViewPlansLink = this.studentsAndTeachersContainer.locator(
      'a.con-button[href*="/acrobat/pricing/students"]',
    );

    // FAQ accordion
    this.faqSection = page.locator('div[class*="accordion-container"]');
    this.faqAccordionTriggers = this.faqSection.locator('button.accordion-trigger');

    // Footer
    this.footer = page.locator('footer[class="global-footer"]');
    this.fedsMenuContent = this.footer.locator('div[class*="feds-menu-content"]');
    this.fedsMenuColumns = this.fedsMenuContent.locator('div[class*="feds-menu-column"]');
    this.fedsMenuItems = this.fedsMenuColumns.locator('a');
    this.fedsFeaturedProducts = this.footer.locator('div[class*="feds-featuredProducts"]');
    this.fedsFeaturedProductsItems = this.fedsFeaturedProducts.locator('a');
    this.fedsFooterOptions = this.footer.locator('div[class*="feds-footer-options"]');
    this.fedsFooterMiscLinks = this.fedsFooterOptions.locator('div[class*="feds-footer-miscLinks"]');
    this.fedsRegionPicker = this.fedsFooterOptions.locator('div[class*="feds-regionPicker"] a');
    this.fedsSocial = this.footer.locator('ul[class*="feds-social"] a');
    this.fedsFooterLegalWrapper = this.footer.locator('div[class*="feds-footer-legalWrapper"]');
    this.fedsFooterPrivacyListItems = this.fedsFooterLegalWrapper.locator('li[class*="feds-footer-privacy-list"]');
  }

  /** @param {string} dataPath fragment path substring */
  questionsAboutSection(dataPath) {
    return this.page.locator(`div[data-path*="${dataPath}"]`);
  }
}
