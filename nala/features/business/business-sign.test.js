import { expect, test } from '@playwright/test';
import BusinessSignPage from './business-sign.page.js';
import { features } from './business-sign.spec.js';

let businessSign;

test.describe('Acrobat Business — Sign', () => {
  test.beforeEach(async ({ page }) => {
    businessSign = new BusinessSignPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Acrobat Business — Sign] ${baseURL}${path}`);

    await test.step('Go to Acrobat Business Sign page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await businessSign.gnav.waitFor({ state: 'visible' });
      await expect(businessSign.gnav).toBeVisible();
    });

    await test.step('Verify notification strip', async () => {
      const notification = businessSign.notification;
      await notification.scrollIntoViewIfNeeded();
      await expect(notification).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify action tabs (7) and panel content changes', async () => {
      const tabs = businessSign.actionTabs;
      await tabs.scrollIntoViewIfNeeded();
      await expect(tabs).toBeVisible({ timeout: 60000 });

      const tabButtons = tabs.locator('button[role="tab"]');
      await expect(tabButtons).toHaveCount(7);

      let previousPanelHeading = null;
      const tabCount = await tabButtons.count();

      for (let i = 0; i < tabCount; i += 1) {
        const tab = tabButtons.nth(i);
        await expect(tab).toBeVisible();
        await expect(tab).toBeEnabled();

        await tab.click();
        await expect(tab).toHaveAttribute('aria-selected', 'true');

        const panelId = await tab.getAttribute('aria-controls');
        expect(panelId).toBeTruthy();
        const panel = page.locator(`#${panelId}`);
        await expect(panel).toBeVisible();

        const heading = panel.locator('h2, h3, h4').first();
        await expect(heading).toBeVisible({ timeout: 60000 });
        const headingText = (await heading.textContent())?.trim() ?? '';
        expect(headingText.length).toBeGreaterThan(0);
        if (previousPanelHeading !== null) {
          expect(headingText).not.toBe(previousPanelHeading);
        }
        previousPanelHeading = headingText;

        await expect(panel.locator('img, h2, h3, h4, p, a, li').first()).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify first aside block', async () => {
      const aside = businessSign.firstAside;
      await aside.scrollIntoViewIfNeeded();
      await expect(aside).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section (The Adobe difference)', async () => {
      const threeUp = businessSign.threeUpSection;
      await threeUp.scrollIntoViewIfNeeded();
      await expect(threeUp).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify two merch cards', async () => {
      const { businessSignMerchCardsContainer, businessSignMerchCards } = businessSign;
      await businessSignMerchCardsContainer.scrollIntoViewIfNeeded();
      await expect(businessSignMerchCardsContainer).toBeVisible({ timeout: 60000 });
      await expect(businessSignMerchCards).toHaveCount(2);

      for (let i = 0; i < 2; i += 1) {
        const card = businessSignMerchCards.nth(i);
        await expect(card).toBeVisible();
        const price = card.locator('span[is*="inline-price"]');
        await expect(price.first()).toBeVisible();
        const freeTrial = card.locator('a[is*="checkout-link"][href*="ot=TRIAL"]');
        await expect(freeTrial).toBeVisible();
        await expect(freeTrial).toBeEnabled();
        const buyNow = card.locator('a[is*="checkout-link"][href*="ot=BASE"]');
        await expect(buyNow).toBeVisible();
        await expect(buyNow).toBeEnabled();
      }
    });

    await test.step('Verify footer', async () => {
      await businessSign.footer.scrollIntoViewIfNeeded();
      await expect(businessSign.footer).toBeVisible({ timeout: 60000 });
    });
  });
});
