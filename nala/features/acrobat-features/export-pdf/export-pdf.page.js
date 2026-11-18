export default class ExportPdfPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('header').first();
    this.gnavBreadcrumbs = page.locator('.feds-breadcrumbs');
    this.footer = page.locator('footer').first();

    this.heroMarquee = page.locator('.hero-marquee').first();

    this.mediaConBlocksOutsideHero = page.locator('div.media:not(.hero-marquee)');

    this.asideBlocks = page.locator('div[class*="aside"]');

    this.editorialCards = page.locator('div.editorial-card');

    this.fourUpSection = page.locator('div.four-up');
  }
}
