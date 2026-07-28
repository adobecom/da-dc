import { expect } from '@playwright/test';

export default class MerchCards {
  constructor(page) {
    this.page = page;

    // Merch Card Plans Section (compare-acrobat-plans fragment)
    this.merchCardPlans = page.locator('div[data-path*="/dc-shared/fragments/merch-cards/compare-acrobat-plans"]');
    this.merchCardPlansTitle = this.merchCardPlans.locator('h2');
    this.tabCompareIndividuals = this.merchCardPlans.locator('button[id="tab-compare-plans-1"]');
    this.tabCompareBusiness = this.merchCardPlans.locator('button[id="tab-compare-plans-2"]');
    this.tabCompareStudentsAndTeachers = this.merchCardPlans.locator('button[id="tab-compare-plans-3"]');

    // Plans and Pricing Tabs Section (PDF Solution page)
    this.plansAndPricingSection = page.locator('div[data-path="/dc-shared/fragments/acrobat/complete-pdf-solution/mini-compare-chart"]');
    this.plansAndPricingTabs = this.plansAndPricingSection.locator('div.tabs#tabs-plans-and-pricing');
    this.plansAndPricingTabButtons = this.plansAndPricingTabs.locator('button[role="tab"]');
    this.plansAndPricingTabIndividuals = this.plansAndPricingTabs.locator('button#tab-plans-and-pricing-1');
    this.plansAndPricingTabBusiness = this.plansAndPricingTabs.locator('button#tab-plans-and-pricing-2');
    this.plansAndPricingTabStudents = this.plansAndPricingTabs.locator('button#tab-plans-and-pricing-3');
    this.plansAndPricingPanelIndividuals = this.plansAndPricingTabs.locator('div#tab-panel-plans-and-pricing-1');
    this.plansAndPricingPanelBusiness = this.plansAndPricingTabs.locator('div#tab-panel-plans-and-pricing-2');
    this.plansAndPricingPanelStudents = this.plansAndPricingTabs.locator('div#tab-panel-plans-and-pricing-3');

    // Plans and Pricing - Individuals Tab Merch Cards
    this.plansIndividualsMerchCards = this.plansAndPricingPanelIndividuals.locator('merch-card').filter({ visible: true });
    this.plansIndividualsReaderCard = this.plansIndividualsMerchCards.nth(0);
    this.plansIndividualsReaderDownload = this.plansIndividualsReaderCard.locator('a[href*="get.adobe.com/reader"]');
    this.plansIndividualsProCard = this.plansIndividualsMerchCards.nth(1);
    this.plansIndividualsProPrice = this.plansIndividualsProCard.locator('p[slot="heading-m-price"]');
    this.plansIndividualsProFreeTrial = this.plansIndividualsProCard.locator('a[is*="checkout-link"][data-wcs-osi="-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ"]');
    this.plansIndividualsProBuyNow = this.plansIndividualsProCard.locator('a[is*="checkout-link"][data-wcs-osi="vQmS1H18A6_kPd0tYBgKnp-TQIF0GbT6p8SH8rWcLMs"]');
    this.plansIndividualsStudioCard = this.plansIndividualsMerchCards.nth(2);
    this.plansIndividualsStudioPrice = this.plansIndividualsStudioCard.locator('p[slot="heading-m-price"]');
    this.plansIndividualsStudioFreeTrial = this.plansIndividualsStudioCard.locator('a[is*="checkout-link"][data-wcs-osi="x0LkInr7lGkqK8dcTFS_Pc6oHauo_g7N_4yWT_gLn20"]');
    this.plansIndividualsStudioBuyNow = this.plansIndividualsStudioCard.locator('a[is*="checkout-link"][data-wcs-osi="V3W0kzf4e6M2Ht1hP9ZAt3dQNmhuDFrmYmEPlE2SlG0"]').filter({ visible: true });

    // Plans and Pricing - Business Tab Merch Cards
    this.plansBusinessMerchCards = this.plansAndPricingPanelBusiness.locator('merch-card').filter({ visible: true });
    this.plansBusinessProCard = this.plansBusinessMerchCards.nth(0);
    this.plansBusinessProPrice = this.plansBusinessProCard.locator('p[slot="heading-m-price"]');
    this.plansBusinessProFreeTrial = this.plansBusinessProCard.locator('a[is*="checkout-link"][data-wcs-osi="8Lr09qx_PHqAJUwvUNiof4FFFEKjsR1TTbvBUncV2b0"]');
    this.plansBusinessProBuyNow = this.plansBusinessProCard.locator('a[is*="checkout-link"][data-wcs-osi="vV01ci-KLH6hYdRfUKMBFx009hdpxZcIRG1-BY_PutE"]');
    this.plansBusinessStudioCard = this.plansBusinessMerchCards.nth(1);
    this.plansBusinessStudioPrice = this.plansBusinessStudioCard.locator('p[slot="heading-m-price"]');
    this.plansBusinessStudioFreeTrial = this.plansBusinessStudioCard.locator('a[is*="checkout-link"][data-wcs-osi="PVhDPYXq4fsy15OdlEE-XyIlvcxaPMxGs73pw39Cx-s"]');
    this.plansBusinessStudioBuyNow = this.plansBusinessStudioCard.locator('a[is*="checkout-link"][data-wcs-osi="SfkorgyrBAsqBVpyKddQQEn6jR0ItBohpXc74sZcKHg"]');

    // Plans and Pricing - Students Tab Merch Cards
    this.plansStudentsMerchCards = this.plansAndPricingPanelStudents.locator('merch-card').filter({ visible: true });
    this.plansStudentsProCard = this.plansStudentsMerchCards.nth(0);
    this.plansStudentsProPrice = this.plansStudentsProCard.locator('span[is*="inline-price"]');
    this.plansStudentsProFreeTrial = this.plansStudentsProCard.locator('a[is*="checkout-link"][data-wcs-osi="WJLr3TF4T4qyJIGZTsDf9KPbTfxA7qAgStpaF2IgYao"]');
    this.plansStudentsProBuyNow = this.plansStudentsProCard.locator('a[is*="checkout-link"][data-wcs-osi="ZZQMV2cU-SWQoDxuznonUFMRdxSyTr4J3fB77YBNakY"]');
    this.plansStudentsCCCard = this.plansStudentsMerchCards.nth(1);
    this.plansStudentsCCPrice = this.plansStudentsCCCard.locator('span[is*="inline-price"]');
    this.plansStudentsCCFreeTrial = this.plansStudentsCCCard.locator('a[is*="checkout-link"][data-wcs-osi="OQ1oCm1tZG35Gj7LCrkGeOOdUMfVlC7xx-7ml-CTWIE"]');
    this.plansStudentsCCBuyNow = this.plansStudentsCCCard.locator('a[is*="checkout-link"][data-wcs-osi="Hnk2P6L5wYhnpZLFYTW5upuk2Y3AJXlso8VGWQ0l2TI"]');

    // Individual Merch Cards Section (acrobat-individuals fragment)
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

    // Individual Standard Merch Cards Section (acrobat-individuals-standard fragment)
    this.individualStandardMerchCardsContainer = page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-individuals-standard"]');
    this.individualStandardMerchCards = this.individualStandardMerchCardsContainer.locator('merch-card').filter({ visible: true });
    this.individualStandardMerchCardAcrobatStandard = this.individualStandardMerchCards.nth(0);
    this.acrobatStandardPrice = this.individualStandardMerchCardAcrobatStandard.locator('span[is*="inline-price"]');
    this.acrobatStandardBuyNow = this.individualStandardMerchCardAcrobatStandard.locator('a[data-wcs-osi="QgYu51CVY2wKyFEqMuvec4N1tc1OaCypeKJjT5n2-Fc"]');
    this.individualStandardMerchCardAcrobatPro = this.individualStandardMerchCards.nth(1);
    this.acrobatProStandardPrice = this.individualStandardMerchCardAcrobatPro.locator('span[is*="inline-price"]');
    this.acrobatProStandardFreeTrial = this.individualStandardMerchCardAcrobatPro.locator('a[data-wcs-osi="-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ"]');
    this.acrobatProStandardBuyNow = this.individualStandardMerchCardAcrobatPro.locator('a[data-wcs-osi="vQmS1H18A6_kPd0tYBgKnp-TQIF0GbT6p8SH8rWcLMs"]');
    this.individualStandardMerchCardAcrobatStudio = this.individualStandardMerchCards.nth(2);
    this.acrobatStudioStandardPrice = this.individualStandardMerchCardAcrobatStudio.locator('span[is*="inline-price"]');
    this.acrobatStudioStandardFreeTrial = this.individualStandardMerchCardAcrobatStudio.locator('a[data-wcs-osi="x0LkInr7lGkqK8dcTFS_Pc6oHauo_g7N_4yWT_gLn20"]');
    this.acrobatStudioStandardBuyNow = this.individualStandardMerchCardAcrobatStudio.locator('a[data-wcs-osi="V3W0kzf4e6M2Ht1hP9ZAt3dQNmhuDFrmYmEPlE2SlG0"]');
    this.individualStandardMerchCardsPricingLink = this.individualStandardMerchCardsContainer.locator('div[class="body-m action-area"] a').filter({ visible: true });

    // Business Standard Merch Cards Section (acrobat-business fragment)
    this.businessStandardMerchCardsContainer = page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-business"]');
    this.businessStandardMerchCards = this.businessStandardMerchCardsContainer.locator('merch-card').filter({ visible: true });
    this.businessStandardMerchCardAcrobatStandardForTeams = this.businessStandardMerchCards.nth(0);
    this.acrobatStandardForTeamsPrice = this.businessStandardMerchCardAcrobatStandardForTeams.locator('span[is*="inline-price"]');
    this.acrobatStandardForTeamsBuyNow = this.businessStandardMerchCardAcrobatStandardForTeams.locator('a[data-wcs-osi="AW-jV275GNYtPao6Q7XWENqyv_Stkc1BbzF7ak2u1dk"]');
    this.businessStandardMerchCardAcrobatProForTeams = this.businessStandardMerchCards.nth(1);
    this.acrobatProForTeamsStandardPrice = this.businessStandardMerchCardAcrobatProForTeams.locator('span[is*="inline-price"]');
    this.acrobatProForTeamsStandardFreeTrial = this.businessStandardMerchCardAcrobatProForTeams.locator('a[data-wcs-osi="8Lr09qx_PHqAJUwvUNiof4FFFEKjsR1TTbvBUncV2b0"]');
    this.acrobatProForTeamsStandardBuyNow = this.businessStandardMerchCardAcrobatProForTeams.locator('a[data-wcs-osi="vV01ci-KLH6hYdRfUKMBFx009hdpxZcIRG1-BY_PutE"]');
    this.businessStandardMerchCardAcrobatStudioForTeams = this.businessStandardMerchCards.nth(2);
    this.acrobatStudioForTeamsStandardPrice = this.businessStandardMerchCardAcrobatStudioForTeams.locator('span[is*="inline-price"]');
    this.acrobatStudioForTeamsStandardFreeTrial = this.businessStandardMerchCardAcrobatStudioForTeams.locator('a[data-wcs-osi="PVhDPYXq4fsy15OdlEE-XyIlvcxaPMxGs73pw39Cx-s"]');
    this.acrobatStudioForTeamsStandardBuyNow = this.businessStandardMerchCardAcrobatStudioForTeams.locator('a[data-wcs-osi="SfkorgyrBAsqBVpyKddQQEn6jR0ItBohpXc74sZcKHg"]');

    // Business Merch Cards Section (acrobat-business-contact fragment)
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

    // Students and Teachers Merch Cards Section (acrobat-students-and-teachers fragment)
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

    // Pricing page - Individuals
    this.pricingPageIndividuals = page.locator('div[data-path="/dc-shared/fragments/merch/acrobat/pricing/acrobat-individual-abm-merch-card-product"]');
    this.pricingPageIndividualsMerchCards = this.pricingPageIndividuals.locator('merch-card').filter({ visible: true });
    this.pricingPageIndividualsMerchCardAcrobatStandard = this.pricingPageIndividualsMerchCards.nth(0);
    this.pricingPageIndividualsMerchCardAcrobatStandardPrice = this.pricingPageIndividualsMerchCardAcrobatStandard.locator('p[slot="heading-m-price"]');
    this.pricingPageIndividualsMerchCardAcrobatStandardBuyNow = this.pricingPageIndividualsMerchCardAcrobatStandard.locator('a[is*="checkout-link"][data-wcs-osi="QgYu51CVY2wKyFEqMuvec4N1tc1OaCypeKJjT5n2-Fc"]');
    this.pricingPageIndividualsMerchCardAcrobatPro = this.pricingPageIndividualsMerchCards.nth(1);
    this.pricingPageIndividualsMerchCardAcrobatProPrice = this.pricingPageIndividualsMerchCardAcrobatPro.locator('p[slot="heading-m-price"]');
    this.pricingPageIndividualsMerchCardAcrobatProFreeTrial = this.pricingPageIndividualsMerchCardAcrobatPro.locator('a[is*="checkout-link"][data-wcs-osi="-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ"]');
    this.pricingPageIndividualsMerchCardAcrobatProBuyNow = this.pricingPageIndividualsMerchCardAcrobatPro.locator('a[is*="checkout-link"][data-wcs-osi="vQmS1H18A6_kPd0tYBgKnp-TQIF0GbT6p8SH8rWcLMs"]');
    this.pricingPageIndividualsMerchCardAcrobatStudio = this.pricingPageIndividualsMerchCards.nth(2);
    this.pricingPageIndividualsMerchCardAcrobatStudioPrice = this.pricingPageIndividualsMerchCardAcrobatStudio.locator('p[slot="heading-m-price"]');
    this.pricingPageIndividualsMerchCardAcrobatStudioFreeTrial = this.pricingPageIndividualsMerchCardAcrobatStudio.locator('a[is*="checkout-link"][data-wcs-osi="x0LkInr7lGkqK8dcTFS_Pc6oHauo_g7N_4yWT_gLn20"]');
    this.pricingPageIndividualsMerchCardAcrobatStudioBuyNow = this.pricingPageIndividualsMerchCardAcrobatStudio.locator('a[is*="checkout-link"][data-wcs-osi="V3W0kzf4e6M2Ht1hP9ZAt3dQNmhuDFrmYmEPlE2SlG0"]').filter({ visible: true });

    // Pricing page - Business
    this.pricingPageBusiness = page.locator('div[data-path="/dc-shared/fragments/merch/acrobat/pricing/acrobat-business-abm-merch-card-product"]');
    this.pricingPageBusinessMerchCards = this.pricingPageBusiness.locator('merch-card').filter({ visible: true });
    this.pricingPageBusinessMerchCardAcrobatStandardForTeams = this.pricingPageBusinessMerchCards.nth(0);
    this.pricingPageBusinessMerchCardAcrobatStandardForTeamsPrice = this.pricingPageBusinessMerchCardAcrobatStandardForTeams.locator('p[slot="heading-m-price"]');
    this.pricingPageBusinessMerchCardAcrobatStandardForTeamsFreeTrial = this.pricingPageBusinessMerchCardAcrobatStandardForTeams.locator('a[is*="checkout-link"][data-wcs-osi="8Lr09qx_PHqAJUwvUNiof4FFFEKjsR1TTbvBUncV2b0"]');
    this.pricingPageBusinessMerchCardAcrobatStandardForTeamsBuyNow = this.pricingPageBusinessMerchCardAcrobatStandardForTeams.locator('a[is*="checkout-link"][data-wcs-osi="AW-jV275GNYtPao6Q7XWENqyv_Stkc1BbzF7ak2u1dk"]');
    this.pricingPageBusinessMerchCardAcrobatProForTeams = this.pricingPageBusinessMerchCards.nth(1);
    this.pricingPageBusinessMerchCardAcrobatProForTeamsPrice = this.pricingPageBusinessMerchCardAcrobatProForTeams.locator('p[slot="heading-m-price"]');
    this.pricingPageBusinessMerchCardAcrobatProForTeamsFreeTrial = this.pricingPageBusinessMerchCardAcrobatProForTeams.locator('a[is*="checkout-link"][data-wcs-osi="8Lr09qx_PHqAJUwvUNiof4FFFEKjsR1TTbvBUncV2b0"]');
    this.pricingPageBusinessMerchCardAcrobatProForTeamsBuyNow = this.pricingPageBusinessMerchCardAcrobatProForTeams.locator('a[is*="checkout-link"][data-wcs-osi="vV01ci-KLH6hYdRfUKMBFx009hdpxZcIRG1-BY_PutE"]');
    this.pricingPageBusinessMerchCardAcrobatStudioForTeams = this.pricingPageBusinessMerchCards.nth(2);
    this.pricingPageBusinessMerchCardAcrobatStudioForTeamsPrice = this.pricingPageBusinessMerchCardAcrobatStudioForTeams.locator('p[slot="heading-m-price"]');
    this.pricingPageBusinessMerchCardAcrobatStudioForTeamsFreeTrial = this.pricingPageBusinessMerchCardAcrobatStudioForTeams.locator('a[is*="checkout-link"][data-wcs-osi="PVhDPYXq4fsy15OdlEE-XyIlvcxaPMxGs73pw39Cx-s"]');
    this.pricingPageBusinessMerchCardAcrobatStudioForTeamsBuyNow = this.pricingPageBusinessMerchCardAcrobatStudioForTeams.locator('a[is*="checkout-link"][data-wcs-osi="SfkorgyrBAsqBVpyKddQQEn6jR0ItBohpXc74sZcKHg"]');

    // Pricing page - Students
    this.pricingPageStudents = page.locator('div[data-path="/dc-shared/fragments/merch/acrobat/pricing/acrobat-students-abm-merch-card-product"]');
    this.pricingPageStudentsMerchCards = this.pricingPageStudents.locator('merch-card').filter({ visible: true });
    this.pricingPageStudentsMerchCardAcrobatPro = this.pricingPageStudentsMerchCards.nth(0);
    this.pricingPageStudentsMerchCardAcrobatProPrice = this.pricingPageStudentsMerchCardAcrobatPro.locator('p[slot="heading-xs"] span[is*="inline-price"]');
    this.pricingPageStudentsMerchCardAcrobatProFreeTrial = this.pricingPageStudentsMerchCardAcrobatPro.locator('a[is*="checkout-link"][data-wcs-osi="WJLr3TF4T4qyJIGZTsDf9KPbTfxA7qAgStpaF2IgYao"]');
    this.pricingPageStudentsMerchCardAcrobatProBuyNow = this.pricingPageStudentsMerchCardAcrobatPro.locator('a[is*="checkout-link"][data-wcs-osi="ZZQMV2cU-SWQoDxuznonUFMRdxSyTr4J3fB77YBNakY"]');
    this.pricingPageStudentsMerchCardCreativeCloud = this.pricingPageStudentsMerchCards.nth(1);
    this.pricingPageStudentsMerchCardCreativeCloudPrice = this.pricingPageStudentsMerchCardCreativeCloud.locator('p[slot="heading-xs"] span[is*="inline-price"]');
    this.pricingPageStudentsMerchCardCreativeCloudFreeTrial = this.pricingPageStudentsMerchCardCreativeCloud.locator('a[is*="checkout-link"][data-wcs-osi="OQ1oCm1tZG35Gj7LCrkGeOOdUMfVlC7xx-7ml-CTWIE"]');
    this.pricingPageStudentsMerchCardCreativeCloudBuyNow = this.pricingPageStudentsMerchCardCreativeCloud.locator('a[is*="checkout-link"][data-wcs-osi="Hnk2P6L5wYhnpZLFYTW5upuk2Y3AJXlso8VGWQ0l2TI"]');

    // Business Sign Merch Cards Section
    this.businessSignMerchCardsContainer = page.locator('div[data-path="/dc-shared/fragments/merch/acrobat/business/acrobat-studio-teams/merch-card-blade"]');
    this.businessSignMerchCards = this.businessSignMerchCardsContainer.locator('merch-card').filter({ visible: true });
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
    await expect(this.tabCompareIndividuals).toHaveAttribute('aria-selected', 'true');
    await this.page.waitForTimeout(400);
    await this.verifyIndividualMerchCards();

    await this.tabCompareBusiness.click();
    await expect(this.tabCompareBusiness).toHaveAttribute('aria-selected', 'true');
    await this.page.waitForTimeout(400);
    await this.verifyBusinessMerchCards();

    await this.tabCompareStudentsAndTeachers.click();
    await expect(this.tabCompareStudentsAndTeachers).toHaveAttribute('aria-selected', 'true');
    await this.page.waitForTimeout(400);
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
    await expect(this.acrobatProBuyNow).toBeVisible();
    await expect(this.acrobatProBuyNow).toBeEnabled();

    await expect(this.acrobatStudioPrice).toBeVisible();
    await expect(this.acrobatStudioFreeTrial).toBeVisible();
    await expect(this.acrobatStudioFreeTrial).toBeEnabled();
    await expect(this.acrobatStudioBuyNow).toBeVisible();
    await expect(this.acrobatStudioBuyNow).toBeEnabled();

    await expect(this.individualMerchCardsPricingLink).toBeEnabled();
    await expect(this.individualMerchCardsPricingLink).toHaveCount(1);
  }

