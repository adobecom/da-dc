export default class GenerativeAiPdfPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    this.heroMarquee = page.locator('div[class*="hero-marquee"]');

    this.masonrySections = page.locator('div.section[class*="masonry"]');
    this.threeUpSections = page.locator('div.section.three-up');

    // Merch — compare Acrobat plans (fragment + tabs + three panel bodies)
    this.merchCardPlans = page.locator('div[data-path*="/dc-shared/fragments/merch-cards/compare-acrobat-plans"]');
    this.merchCardPlansTitle = this.merchCardPlans.locator('h2');
    this.tabCompareIndividuals = this.merchCardPlans.locator('button[id="tab-compare-plans-1"]');
    this.tabCompareBusiness = this.merchCardPlans.locator('button[id="tab-compare-plans-2"]');
    this.tabCompareStudentsAndTeachers = this.merchCardPlans.locator('button[id="tab-compare-plans-3"]');

    this.individualMerchCardsContainer = page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-individuals"]');
    this.individualMerchCards = this.individualMerchCardsContainer.locator('merch-card').filter({ visible: true });
    this.individualMerchCardAcrobatReader = this.individualMerchCards.nth(0);
    this.acrobatReaderPrice = this.individualMerchCardAcrobatReader.locator('p[slot="heading-m-price"]');
    this.acrobatReaderLink = this.individualMerchCardAcrobatReader.locator('a');
    this.individualMerchCardAcrobatPro = this.individualMerchCards.nth(1);
    this.acrobatProPrice = this.individualMerchCardAcrobatPro.locator('p[slot="heading-m-price"]');
    this.acrobatProFreeTrial = this.individualMerchCardAcrobatPro.locator('a[is*="checkout-link"][data-wcs-osi="-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ"]');
    this.acrobatProBuyNow = this.individualMerchCardAcrobatPro.locator('a[is*="checkout-link"][data-wcs-osi="vQmS1H18A6_kPd0tYBgKnp-TQIF0GbT6p8SH8rWcLMs"]');
    this.individualMerchCardAcrobatStudio = this.individualMerchCards.nth(2);
    this.acrobatStudioPrice = this.individualMerchCardAcrobatStudio.locator('p[slot="heading-m-price"]');
    this.acrobatStudioFreeTrial = this.individualMerchCardAcrobatStudio.locator('a[is*="checkout-link"][data-wcs-osi="x0LkInr7lGkqK8dcTFS_Pc6oHauo_g7N_4yWT_gLn20"]');
    this.acrobatStudioBuyNow = this.individualMerchCardAcrobatStudio.locator('a[is*="checkout-link"][data-wcs-osi="V3W0kzf4e6M2Ht1hP9ZAt3dQNmhuDFrmYmEPlE2SlG0"]').filter({ visible: true });
    this.individualMerchCardsPricingLink = this.individualMerchCardsContainer.locator('div[class="body-m action-area"] a').filter({ visible: true });
    this.merchIndividualsComparePlansLink = this.individualMerchCardsContainer.locator(
      'a.con-button[href*="compare-versions"], a.con-button[href*="compare-pricing"]',
    );

    this.businessMerchCardsContainer = page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-business-contact"]');
    this.businessMerchCards = this.businessMerchCardsContainer.locator('merch-card').filter({ visible: true });
    this.businessMerchCardAcrobatStandard = this.businessMerchCards.nth(0);
    this.acrobatProForTeamsPrice = this.businessMerchCardAcrobatStandard.locator('p[slot="heading-m-price"]');
    this.acrobatProForTeamsFreeTrial = this.businessMerchCardAcrobatStandard.locator('a[is*="checkout-link"][data-wcs-osi="8Lr09qx_PHqAJUwvUNiof4FFFEKjsR1TTbvBUncV2b0"]');
    this.acrobatProForTeamsBuyNow = this.businessMerchCardAcrobatStandard.locator('a[is*="checkout-link"][data-wcs-osi="vV01ci-KLH6hYdRfUKMBFx009hdpxZcIRG1-BY_PutE"]');
    this.acrobatStudioForTeams = this.businessMerchCards.nth(1);
    this.acrobatStudioForTeamsPrice = this.acrobatStudioForTeams.locator('p[slot="heading-m-price"]');
    this.acrobatStudioForTeamsFreeTrial = this.acrobatStudioForTeams.locator('a[is*="checkout-link"][data-wcs-osi="PVhDPYXq4fsy15OdlEE-XyIlvcxaPMxGs73pw39Cx-s"]');
    this.acrobatStudioForTeamsBuyNow = this.acrobatStudioForTeams.locator('a[is*="checkout-link"][data-wcs-osi="SfkorgyrBAsqBVpyKddQQEn6jR0ItBohpXc74sZcKHg"]');
    this.businessMerchCardsPricingLink = this.businessMerchCardsContainer.locator('div[class="body-m action-area"] a').filter({ visible: true });
    this.merchBusinessViewPlansLink = this.businessMerchCardsContainer.locator(
      'a.con-button[href*="/acrobat/pricing/business"]',
    );

    this.studentsAndTeachersContainer = page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-students-and-teachers"]');
    this.studentsAndTeachersMerchCards = this.studentsAndTeachersContainer.locator('merch-card').filter({ visible: true });
    this.acrobatProForStudentsAndTeachers = this.studentsAndTeachersMerchCards.nth(0);
    this.acrobatProForStudentsAndTeachersPrice = this.acrobatProForStudentsAndTeachers.locator('p[slot="heading-m-price"] span[is*="inline-price"]');
    this.acrobatProForStudentsAndTeachersFreeTrial = this.acrobatProForStudentsAndTeachers.locator('a[is*="checkout-link"][data-wcs-osi="WJLr3TF4T4qyJIGZTsDf9KPbTfxA7qAgStpaF2IgYao"]');
    this.acrobatProForStudentsAndTeachersBuyNow = this.acrobatProForStudentsAndTeachers.locator('a[is*="checkout-link"][data-wcs-osi="ZZQMV2cU-SWQoDxuznonUFMRdxSyTr4J3fB77YBNakY"]');
    this.creativeCloudForStudentsAndTeachers = this.studentsAndTeachersMerchCards.nth(1);
    this.creativeCloudForStudentsAndTeachersPrice = this.creativeCloudForStudentsAndTeachers.locator('p[slot="heading-m-price"] span[is*="inline-price"]');
    this.creativeCloudForStudentsAndTeachersFreeTrial = this.creativeCloudForStudentsAndTeachers.locator('a[is*="checkout-link"][data-wcs-osi="OQ1oCm1tZG35Gj7LCrkGeOOdUMfVlC7xx-7ml-CTWIE"]');
    this.creativeCloudForStudentsAndTeachersBuyNow = this.creativeCloudForStudentsAndTeachers.locator('a[is*="checkout-link"][data-wcs-osi="Hnk2P6L5wYhnpZLFYTW5upuk2Y3AJXlso8VGWQ0l2TI"]');
    this.studentsAndTeachersPricingLink = this.studentsAndTeachersContainer.locator('div[class="body-m action-area"] a').filter({ visible: true });
    this.merchStudentsViewPlansLink = this.studentsAndTeachersContainer.locator(
      'a.con-button[href*="/acrobat/pricing/students"]',
    );

    this.existingCustomerBlade = page.locator('div[id="already-an-existing-acrobat-customer"]');

    this.faqSection = page.locator('div[class*="accordion-container"]');
    this.faqAccordionTriggers = this.faqSection.locator('button.accordion-trigger');

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
}
