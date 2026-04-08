import { expect, test } from '@playwright/test';
import AcrobatPage from './acrobat.page.js';
import { features } from './acrobat.spec.js';

let acrobat;

test.describe('Acrobat Homepage Full Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    acrobat = new AcrobatPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const { path } = features[0];
    console.info(`[Acrobat Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    // Verify Global Navigation
    await acrobat.verifyGnav();

    await acrobat.verifyLink('a[is*="checkout-link"]', null, acrobat.heroMarquee);
    await acrobat.verifyLink('a:not([is*="checkout-link"])', '/acrobat/pricing', acrobat.heroMarquee);
    await page.waitForTimeout(1000);

    // Verify Carousel
    await acrobat.verifyCarousel();

    // Verify Merch Card Plans section (tabs)
    await acrobat.verifyMerchCardPlans();

    // Verify FAQ Accordion
    await acrobat.verifyFAQAccordion('/dc-shared/fragments/faq/acrobat-overview-faq');

    // Verify Questions About Section
    await acrobat.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/get-acrobat-support'); 
    
    // Verify Promo Sticky
    // await acrobat.verifyPromoSticky();

    // Verify Footer
    await acrobat.verifyFooter();
  });
});