  async verifyIndividualStandardMerchCards() {
    await expect(this.individualStandardMerchCards.first()).toBeVisible();
    await expect(this.individualStandardMerchCards).toHaveCount(3);

    await expect(this.acrobatStandardPrice.first()).toBeVisible();
    await expect(this.acrobatStandardBuyNow).toBeVisible();
    await expect(this.acrobatStandardBuyNow).toBeEnabled();

    await expect(this.acrobatProStandardPrice.first()).toBeVisible();
    await expect(this.acrobatProStandardFreeTrial).toBeVisible();
    await expect(this.acrobatProStandardFreeTrial).toBeEnabled();
    await expect(this.acrobatProStandardBuyNow).toBeVisible();
    await expect(this.acrobatProStandardBuyNow).toBeEnabled();

    await expect(this.acrobatStudioStandardPrice.first()).toBeVisible();
    await expect(this.acrobatStudioStandardFreeTrial).toBeVisible();
    await expect(this.acrobatStudioStandardFreeTrial).toBeEnabled();
    await expect(this.acrobatStudioStandardBuyNow).toBeVisible();
    await expect(this.acrobatStudioStandardBuyNow).toBeEnabled();

    await expect(this.individualStandardMerchCardsPricingLink).toBeVisible();
    await expect(this.individualStandardMerchCardsPricingLink).toBeEnabled();
  }

