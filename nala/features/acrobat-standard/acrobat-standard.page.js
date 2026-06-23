export default class AcrobatStandardPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    this.heroMarquee = page.locator('div[class*="hero-marquee"]');

    // Marketing row — four-up + xs-spacing (*-bottom on Standard authoring)
    this.fourUpSection = page.locator('div.section.four-up[class*="xs-spacing"]');

    // Opens modal; locale-safe (no link text)
    this.seeAllFeaturesModalTrigger = page.locator(
      '[data-modal-path*="/dc-shared/fragments/modals/acrobat/acrobat-standard/see-all-features"]',
    );

    this.launchDemoLink = page.locator('a[href*="/go/EditOrganizeDiscover"]');

    // Matches Pro’s `compare-acrobat-plans` and Standard’s `compare-acrobat-plans-standard` data-paths
    this.merchCardPlans = page.locator('div[data-path*="/dc-shared/fragments/merch-cards/compare-acrobat-plans"]');
    this.merchCardPlansTitle = this.merchCardPlans.locator('h2');
    this.tabCompareIndividuals = this.merchCardPlans.locator('button[id="tab-compare-plans-1"]');
    this.tabCompareBusiness = this.merchCardPlans.locator('button[id="tab-compare-plans-2"]');
    this.tabCompareStudentsAndTeachers = this.merchCardPlans.locator('button[id="tab-compare-plans-3"]');

    this.individualStandardMerchCardsContainer = page.locator(
      'div[data-path="/dc-shared/fragments/merch-cards/acrobat-individuals-standard"]',
    );
    this.individualStandardMerchCards = this.individualStandardMerchCardsContainer.locator('merch-card');
    this.individualStandardMerchCardAcrobatStandard = this.individualStandardMerchCards.nth(0);
    this.acrobatStandardPrice = this.individualStandardMerchCardAcrobatStandard.locator('span[is*="inline-price"]');
    this.acrobatStandardBuyNow = this.individualStandardMerchCardAcrobatStandard.locator(
      'a[data-wcs-osi="QgYu51CVY2wKyFEqMuvec4N1tc1OaCypeKJjT5n2-Fc"]',
    );
    this.individualStandardMerchCardAcrobatPro = this.individualStandardMerchCards.nth(1);
    this.acrobatProStandardPrice = this.individualStandardMerchCardAcrobatPro.locator('span[is*="inline-price"]');
    this.acrobatProStandardFreeTrial = this.individualStandardMerchCardAcrobatPro.locator(
      'a[data-wcs-osi="-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ"]',
    );
    this.acrobatProStandardBuyNow = this.individualStandardMerchCardAcrobatPro.locator(
      'a[data-wcs-osi="vQmS1H18A6_kPd0tYBgKnp-TQIF0GbT6p8SH8rWcLMs"]',
    );
    this.individualStandardMerchCardAcrobatStudio = this.individualStandardMerchCards.nth(2);
    this.acrobatStudioStandardPrice = this.individualStandardMerchCardAcrobatStudio.locator('span[is*="inline-price"]');
    this.acrobatStudioStandardFreeTrial = this.individualStandardMerchCardAcrobatStudio.locator(
      'a[data-wcs-osi="x0LkInr7lGkqK8dcTFS_Pc6oHauo_g7N_4yWT_gLn20"]',
    );
    this.acrobatStudioStandardBuyNow = this.individualStandardMerchCardAcrobatStudio.locator(
      'a[data-wcs-osi="V3W0kzf4e6M2Ht1hP9ZAt3dQNmhuDFrmYmEPlE2SlG0"]',
    );
    this.individualStandardMerchCardsPricingLink = this.individualStandardMerchCardsContainer.locator(
      'div[class="body-m action-area"] a',
    );

    this.businessStandardMerchCardsContainer = page.locator(
      'div[data-path="/dc-shared/fragments/merch-cards/acrobat-business"]',
    );
    this.businessStandardMerchCards = this.businessStandardMerchCardsContainer.locator('merch-card');
    this.businessStandardMerchCardAcrobatStandardForTeams = this.businessStandardMerchCards.nth(0);
    this.acrobatStandardForTeamsPrice = this.businessStandardMerchCardAcrobatStandardForTeams.locator(
      'span[is*="inline-price"]',
    );
    this.acrobatStandardForTeamsBuyNow = this.businessStandardMerchCardAcrobatStandardForTeams.locator(
      'a[data-wcs-osi="AW-jV275GNYtPao6Q7XWENqyv_Stkc1BbzF7ak2u1dk"]',
    );
    this.businessStandardMerchCardAcrobatProForTeams = this.businessStandardMerchCards.nth(1);
    this.acrobatProForTeamsStandardPrice = this.businessStandardMerchCardAcrobatProForTeams.locator(
      'span[is*="inline-price"]',
    );
    this.acrobatProForTeamsStandardFreeTrial = this.businessStandardMerchCardAcrobatProForTeams.locator(
      'a[data-wcs-osi="8Lr09qx_PHqAJUwvUNiof4FFFEKjsR1TTbvBUncV2b0"]',
    );
    this.acrobatProForTeamsStandardBuyNow = this.businessStandardMerchCardAcrobatProForTeams.locator(
      'a[data-wcs-osi="vV01ci-KLH6hYdRfUKMBFx009hdpxZcIRG1-BY_PutE"]',
    );
    this.businessStandardMerchCardAcrobatStudioForTeams = this.businessStandardMerchCards.nth(2);
    this.acrobatStudioForTeamsStandardPrice = this.businessStandardMerchCardAcrobatStudioForTeams.locator(
      'span[is*="inline-price"]',
    );
    this.acrobatStudioForTeamsStandardFreeTrial = this.businessStandardMerchCardAcrobatStudioForTeams.locator(
      'a[data-wcs-osi="PVhDPYXq4fsy15OdlEE-XyIlvcxaPMxGs73pw39Cx-s"]',
    );
    this.acrobatStudioForTeamsStandardBuyNow = this.businessStandardMerchCardAcrobatStudioForTeams.locator(
      'a[data-wcs-osi="SfkorgyrBAsqBVpyKddQQEn6jR0ItBohpXc74sZcKHg"]',
    );

    this.studentsAndTeachersContainer = page.locator(
      'div[data-path="/dc-shared/fragments/merch-cards/acrobat-students-and-teachers-abm"]',
    );
    this.studentsAndTeachersMerchCards = this.studentsAndTeachersContainer.locator('merch-card');
    this.acrobatProForStudentsAndTeachers = this.studentsAndTeachersMerchCards.nth(0);
    this.acrobatProForStudentsAndTeachersPrice = this.acrobatProForStudentsAndTeachers.locator(
      'p[slot="heading-m-price"] span[is*="inline-price"]',
    );
    this.acrobatProForStudentsAndTeachersFreeTrial = this.acrobatProForStudentsAndTeachers.locator(
      'a[data-wcs-osi="WJLr3TF4T4qyJIGZTsDf9KPbTfxA7qAgStpaF2IgYao"]',
    );
    this.acrobatProForStudentsAndTeachersBuyNow = this.acrobatProForStudentsAndTeachers.locator(
      'a[data-wcs-osi="ZZQMV2cU-SWQoDxuznonUFMRdxSyTr4J3fB77YBNakY"]',
    );
    this.creativeCloudForStudentsAndTeachers = this.studentsAndTeachersMerchCards.nth(1);
    this.creativeCloudForStudentsAndTeachersPrice = this.creativeCloudForStudentsAndTeachers.locator(
      'p[slot="heading-m-price"] span[is*="inline-price"]',
    );
    this.creativeCloudForStudentsAndTeachersFreeTrial = this.creativeCloudForStudentsAndTeachers.locator(
      'a[data-wcs-osi="OQ1oCm1tZG35Gj7LCrkGeOOdUMfVlC7xx-7ml-CTWIE"]',
    );
    this.creativeCloudForStudentsAndTeachersBuyNow = this.creativeCloudForStudentsAndTeachers.locator(
      'a[data-wcs-osi="Hnk2P6L5wYhnpZLFYTW5upuk2Y3AJXlso8VGWQ0l2TI"]',
    );
    this.studentsAndTeachersPricingLink = this.studentsAndTeachersContainer.locator(
      'div[class="body-m action-area"] a',
    );

    this.acrobatProStandardIconBlock = page.locator(
      'div[data-path*="/dc-shared/fragments/acrobat/acrobat-pro-standard/icon-block"]',
    );

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

  /** @param {string} dataPath */
  questionsAboutSection(dataPath) {
    return this.page.locator(`div[data-path*="${dataPath}"]`);
  }
}
