/**
 * Locators for `/acrobat/business/sign`.
 * @see https://www.adobe.com/acrobat/business/sign.html
 */
export default class BusinessSignPage {
  constructor(page) {
    this.page = page;

    this.gnav = page.locator('nav.feds-topnav');
    this.footer = page.locator('footer[class="global-footer"]');

    /** Promo / strip that uses a `notification` class (Milo). */
    this.notification = page.locator('div[class*="notification"]').first();

    /**
     * “See how Acrobat with eSignatures can accelerate business workflows.”
     * Tab block id `action` → `tabs-action` (seven tabs).
     */
    this.actionTabs = page.locator('div.tabs#tabs-action, div#tabs-action').first();

    /** First aside blade on the page. */
    this.firstAside = page.locator('div[class*="aside"]').first();

    /** “The Adobe difference.” — three-up, xl spacing on this route. */
    this.threeUpSection = page
      .locator('div.section.three-up').first();

    this.businessSignMerchCardsContainer = page.locator(
      'div[data-path="/dc-shared/fragments/merch/acrobat/business/acrobat-studio-teams/merch-card-blade"]',
    );
    this.businessSignMerchCards = this.businessSignMerchCardsContainer.locator('merch-card');
  }
}
