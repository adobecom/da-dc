export default class ModifyPdfsPage {
  constructor(page) {
    this.page = page;

    // Global nav, breadcrumbs and footer: structural selectors only (no copy or generated ids).
    this.gnav = page.locator('header').first();
    this.gnavBreadcrumbs = page.locator('.feds-breadcrumbs');
    this.footer = page.locator('footer').first();

    this.heroMarquee = page.locator('.hero-marquee').first();

    /** Media promo blocks (exact `media` block class). */
    this.mediaConBlocks = page.locator('div.media');

    /** Aside strip with Reader + Chrome extension CTAs. */
    this.asideBlocks = page.locator('div[class*="aside"]');

    this.editorialCards = page.locator('div.editorial-card');

    this.splitImageBlock = page.locator('div.image.split-image');

    this.fourUpSection = page.locator('div.four-up');
  }
}
