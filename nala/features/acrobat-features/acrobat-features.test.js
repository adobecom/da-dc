import { test } from '@playwright/test';
import AcrobatFeaturesPage from './acrobat-features.page.js';
import { features } from './acrobat-features.spec.js';

let acrobatFeaturesPage;

test.describe('Acrobat Features Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    acrobatFeaturesPage = new AcrobatFeaturesPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const { path } = features[0];
    console.info(`[Acrobat Features Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    await acrobatFeaturesPage.verifyGnavSmoke();

    await acrobatFeaturesPage.verifyLink('a[is*="checkout-link"]', null, acrobatFeaturesPage.heroMarquee.root);
    await acrobatFeaturesPage.verifyLink('a:not([is*="checkout-link"])', '/acrobat/pricing', acrobatFeaturesPage.heroMarquee.root);
    await acrobatFeaturesPage.verifyTabs(5);

    await acrobatFeaturesPage.verifyMerchCardPlans();

    await acrobatFeaturesPage.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/get-acrobat-support');

    await acrobatFeaturesPage.verifyFooter();
  });

  test(`${features[1].name}, ${features[1].tags}`, async ({ page }) => {
    const { path } = features[1];
    console.info(`[Acrobat Features Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await acrobatFeaturesPage.verifyGnavSmoke();
    await acrobatFeaturesPage.verifyMerchCardPlans();
    await acrobatFeaturesPage.verifyStudentsAndTeachersMerchCards();
    await acrobatFeaturesPage.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/get-acrobat-support');
    await acrobatFeaturesPage.verifyFooter();
  });

  test(`${features[2].name}, ${features[2].tags}`, async ({ page }) => {
    const { path } = features[2];
    console.info(`[Acrobat Features Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    await acrobatFeaturesPage.verifyGnavSmoke();
    await acrobatFeaturesPage.verifyMerchCardPlans();

    await acrobatFeaturesPage.merchCards.tabCompareIndividuals.click();
    await acrobatFeaturesPage.verifyIndividualMerchCards();

    await acrobatFeaturesPage.merchCards.tabCompareBusiness.click();
    await acrobatFeaturesPage.verifyBusinessMerchCards();

    await acrobatFeaturesPage.merchCards.tabCompareStudentsAndTeachers.click();
    await acrobatFeaturesPage.verifyStudentsAndTeachersMerchCards();
    // await acrobatFeaturesPage.verifyThreeUpEditorialCards();
    await acrobatFeaturesPage.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/get-acrobat-support');
    await acrobatFeaturesPage.verifyFooter();
  });
});
