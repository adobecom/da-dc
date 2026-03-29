import { expect } from '@playwright/test';
export default class BasePage {
    constructor(page) {
      this.page = page;
  
// Global Navigation Section
this.gnav = this.page.locator('nav.feds-topnav');
this.gnavLogo = this.gnav.locator('.feds-brand');

// Nav items by position (assuming order is consistent)
this.gnavNavItems = this.gnav.locator('.feds-nav > [role="listitem"]');
this.gnavPDFsESignatures = this.gnavNavItems.nth(0).locator('button'); // PDFs & E-signatures
this.gnavAdobeAcrobat = this.gnavNavItems.nth(1).locator('a'); // Adobe Acrobat (active)
this.gnavFeatures = this.gnavNavItems.nth(2).locator('button'); // Features
this.gnavMobile = this.gnavNavItems.nth(3).locator('button'); // Mobile
this.gnavComparePlans = this.gnavNavItems.nth(4).locator('a');
this.gnavOnlineTools = this.gnavNavItems.nth(5).locator('button');
this.gnavLearnAndSupport = this.gnavNavItems.nth(6).locator('button');


// Universal Nav Section
this.universalNav = this.page.locator('div[id="universal-nav"]');
this.universalNavAppSwitcher = this.universalNav.locator('div[data-test-id="unav-app-switcher"]');
this.signInButton = this.universalNav.locator('button[data-test-id="unav-profile--sign-in"]');

// Hero Marquee Section
this.heroMarquee = this.page.locator('div[class*="hero-marquee"]');
this.heroMarqueeTitle = this.heroMarquee.locator('h1');
this.heroMarqueeDescription = this.heroMarquee.locator('p');
this.heroMarqueeCheckoutLink = this.heroMarquee.locator('a[is*="checkout-link"]');
this.heroNonCheckoutLinks = this.heroMarquee.locator('a:not([is*="checkout-link"])');


// Footer Section
this.footer = this.page.locator('footer[class="global-footer"]');
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

// Promo Sticky Section
this.promoSticky = this.page.locator('div[class*="promo-sticky"]');
this.promoStickyCopyWrap = this.promoSticky.locator('div[class*="copy-wrap"]');
this.promoStickyTitle = this.promoStickyCopyWrap.locator('h2');
this.promoStickyDescription = this.promoStickyCopyWrap.locator('p');
this.promoStickyLink = this.promoStickyCopyWrap.locator('a');

this.promoStickyActionArea = this.promoSticky.locator('p[class*="action-area"]');
this.promoStickyCheckoutLinks = this.promoStickyActionArea.locator('a[is*="checkout-link"]');



// Acrobat Overview FAQ Section
this.acrobatOverviewFAQ = this.page.locator('div[data-path*="/dc-shared/fragments/faq/acrobat-overview-faq"]');
this.acrobatOverviewFAQTitle = this.acrobatOverviewFAQ.locator('h2');
this.acrobatOverviewFAQButton = this.acrobatOverviewFAQ.locator('button');


// Merch Card Plans Section
this.merchCardPlans = this.page.locator('div[data-path*="/dc-shared/fragments/merch-cards/compare-acrobat-plans"]');
this.merchCardPlansTitle = this.merchCardPlans.locator('h2');

this.tabCompareIndividuals = this.merchCardPlans.locator('button[id="tab-compare-plans-1"]');
this.tabCompareBusiness = this.merchCardPlans.locator('button[id="tab-compare-plans-2"]');
this.tabCompareStudentsAndTeachers = this.merchCardPlans.locator('button[id="tab-compare-plans-3"]');

// Plans and Pricing Tabs Section (PDF Solution page)
this.plansAndPricingSection = this.page.locator('div[data-path="/dc-shared/fragments/acrobat/complete-pdf-solution/mini-compare-chart"]');
this.plansAndPricingTabs = this.plansAndPricingSection.locator('div.tabs#tabs-plans-and-pricing');
this.plansAndPricingTabButtons = this.plansAndPricingTabs.locator('button[role="tab"]');
this.plansAndPricingTabIndividuals = this.plansAndPricingTabs.locator('button#tab-plans-and-pricing-1');
this.plansAndPricingTabBusiness = this.plansAndPricingTabs.locator('button#tab-plans-and-pricing-2');
this.plansAndPricingTabStudents = this.plansAndPricingTabs.locator('button#tab-plans-and-pricing-3');
this.plansAndPricingPanelIndividuals = this.plansAndPricingTabs.locator('div#tab-panel-plans-and-pricing-1');
this.plansAndPricingPanelBusiness = this.plansAndPricingTabs.locator('div#tab-panel-plans-and-pricing-2');
this.plansAndPricingPanelStudents = this.plansAndPricingTabs.locator('div#tab-panel-plans-and-pricing-3');

// Plans and Pricing - Individuals Tab Merch Cards
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

// Plans and Pricing - Business Tab Merch Cards
this.plansBusinessMerchCards = this.plansAndPricingPanelBusiness.locator('merch-card');
this.plansBusinessProCard = this.plansBusinessMerchCards.nth(0);
this.plansBusinessProPrice = this.plansBusinessProCard.locator('span[is*="inline-price"]');
this.plansBusinessProFreeTrial = this.plansBusinessProCard.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.plansBusinessProBuyNow = this.plansBusinessProCard.locator('a[is*="checkout-link"][href*="ot=BASE"]');
this.plansBusinessStudioCard = this.plansBusinessMerchCards.nth(1);
this.plansBusinessStudioPrice = this.plansBusinessStudioCard.locator('span[is*="inline-price"]');
this.plansBusinessStudioFreeTrial = this.plansBusinessStudioCard.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.plansBusinessStudioBuyNow = this.plansBusinessStudioCard.locator('a[is*="checkout-link"][href*="ot=BASE"]');

// Plans and Pricing - Students Tab Merch Cards
this.plansStudentsMerchCards = this.plansAndPricingPanelStudents.locator('merch-card');
this.plansStudentsProCard = this.plansStudentsMerchCards.nth(0);
this.plansStudentsProPrice = this.plansStudentsProCard.locator('span[is*="inline-price"]');
this.plansStudentsProFreeTrial = this.plansStudentsProCard.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.plansStudentsProBuyNow = this.plansStudentsProCard.locator('a[is*="checkout-link"][href*="ot=BASE"]');
this.plansStudentsCCCard = this.plansStudentsMerchCards.nth(1);
this.plansStudentsCCPrice = this.plansStudentsCCCard.locator('span[is*="inline-price"]');
this.plansStudentsCCFreeTrial = this.plansStudentsCCCard.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.plansStudentsCCBuyNow = this.plansStudentsCCCard.locator('a[is*="checkout-link"][href*="ot=BASE"]');

// Individual Merch Cards Section
this.individualMerchCardsContainer = this.page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-individuals"]');
this.individualMerchCards = this.individualMerchCardsContainer.locator('merch-card');

// Acrobat Reader for Individuals Acrobat page
this.individualMerchCardAcrobatReader = this.individualMerchCards.nth(0);
this.acrobatReaderPrice = this.individualMerchCardAcrobatReader.locator('p[id="free"]');
this.acrobatReaderLink = this.individualMerchCardAcrobatReader.locator('a');

// Acrobat Pro for Individuals Acrobat page
this.individualMerchCardAcrobatPro = this.individualMerchCards.nth(1);
this.acrobatProPrice = this.individualMerchCardAcrobatPro.locator('span[is*="inline-price"]');
this.acrobatProFreeTrial = this.individualMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.acrobatProBuyNow = this.individualMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=BASE"]');

// Acrobat Studio for Individuals Acrobat page
this.individualMerchCardAcrobatStudio = this.individualMerchCards.nth(2);
this.acrobatStudioPrice = this.individualMerchCardAcrobatStudio.locator('span[is*="inline-price"]');
this.acrobatStudioFreeTrial = this.individualMerchCardAcrobatStudio.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.acrobatStudioBuyNow = this.individualMerchCardAcrobatStudio.locator('a[is*="checkout-link"][href*="ot=BASE"]');
this.individualMerchCardsPricingLink = this.individualMerchCardsContainer.locator('div[class="body-m action-area"] a');

// Business Merch Cards Section
this.businessMerchCardsContainer = this.page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-business-contact"]');
this.businessMerchCards = this.businessMerchCardsContainer.locator('merch-card');

// Acrobat Standard for Business Acrobat page
this.businessMerchCardAcrobatStandard = this.businessMerchCards.nth(0);
this.acrobatProForTeamsPrice = this.businessMerchCardAcrobatStandard.locator('span[is*="inline-price"]');
this.acrobatProForTeamsFreeTrial = this.businessMerchCardAcrobatStandard.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.acrobatProForTeamsBuyNow = this.businessMerchCardAcrobatStandard.locator('a[is*="checkout-link"][href*="ot=BASE"]');

// Acrobat Studio for Business Acrobat page
this.acrobatStudioForTeams = this.businessMerchCards.nth(1);
this.acrobatStudioForTeamsPrice = this.acrobatStudioForTeams.locator('span[is*="inline-price"]');
this.acrobatStudioForTeamsFreeTrial = this.acrobatStudioForTeams.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.acrobatStudioForTeamsBuyNow = this.acrobatStudioForTeams.locator('a[is*="checkout-link"][href*="ot=BASE"]');
this.businessMerchCardsPricingLink = this.businessMerchCardsContainer.locator('div[class="body-m action-area"] a');


// Students and Teachers Merch Cards Section
this.studentsAndTeachersContainer = this.page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-students-and-teachers"]');
this.studentsAndTeachersMerchCards = this.studentsAndTeachersContainer.locator('merch-card');

// Acrobat Pro for Students and Teachers Acrobat page
this.acrobatProForStudentsAndTeachers = this.studentsAndTeachersMerchCards.nth(0);
this.acrobatProForStudentsAndTeachersPrice = this.acrobatProForStudentsAndTeachers.locator('p[slot="heading-m-price"] span[is*="inline-price"]');
this.acrobatProForStudentsAndTeachersFreeTrial = this.acrobatProForStudentsAndTeachers.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.acrobatProForStudentsAndTeachersBuyNow = this.acrobatProForStudentsAndTeachers.locator('a[is*="checkout-link"][href*="ot=BASE"]');

// Creative Cloud for Students and Teachers Acrobat page
this.creativeCloudForStudentsAndTeachers = this.studentsAndTeachersMerchCards.nth(1);
this.creativeCloudForStudentsAndTeachersPrice = this.creativeCloudForStudentsAndTeachers.locator('p[slot="heading-m-price"] span[is*="inline-price"]');
this.creativeCloudForStudentsAndTeachersFreeTrial = this.creativeCloudForStudentsAndTeachers.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.creativeCloudForStudentsAndTeachersBuyNow = this.creativeCloudForStudentsAndTeachers.locator('a[is*="checkout-link"][href*="ot=BASE"]');
this.studentsAndTeachersPricingLink = this.studentsAndTeachersContainer.locator('div[class="body-m action-area"] a');

// Comparison Table Section
this.comparisonTableSection = this.page.locator('div.section.table-section');
this.comparisonTable = this.comparisonTableSection.locator('div.table[role="table"]');
this.comparisonTableHeadingRow = this.comparisonTable.locator('div.row-heading');
this.comparisonTableColumnHeaders = this.comparisonTableHeadingRow.locator('h3.tracking-header');
this.comparisonTableSectionHeads = this.comparisonTable.locator('div.section-head');
this.comparisonTableFeatureRows = this.comparisonTable.locator('div.section-row');
this.comparisonTableCompareLink = this.comparisonTableSection.locator('div.text-block a');

// Business Comparison Table Section
this.businessComparisonTable = this.page.locator('div.table.sticky-tablet-up[role="table"]');
this.businessComparisonTableHeadingRow = this.businessComparisonTable.locator('div.row-heading');
this.businessComparisonTableColumnHeaders = this.businessComparisonTableHeadingRow.locator('div.col-heading');
this.businessComparisonTableFeatureRows = this.businessComparisonTable.locator('div.section-row');
this.businessComparisonTableFreeTrialLinks = this.businessComparisonTableHeadingRow.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.businessComparisonTableBuyNowLinks = this.businessComparisonTableHeadingRow.locator('a[is*="checkout-link"][href*="ot=BASE"]');
this.businessComparisonTableLearnMoreLink = this.businessComparisonTableHeadingRow.locator('a:not([is*="checkout-link"])');

// Tabbed Comparison Table Section (Compare Versions page)
this.compareTabs = this.page.locator('div.tabs#tabs-compare');
this.compareTabButtons = this.compareTabs.locator('button[role="tab"]');
this.compareTabIndividuals = this.compareTabs.locator('button#tab-compare-1');
this.compareTabBusiness = this.compareTabs.locator('button#tab-compare-2');
this.compareTabStudents = this.compareTabs.locator('button#tab-compare-3');
this.compareTabPanels = this.compareTabs.locator('div.tabpanel');
this.compareTabPanelIndividuals = this.compareTabs.locator('div#tab-panel-compare-1');
this.compareTabPanelBusiness = this.compareTabs.locator('div#tab-panel-compare-2');
this.compareTabPanelStudents = this.compareTabs.locator('div#tab-panel-compare-3');

// Pricing page Individuals
this.pricingPageIndividuals = this.page.locator('div[data-path="/dc-shared/fragments/merch/acrobat/pricing/acrobat-individual-abm-merch-card-product"]');
this.pricingPageIndividualsMerchCards = this.pricingPageIndividuals.locator('merch-card');

// Acrobat Standard for Individuals Pricing page
this.pricingPageIndividualsMerchCardAcrobatStandard = this.pricingPageIndividualsMerchCards.nth(0);
this.pricingPageIndividualsMerchCardAcrobatStandardPrice = this.pricingPageIndividualsMerchCardAcrobatStandard.locator('span[is*="inline-price"]');
this.pricingPageIndividualsMerchCardAcrobatStandardBuyNow = this.pricingPageIndividualsMerchCardAcrobatStandard.locator('a[is="checkout-link"][href*="ot=BASE"]');

// Acrobat Pro for Individuals Pricing page
this.pricingPageIndividualsMerchCardAcrobatPro = this.pricingPageIndividualsMerchCards.nth(1);
this.pricingPageIndividualsMerchCardAcrobatProPrice = this.pricingPageIndividualsMerchCardAcrobatPro.locator('span[is*="inline-price"]');
this.pricingPageIndividualsMerchCardAcrobatProFreeTrial = this.pricingPageIndividualsMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.pricingPageIndividualsMerchCardAcrobatProBuyNow = this.pricingPageIndividualsMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=BASE"]');

// Acrobat Studio for Individuals Pricing page
this.pricingPageIndividualsMerchCardAcrobatStudio = this.pricingPageIndividualsMerchCards.nth(2);
this.pricingPageIndividualsMerchCardAcrobatStudioPrice = this.pricingPageIndividualsMerchCardAcrobatStudio.locator('span[is*="inline-price"]');
this.pricingPageIndividualsMerchCardAcrobatStudioFreeTrial = this.pricingPageIndividualsMerchCardAcrobatStudio.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.pricingPageIndividualsMerchCardAcrobatStudioBuyNow = this.pricingPageIndividualsMerchCardAcrobatStudio.locator('a[is*="checkout-link"][href*="ot=BASE"]');

// Pricing page Business
this.pricingPageBusiness = this.page.locator('div[data-path="/dc-shared/fragments/merch/acrobat/pricing/acrobat-business-abm-merch-card-product"]');
this.pricingPageBusinessMerchCards = this.pricingPageBusiness.locator('merch-card');

// Acrobat Standard for Teams Business Pricing page
this.pricingPageBusinessMerchCardAcrobatStandardForTeams = this.pricingPageBusinessMerchCards.nth(0);
this.pricingPageBusinessMerchCardAcrobatStandardForTeamsPrice = this.pricingPageBusinessMerchCardAcrobatStandardForTeams.locator('span[is*="inline-price"]');
this.pricingPageBusinessMerchCardAcrobatStandardForTeamsFreeTrial = this.pricingPageBusinessMerchCardAcrobatStandardForTeams.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.pricingPageBusinessMerchCardAcrobatStandardForTeamsBuyNow = this.pricingPageBusinessMerchCardAcrobatStandardForTeams.locator('a[is*="checkout-link"][href*="ot=BASE"]');

// Acrobat Pro for Teams Business Pricing page
this.pricingPageBusinessMerchCardAcrobatProForTeams = this.pricingPageBusinessMerchCards.nth(1);
this.pricingPageBusinessMerchCardAcrobatProForTeamsPrice = this.pricingPageBusinessMerchCardAcrobatProForTeams.locator('span[is*="inline-price"]');
this.pricingPageBusinessMerchCardAcrobatProForTeamsFreeTrial = this.pricingPageBusinessMerchCardAcrobatProForTeams.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.pricingPageBusinessMerchCardAcrobatProForTeamsBuyNow = this.pricingPageBusinessMerchCardAcrobatProForTeams.locator('a[is*="checkout-link"][href*="ot=BASE"]');

// Acrobat Studio for Teams Business Pricing page
this.pricingPageBusinessMerchCardAcrobatStudioForTeams = this.pricingPageBusinessMerchCards.nth(2);
this.pricingPageBusinessMerchCardAcrobatStudioForTeamsPrice = this.pricingPageBusinessMerchCardAcrobatStudioForTeams.locator('span[is*="inline-price"]');
this.pricingPageBusinessMerchCardAcrobatStudioForTeamsFreeTrial = this.pricingPageBusinessMerchCardAcrobatStudioForTeams.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.pricingPageBusinessMerchCardAcrobatStudioForTeamsBuyNow = this.pricingPageBusinessMerchCardAcrobatStudioForTeams.locator('a[is*="checkout-link"][href*="ot=BASE"]');

// Pricing page Students
this.pricingPageStudents = this.page.locator('div[data-path="/dc-shared/fragments/merch/acrobat/pricing/acrobat-students-abm-merch-card-product"]');
this.pricingPageStudentsMerchCards = this.pricingPageStudents.locator('merch-card');

// Acrobat Pro for Students Pricing page
this.pricingPageStudentsMerchCardAcrobatPro = this.pricingPageStudentsMerchCards.nth(0);
this.pricingPageStudentsMerchCardAcrobatProPrice = this.pricingPageStudentsMerchCardAcrobatPro.locator('p[slot="heading-xs"] span[is*="inline-price"]');
this.pricingPageStudentsMerchCardAcrobatProFreeTrial = this.pricingPageStudentsMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.pricingPageStudentsMerchCardAcrobatProBuyNow = this.pricingPageStudentsMerchCardAcrobatPro.locator('a[is*="checkout-link"]');

// Creative Cloud for Students Pricing page
this.pricingPageStudentsMerchCardCreativeCloud = this.pricingPageStudentsMerchCards.nth(1);
this.pricingPageStudentsMerchCardCreativeCloudPrice = this.pricingPageStudentsMerchCardCreativeCloud.locator('p[slot="heading-xs"] span[is*="inline-price"]');
this.pricingPageStudentsMerchCardCreativeCloudFreeTrial = this.pricingPageStudentsMerchCardCreativeCloud.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
this.pricingPageStudentsMerchCardCreativeCloudBuyNow = this.pricingPageStudentsMerchCardCreativeCloud.locator('a[is*="checkout-link"]');

// Generative AI Students Prompt Tabs Section
this.genAiStudentsTabs = this.page.locator('div.tabs#tabs-genaipdfstudents');
this.genAiStudentsTabButtons = this.genAiStudentsTabs.locator('button[role="tab"]');
this.genAiStudentsTabAsk = this.genAiStudentsTabs.locator('button#tab-genaipdfstudents-1');
this.genAiStudentsTabAnalyze = this.genAiStudentsTabs.locator('button#tab-genaipdfstudents-2');
this.genAiStudentsTabModify = this.genAiStudentsTabs.locator('button#tab-genaipdfstudents-3');
this.genAiStudentsTabGenerate = this.genAiStudentsTabs.locator('button#tab-genaipdfstudents-4');
this.genAiStudentsTabBrainstorm = this.genAiStudentsTabs.locator('button#tab-genaipdfstudents-5');

this.genAiStudentsPanelAsk = this.genAiStudentsTabs.locator('div#tab-panel-genaipdfstudents-1');
this.genAiStudentsPanelAnalyze = this.genAiStudentsTabs.locator('div#tab-panel-genaipdfstudents-2');
this.genAiStudentsPanelModify = this.genAiStudentsTabs.locator('div#tab-panel-genaipdfstudents-3');
this.genAiStudentsPanelGenerate = this.genAiStudentsTabs.locator('div#tab-panel-genaipdfstudents-4');
this.genAiStudentsPanelBrainstorm = this.genAiStudentsTabs.locator('div#tab-panel-genaipdfstudents-5');

this.genAiStudentsPromptCards = this.genAiStudentsTabs.locator('.prompt-card');
this.genAiStudentsSeeAllPromptsLink = this.genAiStudentsTabs.locator('a[href*="ai-prompts"]');

// Three-up Editorial Cards Section
this.editorialCard = this.page.locator('div.editorial-card');



// Business Sign Merch Cards Section
this.businessSignMerchCardsContainer = this.page.locator('div[data-path="/dc-shared/fragments/merch/acrobat/business/acrobat-studio-teams/merch-card-blade"]');
this.businessSignMerchCards = this.businessSignMerchCardsContainer.locator('merch-card');
}

