import { expect, test } from '@playwright/test';
import MerchCards from '../../libs/blocks/merch-card.js';
import { features, planOffers } from './merch.spec.js';

test.describe('Merch cards on the plans page', () => {
  features.forEach((feature) => {
    test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
      const { path, data: { currency, country } } = feature;

      await test.step('Go to the plans page', async () => {
        // The plans page shows prices for the visitor's country. Pin it so the runner location does not matter.
        await page.context().addCookies([{ name: 'country', value: country, url: baseURL }]);
        await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
      });

      for (const [tabId, osis] of Object.entries(planOffers)) {
        await test.step(`Verify cards, prices, and offers in ${tabId}`, async () => {
          const tab = page.locator(`button#tab-${tabId}`);
          await tab.scrollIntoViewIfNeeded({ timeout: 60000 });
          await tab.click();
          await expect(tab).toHaveAttribute('aria-selected', 'true');

          const merchCards = new MerchCards(page, page.locator(`#tab-panel-${tabId}`));
          await merchCards.verifyVisibleCards({ currency });
          await merchCards.verifyCheckoutOffers(osis);
        });
      }
    });
  });
});
