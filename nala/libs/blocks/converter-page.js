export default class ConverterPage {
  constructor(page) {
    this.page = page;

    this.header = page.locator('header').first();
    this.h1 = page.locator('main h1').first();

    this.howTo = page.locator('.how-to').first();

    this.faq = page.locator('.accordion-container.seo').first();
    this.faqTriggers = this.faq.locator('button[aria-controls][aria-expanded]');

    this.media = page.locator('.media').first();

    this.rnr = page.locator('div.rnr').first();

    this.toolDirectory = page.locator('.columns.verb-subfooter').first();
    this.toolDirectoryLinks = this.toolDirectory.locator('a[href]');

    this.footer = page.locator('footer.global-footer');
  }

  async hasRnr() {
    return (await this.rnr.count()) > 0;
  }

  panelFor(trigger) {
    return trigger.evaluate((el) => el.getAttribute('aria-controls'))
      .then((id) => this.page.locator(`[id="${id}"]`));
  }
}
