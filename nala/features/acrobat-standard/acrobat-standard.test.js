import { expect, test } from '@playwright/test';
import AcrobatStandardPage from './acrobat-standard.page.js';
import { features } from './acrobat-standard.spec.js';

let acrobatStandard;

test.describe('Acrobat Standard Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    acrobatStandard = new AcrobatStandardPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const { path } = features[0];
    console.info(`[Acrobat Standard Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    // Verify Global Navigation
    await acrobatStandard.verifyGnav();

    // Verify Hero Marquee
    // await acrobatStandard.verifyHeroMarquee();

    // Verify Merch Card Plans section (tabs)
    // await acrobatStandard.verifyMerchCardPlans();

    // // Click Individuals tab and verify cards
    // await acrobatStandard.merchCards.tabCompareIndividuals.click();
    // await acrobatStandard.verifyIndividualMerchCards();

    // // Click Business tab and verify cards
    // await acrobatStandard.merchCards.tabCompareBusiness.click();
    // await acrobatStandard.verifyBusinessMerchCards();

    // // Click Students & Teachers tab and verify cards
    // await acrobatStandard.merchCards.tabCompareStudentsAndTeachers.click();
    // await acrobatStandard.verifyStudentsAndTeachersMerchCards();

    // Verify FAQ
    await expect(acrobatStandard.acrobatOverviewFAQ).toBeVisible();
    await expect(acrobatStandard.acrobatOverviewFAQTitle).toBeVisible();
    await expect(acrobatStandard.acrobatOverviewFAQButton.first()).toBeVisible();

    // Verify Promo Sticky
    // await acrobatStandard.verifyPromoSticky();

    // Verify Footer
    await acrobatStandard.verifyFooter();
  });
});