  async verifyBusinessStandardMerchCards() {
    await expect(this.businessStandardMerchCards.first()).toBeVisible();
    await expect(this.businessStandardMerchCards).toHaveCount(3);

    await expect(this.acrobatStandardForTeamsPrice.first()).toBeVisible();
    await expect(this.acrobatStandardForTeamsBuyNow).toBeVisible();
    await expect(this.acrobatStandardForTeamsBuyNow).toBeEnabled();

    await expect(this.acrobatProForTeamsStandardPrice.first()).toBeVisible();
    await expect(this.acrobatProForTeamsStandardFreeTrial).toBeVisible();
    await expect(this.acrobatProForTeamsStandardFreeTrial).toBeEnabled();
    await expect(this.acrobatProForTeamsStandardBuyNow).toBeVisible();
    await expect(this.acrobatProForTeamsStandardBuyNow).toBeEnabled();

    await expect(this.acrobatStudioForTeamsStandardPrice.first()).toBeVisible();
    await expect(this.acrobatStudioForTeamsStandardFreeTrial).toBeVisible();
    await expect(this.acrobatStudioForTeamsStandardFreeTrial).toBeEnabled();
    await expect(this.acrobatStudioForTeamsStandardBuyNow).toBeVisible();
    await expect(this.acrobatStudioForTeamsStandardBuyNow).toBeEnabled();
  }

