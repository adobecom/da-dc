import { expect, test } from '@playwright/test';
import OnlinePage from './online.page.js';
import { features } from './online.spec.js';

let onlinePage;

test.describe('Acrobat Online Tools Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    onlinePage = new OnlinePage(page);
  });

  features.forEach((feature) => {
    test(`${feature.name}, ${feature.tags}`, async ({ page }) => {
      console.info(`[Online Test] Navigating to: ${feature.path}`);
      await page.goto(feature.path);

      await expect(onlinePage.heroTitle).toBeVisible();
      await expect(onlinePage.gnav).toBeVisible();
      await expect(onlinePage.footer.first()).toBeVisible();
    });
  });
});
