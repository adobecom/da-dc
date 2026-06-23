import AcrobatWidget from '../../widget/acrobat-widget.js';

export default class PdfAi extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.pdf-ai.unity-enabled', nth);

    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    this.howToSection = page.locator('div[class*="how-to"]').first();
    this.selectFilesButton = page.locator('button[for="file-upload"]');

    this.threeUpSection = page.locator('div[class*="three-up"]').first();

    this.faqSection = page.locator('div[class*="accordion-container"]').first();
    this.faqAccordionTriggers = this.faqSection.locator('button.accordion-trigger');

    this.mediaSection = page.locator('div[class*="media"]').first();

    this.rnrSection = page.locator('div.rnr').first();

    this.columnsSection = page.locator('div[class*="columns"]').first();
    this.columnsATags = this.columnsSection.locator('a');

    this.footer = page.locator('footer[class="global-footer"]');
  }
}
