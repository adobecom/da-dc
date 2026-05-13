import { expect, test } from '@playwright/test';
import OnlinePage from './online.page.js';
import { features } from './online.spec.js';

let onlinePage;

test.describe('Acrobat Online Tools Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    onlinePage = new OnlinePage(page);
  });

  features.forEach((feature) => {
    test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
      const { path } = feature;
      console.info(`[Online Test] ${baseURL}${path}`);

      await test.step('Go to Acrobat Online page', async () => {
        await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
      });

      await test.step('Verify global nav (smoke)', async () => {
        await onlinePage.gnav.waitFor({ state: 'visible' });
        await expect(onlinePage.gnav).toBeVisible();
      });

      await test.step('Verify hero marquee', async () => {
        await expect(onlinePage.heroMarqueeSection).toBeVisible({ timeout: 60000 });
      });

      await test.step('Verify 33 editorial cards', async () => {
        const cards = onlinePage.editorialCards;
        await expect.poll(async () => cards.count(), { timeout: 60000 }).toBe(34);

        const count = await cards.count();
        for (let i = 0; i < count; i += 1) {
          const card = cards.nth(i);
          await card.scrollIntoViewIfNeeded();
          await expect(card).toBeVisible();
        }
      });

      await test.step('Verify footer', async () => {
        await onlinePage.footer.scrollIntoViewIfNeeded();
        await expect(onlinePage.footer).toBeVisible({ timeout: 60000 });
      });
    });
  });
});
