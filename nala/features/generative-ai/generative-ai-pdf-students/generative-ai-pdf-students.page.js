export default class GenerativeAiPdfStudentsPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    this.heroMarquee = page.locator('div[class*="hero-marquee"]');

    this.sectionSpacingSection = page.locator('div.section[class*="s-spacing"]');

    this.threeUpSection = page.locator('div.section.three-up').first();

    this.genAiStudentsTabs = page.locator('div.tabs#tabs-genaipdfstudents');
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
