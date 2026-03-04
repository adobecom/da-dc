export default class OnlinePage {
  constructor(page) {
    this.page = page;
    this.heroTitle = this.page.locator('h1').first();
    this.gnav = this.page.locator('header.global-navigation');
    this.footer = this.page.locator('footer');
  }
}
