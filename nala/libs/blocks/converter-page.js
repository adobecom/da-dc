/**
 * Stable locators for the structural blocks that every Acrobat online converter
 * page (`/acrobat/online/<tool>`) shares.
 *
 * CMS copy changes often, so these selectors never depend on text, on ids that
 * are generated from headings, or on utility classes such as `xl-spacing-top`.
 * They rely on block classes (`how-to`, `accordion-container`, `media`, `rnr`,
 * `columns verb-subfooter`, `footer.global-footer`) that the page template keeps.
 * See the "Selector strategy for CMS pages" section in .claude/agents/playwright-test-planner.md.
 */
export default class ConverterPage {
  constructor(page) {
    this.page = page;

    this.header = page.locator('header').first();
    this.h1 = page.locator('main h1').first();

    this.howTo = page.locator('.how-to').first();

    // First accordion-container.seo is the FAQ; the verb-subfooter ones are footer accordions.
    this.faq = page.locator('.accordion-container.seo').first();
    this.faqTriggers = this.faq.locator('button[aria-controls][aria-expanded]');

    this.media = page.locator('.media').first();

    this.rnr = page.locator('div.rnr').first();

    this.toolDirectory = page.locator('.columns.verb-subfooter').first();
    this.toolDirectoryLinks = this.toolDirectory.locator('a[href]');

    this.footer = page.locator('footer.global-footer');
  }

  /** Returns true when the page renders an RnR (ratings and reviews) block. */
  async hasRnr() {
    return (await this.rnr.count()) > 0;
  }

  /** Locates the panel controlled by an accordion trigger, by its aria-controls id. */
  panelFor(trigger) {
    return trigger.evaluate((el) => el.getAttribute('aria-controls'))
      .then((id) => this.page.locator(`[id="${id}"]`));
  }
}
