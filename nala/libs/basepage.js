import { expect } from '@playwright/test';
import HeroMarquee from './blocks/hero-marquee.js';
import MerchCards from './blocks/merch-cards.js';

export default class BasePage {
  constructor(page) {
    this.page = page;

    // Global Navigation Section
    this.gnav = this.page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = this.page.locator('nav.feds-breadcrumbs');
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
    this.heroMarquee = new HeroMarquee(page);

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

    // Merch Cards Block
    this.merchCards = new MerchCards(page);

    // Comparison Table Section
    this.comparisonTableSection = this.page.locator('div.section.table-section');
    this.comparisonTable = this.comparisonTableSection.locator('div.table[role="table"]');
    this.comparisonTableHeadingRow = this.comparisonTable.locator('div.row-heading');
    this.comparisonTableColumnHeaders = this.comparisonTableHeadingRow.locator('h3.tracking-header');
    this.comparisonTableSectionHeads = this.comparisonTable.locator('div.section-head');
    this.comparisonTableFeatureRows = this.comparisonTable.locator('div.section-row');
    this.comparisonTableCompareLink = this.comparisonTableSection.locator('div.text-block a');

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
  }

  async verifyVerbWidget(verb) {
    this.verbWidget = this.page.locator(`div[class*="verb-widget ${verb}"]`);
    await expect(this.verbWidget).toBeVisible();
  }

  async verifyStudyMarquee() {
    this.studyMarquee = this.page.locator('div[class*="study-marquee"][data-block-status="loaded"]');
    await expect(this.studyMarquee).toBeVisible();
  }

  async verifyHeroMarqueeSmoke() {
    this.heroMarquee = this.page.locator('div[class*="hero-marquee"]');
    await expect(this.heroMarquee).toBeVisible();
  }

  async uploadFileToStudyMarquee(filePath) {
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.page.locator('main button.study-marquee-cta').click(),
    ]);
    await fileChooser.setFiles(filePath);
  }

  async uploadFileToVerbWidget(verb, filePath) {
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.page.locator(`main div[class*="verb-widget ${verb}"]`).first().click(),
    ]);
    await fileChooser.setFiles(filePath);
  }

  async verifyUploadRedirect() {
    await this.page.waitForURL(/acrobat\.adobe\.com/, { timeout: 30000 });
    await expect(this.page).toHaveURL(/acrobat\.adobe\.com/);
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

  async verifyGnavSmoke() {
    await this.gnav.waitFor({ state: 'visible' });
    await expect(this.gnav).toBeVisible();
    await expect(this.gnavBreadcrumbs).toBeVisible();
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

  async verifyFAQAccordion() {
    const faqSection = this.page.locator('div[class*="accordion-container"]');
    const accordionButtons = faqSection.locator('button.accordion-trigger');

    await expect(faqSection).toBeVisible();

    const buttonCount = await accordionButtons.count();

    for (let i = 0; i < buttonCount; i += 1) {
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
    await this.merchCards.verifyMerchCardPlans();
  }

  async verifyIndividualMerchCards() {
    await this.merchCards.verifyIndividualMerchCards();
  }

  async verifyIndividualStandardMerchCards() {
    await this.merchCards.verifyIndividualStandardMerchCards();
  }

  async verifyBusinessStandardMerchCards() {
    await this.merchCards.verifyBusinessStandardMerchCards();
  }

  async verifyBusinessMerchCards() {
    await this.merchCards.verifyBusinessMerchCards();
  }

  async verifyStudentsAndTeachersMerchCards() {
    await this.merchCards.verifyStudentsAndTeachersMerchCards();
  }

  async verifyPlansAndPricingTabsPDFSolution() {
    await this.merchCards.verifyPlansAndPricingTabsPDFSolution();
  }

  async verifyCompareVersionsTable() {
    const table = this.page.locator('div[data-path*="/dc-shared/fragments/merch/acrobat/pricing/compare-versions/table/default"] div.table[role="table"]');
    await expect(table).toBeVisible();

    const headingRow = table.locator('div.row-heading');
    await expect(headingRow).toBeVisible();

    const colHeadings = headingRow.locator('div[role="columnheader"]');
    await expect(colHeadings).toHaveCount(4);

    const headingLinks = headingRow.locator('a');
    const headingLinkCount = await headingLinks.count();
    for (let i = 0; i < headingLinkCount; i += 1) {
      await expect(headingLinks.nth(i)).toBeVisible();
      await expect(headingLinks.nth(i)).toBeEnabled();
    }

    const headingButtons = headingRow.locator('button');
    const headingButtonCount = await headingButtons.count();
    for (let i = 0; i < headingButtonCount; i += 1) {
      await expect(headingButtons.nth(i)).toBeVisible();
      await expect(headingButtons.nth(i)).toBeEnabled();
    }

    const featureRows = table.locator('div.section-row');
    const rowCount = await featureRows.count();
    expect(rowCount).toBeGreaterThan(0);

    const checkmarks = table.locator('span.icon-checkmark');
    const checkmarkCount = await checkmarks.count();
    expect(checkmarkCount).toBeGreaterThan(0);
  }

  async verifyHeroMarquee() {
    await this.heroMarquee.verify();
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
    await this.merchCards.verifyPricingPageMerchCards();
  }

  async verifyPricingBusinessPageMerchCards() {
    await this.merchCards.verifyPricingBusinessPageMerchCards();
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
    const table = this.page.locator('div.table.sticky.highlight[role="table"]');
    await expect(table).toBeVisible();

    const headingRow = table.locator('div.row-heading');
    await expect(headingRow).toBeVisible();

    const colHeadings = headingRow.locator('div[role="columnheader"]');
    await expect(colHeadings).toHaveCount(3);

    const headingLinks = headingRow.locator('a');
    const headingLinkCount = await headingLinks.count();
    for (let i = 0; i < headingLinkCount; i += 1) {
      await expect(headingLinks.nth(i)).toBeVisible();
      await expect(headingLinks.nth(i)).toBeEnabled();
    }

    const headingButtons = headingRow.locator('button');
    const headingButtonCount = await headingButtons.count();
    for (let i = 0; i < headingButtonCount; i += 1) {
      await expect(headingButtons.nth(i)).toBeVisible();
      await expect(headingButtons.nth(i)).toBeEnabled();
    }

    const featureRows = table.locator('div.section-row');
    const rowCount = await featureRows.count();
    expect(rowCount).toBeGreaterThan(0);

    const checkmarks = table.locator('span.icon-checkmark');
    const checkmarkCount = await checkmarks.count();
    expect(checkmarkCount).toBeGreaterThan(0);
  }

  async verifyPricingStudentsPageMerchCards() {
    await this.merchCards.verifyPricingStudentsPageMerchCards();
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
    await this.merchCards.verifyBusinessSignMerchCards();
  }

  async verifyLink(selectorOrLocator, hrefPattern = null, container = null) {
    const link = container ? container.locator(selectorOrLocator) : this.page.locator(selectorOrLocator);
    await expect(link).toBeVisible();
    await expect(link).toBeEnabled();
    if (hrefPattern) {
      await expect(link).toHaveAttribute('href', expect.stringContaining(hrefPattern));
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
