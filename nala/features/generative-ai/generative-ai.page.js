import BasePage from '../../libs/basepage.js';

export default class GenerativeAiPage extends BasePage {
  constructor(page) {
    super(page);
    this.heroTitle = this.page.locator('h1').first();
  }
}
