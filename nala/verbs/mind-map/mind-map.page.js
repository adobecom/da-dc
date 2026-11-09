export default class MindMapPage {
  constructor(page) {
    this.page = page;

    // Global nav, breadcrumbs and footer: structural selectors only (no copy or generated ids).
    this.gnav = page.locator('header').first();
    this.gnavBreadcrumbs = page.locator('.feds-breadcrumbs');
    this.footer = page.locator('footer').first();

    // Widget.
    this.root = page.locator('.study-marquee.mindmap-maker').first();
    this.widget = this.root;
    this.dropZone = this.root.locator('#drop-zone');
    this.fileInput = this.root.locator('input[type="file"]#file-upload');
    this.verbHeader = this.root.locator('.study-marquee-heading');
    this.verbTitle = this.root.locator('.study-marquee-title');
    this.verbCopy = this.root.locator('.study-marquee-copy').first();
    this.acrobatIcon = this.root.locator('.study-marquee-header .acrobat-icon svg');
    this.studyMarqueeMedia = this.root.locator('.study-marquee-media').first();
    this.ctaButton = this.root.locator('button.study-marquee-cta');

    // Page sections, matched by block class or by the accordion's ARIA structure.
    this.editorialCards = page.locator('.editorial-card');
    this.carousels = page.locator('.carousel');
    this.faqSection = page.locator('.accordion-container, .accordion')
      .filter({ has: page.locator('button[aria-controls][aria-expanded]') })
      .first();
    this.faqAccordionTriggers = this.faqSection.locator('button[aria-controls][aria-expanded]');
  }
}