  async verifyBusinessMerchCards() {
    await expect(this.businessMerchCards.first()).toBeVisible();
    await expect(this.businessMerchCards).toHaveCount(2);

    await expect(this.acrobatProForTeamsPrice).toBeVisible();
    await expect(this.acrobatProForTeamsFreeTrial).toBeVisible();
    await expect(this.acrobatProForTeamsFreeTrial).toBeEnabled();
    await expect(this.acrobatProForTeamsBuyNow).toBeVisible();
    await expect(this.acrobatProForTeamsBuyNow).toBeEnabled();

    await expect(this.acrobatStudioForTeamsPrice).toBeVisible();
    await expect(this.acrobatStudioForTeamsFreeTrial).toBeVisible();
    await expect(this.acrobatStudioForTeamsFreeTrial).toBeEnabled();
    await expect(this.acrobatStudioForTeamsBuyNow).toBeVisible();
    await expect(this.acrobatStudioForTeamsBuyNow).toBeEnabled();

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
    await expect(this.acrobatProForStudentsAndTeachersBuyNow).toBeVisible();
    await expect(this.acrobatProForStudentsAndTeachersBuyNow).toBeEnabled();

    await expect(this.creativeCloudForStudentsAndTeachersPrice.first()).toBeVisible();
    await expect(this.creativeCloudForStudentsAndTeachersFreeTrial).toBeVisible();
    await expect(this.creativeCloudForStudentsAndTeachersFreeTrial).toBeEnabled();
    await expect(this.creativeCloudForStudentsAndTeachersBuyNow).toBeVisible();
    await expect(this.creativeCloudForStudentsAndTeachersBuyNow).toBeEnabled();

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
    // await expect(this.pricingPageBusinessMerchCardAcrobatStandardForTeamsFreeTrial).toBeVisible();
    // await expect(this.pricingPageBusinessMerchCardAcrobatStandardForTeamsFreeTrial).toBeEnabled();
    await expect(this.pricingPageBusinessMerchCardAcrobatStandardForTeamsBuyNow).toBeVisible();
    await expect(this.pricingPageBusinessMerchCardAcrobatStandardForTeamsBuyNow).toBeEnabled();

    await expect(this.pricingPageBusinessMerchCardAcrobatProForTeamsPrice).toBeVisible();
    await expect(this.pricingPageBusinessMerchCardAcrobatProForTeamsFreeTrial).toBeVisible();
    await expect(this.pricingPageBusinessMerchCardAcrobatProForTeamsFreeTrial).toBeEnabled();
    await expect(this.pricingPageBusinessMerchCardAcrobatProForTeamsBuyNow).toBeVisible();
    await expect(this.pricingPageBusinessMerchCardAcrobatProForTeamsBuyNow).toBeEnabled();

    await expect(this.pricingPageBusinessMerchCardAcrobatStudioForTeamsPrice).toBeVisible();
    await expect(this.pricingPageBusinessMerchCardAcrobatStudioForTeamsFreeTrial).toBeVisible();
    await expect(this.pricingPageBusinessMerchCardAcrobatStudioForTeamsFreeTrial).toBeEnabled();
    await expect(this.pricingPageBusinessMerchCardAcrobatStudioForTeamsBuyNow).toBeVisible();
    await expect(this.pricingPageBusinessMerchCardAcrobatStudioForTeamsBuyNow).toBeEnabled();
  }

