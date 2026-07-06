/**
 * Locators for `/acrobat/online`.
 * @see https://www.adobe.com/acrobat/online.html
 */
export default class OnlinePage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('nav.feds-topnav');
    this.footer = page.locator('footer[class="global-footer"]');

    /** Hero (“Do your best work online with Adobe Acrobat”). */
    this.heroMarqueeSection = page.locator('div[class*="hero-marquee"]');

    /** Product / verb tiles (“Try 25+ powerful PDF and e-signing tools for free”). */
    this.editorialCards = page.locator('div[class*="editorial-card"]');
  }
}
