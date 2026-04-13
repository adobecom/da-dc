import { test } from '@playwright/test';
import BusinessPage from './business.page.js';
import { features } from './business.spec.js';

let businessPage;

test.describe('Acrobat Business Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    businessPage = new BusinessPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const { path } = features[0];
    console.info(`[Business Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    // await businessPage.verifyGnav();

    await businessPage.verifyBusinessComparisonTable();

    await businessPage.verifyFooter();
  });

  test(`${features[1].name}, ${features[1].tags}`, async ({ page }) => {
    const { path } = features[1];
    console.info(`[Business Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    await businessPage.verifyBusinessSignMerchCards();
  });

  test(`${features[2].name}, ${features[2].tags}`, async ({ page }) => {
    const { path } = features[2];
    console.info(`[Business Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(10000);

    await businessPage.verifyMultipleComparisonTables();

    await businessPage.verifyFooter();
  });
});