  async verifyPricingStudentsPageMerchCards() {
    await expect(this.pricingPageStudentsMerchCards.first()).toBeVisible();
    await expect(this.pricingPageStudentsMerchCards).toHaveCount(2);

    await expect(this.pricingPageStudentsMerchCardAcrobatProPrice.first()).toBeVisible();
    await expect(this.pricingPageStudentsMerchCardAcrobatProFreeTrial).toBeVisible();
    await expect(this.pricingPageStudentsMerchCardAcrobatProFreeTrial).toBeEnabled();
    await expect(this.pricingPageStudentsMerchCardAcrobatProBuyNow).toBeVisible();
    await expect(this.pricingPageStudentsMerchCardAcrobatProBuyNow).toBeEnabled();

    await expect(this.pricingPageStudentsMerchCardCreativeCloudPrice.first()).toBeVisible();
    await expect(this.pricingPageStudentsMerchCardCreativeCloudFreeTrial).toBeVisible();
    await expect(this.pricingPageStudentsMerchCardCreativeCloudFreeTrial).toBeEnabled();
    await expect(this.pricingPageStudentsMerchCardCreativeCloudBuyNow).toBeVisible();
    await expect(this.pricingPageStudentsMerchCardCreativeCloudBuyNow).toBeEnabled();
  }

  async verifyBusinessSignMerchCards() {
    await expect(this.businessSignMerchCardsContainer).toBeVisible();
    await expect(this.businessSignMerchCards).toHaveCount(2);

    for (let i = 0; i < 2; i += 1) {
      const card = this.businessSignMerchCards.nth(i);
      await expect(card).toBeVisible();
      const price = card.locator('span[is*="inline-price"]');
      await expect(price.first()).toBeVisible();
      const checkoutLinks = card.locator('a[is*="checkout-link"]').filter({ visible: true });
      await expect(checkoutLinks.first()).toBeVisible();
      await expect(checkoutLinks.first()).toBeEnabled();
      await expect(checkoutLinks.last()).toBeVisible();
      await expect(checkoutLinks.last()).toBeEnabled();
    }
  }
}
