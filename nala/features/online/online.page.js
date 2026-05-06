import BasePage from '../../libs/basepage.js';

export default class OnlinePage extends BasePage {
  constructor(page) {
    super(page);
    this.heroTitle = this.page.locator('h1').first();
    this.gnav = this.page.locator('header.global-navigation');
    this.footer = this.page.locator('footer');
  }
}
