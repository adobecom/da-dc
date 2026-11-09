export default class FlashcardMakerPage {
  constructor(page) {
    this.page = page;

    // Global nav, breadcrumbs and footer: structural selectors only (no copy or generated ids).
    this.gnav = page.locator('header').first();
    this.gnavBreadcrumbs = page.locator('.feds-breadcrumbs');
    this.footer = page.locator('footer').first();

    // Widget.
    this.root = page.locator('.unity-marquee.flashcard-maker').first();
    this.widget = this.root;
    this.dropZone = this.root.locator('.drop-zone.pu-add-sources');
    this.fileInput = this.root.locator('input[type="file"]#file-upload');
    this.verbHeader = this.root.locator('.unity-marquee-heading');
    this.verbTitle = this.root.locator('.unity-marquee-title');
    this.verbCopy = this.root.locator('.unity-marquee-copy').first();
    this.acrobatIcon = this.root.locator('.unity-marquee-header .acrobat-icon svg');
    this.promptInput = this.root.locator('#pbuPromptInput');
    this.ctaButton = this.root.locator('a.pu-cta');
    this.securityTooltip = this.root.locator('button.info-icon');

    // Page sections, matched by block class or by the accordion's ARIA structure.
    this.editorialCards = page.locator('.editorial-card');
    this.carousels = page.locator('.carousel');
    this.faqSection = page.locator('.accordion-container, .accordion')
      .filter({ has: page.locator('button[aria-controls][aria-expanded]') })
      .first();
    this.faqAccordionTriggers = this.faqSection.locator('button[aria-controls][aria-expanded]');
  }
}
