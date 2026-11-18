import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './pdf-filler.spec.js';
import PdfFiller from './pdf-filler.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const fixturePath = path.resolve(__dirname, '../../assets/1-PDF-pdf-filler-fillable.pdf');
const acceptedTypes = ['.pdf'];

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity PDF form filler test suite', () => {
  let verbPage;

  test.beforeEach(async ({ page }) => {
    verbPage = new PdfFiller(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { sections } = verbPage;

    await test.step('Go to PDF form filler test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('Verify header and page heading are rendered', async () => {
      await expect(sections.header).toBeVisible();
      await expect(sections.h1).toBeVisible();
      await expect(sections.h1).not.toBeEmpty();
    });

    await test.step('Verify widget and select button', async () => {
      await expect(verbPage.widget).toBeVisible();
      await expect(verbPage.dropZone).toBeVisible();
      await expect(verbPage.verbImage).toBeVisible();
      await expect(verbPage.acrobatIcon).toBeVisible();
      await expect(verbPage.verbHeader).toBeVisible();
      await expect(verbPage.verbTitle).toBeVisible();
      await expect(verbPage.verbCopy).toBeVisible();
      await expect(verbPage.selectFilesButton).toBeVisible();
      await expect(verbPage.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify file input accepts the expected types', async () => {
      const accept = (await verbPage.fileInput.getAttribute('accept')) || '';
      const listed = accept.split(',').map((ext) => ext.trim());
      for (const ext of acceptedTypes) {
        expect(listed, `accept list should include ${ext}`).toContain(ext);
      }
    });

    await test.step('Verify how-to section', async () => {
      await sections.howTo.scrollIntoViewIfNeeded();
      await expect(sections.howTo).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion opens and closes each item', async () => {
      await sections.faq.scrollIntoViewIfNeeded();
      await expect(sections.faq).toBeVisible({ timeout: 60000 });

      const count = await sections.faqTriggers.count();
      expect(count, 'FAQ should have at least one item').toBeGreaterThan(0);

      for (let i = 0; i < count; i += 1) {
        const trigger = sections.faqTriggers.nth(i);
        const panel = await sections.panelFor(trigger);

        await trigger.click();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(panel).toBeVisible();

        await trigger.click();
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      }
    });

    await test.step('Verify media block', async () => {
      await sections.media.scrollIntoViewIfNeeded();
      await expect(sections.media).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify ratings and reviews block when present', async () => {
      if (await sections.hasRnr()) {
        await sections.rnr.scrollIntoViewIfNeeded();
        await expect(sections.rnr).toBeVisible();
        await expect(sections.rnr.locator('.rnr-summary-votes')).toHaveText(/^\d+$/);
      }
    });

    await test.step('Verify tool directory has links', async () => {
      await sections.toolDirectory.scrollIntoViewIfNeeded();
      await expect(sections.toolDirectory).toBeVisible({ timeout: 60000 });
      expect(await sections.toolDirectoryLinks.count()).toBeGreaterThan(0);
      await expect(sections.toolDirectoryLinks.first()).toHaveAttribute('href', /.+/);
    });

    await test.step('Verify footer', async () => {
      await sections.footer.scrollIntoViewIfNeeded();
      await expect(sections.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        verbPage.dropZone.click(),
      ]);
      await fileChooser.setFiles(fixturePath);
      await expect(page).toHaveURL(/acrobat\.adobe/, { timeout: 60000 });

      const urlObj = new URL(page.url());
      console.log(`[Post-upload URL]: ${page.url()}`);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('pdf-filler');
    });
  });
});
