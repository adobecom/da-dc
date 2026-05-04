import { test } from '@playwright/test';
import PdfReaderPage from './pdf-reader.page.js';
import { features } from './pdf-reader.spec.js';

let pdfReaderPage;

test.describe('Acrobat PDF Reader Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    pdfReaderPage = new PdfReaderPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const { path } = features[0];
    console.info(`[PDF Reader Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    await pdfReaderPage.verifyGnavSmoke();

    await pdfReaderPage.verifyMerchCardPlans();

    await pdfReaderPage.merchCards.tabCompareIndividuals.click();
    await pdfReaderPage.verifyIndividualMerchCards();

    await pdfReaderPage.merchCards.tabCompareBusiness.click();
    await pdfReaderPage.verifyBusinessMerchCards();

    await pdfReaderPage.merchCards.tabCompareStudentsAndTeachers.click();
    await pdfReaderPage.verifyStudentsAndTeachersMerchCards();

    // await pdfReaderPage.verifyFAQAccordion();
    await pdfReaderPage.verifyQuestionsAboutSection('/dc-shared/fragments/acrobat/get-acrobat-support');
    await pdfReaderPage.verifyFooter();
    await pdfReaderPage.verifyAllCheckoutLinks();
  });
});
