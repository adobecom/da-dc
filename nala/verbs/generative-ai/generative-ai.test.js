import { test } from '@playwright/test';
import OnlineGenAiPage from './generative-ai.page.js';
import { features } from './generative-ai.spec.js';

const PDF_FIXTURES = [
  'nala/test-files/testpdf.pdf',
];

test.describe(features[0].name, () => {
  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const genAiPage = new OnlineGenAiPage(page);
    await page.goto(features[0].path, { waitUntil: 'domcontentloaded' });
    await genAiPage.verifyVerbWidget(features[0].verb);
    await genAiPage.verifyFooterOptions();
    await genAiPage.uploadFileToVerbWidget(features[0].verb, PDF_FIXTURES);
    await genAiPage.verifyUploadRedirect();
  });
});

test.describe(features[1].name, () => {
  test(`${features[1].name}, ${features[1].tags}`, async ({ page }) => {
    const genAiPage = new OnlineGenAiPage(page);
    await page.goto(features[1].path, { waitUntil: 'domcontentloaded' });
    await genAiPage.verifyVerbWidget(features[1].verb);
    await genAiPage.verifyFooterOptions();
    await genAiPage.uploadFileToVerbWidget(features[1].verb, PDF_FIXTURES);
    await genAiPage.verifyUploadRedirect();
  });
});

test.describe(features[2].name, () => {
  test(`${features[2].name}, ${features[2].tags}`, async ({ page }) => {
    const genAiPage = new OnlineGenAiPage(page);
    await page.goto(features[2].path, { waitUntil: 'domcontentloaded' });
    await genAiPage.verifyVerbWidget(features[2].verb);
    await genAiPage.verifyFooterOptions();
    await genAiPage.uploadFileToVerbWidget(features[2].verb, PDF_FIXTURES);
    await genAiPage.verifyUploadRedirect();
  });
});

test.describe(features[3].name, () => {
  test(`${features[3].name}, ${features[3].tags}`, async ({ page }) => {
    const genAiPage = new OnlineGenAiPage(page);
    await page.goto(features[3].path, { waitUntil: 'domcontentloaded' });
    await genAiPage.verifyStudyMarquee();
    await genAiPage.verifyFooterOptions();
    await genAiPage.uploadFileToStudyMarquee(PDF_FIXTURES);
    await genAiPage.verifyUploadRedirect();
  });
});

test.describe(features[4].name, () => {
  test(`${features[4].name}, ${features[4].tags}`, async ({ page }) => {
    const genAiPage = new OnlineGenAiPage(page);
    await page.goto(features[4].path, { waitUntil: 'domcontentloaded' });
    await genAiPage.verifyStudyMarquee();
    await genAiPage.verifyFooterOptions();
    await genAiPage.uploadFileToStudyMarquee(PDF_FIXTURES);
    await genAiPage.verifyUploadRedirect();
  });
});
