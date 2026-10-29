import { expect } from '@playwright/test';

// Milo adds `placeholder-resolved` to a price or a checkout link after the offer loads,
// and `placeholder-failed` when the offer does not load.
const RESOLVED = /\bplaceholder-resolved\b/;
const CHECKOUT_URL = /^https:\/\/commerce(-stg)?\.adobe\.com\//;

export default class MerchCards {
  /** @param {import('@playwright/test').Locator} [container] The block or tab panel with the cards. */
  constructor(page, container = page.locator('main')) {
    this.container = container;
    this.cards = container.locator('merch-card').filter({ visible: true });
  }

  /**
   * Checks the title, prices, and buttons of every visible card.
   * @param {{ currency?: string }} [options] For example 'US$' or '€'.
   */
  async verifyVisibleCards({ currency } = {}) {
    await expect(this.cards.first()).toBeVisible({ timeout: 60000 });
    const count = await this.cards.count();
    for (let i = 0; i < count; i += 1) {
      await MerchCards.verifyCard(this.cards.nth(i), { currency });
    }
  }

  static async verifyCard(card, { currency } = {}) {
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('[slot^="heading"]').first()).not.toBeEmpty();

    // Some cards have no price, for example Acrobat Reader with a download button.
    const prices = card.locator('span[is="inline-price"]');
    for (let i = 0; i < await prices.count(); i += 1) {
      await expect(prices.nth(i)).toHaveClass(RESOLVED, { timeout: 30000 });
    }
    const mainPrices = card.locator('span[is="inline-price"][data-template="price"]');
    for (let i = 0; i < await mainPrices.count(); i += 1) {
      await expect(mainPrices.nth(i)).toHaveText(/\d/);
      if (currency) await expect(mainPrices.nth(i)).toContainText(currency);
    }

    const buttons = card.locator('a.con-button').filter({ visible: true });
    await expect(buttons.first()).toBeVisible();
    for (let i = 0; i < await buttons.count(); i += 1) {
      await expect(buttons.nth(i)).not.toBeEmpty();
      await expect(buttons.nth(i)).toHaveAttribute('href', /^https:\/\//);
    }

    const checkoutLinks = card.locator('a[is="checkout-link"]').filter({ visible: true });
    for (let i = 0; i < await checkoutLinks.count(); i += 1) {
      await expect(checkoutLinks.nth(i)).toHaveClass(RESOLVED, { timeout: 30000 });
      await expect(checkoutLinks.nth(i)).toHaveAttribute('href', CHECKOUT_URL);
    }
  }

  /**
   * Checks that a visible checkout link exists for each WCS OSI.
   * The OSI is the same in all locales, so the check does not use the button text.
   */
  async verifyCheckoutOffers(osis) {
    for (const osi of osis) {
      const link = this.container.locator(`a[is="checkout-link"][data-wcs-osi="${osi}"]`).filter({ visible: true }).first();
      await expect(link, `checkout link for WCS OSI ${osi}`).toBeVisible({ timeout: 30000 });
      await expect(link).toHaveClass(RESOLVED, { timeout: 30000 });
      await expect(link).toHaveAttribute('href', CHECKOUT_URL);
    }
  }
}
