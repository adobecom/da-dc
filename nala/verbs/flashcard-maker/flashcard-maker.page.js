import BasePage from '../../libs/basepage.js';

export default class FlashcardMakerPage extends BasePage {
  constructor(page) {
    super(page);
    this.root = page.locator('.study-marquee.flashcard-maker').first();
    this.widget = this.root;
    this.dropZone = this.root.locator('#drop-zone');
    this.ctaButton = this.root.locator('button.study-marquee-cta');
    this.fileInput = this.root.locator('input[type="file"]#file-upload');
    this.verbHeader = this.root.locator('.study-marquee-heading');
    this.verbTitle = this.root.locator('.study-marquee-title');
    this.verbCopy = this.root.locator('.study-marquee-copy').first();
    this.acrobatIcon = this.root.locator('.study-marquee-header .acrobat-icon svg');
    this.studyMarqueeMedia = this.root.locator('.study-marquee-media').first();
  }
}
