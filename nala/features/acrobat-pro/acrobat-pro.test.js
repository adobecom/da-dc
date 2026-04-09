import { expect, test } from '@playwright/test';
import AcrobatProPage from './acrobat-pro.page.js';
import { features } from './acrobat-pro.spec.js';

let acrobatPro;

test.describe('Acrobat Pro Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    acrobatPro = new AcrobatProPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const { path } = features[0];
    console.info(`[Acrobat Pro Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    // Verify Global Navigation
    await acrobatPro.verifyGnav();
    await acrobatPro.verifyLink('a[is*="checkout-link"]', null, acrobatPro.heroMarquee.root);
    await acrobatPro.verifyLink('a:not([is*="checkout-link"])', '/acrobat/pricing', acrobatPro.heroMarquee.root);
    await acrobatPro.verifyLink('a[href*="/go/EditOrganizeDiscover"]');

    // Verify Merch Card Plans section (tabs)
    await acrobatPro.verifyMerchCardPlans();

    // // Verify Promo Sticky
    // await acrobatPro.verifyPromoSticky();
    await acrobatPro.verifyFAQAccordion('/dc-shared/fragments/faq/acrobat-overview-faq');

    // Verify Questions About Section
    await acrobatPro.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/get-acrobat-support'); 

    // Verify Footer
    await acrobatPro.verifyFooter();
  });
});