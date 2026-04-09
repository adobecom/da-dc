import { expect, test } from '@playwright/test';
import GenerativeAiPage from './generative-ai.page.js';
import { features } from './generative-ai.spec.js';

let generativeAiPage;

test.describe('Acrobat Generative AI Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    generativeAiPage = new GenerativeAiPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const { path } = features[0];
    console.info(`[Generative AI Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    await generativeAiPage.verifyGnav();

    await generativeAiPage.getCheckoutLink('Rx0_PNHTOvg4Lgs4fZuns0dctT7LagQs2h1ivTTJGro');

    await generativeAiPage.verifyMerchCardPlans();

    await generativeAiPage.merchCards.tabCompareIndividuals.click();
    await generativeAiPage.verifyIndividualMerchCards();

    await generativeAiPage.merchCards.tabCompareBusiness.click();
    await generativeAiPage.verifyBusinessMerchCards();

    await generativeAiPage.merchCards.tabCompareStudentsAndTeachers.click();
    await generativeAiPage.verifyStudentsAndTeachersMerchCards();

    await generativeAiPage.verifyFAQAccordion('/dc-shared/fragments/faq/generative-ai-faq');

    await generativeAiPage.verifyFooter();
  });

  test(`${features[1].name}, ${features[1].tags}`, async ({ page }) => {
    const { path } = features[1];
    console.info(`[Generative AI Students Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    await generativeAiPage.verifyGnav();

    const generativeAIStudentsBuyNow = await generativeAiPage.getCheckoutLink('Rx0_PNHTOvg4Lgs4fZuns0dctT7LagQs2h1ivTTJGro');
    await expect(generativeAIStudentsBuyNow.first()).toBeVisible();
    await expect(generativeAIStudentsBuyNow.first()).toBeEnabled();

    await generativeAiPage.verifyGenAiStudentsPromptTabs();

    await generativeAiPage.verifyFAQAccordion('/dc-shared/fragments/faq/generative-ai-faq');

    await generativeAiPage.verifyFooter();
  });
});
