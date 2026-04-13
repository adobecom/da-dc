import { test } from '@playwright/test';
import ConvertPage from './convert.page.js';
import { features } from './convert.spec.js';

const PDF_FIXTURE = 'nala/test-files/testpdf.pdf';

test.describe(features[0].name, () => {
  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const convertPage = new ConvertPage(page);
    await page.goto(features[0].path, { waitUntil: 'domcontentloaded' });
    await convertPage.verifyVerbWidget(features[0].verb);
    await convertPage.verifyFooterOptions();
    await convertPage.uploadFileToVerbWidget(features[0].verb, PDF_FIXTURE);
    await convertPage.verifyUploadRedirect();
  });
});

test.describe(features[1].name, () => {
  test(`${features[1].name}, ${features[1].tags}`, async ({ page }) => {
    const convertPage = new ConvertPage(page);
    await page.goto(features[1].path, { waitUntil: 'domcontentloaded' });
    await convertPage.verifyVerbWidget(features[1].verb);
    await convertPage.verifyFooterOptions();
    await convertPage.uploadFileToVerbWidget(features[1].verb, PDF_FIXTURE);
    await convertPage.verifyUploadRedirect();
  });
});

test.describe(features[2].name, () => {
  test(`${features[2].name}, ${features[2].tags}`, async ({ page }) => {
    const convertPage = new ConvertPage(page);
    await page.goto(features[2].path, { waitUntil: 'domcontentloaded' });
    await convertPage.verifyVerbWidget(features[2].verb);
    await convertPage.verifyFooterOptions();
    await convertPage.uploadFileToVerbWidget(features[2].verb, PDF_FIXTURE);
    await convertPage.verifyUploadRedirect();
  });
});

test.describe(features[3].name, () => {
  test(`${features[3].name}, ${features[3].tags}`, async ({ page }) => {
    const convertPage = new ConvertPage(page);
    await page.goto(features[3].path, { waitUntil: 'domcontentloaded' });
    await convertPage.verifyVerbWidget(features[3].verb);
    await convertPage.verifyFooterOptions();
    await convertPage.uploadFileToVerbWidget(features[3].verb, PDF_FIXTURE);
    await convertPage.verifyUploadRedirect();
  });
});

test.describe(features[4].name, () => {
  test(`${features[4].name}, ${features[4].tags}`, async ({ page }) => {
    const convertPage = new ConvertPage(page);
    await page.goto(features[4].path, { waitUntil: 'domcontentloaded' });
    await convertPage.verifyVerbWidget(features[4].verb);
    await convertPage.verifyFooterOptions();
    await convertPage.uploadFileToVerbWidget(features[4].verb, PDF_FIXTURE);
    await convertPage.verifyUploadRedirect();
  });
});

test.describe(features[5].name, () => {
  test(`${features[5].name}, ${features[5].tags}`, async ({ page }) => {
    const convertPage = new ConvertPage(page);
    await page.goto(features[5].path, { waitUntil: 'domcontentloaded' });
    await convertPage.verifyVerbWidget(features[5].verb);
    await convertPage.verifyFooterOptions();
  });
});

test.describe(features[6].name, () => {
  test(`${features[6].name}, ${features[6].tags}`, async ({ page }) => {
    const convertPage = new ConvertPage(page);
    await page.goto(features[6].path, { waitUntil: 'domcontentloaded' });
    await convertPage.verifyVerbWidget(features[6].verb);
    await convertPage.verifyFooterOptions();
  });
});

test.describe(features[7].name, () => {
  test(`${features[7].name}, ${features[7].tags}`, async ({ page }) => {
    const convertPage = new ConvertPage(page);
    await page.goto(features[7].path, { waitUntil: 'domcontentloaded' });
    await convertPage.verifyVerbWidget(features[7].verb);
    await convertPage.verifyFooterOptions();
  });
});

test.describe(features[8].name, () => {
  test(`${features[8].name}, ${features[8].tags}`, async ({ page }) => {
    const convertPage = new ConvertPage(page);
    await page.goto(features[8].path, { waitUntil: 'domcontentloaded' });
    await convertPage.verifyVerbWidget(features[8].verb);
    await convertPage.verifyFooterOptions();
  });
});

test.describe(features[9].name, () => {
  test(`${features[9].name}, ${features[9].tags}`, async ({ page }) => {
    const convertPage = new ConvertPage(page);
    await page.goto(features[9].path, { waitUntil: 'domcontentloaded' });
    await convertPage.verifyVerbWidget(features[9].verb);
    await convertPage.verifyFooterOptions();
  });
});

// test.describe(features[10].name, () => {
//   test(`${features[10].name}, ${features[10].tags}`, async ({ page }) => {
//     const convertPage = new ConvertPage(page);
//     await page.goto(features[10].path, { waitUntil: 'domcontentloaded' });
//     await convertPage.verifyVerbWidget(features[10].verb);
//     await convertPage.verifyFooterOptions();
//   });
// });

test.describe(features[11].name, () => {
  test(`${features[11].name}, ${features[11].tags}`, async ({ page }) => {
    const convertPage = new ConvertPage(page);
    await page.goto(features[11].path, { waitUntil: 'domcontentloaded' });
    await convertPage.verifyVerbWidget(features[11].verb);
    await convertPage.verifyFooterOptions();
    await convertPage.uploadFileToVerbWidget(features[11].verb, PDF_FIXTURE);
    await convertPage.verifyUploadRedirect();
  });
});

test.describe(features[12].name, () => {
  test(`${features[12].name}, ${features[12].tags}`, async ({ page }) => {
    const convertPage = new ConvertPage(page);
    await page.goto(features[12].path, { waitUntil: 'domcontentloaded' });
    await convertPage.verifyVerbWidget(features[12].verb);
    await convertPage.verifyFooterOptions();
    await convertPage.uploadFileToVerbWidget(features[12].verb, PDF_FIXTURE);
    await convertPage.verifyUploadRedirect();
  });
});
