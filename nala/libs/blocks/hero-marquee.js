import { expect } from '@playwright/test';

export default class HeroMarquee {
  constructor(page) {
    this.page = page;
    this.root = page.locator('div[class*="hero-marquee"]');
    this.title = this.root.locator('h1');
    this.description = this.root.locator('p');
    this.checkoutLink = this.root.locator('a[is*="checkout-link"]');
    this.nonCheckoutLinks = this.root.locator('a:not([is*="checkout-link"])');
  }

  async verify() {
    await expect(this.root).toBeVisible();
    await expect(this.title).toBeVisible();
    await expect(this.description.first()).toBeVisible();
    await expect(this.nonCheckoutLinks.first()).toBeVisible();
    await expect(this.nonCheckoutLinks.first()).toBeEnabled();
    await expect(this.nonCheckoutLinks).toHaveCount(3);
    await expect(this.checkoutLink).toBeVisible();
    await expect(this.checkoutLink).toBeEnabled();
    await expect(this.checkoutLink).toHaveCount(1);
  }
}
