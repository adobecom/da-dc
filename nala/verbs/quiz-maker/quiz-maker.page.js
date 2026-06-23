import BasePage from '../../libs/basepage.js';

export default class QuizMakerPage extends BasePage {
  constructor(page) {
    super(page);

    this.root = page.locator('.study-marquee.quiz-maker').first();
    this.widget = this.root;
    this.dropZone = this.root.locator('#drop-zone');
    this.ctaButton = this.root.locator('button.study-marquee-cta');
    this.fileInput = this.root.locator('input[type="file"]#file-upload');
    this.verbHeader = this.root.locator('.study-marquee-heading');
    this.verbTitle = this.root.locator('.study-marquee-title');
    this.verbCopy = this.root.locator('.study-marquee-copy').first();
    this.acrobatIcon = this.root.locator('.study-marquee-header .acrobat-icon svg');
    this.studyMarqueeMedia = this.root.locator('.study-marquee-media').first();

    this.howToHeading = page.locator('#how-to-use-our-ai-quiz-maker');
    this.threeUpSections = page.locator('div[class*="three-up"]');
    this.twoUpSections = page.locator('div[class*="two-up"]');
    this.studentSpacesHeading = page.locator('#what-can-i-make-with-student-spaces');
    this.carousels = page.locator('div.carousel');
    this.faqSection = page.locator('div[class*="accordion-container"]').first();
    this.faqAccordionTriggers = this.faqSection.locator('button.accordion-trigger');
    this.footer = page.locator('footer[class="global-footer"]');
  }
}
