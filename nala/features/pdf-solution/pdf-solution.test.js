import { expect, test } from '@playwright/test';
import PdfSolutionPage from './pdf-solution.page.js';
import { features } from './pdf-solution.spec.js';

let pdfSolutionPage;

test.describe('Complete PDF Solution Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    pdfSolutionPage = new PdfSolutionPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    console.info(`[PDF Solution Test] Navigating to: ${features[0].path}`);
    await page.goto(features[0].path, { waitUntil: 'domcontentloaded' });

    const acrobatProWithAiPrice = pdfSolutionPage.getPrice('-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ,bKwlW94xSVU_ykn4WHDjS1eiZrXopDo8VD7UhGAKYBI');
    await expect(acrobatProWithAiPrice).toBeVisible();
    const acrobatProWithAiFreeTrial = pdfSolutionPage.getCheckoutLink('-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ,bKwlW94xSVU_ykn4WHDjS1eiZrXopDo8VD7UhGAKYBI');
    await expect(acrobatProWithAiFreeTrial.first()).toBeVisible();
    await expect(acrobatProWithAiFreeTrial.first()).toBeEnabled();
    await expect(acrobatProWithAiFreeTrial.last()).toBeVisible();
    await expect(acrobatProWithAiFreeTrial.last()).toBeEnabled();

    const acrobatProWithAIBuyNow = pdfSolutionPage.getCheckoutLink('vQmS1H18A6_kPd0tYBgKnp-TQIF0GbT6p8SH8rWcLMs,nIy-IPGnALw3KNncaqMjOJsMUrqElWi8sdGnBFBAgTw');
    await expect(acrobatProWithAIBuyNow.first()).toBeVisible();
    await expect(acrobatProWithAIBuyNow.first()).toBeEnabled();
    await expect(acrobatProWithAIBuyNow.last()).toBeVisible();
    await expect(acrobatProWithAIBuyNow.last()).toBeEnabled();
    await pdfSolutionPage.verifyPlansAndPricingTabsPDFSolution();
    await pdfSolutionPage.verifyFAQAccordion('/dc-shared/fragments/acrobat/complete-pdf-solution/faq-acrobat-pro');
    await pdfSolutionPage.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/acrobat-here-to-help-blade');
    await pdfSolutionPage.verifyFooterOptions();
  });

  test(`${features[1].name}, ${features[1].tags}`, async ({ page }) => {
    console.info(`[PDF Solution Test] Navigating to: ${features[1].path}`);
    await page.goto(features[1].path, { waitUntil: 'domcontentloaded' });

    const acrobatProWithAiFreeTrial = pdfSolutionPage.getCheckoutLink('-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ,bKwlW94xSVU_ykn4WHDjS1eiZrXopDo8VD7UhGAKYBI');
    await expect(acrobatProWithAiFreeTrial.first()).toBeVisible();
    await expect(acrobatProWithAiFreeTrial.first()).toBeEnabled();
    await expect(acrobatProWithAiFreeTrial.last()).toBeVisible();
    await expect(acrobatProWithAiFreeTrial.last()).toBeEnabled();

    await pdfSolutionPage.verifyPlansAndPricingTabsPDFSolution();
    await pdfSolutionPage.verifyFAQAccordion('/dc-shared/fragments/acrobat/complete-pdf-solution/faq-acrobat-pro');
    await pdfSolutionPage.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/acrobat-here-to-help-blade');
    await pdfSolutionPage.verifyFooterOptions();


  });
});
