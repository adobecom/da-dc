export default class ExportPdfPage {
  constructor(page) {
    this.page = page;

    // Global nav, breadcrumbs and footer: structural selectors only (no copy or generated ids).
    this.gnav = page.locator('header').first();
    this.gnavBreadcrumbs = page.locator('.feds-breadcrumbs');
    this.footer = page.locator('footer').first();

    this.heroMarquee = page.locator('.hero-marquee').first();

    /** Media promo blocks outside the hero marquee (exact `media` block class). */
    this.mediaConBlocksOutsideHero = page.locator('div.media:not(.hero-marquee)');

    /** Aside strips with Reader + Chrome CTAs. */
    this.asideBlocks = page.locator('div[class*="aside"]');

    this.editorialCards = page.locator('div.editorial-card');

    this.fourUpSection = page.locator('div.four-up');
  }
}
