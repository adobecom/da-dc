import { test } from '@playwright/test';
import SignAndProtectPage from './sign-and-protect.page.js';
import { features } from './sign-and-protect.spec.js';

const PDF_FIXTURE = 'nala/test-files/testpdf.pdf';

test.describe(features[0].name, () => {
  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const signPage = new SignAndProtectPage(page);
    await page.goto(features[0].path, { waitUntil: 'domcontentloaded' });
    await signPage.verifyVerbWidget(features[0].verb);
    await signPage.verifyFooterOptions();
    await signPage.uploadFileToVerbWidget(features[0].verb, PDF_FIXTURE);
    await signPage.verifyUploadRedirect();
  });
});

test.describe(features[1].name, () => {
  test(`${features[1].name}, ${features[1].tags}`, async ({ page }) => {
    const signPage = new SignAndProtectPage(page);
    await page.goto(features[1].path, { waitUntil: 'domcontentloaded' });
    await signPage.verifyVerbWidget(features[1].verb);
    await signPage.verifyFooterOptions();
    await signPage.uploadFileToVerbWidget(features[1].verb, PDF_FIXTURE);
    await signPage.verifyUploadRedirect();
  });
});

test.describe(features[2].name, () => {
  test(`${features[2].name}, ${features[2].tags}`, async ({ page }) => {
    const signPage = new SignAndProtectPage(page);
    await page.goto(features[2].path, { waitUntil: 'domcontentloaded' });
    await signPage.verifyVerbWidget(features[2].verb);
    await signPage.verifyFooterOptions();
    await signPage.uploadFileToVerbWidget(features[2].verb, PDF_FIXTURE);
    await signPage.verifyUploadRedirect();
  });
});
