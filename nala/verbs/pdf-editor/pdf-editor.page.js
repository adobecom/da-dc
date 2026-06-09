import AcrobatWidget from '../../widget/acrobat-widget.js';

export default class PdfEditor extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.add-comment.unity-enabled', nth);

    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    this.howToSection = page.locator('div[class*="how-to"]').first();
    this.selectFilesButton = this.widget.locator('button.verb-cta');

    this.threeUpSection = page.locator('div[class*="three-up"]').first();

    this.fourUpSection = page.locator('div[class*="four-up"]').first();
    this.quoteBlock = page.locator('div[class*="quote"]').first();

    this.faqSection = page.locator('div[class*="accordion-container"]').first();
    this.faqAccordionTriggers = this.faqSection.locator('button.accordion-trigger');

    this.caasSection = page.locator('div#caas');

    this.mediaSection = page.locator('div[class*="media"]').first();

    this.rnrSection = page.locator('div.rnr').first();

    this.columnsSection = page.locator('div[class*="columns"]').first();
    this.columnsATags = this.columnsSection.locator('a');

    this.footer = page.locator('footer[class="global-footer"]');
  }
}