    getCheckoutLink(osi) {
      return this.page.locator(`a[is*="checkout-link"][data-wcs-osi="${osi}"]`);
    }

    async verifyCheckoutLinks(osiList) {
      for (const osi of osiList) {
        const link = this.getCheckoutLink(osi);
        await expect(link).toBeVisible();
        await expect(link).toBeEnabled();
      }
    }

    getPrice(osi) {
      return this.page.locator(`span[is="inline-price"][data-wcs-osi="${osi}"]`);
    }

    async verifyPrices(osiList) {
      for (const osi of osiList) {
        const price = this.getPrice(osi);
        await expect(price).toBeVisible();
      }
    }
  
    async verifyGnav() {
        await this.gnav.waitFor({ state: 'visible' });
        await expect(this.gnavPDFsESignatures).toBeVisible();
        await expect(this.gnavPDFsESignatures).toBeEnabled();
        await expect(this.gnavAdobeAcrobat).toBeVisible();
        await expect(this.gnavAdobeAcrobat).toBeEnabled();
        await expect(this.gnavFeatures).toBeVisible();
        await expect(this.gnavFeatures).toBeEnabled();
        await expect(this.gnavMobile).toBeVisible();
        await expect(this.gnavMobile).toBeEnabled();
        await expect(this.gnavComparePlans).toBeVisible();
        await expect(this.gnavComparePlans).toBeEnabled();
        await expect(this.gnavOnlineTools).toBeVisible();
        await expect(this.gnavOnlineTools).toBeEnabled();
        await expect(this.gnavLearnAndSupport).toBeVisible();
        await expect(this.gnavLearnAndSupport).toBeEnabled();

        await expect(this.universalNav).toBeVisible();
        await expect(this.universalNavAppSwitcher).toBeVisible();
        await expect(this.universalNavAppSwitcher).toBeEnabled();
        await expect(this.signInButton).toBeVisible();
        await expect(this.signInButton).toBeEnabled();
    }   

