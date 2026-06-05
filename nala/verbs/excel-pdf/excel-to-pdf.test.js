import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './excel-to-pdf.spec.js';
import ExcelToPdf from './excel-to-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const excelFilePath = path.resolve(__dirname, '../../assets/1-Excel-excel-pdf.xlsx');

let excelToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity EXCEL to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    excelToPdf = new ExcelToPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Excel to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await excelToPdf.gnav.waitFor({ state: 'visible' });
      await expect(excelToPdf.gnav).toBeVisible();
      await expect(excelToPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Excel to PDF widget content/specs', async () => {
      await expect(excelToPdf.widget).toBeVisible();
      await expect(excelToPdf.dropZone).toBeVisible();
      await expect(excelToPdf.verbImage).toBeVisible();
      await expect(excelToPdf.acrobatIcon).toBeVisible();
      const actualText = await excelToPdf.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(excelToPdf.verbTitle).toContainText(data.verbTitle);
      await expect(excelToPdf.verbCopy).toContainText(data.verbCopy);
      await expect(excelToPdf.selectFilesButton).toBeVisible();
      await expect(excelToPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await excelToPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(excelToPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await excelToPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(excelToPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = excelToPdf;
      await faqSection.scrollIntoViewIfNeeded();
      await expect(faqSection).toBeVisible({ timeout: 60000 });

      const buttonCount = await faqAccordionTriggers.count();

      for (let i = 0; i < buttonCount; i += 1) {
        const button = faqAccordionTriggers.nth(i);
        const ariaControls = await button.getAttribute('aria-controls');
        const contentPanel = faqSection.locator(`#${ariaControls}`);

        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'true');
        await expect(contentPanel).toBeVisible();

        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'false');
      }
    });

    await test.step('Verify media block', async () => {
      await excelToPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(excelToPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews (RnR) block', async () => {
      await excelToPdf.rnrSection.scrollIntoViewIfNeeded();
      await expect(excelToPdf.rnrSection).toBeVisible({ timeout: 60000 });
      await expect(excelToPdf.rnrSection.locator('.rnr-container')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = excelToPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags).toHaveCount(31);
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await excelToPdf.footer.scrollIntoViewIfNeeded();
      await expect(excelToPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample Excel file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        excelToPdf.dropZone.click(),
      ]);
      await fileChooser.setFiles(excelFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('excel-to-pdf');
      expect(urlObj.searchParams.get('user')).toBe('frictionless_new_user');
      expect(urlObj.searchParams.get('attempts')).toBe('1st');
      console.log({
        x_api_client_id: urlObj.searchParams.get('x_api_client_id'),
        x_api_client_location: urlObj.searchParams.get('x_api_client_location'),
        user: urlObj.searchParams.get('user'),
        attempts: urlObj.searchParams.get('attempts'),
      });
    });
  });
});
