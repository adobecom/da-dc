import BasePage from '../../libs/basepage.js';

export default class AcrobatFeaturesPage extends BasePage {
  constructor(page) {
    super(page);
    this.heroTitle = this.page.locator('h1').first();
  }
}
