export default class PlansPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('header');
    this.tabs = page.locator('button[id^="tab-compare-plans-"]');
    this.footer = page.locator('footer[class="global-footer"]');
  }

  /** @param {string} tabId e.g. 'tab-compare-plans-2' */
  tab(tabId) {
    return this.page.locator(`button#${tabId}`);
  }

  /** @param {string} tabId e.g. 'tab-compare-plans-2' */
  tabPanel(tabId) {
    return this.page.locator(`#${tabId.replace('tab-', 'tab-panel-')}`);
  }
}
