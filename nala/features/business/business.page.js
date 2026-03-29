import BasePage from '../../libs/basepage.js';

export default class BusinessPage extends BasePage {
  constructor(page) {
    super(page);
    this.heroTitle = this.page.locator('h1').first();
  }
}
