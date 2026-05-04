import { expect, test } from '@playwright/test';
import PricingPage from './pricing.page.js';
import { features } from './pricing.spec.js';

let pricingPage;

test.describe('Acrobat Pricing Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    pricingPage = new PricingPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    console.info(`[Pricing Test] Navigating to: ${features[0].path}`);
    await page.goto(features[0].path, { waitUntil: 'domcontentloaded' });
    await pricingPage.verifyPricingPageMerchCards();
    await pricingPage.verifyComparisonTable();
    await pricingPage.verifyComparisonTableSectionToggle();
    await pricingPage.verifyComparisonTableCompareLink();
    await pricingPage.verifyFAQAccordion();
    await pricingPage.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/acrobat-here-to-help-blade');
    await pricingPage.verifyFooterOptions();
    await pricingPage.verifyAllCheckoutLinks();
  });

  test(`${features[1].name}, ${features[1].tags}`, async ({ page }) => {
    console.info(`[Pricing Test] Navigating to: ${features[1].path}`);
    await page.goto(features[1].path, { waitUntil: 'domcontentloaded' });
    await pricingPage.verifyPricingStudentsPageMerchCards();
    await pricingPage.verifyLink('a[is*="checkout-link"]', null, pricingPage.editorialCard);
    await pricingPage.verifyTableBasics();
    const legalblock = pricingPage.page.locator('div[class*="legal text-block"]');
    await expect(legalblock).toBeVisible();
    await pricingPage.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/acrobat-here-to-help-blade');
    await pricingPage.verifyFooterOptions();
    await pricingPage.verifyAllCheckoutLinks();
  });

  test(`${features[2].name}, ${features[2].tags}`, async ({ page }) => {
    console.info(`[Pricing Test] Navigating to: ${features[2].path}`);
    await page.goto(features[2].path, { waitUntil: 'domcontentloaded' });
    await pricingPage.verifyGnavSmoke();
    await pricingPage.verifyCompareVersionsTable();

    const checkoutLink = pricingPage.getCheckoutLink('ueZxdqCMpxWZewzvKQb5qmlffllcKzDkTj-kYwtKJ1c');
    await expect(checkoutLink).toBeVisible();
    await expect(checkoutLink).toBeEnabled();

    await pricingPage.verifyFAQAccordion();
    await pricingPage.verifyFooter();
    await pricingPage.verifyAllCheckoutLinks();
  });

  test(`${features[3].name}, ${features[3].tags}`, async ({ page }) => {
    console.info(`[Pricing Test] Navigating to: ${features[3].path}`);
    await page.goto(features[3].path, { waitUntil: 'domcontentloaded' });
    await pricingPage.verifyPricingBusinessPageMerchCards();
    await pricingPage.verifyBusinessComparisonTable();
    await pricingPage.verifyComparisonTableSectionToggle();
    await pricingPage.verifyFAQAccordion();
    await pricingPage.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/acrobat-here-to-help-blade');
    await pricingPage.verifyFooterOptions();
    await pricingPage.verifyAllCheckoutLinks();
  });
});