    async verifyQuestionsAboutSection(dataPath) {
      const questionsAboutSection = this.page.locator(`div[data-path*="${dataPath}"]`);
      await questionsAboutSection.scrollIntoViewIfNeeded();
      const title = questionsAboutSection.locator('h2');
      const description = questionsAboutSection.locator('p');
      const links = questionsAboutSection.locator('a');

      await expect(questionsAboutSection).toBeVisible();
      await expect(title).toBeVisible();
      await expect(description.first()).toBeVisible();
      await expect(links.first()).toBeVisible();
      await expect(links.first()).toBeEnabled();
      await expect(links.first()).toHaveAttribute('href', expect.stringContaining('/acrobat/contact'));
      await expect(links.last()).toBeVisible();
      await expect(links.last()).toBeEnabled();
      await expect(links.last()).toHaveAttribute('href', /tel:/);
      await expect(links).toHaveCount(2);
    }

    async verifyFAQAccordion(dataPath) {
      const faqSection = this.page.locator(`div[data-path*="${dataPath}"]`);
      const title = faqSection.locator('h2');
      const accordionButtons = faqSection.locator('button.accordion-trigger');

      await expect(faqSection).toBeVisible();
      await expect(title).toBeVisible();

      const buttonCount = await accordionButtons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = accordionButtons.nth(i);
        const ariaControls = await button.getAttribute('aria-controls');
        const contentPanel = faqSection.locator(`#${ariaControls}`);

        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'true');
        await expect(contentPanel).toBeVisible();

        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'false');
      }
    }

    async verifyCarousel() {

      const carousel = this.page.locator('div.carousel');
      const slides = carousel.locator('div.carousel-slide');
      const nextButton = carousel.locator('button.carousel-next');
      const prevButton = carousel.locator('button.carousel-previous');
      const indicators = carousel.locator('li.carousel-indicator');

      await expect(carousel).toBeVisible();

      const slideCount = await slides.count();
      const indicatorCount = await indicators.count();

      expect(slideCount).toBeGreaterThan(0);
      expect(indicatorCount).toBe(slideCount);

      for (let i = 0; i < slideCount; i++) {
        const slide = slides.nth(i);
        const title = slide.locator('h3');
        const description = slide.locator('p.body-m');
        const image = slide.locator('img');

        await expect(title).toBeVisible();
        await expect(description).toBeVisible();
        await expect(image).toHaveAttribute('src', expect.stringMatching(/.+/));
      }

      await expect(nextButton).toBeVisible();
      await expect(nextButton).toBeEnabled();
      await expect(prevButton).toBeVisible();
      await expect(prevButton).toBeEnabled();

      const initialActiveIndex = await carousel.locator('li.carousel-indicator.active').getAttribute('data-index');

      await nextButton.click();
      await this.page.waitForTimeout(300);

      const newActiveIndex = await carousel.locator('li.carousel-indicator.active').getAttribute('data-index');
      expect(newActiveIndex).not.toBe(initialActiveIndex);

      await prevButton.click();
      await this.page.waitForTimeout(300);

      const revertedIndex = await carousel.locator('li.carousel-indicator.active').getAttribute('data-index');
      expect(revertedIndex).toBe(initialActiveIndex);
    }

    async verifyFooter() {
      await expect(this.footer).toBeVisible();
      await expect(this.fedsMenuContent).toBeVisible();
      await expect(this.fedsMenuColumns.first()).toBeVisible();
      await expect(this.fedsMenuColumns).toHaveCount(5);
      await expect(this.fedsMenuItems.first()).toBeVisible();
      await expect(this.fedsMenuItems).toHaveCount(25);

      await expect(this.fedsFeaturedProducts).toBeVisible();
      await expect(this.fedsFeaturedProductsItems.first()).toBeVisible();
      await expect(this.fedsFeaturedProductsItems).toHaveCount(4);

      await this.verifyFooterOptions();
    }

    async verifyFooterOptions() {
      await expect(this.fedsFooterOptions).toBeVisible();
      await expect(this.fedsFooterMiscLinks).toBeVisible();
      await expect(this.fedsRegionPicker.first()).toBeVisible();
      await expect(this.fedsSocial.first()).toBeVisible();
      await expect(this.fedsSocial).toHaveCount(4);
      await expect(this.fedsFooterLegalWrapper).toBeVisible();
      await expect(this.fedsFooterPrivacyListItems.first()).toBeVisible();
      await expect(this.fedsFooterPrivacyListItems).toHaveCount(6);
    }

    async verifyPromoSticky() {
      await expect(this.promoSticky).toBeVisible();
      await expect(this.promoStickyCopyWrap).toBeVisible();
      await expect(this.promoStickyTitle).toBeVisible();
      await expect(this.promoStickyDescription).toBeVisible();
      await expect(this.promoStickyLink.first()).toBeVisible();
      await expect(this.promoStickyLink.first()).toBeEnabled();
      await expect(this.promoStickyLink.last()).toBeVisible();
      await expect(this.promoStickyLink.last()).toBeEnabled();
      await expect(this.promoStickyCheckoutLinks.first()).toBeVisible();
      await expect(this.promoStickyCheckoutLinks.first()).toBeEnabled();
      await expect(this.promoStickyCheckoutLinks.last()).toBeVisible();
      await expect(this.promoStickyCheckoutLinks.last()).toBeEnabled();
    }

    async verifyMerchCardPlans() {
      await expect(this.merchCardPlans).toBeVisible();
      await expect(this.merchCardPlansTitle).toBeVisible();
      await expect(this.tabCompareIndividuals).toBeVisible();
      await expect(this.tabCompareIndividuals).toBeEnabled();
      await expect(this.tabCompareBusiness).toBeVisible();
      await expect(this.tabCompareBusiness).toBeEnabled();
      await expect(this.tabCompareStudentsAndTeachers).toBeVisible();
      await expect(this.tabCompareStudentsAndTeachers).toBeEnabled();

      await this.tabCompareIndividuals.click();
      await this.verifyIndividualMerchCards();
    
      await this.tabCompareBusiness.click();
      await this.verifyBusinessMerchCards();
    
      await this.tabCompareStudentsAndTeachers.click();
      await this.verifyStudentsAndTeachersMerchCards();
    }

    async verifyIndividualMerchCards() {
      await expect(this.individualMerchCards.first()).toBeVisible();
      await expect(this.individualMerchCards).toHaveCount(3);

      await expect(this.acrobatReaderPrice).toBeVisible();
      await expect(this.acrobatReaderLink.first()).toBeVisible();
      await expect(this.acrobatReaderLink.first()).toBeEnabled();

      await expect(this.acrobatProPrice).toBeVisible();
      await expect(this.acrobatProFreeTrial).toBeVisible();
      await expect(this.acrobatProFreeTrial).toBeEnabled();
      await expect(this.acrobatProFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(this.acrobatProBuyNow).toBeVisible();
      await expect(this.acrobatProBuyNow).toBeEnabled();
      await expect(this.acrobatProBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(this.acrobatStudioPrice).toBeVisible();
      await expect(this.acrobatStudioFreeTrial).toBeVisible();
      await expect(this.acrobatStudioFreeTrial).toBeEnabled();
      await expect(this.acrobatStudioFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(this.acrobatStudioBuyNow).toBeVisible();
      await expect(this.acrobatStudioBuyNow).toBeEnabled();
      await expect(this.acrobatStudioBuyNow).toHaveAttribute('href', /ot=BASE/);
    

      await expect(this.individualMerchCardsPricingLink).toBeVisible();
      await expect(this.individualMerchCardsPricingLink).toBeEnabled();
      await expect(this.individualMerchCardsPricingLink).toHaveCount(1);
    }

    async verifyBusinessMerchCards() {
      await expect(this.businessMerchCards.first()).toBeVisible();
      await expect(this.businessMerchCards).toHaveCount(2);

      await expect(this.acrobatProForTeamsPrice).toBeVisible();
      await expect(this.acrobatProForTeamsFreeTrial).toBeVisible();
      await expect(this.acrobatProForTeamsFreeTrial).toBeEnabled();
      await expect(this.acrobatProForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(this.acrobatProForTeamsBuyNow).toBeVisible();
      await expect(this.acrobatProForTeamsBuyNow).toBeEnabled();
      await expect(this.acrobatProForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(this.acrobatStudioForTeamsPrice).toBeVisible();
      await expect(this.acrobatStudioForTeamsFreeTrial).toBeVisible();
      await expect(this.acrobatStudioForTeamsFreeTrial).toBeEnabled();
      await expect(this.acrobatStudioForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(this.acrobatStudioForTeamsBuyNow).toBeVisible();
      await expect(this.acrobatStudioForTeamsBuyNow).toBeEnabled();
      await expect(this.acrobatStudioForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(this.businessMerchCardsPricingLink).toBeVisible();
      await expect(this.businessMerchCardsPricingLink).toBeEnabled();
      await expect(this.businessMerchCardsPricingLink).toHaveCount(1);
    }
    
    async verifyStudentsAndTeachersMerchCards() {
      await expect(this.studentsAndTeachersMerchCards.first()).toBeVisible();
      await expect(this.studentsAndTeachersMerchCards).toHaveCount(2);

      await expect(this.acrobatProForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(this.acrobatProForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(this.acrobatProForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(this.acrobatProForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(this.acrobatProForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(this.acrobatProForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(this.acrobatProForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(this.creativeCloudForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(this.creativeCloudForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(this.creativeCloudForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(this.creativeCloudForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(this.creativeCloudForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(this.creativeCloudForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(this.creativeCloudForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(this.studentsAndTeachersPricingLink).toBeVisible();
      await expect(this.studentsAndTeachersPricingLink).toBeEnabled();
      await expect(this.studentsAndTeachersPricingLink).toHaveCount(1);
    }

    async verifyPlansAndPricingTabsPDFSolution() {
      await expect(this.plansAndPricingSection).toBeVisible();
      await expect(this.plansAndPricingTabs).toBeVisible();
      await expect(this.plansAndPricingTabButtons).toHaveCount(3);

      await expect(this.plansAndPricingTabIndividuals).toBeVisible();
      await expect(this.plansAndPricingTabIndividuals).toBeEnabled();
      await expect(this.plansAndPricingTabBusiness).toBeVisible();
      await expect(this.plansAndPricingTabBusiness).toBeEnabled();
      await expect(this.plansAndPricingTabStudents).toBeVisible();
      await expect(this.plansAndPricingTabStudents).toBeEnabled();

      await this.plansAndPricingTabIndividuals.click();
      await expect(this.plansAndPricingTabIndividuals).toHaveAttribute('aria-selected', 'true');
      await expect(this.plansAndPricingPanelIndividuals).not.toHaveAttribute('hidden');

      await expect(this.plansIndividualsMerchCards).toHaveCount(3);

      await expect(this.plansIndividualsReaderCard).toBeVisible();
      await expect(this.plansIndividualsReaderDownload).toBeVisible();
      await expect(this.plansIndividualsReaderDownload).toBeEnabled();

      await expect(this.plansIndividualsProCard).toBeVisible();
      await expect(this.plansIndividualsProPrice.first()).toBeVisible();
      await expect(this.plansIndividualsProFreeTrial).toBeVisible();
      await expect(this.plansIndividualsProFreeTrial).toBeEnabled();
      await expect(this.plansIndividualsProBuyNow).toBeVisible();
      await expect(this.plansIndividualsProBuyNow).toBeEnabled();

      await expect(this.plansIndividualsStudioCard).toBeVisible();
      await expect(this.plansIndividualsStudioPrice.first()).toBeVisible();
      await expect(this.plansIndividualsStudioFreeTrial).toBeVisible();
      await expect(this.plansIndividualsStudioFreeTrial).toBeEnabled();
      await expect(this.plansIndividualsStudioBuyNow).toBeVisible();
      await expect(this.plansIndividualsStudioBuyNow).toBeEnabled();

      await this.plansAndPricingTabBusiness.click();
      await expect(this.plansAndPricingTabBusiness).toHaveAttribute('aria-selected', 'true');
      await expect(this.plansAndPricingPanelBusiness).not.toHaveAttribute('hidden');

      await expect(this.plansBusinessMerchCards).toHaveCount(2);

      await expect(this.plansBusinessProCard).toBeVisible();
      await expect(this.plansBusinessProPrice.first()).toBeVisible();
      await expect(this.plansBusinessProFreeTrial).toBeVisible();
      await expect(this.plansBusinessProFreeTrial).toBeEnabled();
      await expect(this.plansBusinessProBuyNow).toBeVisible();
      await expect(this.plansBusinessProBuyNow).toBeEnabled();

      await expect(this.plansBusinessStudioCard).toBeVisible();
      await expect(this.plansBusinessStudioPrice.first()).toBeVisible();
      await expect(this.plansBusinessStudioFreeTrial).toBeVisible();
      await expect(this.plansBusinessStudioFreeTrial).toBeEnabled();
      await expect(this.plansBusinessStudioBuyNow).toBeVisible();
      await expect(this.plansBusinessStudioBuyNow).toBeEnabled();

      await this.plansAndPricingTabStudents.click();
      await expect(this.plansAndPricingTabStudents).toHaveAttribute('aria-selected', 'true');
      await expect(this.plansAndPricingPanelStudents).not.toHaveAttribute('hidden');

      await expect(this.plansStudentsMerchCards).toHaveCount(2);

      await expect(this.plansStudentsProCard).toBeVisible();
      await expect(this.plansStudentsProPrice.first()).toBeVisible();
      await expect(this.plansStudentsProFreeTrial).toBeVisible();
      await expect(this.plansStudentsProFreeTrial).toBeEnabled();
      await expect(this.plansStudentsProBuyNow).toBeVisible();
      await expect(this.plansStudentsProBuyNow).toBeEnabled();

      await expect(this.plansStudentsCCCard).toBeVisible();
      await expect(this.plansStudentsCCPrice.first()).toBeVisible();
      await expect(this.plansStudentsCCFreeTrial).toBeVisible();
      await expect(this.plansStudentsCCFreeTrial).toBeEnabled();
      await expect(this.plansStudentsCCBuyNow).toBeVisible();
      await expect(this.plansStudentsCCBuyNow).toBeEnabled();

      await this.plansAndPricingTabIndividuals.click();
      await expect(this.plansAndPricingTabIndividuals).toHaveAttribute('aria-selected', 'true');
    }

    async verifyHeroMarquee() {
      await expect(this.heroMarquee).toBeVisible();
      await expect(this.heroMarqueeTitle).toBeVisible();
      await expect(this.heroMarqueeDescription.first()).toBeVisible();
      await expect(this.heroNonCheckoutLinks.first()).toBeVisible();
      await expect(this.heroNonCheckoutLinks.first()).toBeEnabled();
      await expect(this.heroNonCheckoutLinks).toHaveCount(3);
      await expect(this.heroMarqueeCheckoutLink).toBeVisible();
      await expect(this.heroMarqueeCheckoutLink).toBeEnabled();
      await expect(this.heroMarqueeCheckoutLink).toHaveCount(1);
    }

    async verifyTableBasics() {
      await expect(this.comparisonTable).toBeVisible();
    
      await expect(this.comparisonTableHeadingRow).toBeVisible();

      const sectionHeadCount = await this.comparisonTableSectionHeads.count();
      expect(sectionHeadCount).toBeGreaterThan(0);
    }

    async verifyComparisonTable() {
      await this.verifyTableBasics();

      const visibleSectionHead = this.comparisonTableSectionHeads.first();
      await expect(visibleSectionHead).toBeVisible();
      const expandButton = visibleSectionHead.locator('span.icon.expand');
      await expect(expandButton).toHaveAttribute('aria-expanded', 'true');

      const visibleFeatureRows = this.comparisonTable.locator('div.section-row:not(.hidden)');
      const visibleRowCount = await visibleFeatureRows.count();
      expect(visibleRowCount).toBeGreaterThan(0);

      const firstVisibleRow = visibleFeatureRows.first();
      const featureTitle = firstVisibleRow.locator('.table-title-text');
      await expect(featureTitle).toBeVisible();

      const checkmarks = firstVisibleRow.locator('span.icon-checkmark');
      const checkmarkCount = await checkmarks.count();
      expect(checkmarkCount).toBeGreaterThan(0);

    }

    async verifyComparisonTableCompareLink() {
      await expect(this.comparisonTableCompareLink).toBeVisible();
      await expect(this.comparisonTableCompareLink).toBeEnabled();
      await expect(this.comparisonTableCompareLink).toHaveAttribute('href', /compare-versions/);
    }

    async verifyMultipleComparisonTables() {
      const tables = this.page.locator('div.table[role="table"]');
      const tableCount = await tables.count();
      expect(tableCount).toBeGreaterThanOrEqual(2);

      for (let i = 0; i < tableCount; i += 1) {
        const table = tables.nth(i);
        await expect(table).toBeVisible();

        const headingRow = table.locator('div.row-heading');
        await expect(headingRow).toBeVisible();

        const featureRows = table.locator('div.section-row');
        const rowCount = await featureRows.count();
        expect(rowCount).toBeGreaterThan(0);
      }
    }

    async verifyComparisonTableSectionToggle() {
      const visibleSectionHead = this.comparisonTableSectionHeads.first();
      const expandButton = visibleSectionHead.locator('span.icon.expand');

      await expect(expandButton.first()).toHaveAttribute('aria-expanded', 'true');

      await expandButton.first().click();
      await expect(expandButton.first()).toHaveAttribute('aria-expanded', 'false');

      await expandButton.first().click();
      await expect(expandButton.first()).toHaveAttribute('aria-expanded', 'true');
    }

    async verifyPricingPageMerchCards() {
      await expect(this.pricingPageIndividualsMerchCards.first()).toBeVisible();
      await expect(this.pricingPageIndividualsMerchCards).toHaveCount(3);

      await expect(this.pricingPageIndividualsMerchCardAcrobatStandardPrice).toBeVisible();
      await expect(this.pricingPageIndividualsMerchCardAcrobatStandardBuyNow).toBeVisible();
      await expect(this.pricingPageIndividualsMerchCardAcrobatStandardBuyNow).toBeEnabled();
      await expect(this.pricingPageIndividualsMerchCardAcrobatStandardBuyNow).toHaveCount(1);

      await expect(this.pricingPageIndividualsMerchCardAcrobatProPrice).toBeVisible();
      await expect(this.pricingPageIndividualsMerchCardAcrobatProFreeTrial).toBeVisible();
      await expect(this.pricingPageIndividualsMerchCardAcrobatProFreeTrial).toBeEnabled();
      await expect(this.pricingPageIndividualsMerchCardAcrobatProBuyNow).toBeVisible();
      await expect(this.pricingPageIndividualsMerchCardAcrobatProBuyNow).toBeEnabled();
      await expect(this.pricingPageIndividualsMerchCardAcrobatProBuyNow).toHaveCount(1);


      await expect(this.pricingPageIndividualsMerchCardAcrobatStudioPrice).toBeVisible();
      await expect(this.pricingPageIndividualsMerchCardAcrobatStudioFreeTrial).toBeVisible();
      await expect(this.pricingPageIndividualsMerchCardAcrobatStudioFreeTrial).toBeEnabled();
      await expect(this.pricingPageIndividualsMerchCardAcrobatStudioBuyNow).toBeVisible();
      await expect(this.pricingPageIndividualsMerchCardAcrobatStudioBuyNow).toBeEnabled();
      await expect(this.pricingPageIndividualsMerchCardAcrobatStudioBuyNow).toHaveCount(1);
    }

    async verifyPricingBusinessPageMerchCards() {
      await expect(this.pricingPageBusinessMerchCards.first()).toBeVisible();
      await expect(this.pricingPageBusinessMerchCards).toHaveCount(3);

      await expect(this.pricingPageBusinessMerchCardAcrobatStandardForTeamsPrice).toBeVisible();
      await expect(this.pricingPageBusinessMerchCardAcrobatStandardForTeamsBuyNow).toBeVisible();
      await expect(this.pricingPageBusinessMerchCardAcrobatStandardForTeamsBuyNow).toBeEnabled();
      await expect(this.pricingPageBusinessMerchCardAcrobatStandardForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(this.pricingPageBusinessMerchCardAcrobatProForTeamsPrice).toBeVisible();
      await expect(this.pricingPageBusinessMerchCardAcrobatProForTeamsFreeTrial).toBeVisible();
      await expect(this.pricingPageBusinessMerchCardAcrobatProForTeamsFreeTrial).toBeEnabled();
      await expect(this.pricingPageBusinessMerchCardAcrobatProForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(this.pricingPageBusinessMerchCardAcrobatProForTeamsBuyNow).toBeVisible();
      await expect(this.pricingPageBusinessMerchCardAcrobatProForTeamsBuyNow).toBeEnabled();
      await expect(this.pricingPageBusinessMerchCardAcrobatProForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(this.pricingPageBusinessMerchCardAcrobatStudioForTeamsPrice).toBeVisible();
      await expect(this.pricingPageBusinessMerchCardAcrobatStudioForTeamsFreeTrial).toBeVisible();
      await expect(this.pricingPageBusinessMerchCardAcrobatStudioForTeamsFreeTrial).toBeEnabled();
      await expect(this.pricingPageBusinessMerchCardAcrobatStudioForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(this.pricingPageBusinessMerchCardAcrobatStudioForTeamsBuyNow).toBeVisible();
      await expect(this.pricingPageBusinessMerchCardAcrobatStudioForTeamsBuyNow).toBeEnabled();
      await expect(this.pricingPageBusinessMerchCardAcrobatStudioForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);
    }

    async verifyTabbedComparisonTable() {
      await expect(this.compareTabs).toBeVisible();
      await expect(this.compareTabButtons).toHaveCount(3);

      await expect(this.compareTabIndividuals).toBeVisible();
      await expect(this.compareTabIndividuals).toBeEnabled();
      await expect(this.compareTabBusiness).toBeVisible();
      await expect(this.compareTabBusiness).toBeEnabled();
      await expect(this.compareTabStudents).toBeVisible();
      await expect(this.compareTabStudents).toBeEnabled();

      await expect(this.compareTabIndividuals).toHaveAttribute('aria-selected', 'true');
      await expect(this.compareTabPanelIndividuals).not.toHaveAttribute('hidden');

      const individualsTable = this.compareTabPanelIndividuals.locator('div.table[role="table"]');
      await expect(individualsTable).toBeVisible();
      const individualsColumnHeaders = individualsTable.locator('div.row-heading div.col-heading');
      const individualsHeaderCount = await individualsColumnHeaders.count();
      expect(individualsHeaderCount).toBe(5);
      const individualsCheckmarks = individualsTable.locator('span.icon-checkmark');
      const individualsCheckmarkCount = await individualsCheckmarks.count();
      expect(individualsCheckmarkCount).toBeGreaterThan(0);

      const individualsReaderDownload = individualsTable.locator('a[href*="get.adobe.com/reader"]');
      await expect(individualsReaderDownload).toBeVisible();
      await expect(individualsReaderDownload).toBeEnabled();

      const individualsCheckoutOsiList = [
        'QgYu51CVY2wKyFEqMuvec4N1tc1OaCypeKJjT5n2-Fc',
        '-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ',
        'vQmS1H18A6_kPd0tYBgKnp-TQIF0GbT6p8SH8rWcLMs',
        'x0LkInr7lGkqK8dcTFS_Pc6oHauo_g7N_4yWT_gLn20',
        'V3W0kzf4e6M2Ht1hP9ZAt3dQNmhuDFrmYmEPlE2SlG0',
      ];
      await this.verifyCheckoutLinks(individualsCheckoutOsiList);

      await this.compareTabBusiness.click();
      await expect(this.compareTabBusiness).toHaveAttribute('aria-selected', 'true');
      await expect(this.compareTabPanelBusiness).not.toHaveAttribute('hidden');

      const businessTable = this.compareTabPanelBusiness.locator('div.table[role="table"]');
      await expect(businessTable).toBeVisible();
      const businessColumnHeaders = businessTable.locator('div.row-heading div.col-heading');
      const businessHeaderCount = await businessColumnHeaders.count();
      expect(businessHeaderCount).toBe(4);
      const businessCheckmarks = businessTable.locator('span.icon-checkmark');
      const businessCheckmarkCount = await businessCheckmarks.count();
      expect(businessCheckmarkCount).toBeGreaterThan(0);

      const businessCheckoutOsiList = [
        'AW-jV275GNYtPao6Q7XWENqyv_Stkc1BbzF7ak2u1dk',
        '8Lr09qx_PHqAJUwvUNiof4FFFEKjsR1TTbvBUncV2b0',
        'vV01ci-KLH6hYdRfUKMBFx009hdpxZcIRG1-BY_PutE',
        'PVhDPYXq4fsy15OdlEE-XyIlvcxaPMxGs73pw39Cx-s',
        'SfkorgyrBAsqBVpyKddQQEn6jR0ItBohpXc74sZcKHg',
      ];
      await this.verifyCheckoutLinks(businessCheckoutOsiList);

      await this.compareTabStudents.click();
      await expect(this.compareTabStudents).toHaveAttribute('aria-selected', 'true');
      await expect(this.compareTabPanelStudents).not.toHaveAttribute('hidden');

      const studentsTable = this.compareTabPanelStudents.locator('div.table[role="table"]');
      await expect(studentsTable).toBeVisible();
      const studentsColumnHeaders = studentsTable.locator('div.row-heading div.col-heading');
      const studentsHeaderCount = await studentsColumnHeaders.count();
      expect(studentsHeaderCount).toBe(3);
      const studentsCheckmarks = studentsTable.locator('span.icon-checkmark');
      const studentsCheckmarkCount = await studentsCheckmarks.count();
      expect(studentsCheckmarkCount).toBeGreaterThan(0);

      const studentsCheckoutOsiList = [
        'WJLr3TF4T4qyJIGZTsDf9KPbTfxA7qAgStpaF2IgYao',
        'ZZQMV2cU-SWQoDxuznonUFMRdxSyTr4J3fB77YBNakY',
        'xxgyCsZk7zx3WAfpZMqiE6IMtvvu0CP4JJeIey_UtYo',
        'a2BclUUkea_JeR4CLVkbrsqNFOf3ClN-B8nQ79n7LlE',
      ];
      await this.verifyCheckoutLinks(studentsCheckoutOsiList);

      await this.compareTabIndividuals.click();
      await expect(this.compareTabIndividuals).toHaveAttribute('aria-selected', 'true');
    }

    async verifyBusinessComparisonTable() {
      await expect(this.businessComparisonTable).toBeVisible();
      await expect(this.businessComparisonTableHeadingRow).toBeVisible();

      await expect(this.businessComparisonTableColumnHeaders).toHaveCount(4);

      const visibleColumnHeaders = this.businessComparisonTableColumnHeaders.filter({ has: this.page.locator('p.tracking-header') });
      const visibleHeaderCount = await visibleColumnHeaders.count();
      expect(visibleHeaderCount).toBe(3);

      await expect(this.businessComparisonTableFreeTrialLinks.first()).toBeVisible();
      await expect(this.businessComparisonTableFreeTrialLinks.first()).toBeEnabled();
      await expect(this.businessComparisonTableFreeTrialLinks.first()).toHaveAttribute('href', /ot=TRIAL/);
      await expect(this.businessComparisonTableFreeTrialLinks).toHaveCount(2);

      await expect(this.businessComparisonTableBuyNowLinks.first()).toBeVisible();
      await expect(this.businessComparisonTableBuyNowLinks.first()).toBeEnabled();
      await expect(this.businessComparisonTableBuyNowLinks.first()).toHaveAttribute('href', /ot=BASE/);
      await expect(this.businessComparisonTableBuyNowLinks).toHaveCount(2);

      await expect(this.businessComparisonTableLearnMoreLink).toBeVisible();
      await expect(this.businessComparisonTableLearnMoreLink).toBeEnabled();

      const featureRowCount = await this.businessComparisonTableFeatureRows.count();
      expect(featureRowCount).toBeGreaterThan(0);

      const firstFeatureRow = this.businessComparisonTableFeatureRows.first();
      await expect(firstFeatureRow).toBeVisible();

      const checkmarks = this.businessComparisonTable.locator('span.icon-checkmark');
      const checkmarkCount = await checkmarks.count();
      expect(checkmarkCount).toBeGreaterThan(0);
    }

    async verifyPricingStudentsPageMerchCards() {
      await expect(this.pricingPageStudentsMerchCards.first()).toBeVisible();
      await expect(this.pricingPageStudentsMerchCards).toHaveCount(2);

      await expect(this.pricingPageStudentsMerchCardAcrobatProPrice.first()).toBeVisible();
      await expect(this.pricingPageStudentsMerchCardAcrobatProFreeTrial).toBeVisible();
      await expect(this.pricingPageStudentsMerchCardAcrobatProFreeTrial).toBeEnabled();
      await expect(this.pricingPageStudentsMerchCardAcrobatProFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(this.pricingPageStudentsMerchCardAcrobatProBuyNow.last()).toBeVisible();
      await expect(this.pricingPageStudentsMerchCardAcrobatProBuyNow.last()).toBeEnabled();
      await expect(this.pricingPageStudentsMerchCardAcrobatProBuyNow.last()).toHaveAttribute('href', /commerce/);

      await expect(this.pricingPageStudentsMerchCardCreativeCloudPrice.first()).toBeVisible();
      await expect(this.pricingPageStudentsMerchCardCreativeCloudFreeTrial).toBeVisible();
      await expect(this.pricingPageStudentsMerchCardCreativeCloudFreeTrial).toBeEnabled();
      await expect(this.pricingPageStudentsMerchCardCreativeCloudFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(this.pricingPageStudentsMerchCardCreativeCloudBuyNow.last()).toBeVisible();
      await expect(this.pricingPageStudentsMerchCardCreativeCloudBuyNow.last()).toBeEnabled();
      await expect(this.pricingPageStudentsMerchCardCreativeCloudBuyNow.last()).toHaveAttribute('href', /commerce/);
    }

    async verifyGenAiStudentsPromptTabs() {
      await expect(this.genAiStudentsTabs).toBeVisible();
      await expect(this.genAiStudentsTabButtons).toHaveCount(5);

      await expect(this.genAiStudentsTabAsk).toBeVisible();
      await expect(this.genAiStudentsTabAsk).toHaveAttribute('aria-selected', 'true');
      await expect(this.genAiStudentsPanelAsk).toBeVisible();
      await expect(this.genAiStudentsPanelAsk.locator('.prompt-card')).toHaveCount(4);
      await expect(this.genAiStudentsPanelAsk.locator('a[href*="ai-prompts"]')).toBeVisible();

      await this.genAiStudentsTabAnalyze.click();
      await expect(this.genAiStudentsTabAnalyze).toHaveAttribute('aria-selected', 'true');
      await expect(this.genAiStudentsPanelAnalyze).toBeVisible();
      await expect(this.genAiStudentsPanelAnalyze.locator('.prompt-card')).toHaveCount(4);
      await expect(this.genAiStudentsPanelAnalyze.locator('a[href*="ai-prompts"]')).toBeVisible();

      await this.genAiStudentsTabModify.click();
      await expect(this.genAiStudentsTabModify).toHaveAttribute('aria-selected', 'true');
      await expect(this.genAiStudentsPanelModify).toBeVisible();
      await expect(this.genAiStudentsPanelModify.locator('.prompt-card')).toHaveCount(4);
      await expect(this.genAiStudentsPanelModify.locator('a[href*="ai-prompts"]')).toBeVisible();

      await this.genAiStudentsTabGenerate.click();
      await expect(this.genAiStudentsTabGenerate).toHaveAttribute('aria-selected', 'true');
      await expect(this.genAiStudentsPanelGenerate).toBeVisible();
      await expect(this.genAiStudentsPanelGenerate.locator('.prompt-card')).toHaveCount(4);
      await expect(this.genAiStudentsPanelGenerate.locator('a[href*="ai-prompts"]')).toBeVisible();

      await this.genAiStudentsTabBrainstorm.click();
      await expect(this.genAiStudentsTabBrainstorm).toHaveAttribute('aria-selected', 'true');
      await expect(this.genAiStudentsPanelBrainstorm).toBeVisible();
      await expect(this.genAiStudentsPanelBrainstorm.locator('.prompt-card')).toHaveCount(4);
      await expect(this.genAiStudentsPanelBrainstorm.locator('a[href*="ai-prompts"]')).toBeVisible();
    }

    async verifyThreeUpEditorialCards() {
      await expect(this.threeUpSection.first()).toBeVisible();
      const cardCount = await this.editorialCards.count();
      expect(cardCount).toBeGreaterThanOrEqual(3);

      for (let i = 0; i < 3; i += 1) {
        const card = this.editorialCards.nth(i);
        await expect(card).toBeVisible();
        await expect(card.locator('h3')).toBeVisible();
        await expect(card.locator('p.body-xs').first()).toBeVisible();
        const link = card.locator('a.con-button');
        await expect(link).toBeVisible();
        await expect(link).toBeEnabled();
      }
    }

    async verifyBusinessSignMerchCards() {
      await expect(this.businessSignMerchCardsContainer).toBeVisible();
      await expect(this.businessSignMerchCards).toHaveCount(2);

      for (let i = 0; i < 2; i += 1) {
        const card = this.businessSignMerchCards.nth(i);
        await expect(card).toBeVisible();
        const price = card.locator('span[is*="inline-price"]');
        await expect(price.first()).toBeVisible();
        const freeTrial = card.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
        await expect(freeTrial).toBeVisible();
        await expect(freeTrial).toBeEnabled();
        const buyNow = card.locator('a[is*="checkout-link"][href*="ot=BASE"]');
        await expect(buyNow).toBeVisible();
        await expect(buyNow).toBeEnabled();
      }
    }

    async verifyLink(selectorOrLocator, hrefPattern = null, container = null) {
      const link = container ? container.locator(selectorOrLocator) : this.page.locator(selectorOrLocator);
      await expect(link).toBeVisible();
      await expect(link).toBeEnabled();
      if (hrefPattern) {
        await expect(link).toHaveAttribute('href', hrefPattern);
      }
    }

    async verifyTabs(expectedTabCount = null, verifyPanelContent = null) {
      const tabsContainer = this.page.locator('div[class*="tablist-features-section"]');
      await expect(tabsContainer).toBeVisible();
      
      const tabButtons = tabsContainer.locator('button[role="tab"]');
      
      if (expectedTabCount) {
        await expect(tabButtons).toHaveCount(expectedTabCount);
      }
      
      const tabCount = await tabButtons.count();
      
      for (let i = 0; i < tabCount; i += 1) {
        const tab = tabButtons.nth(i);
        await expect(tab).toBeVisible();
        await expect(tab).toBeEnabled();
        
        await tab.click();
        await expect(tab).toHaveAttribute('aria-selected', 'true');
        
        const panelId = await tab.getAttribute('aria-controls');
        const panel = tabsContainer.locator(`#${panelId}`);
        await expect(panel).toBeVisible();
        
        if (verifyPanelContent) {
          await verifyPanelContent(panel, i);
        }
      }
    }
  }