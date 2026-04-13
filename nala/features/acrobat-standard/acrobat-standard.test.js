import { test } from '@playwright/test';
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

    await acrobatStandard.verifyGnavSmoke();
    await acrobatStandard.verifyHeroMarqueeSmoke();

    await acrobatStandard.merchCards.tabCompareIndividuals.click();
    await acrobatStandard.verifyIndividualStandardMerchCards();

    await acrobatStandard.merchCards.tabCompareBusiness.click();
    await acrobatStandard.verifyBusinessStandardMerchCards();

    await acrobatStandard.merchCards.tabCompareStudentsAndTeachers.click();
    await acrobatStandard.verifyStudentsAndTeachersMerchCards();

    await acrobatStandard.verifyFAQAccordion();
    await acrobatStandard.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/get-acrobat-support');
    await acrobatStandard.verifyFooter();
  });
});
