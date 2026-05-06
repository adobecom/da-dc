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

    // Individual Merch Cards Section (acrobat-individuals fragment)
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

    // Individual Standard Merch Cards Section (acrobat-individuals-standard fragment)
    this.individualStandardMerchCardsContainer = page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-individuals-standard"]');
    this.individualStandardMerchCards = this.individualStandardMerchCardsContainer.locator('merch-card');
    this.individualStandardMerchCardAcrobatStandard = this.individualStandardMerchCards.nth(0);
    this.acrobatStandardPrice = this.individualStandardMerchCardAcrobatStandard.locator('span[is*="inline-price"]');
    this.acrobatStandardBuyNow = this.individualStandardMerchCardAcrobatStandard.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.individualStandardMerchCardAcrobatPro = this.individualStandardMerchCards.nth(1);
    this.acrobatProStandardPrice = this.individualStandardMerchCardAcrobatPro.locator('span[is*="inline-price"]');
    this.acrobatProStandardFreeTrial = this.individualStandardMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.acrobatProStandardBuyNow = this.individualStandardMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.individualStandardMerchCardAcrobatStudio = this.individualStandardMerchCards.nth(2);
    this.acrobatStudioStandardPrice = this.individualStandardMerchCardAcrobatStudio.locator('span[is*="inline-price"]');
    this.acrobatStudioStandardFreeTrial = this.individualStandardMerchCardAcrobatStudio.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.acrobatStudioStandardBuyNow = this.individualStandardMerchCardAcrobatStudio.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.individualStandardMerchCardsPricingLink = this.individualStandardMerchCardsContainer.locator('div[class="body-m action-area"] a');

    // Business Standard Merch Cards Section (acrobat-business fragment)
    this.businessStandardMerchCardsContainer = page.locator('div[data-path="/dc-shared/fragments/merch-cards/acrobat-business"]');
    this.businessStandardMerchCards = this.businessStandardMerchCardsContainer.locator('merch-card');
    this.businessStandardMerchCardAcrobatStandardForTeams = this.businessStandardMerchCards.nth(0);
    this.acrobatStandardForTeamsPrice = this.businessStandardMerchCardAcrobatStandardForTeams.locator('span[is*="inline-price"]');
    this.acrobatStandardForTeamsBuyNow = this.businessStandardMerchCardAcrobatStandardForTeams.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.businessStandardMerchCardAcrobatProForTeams = this.businessStandardMerchCards.nth(1);
    this.acrobatProForTeamsStandardPrice = this.businessStandardMerchCardAcrobatProForTeams.locator('span[is*="inline-price"]');
    this.acrobatProForTeamsStandardFreeTrial = this.businessStandardMerchCardAcrobatProForTeams.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.acrobatProForTeamsStandardBuyNow = this.businessStandardMerchCardAcrobatProForTeams.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.businessStandardMerchCardAcrobatStudioForTeams = this.businessStandardMerchCards.nth(2);
    this.acrobatStudioForTeamsStandardPrice = this.businessStandardMerchCardAcrobatStudioForTeams.locator('span[is*="inline-price"]');
    this.acrobatStudioForTeamsStandardFreeTrial = this.businessStandardMerchCardAcrobatStudioForTeams.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.acrobatStudioForTeamsStandardBuyNow = this.businessStandardMerchCardAcrobatStudioForTeams.locator('a[is*="checkout-link"][href*="ot=BASE"]');

    // Business Merch Cards Section (acrobat-business-contact fragment)
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

    // Students and Teachers Merch Cards Section (acrobat-students-and-teachers fragment)
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

    // Pricing page - Individuals
    this.pricingPageIndividuals = page.locator('div[data-path="/dc-shared/fragments/merch/acrobat/pricing/acrobat-individual-abm-merch-card-product"]');
    this.pricingPageIndividualsMerchCards = this.pricingPageIndividuals.locator('merch-card');
    this.pricingPageIndividualsMerchCardAcrobatStandard = this.pricingPageIndividualsMerchCards.nth(0);
    this.pricingPageIndividualsMerchCardAcrobatStandardPrice = this.pricingPageIndividualsMerchCardAcrobatStandard.locator('span[is*="inline-price"]');
    this.pricingPageIndividualsMerchCardAcrobatStandardBuyNow = this.pricingPageIndividualsMerchCardAcrobatStandard.locator('a[is="checkout-link"][href*="ot=BASE"]');
    this.pricingPageIndividualsMerchCardAcrobatPro = this.pricingPageIndividualsMerchCards.nth(1);
    this.pricingPageIndividualsMerchCardAcrobatProPrice = this.pricingPageIndividualsMerchCardAcrobatPro.locator('span[is*="inline-price"]');
    this.pricingPageIndividualsMerchCardAcrobatProFreeTrial = this.pricingPageIndividualsMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.pricingPageIndividualsMerchCardAcrobatProBuyNow = this.pricingPageIndividualsMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.pricingPageIndividualsMerchCardAcrobatStudio = this.pricingPageIndividualsMerchCards.nth(2);
    this.pricingPageIndividualsMerchCardAcrobatStudioPrice = this.pricingPageIndividualsMerchCardAcrobatStudio.locator('span[is*="inline-price"]');
    this.pricingPageIndividualsMerchCardAcrobatStudioFreeTrial = this.pricingPageIndividualsMerchCardAcrobatStudio.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.pricingPageIndividualsMerchCardAcrobatStudioBuyNow = this.pricingPageIndividualsMerchCardAcrobatStudio.locator('a[is*="checkout-link"][href*="ot=BASE"]');

    // Pricing page - Business
    this.pricingPageBusiness = page.locator('div[data-path="/dc-shared/fragments/merch/acrobat/pricing/acrobat-business-abm-merch-card-product"]');
    this.pricingPageBusinessMerchCards = this.pricingPageBusiness.locator('merch-card');
    this.pricingPageBusinessMerchCardAcrobatStandardForTeams = this.pricingPageBusinessMerchCards.nth(0);
    this.pricingPageBusinessMerchCardAcrobatStandardForTeamsPrice = this.pricingPageBusinessMerchCardAcrobatStandardForTeams.locator('span[is*="inline-price"]');
    this.pricingPageBusinessMerchCardAcrobatStandardForTeamsFreeTrial = this.pricingPageBusinessMerchCardAcrobatStandardForTeams.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.pricingPageBusinessMerchCardAcrobatStandardForTeamsBuyNow = this.pricingPageBusinessMerchCardAcrobatStandardForTeams.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.pricingPageBusinessMerchCardAcrobatProForTeams = this.pricingPageBusinessMerchCards.nth(1);
    this.pricingPageBusinessMerchCardAcrobatProForTeamsPrice = this.pricingPageBusinessMerchCardAcrobatProForTeams.locator('span[is*="inline-price"]');
    this.pricingPageBusinessMerchCardAcrobatProForTeamsFreeTrial = this.pricingPageBusinessMerchCardAcrobatProForTeams.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.pricingPageBusinessMerchCardAcrobatProForTeamsBuyNow = this.pricingPageBusinessMerchCardAcrobatProForTeams.locator('a[is*="checkout-link"][href*="ot=BASE"]');
    this.pricingPageBusinessMerchCardAcrobatStudioForTeams = this.pricingPageBusinessMerchCards.nth(2);
    this.pricingPageBusinessMerchCardAcrobatStudioForTeamsPrice = this.pricingPageBusinessMerchCardAcrobatStudioForTeams.locator('span[is*="inline-price"]');
    this.pricingPageBusinessMerchCardAcrobatStudioForTeamsFreeTrial = this.pricingPageBusinessMerchCardAcrobatStudioForTeams.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.pricingPageBusinessMerchCardAcrobatStudioForTeamsBuyNow = this.pricingPageBusinessMerchCardAcrobatStudioForTeams.locator('a[is*="checkout-link"][href*="ot=BASE"]');

    // Pricing page - Students
    this.pricingPageStudents = page.locator('div[data-path="/dc-shared/fragments/merch/acrobat/pricing/acrobat-students-abm-merch-card-product"]');
    this.pricingPageStudentsMerchCards = this.pricingPageStudents.locator('merch-card');
    this.pricingPageStudentsMerchCardAcrobatPro = this.pricingPageStudentsMerchCards.nth(0);
    this.pricingPageStudentsMerchCardAcrobatProPrice = this.pricingPageStudentsMerchCardAcrobatPro.locator('p[slot="heading-xs"] span[is*="inline-price"]');
    this.pricingPageStudentsMerchCardAcrobatProFreeTrial = this.pricingPageStudentsMerchCardAcrobatPro.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.pricingPageStudentsMerchCardAcrobatProBuyNow = this.pricingPageStudentsMerchCardAcrobatPro.locator('a[is*="checkout-link"]');
    this.pricingPageStudentsMerchCardCreativeCloud = this.pricingPageStudentsMerchCards.nth(1);
    this.pricingPageStudentsMerchCardCreativeCloudPrice = this.pricingPageStudentsMerchCardCreativeCloud.locator('p[slot="heading-xs"] span[is*="inline-price"]');
    this.pricingPageStudentsMerchCardCreativeCloudFreeTrial = this.pricingPageStudentsMerchCardCreativeCloud.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
    this.pricingPageStudentsMerchCardCreativeCloudBuyNow = this.pricingPageStudentsMerchCardCreativeCloud.locator('a[is*="checkout-link"]');

    // Business Sign Merch Cards Section
    this.businessSignMerchCardsContainer = page.locator('div[data-path="/dc-shared/fragments/merch/acrobat/business/acrobat-studio-teams/merch-card-blade"]');
    this.businessSignMerchCards = this.businessSignMerchCardsContainer.locator('merch-card');
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

  async verifyIndividualStandardMerchCards() {
    await expect(this.individualStandardMerchCards.first()).toBeVisible();
    await expect(this.individualStandardMerchCards).toHaveCount(3);

    await expect(this.acrobatStandardPrice.first()).toBeVisible();
    await expect(this.acrobatStandardBuyNow).toBeVisible();
    await expect(this.acrobatStandardBuyNow).toBeEnabled();
    await expect(this.acrobatStandardBuyNow).toHaveAttribute('href', /ot=BASE/);

    await expect(this.acrobatProStandardPrice.first()).toBeVisible();
    await expect(this.acrobatProStandardFreeTrial).toBeVisible();
    await expect(this.acrobatProStandardFreeTrial).toBeEnabled();
    await expect(this.acrobatProStandardFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
    await expect(this.acrobatProStandardBuyNow).toBeVisible();
    await expect(this.acrobatProStandardBuyNow).toBeEnabled();
    await expect(this.acrobatProStandardBuyNow).toHaveAttribute('href', /ot=BASE/);

    await expect(this.acrobatStudioStandardPrice.first()).toBeVisible();
    await expect(this.acrobatStudioStandardFreeTrial).toBeVisible();
    await expect(this.acrobatStudioStandardFreeTrial).toBeEnabled();
    await expect(this.acrobatStudioStandardFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
    await expect(this.acrobatStudioStandardBuyNow).toBeVisible();
    await expect(this.acrobatStudioStandardBuyNow).toBeEnabled();
    await expect(this.acrobatStudioStandardBuyNow).toHaveAttribute('href', /ot=BASE/);

    await expect(this.individualStandardMerchCardsPricingLink).toBeVisible();
    await expect(this.individualStandardMerchCardsPricingLink).toBeEnabled();
  }

  async verifyBusinessStandardMerchCards() {
    await expect(this.businessStandardMerchCards.first()).toBeVisible();
    await expect(this.businessStandardMerchCards).toHaveCount(3);

    await expect(this.acrobatStandardForTeamsPrice.first()).toBeVisible();
    await expect(this.acrobatStandardForTeamsBuyNow).toBeVisible();
    await expect(this.acrobatStandardForTeamsBuyNow).toBeEnabled();
    await expect(this.acrobatStandardForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

    await expect(this.acrobatProForTeamsStandardPrice.first()).toBeVisible();
    await expect(this.acrobatProForTeamsStandardFreeTrial).toBeVisible();
    await expect(this.acrobatProForTeamsStandardFreeTrial).toBeEnabled();
    await expect(this.acrobatProForTeamsStandardFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
    await expect(this.acrobatProForTeamsStandardBuyNow).toBeVisible();
    await expect(this.acrobatProForTeamsStandardBuyNow).toBeEnabled();
    await expect(this.acrobatProForTeamsStandardBuyNow).toHaveAttribute('href', /ot=BASE/);

    await expect(this.acrobatStudioForTeamsStandardPrice.first()).toBeVisible();
    await expect(this.acrobatStudioForTeamsStandardFreeTrial).toBeVisible();
    await expect(this.acrobatStudioForTeamsStandardFreeTrial).toBeEnabled();
    await expect(this.acrobatStudioForTeamsStandardFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
    await expect(this.acrobatStudioForTeamsStandardBuyNow).toBeVisible();
    await expect(this.acrobatStudioForTeamsStandardBuyNow).toBeEnabled();
    await expect(this.acrobatStudioForTeamsStandardBuyNow).toHaveAttribute('href', /ot=BASE/);
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
    // await expect(this.pricingPageBusinessMerchCardAcrobatStandardForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
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
}
