import BasePage from '../../libs/basepage.js';

export default class QuizMakerPage extends BasePage {
  constructor(page) {
    super(page);

    this.root = page.locator('.unity-marquee.quiz-maker').first();
    this.widget = this.root;
    this.dropZone = this.root.locator('.drop-zone.pu-add-sources');
    this.addSourcesLabel = this.root.locator('.pu-add-sources-label');
    this.promptInput = this.root.locator('#pbuPromptInput');
    this.ctaButton = this.root.locator('a.pu-cta');
    this.fileInput = this.root.locator('input[type="file"]#file-upload');
    this.verbHeader = this.root.locator('.unity-marquee-heading');
    this.verbTitle = this.root.locator('.unity-marquee-title');
    this.verbCopy = this.root.locator('.unity-marquee-copy').first();
    this.acrobatIcon = this.root.locator('.unity-marquee-header .acrobat-icon svg');
    this.securityTooltip = this.root.locator('button.info-icon');

    this.howToHeading = page.locator('[id*="how-to"]');
    this.threeUpSections = page.locator('div[class*="three-up"]');
    this.twoUpSections = page.locator('div[class*="two-up"]');
    this.studentSpacesHeading = page.locator('#what-can-i-make-with-student-spaces');
    this.carousels = page.locator('div.carousel');
    this.faqSection = page.locator('div[class*="accordion-container"]').first();
    this.faqAccordionTriggers = this.faqSection.locator('button.accordion-trigger');
    this.footer = page.locator('footer[class="global-footer"]');
  }
}
