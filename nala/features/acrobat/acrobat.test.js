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
    await acrobat.verifyGnavSmoke();
    await acrobat.verifyHeroMarqueeSmoke();
    await page.waitForTimeout(1000);
    await acrobat.verifyCarousel();
    await acrobat.verifyMerchCardPlans();

    await acrobat.verifyFAQAccordion();

    await acrobat.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/get-acrobat-support'); 
    // await acrobat.verifyPromoSticky();
    // Verify Footer
    await acrobat.verifyFooter();
  });
});
