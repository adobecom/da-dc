import { test } from '@playwright/test';
import ReduceSizePage from './reduce-size.page.js';
import { features } from './reduce-size.spec.js';

test.describe(features[0].name, () => {
  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const reduceSizePage = new ReduceSizePage(page);
    await page.goto(features[0].path, { waitUntil: 'domcontentloaded' });
    await reduceSizePage.verifyVerbWidget(features[0].verb);
    await reduceSizePage.verifyFooterOptions();
  });
});
