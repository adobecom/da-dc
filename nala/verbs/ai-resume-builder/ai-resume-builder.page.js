import AcrobatWidget from '../../widget/acrobat-widget.js';

export default class AiResumeBuilderPage extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.resume-builder.unity-enabled', nth);

    this.gnav = page.locator('nav.feds-topnav');
    this.gnavBreadcrumbs = page.locator('nav.feds-breadcrumbs');

    this.dropZone = this.widget.locator('#drop-zone');
    this.verbHeader = this.widget.locator('.verb-marquee-heading');
    this.verbTitle = this.widget.locator('.verb-marquee-title');
    this.verbCopy = this.widget.locator('.verb-marquee-copy').nth(0);
    this.acrobatIcon = this.widget.locator('.verb-marquee-header .acrobat-icon svg');
    this.verbImage = this.widget.locator('.verb-marquee-media');
    this.selectFilesButton = this.widget.locator('button.verb-marquee-cta');
    this.fileInput = this.widget.locator('input[type="file"]#file-upload');

    this.howToHeading = page.locator('#how-to-build-a-standout-resume');
    this.adobeExpressHeading = page.locator('#dont-have-a-resume-adobe-express-can-help-you-create-one');
    this.threeUpSections = page.locator('div[class*="three-up"]');
    this.fourUpSection = page.locator('div[class*="four-up"]').first();
    this.tryFreeHeading = page.locator('#try-our-free-ai-resume-builder');
    this.faqSection = page.locator('div[class*="accordion-container"]').first();
    this.faqAccordionTriggers = this.faqSection.locator('button.accordion-trigger');
    this.columnsSection = page.locator('div[class*="columns"]').first();
    this.columnsATags = this.columnsSection.locator('a');
    this.footer = page.locator('footer[class="global-footer"]');
  }
}
