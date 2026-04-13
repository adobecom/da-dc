import { test } from '@playwright/test';
import EditPage from './edit.page.js';
import { features } from './edit.spec.js';

const PDF_FIXTURE = 'nala/test-files/testpdf.pdf';

test.describe(features[0].name, () => {
  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const editPage = new EditPage(page);
    await page.goto(features[0].path, { waitUntil: 'domcontentloaded' });
    await editPage.verifyVerbWidget(features[0].verb);
    await editPage.verifyFooterOptions();
    await editPage.uploadFileToVerbWidget(features[0].verb, PDF_FIXTURE);
    await editPage.verifyUploadRedirect();
  });
});

test.describe(features[1].name, () => {
  test(`${features[1].name}, ${features[1].tags}`, async ({ page }) => {
    const editPage = new EditPage(page);
    await page.goto(features[1].path, { waitUntil: 'domcontentloaded' });
    await editPage.verifyVerbWidget(features[1].verb);
    await editPage.verifyFooterOptions();
    await editPage.uploadFileToVerbWidget(features[1].verb, PDF_FIXTURE);
    await editPage.verifyUploadRedirect();
  });
});

test.describe(features[2].name, () => {
  test(`${features[2].name}, ${features[2].tags}`, async ({ page }) => {
    const editPage = new EditPage(page);
    await page.goto(features[2].path, { waitUntil: 'domcontentloaded' });
    await editPage.verifyVerbWidget(features[2].verb);
    await editPage.verifyFooterOptions();
    await editPage.uploadFileToVerbWidget(features[2].verb, PDF_FIXTURE);
    await editPage.verifyUploadRedirect();
  });
});

test.describe(features[3].name, () => {
  test(`${features[3].name}, ${features[3].tags}`, async ({ page }) => {
    const editPage = new EditPage(page);
    await page.goto(features[3].path, { waitUntil: 'domcontentloaded' });
    await editPage.verifyVerbWidget(features[3].verb);
    await editPage.verifyFooterOptions();
    await editPage.uploadFileToVerbWidget(features[3].verb, PDF_FIXTURE);
    await editPage.verifyUploadRedirect();
  });
});

test.describe(features[4].name, () => {
  test(`${features[4].name}, ${features[4].tags}`, async ({ page }) => {
    const editPage = new EditPage(page);
    await page.goto(features[4].path, { waitUntil: 'domcontentloaded' });
    await editPage.verifyVerbWidget(features[4].verb);
    await editPage.verifyFooterOptions();
    await editPage.uploadFileToVerbWidget(features[4].verb, PDF_FIXTURE);
    await editPage.verifyUploadRedirect();
  });
});

test.describe(features[5].name, () => {
  test(`${features[5].name}, ${features[5].tags}`, async ({ page }) => {
    const editPage = new EditPage(page);
    await page.goto(features[5].path, { waitUntil: 'domcontentloaded' });
    await editPage.verifyVerbWidget(features[5].verb);
    await editPage.verifyFooterOptions();
    await editPage.uploadFileToVerbWidget(features[5].verb, PDF_FIXTURE);
    await editPage.verifyUploadRedirect();
  });
});

test.describe(features[6].name, () => {
  test(`${features[6].name}, ${features[6].tags}`, async ({ page }) => {
    const editPage = new EditPage(page);
    await page.goto(features[6].path, { waitUntil: 'domcontentloaded' });
    await editPage.verifyVerbWidget(features[6].verb);
    await editPage.verifyFooterOptions();
    await editPage.uploadFileToVerbWidget(features[6].verb, PDF_FIXTURE);
    await editPage.verifyUploadRedirect();
  });
});

test.describe(features[7].name, () => {
  test(`${features[7].name}, ${features[7].tags}`, async ({ page }) => {
    const editPage = new EditPage(page);
    await page.goto(features[7].path, { waitUntil: 'domcontentloaded' });
    await editPage.verifyVerbWidget(features[7].verb);
    await editPage.verifyFooterOptions();
    await editPage.uploadFileToVerbWidget(features[7].verb, PDF_FIXTURE);
    await editPage.verifyUploadRedirect();
  });
});

test.describe(features[8].name, () => {
  test(`${features[8].name}, ${features[8].tags}`, async ({ page }) => {
    const editPage = new EditPage(page);
    await page.goto(features[8].path, { waitUntil: 'domcontentloaded' });
    await editPage.verifyVerbWidget(features[8].verb);
    await editPage.verifyFooterOptions();
    await editPage.uploadFileToVerbWidget(features[8].verb, PDF_FIXTURE);
    await editPage.verifyUploadRedirect();
  });
});

test.describe(features[9].name, () => {
  test(`${features[9].name}, ${features[9].tags}`, async ({ page }) => {
    const editPage = new EditPage(page);
    await page.goto(features[9].path, { waitUntil: 'domcontentloaded' });
    await editPage.verifyVerbWidget(features[9].verb);
    await editPage.verifyFooterOptions();
    await editPage.uploadFileToVerbWidget(features[9].verb, PDF_FIXTURE);
    await editPage.verifyUploadRedirect();
  });
});
