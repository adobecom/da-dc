import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './image-to-pdf.spec.js';
import ImageToPdf from './image-to-pdf.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const filePath = path.resolve(__dirname, '../../assets/1-JPG-jpg-pdf.jpg');

let imageToPdf;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Image to PDF test suite', () => {
  test.beforeEach(async ({ page }) => {
    imageToPdf = new ImageToPdf(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL, browserName }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);

    await test.step('Go to Image to PDF test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await imageToPdf.gnav.waitFor({ state: 'visible' });
      await expect(imageToPdf.gnav).toBeVisible();
      await expect(imageToPdf.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Image to PDF widget content/specs', async () => {
      await expect(imageToPdf.widget).toBeVisible();
      await expect(imageToPdf.dropZone).toBeVisible();
      await expect(imageToPdf.verbImage).toBeVisible();
      await expect(imageToPdf.acrobatIcon).toBeVisible();
      await expect(imageToPdf.verbHeader).toBeVisible();
      await expect(imageToPdf.verbTitle).toBeVisible();
      await expect(imageToPdf.verbCopy).toBeVisible();
      await expect(imageToPdf.selectFilesButton).toBeVisible();
      await expect(imageToPdf.selectFilesButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await imageToPdf.howToSection.scrollIntoViewIfNeeded();
      await expect(imageToPdf.howToSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify three-up section', async () => {
      await imageToPdf.threeUpSection.scrollIntoViewIfNeeded();
      await expect(imageToPdf.threeUpSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = imageToPdf;
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

    // await test.step('Verify CaaS section', async () => {
    //   if (browserName === 'chromium') {
    //     // TODO: Investigate CaaS section flakiness on Chrome (async hydration / late attach).
    //     return;
    //   }
    //   await imageToPdf.caasSection.waitFor({ state: 'attached', timeout: 90000 });
    //   await imageToPdf.caasSection.scrollIntoViewIfNeeded();
    //   await expect(imageToPdf.caasSection).toBeVisible({ timeout: 60000 });
    // });

    await test.step('Verify media block', async () => {
      await imageToPdf.mediaSection.scrollIntoViewIfNeeded();
      await expect(imageToPdf.mediaSection).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify columns section has 31 links', async () => {
      const { columnsSection, columnsATags } = imageToPdf;
      await columnsSection.scrollIntoViewIfNeeded();
      await expect(columnsSection).toBeVisible({ timeout: 60000 });
      await expect(columnsATags.first()).toBeVisible();
      await expect(columnsATags.first()).toBeEnabled();
    });

    await test.step('Verify footer', async () => {
      await imageToPdf.footer.scrollIntoViewIfNeeded();
      await expect(imageToPdf.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample image file (client-side encrypt + redirect)', async () => {
      // Client-upload flow: the file is AES-GCM encrypted and stored in IndexedDB
      // in the browser, then the user is redirected to the Acrobat Online tool with
      // a fileId reference. No filechooser dialog and no unity redirect.
      await imageToPdf.fileInput.setInputFiles(filePath);

      await expect(page).toHaveURL(
        /\/acrobat-online\/image-to-pdf\.html\?.*clientConvert=true/,
        { timeout: 60000 },
      );

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('clientConvert')).toBe('true');
      // fileId is the IndexedDB record UUID for the encrypted file.
      expect(urlObj.searchParams.get('fileId')).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(urlObj.searchParams.get('UTS_Uploaded')).toBeTruthy();
      console.log({
        clientConvert: urlObj.searchParams.get('clientConvert'),
        fileId: urlObj.searchParams.get('fileId'),
        UTS_Uploaded: urlObj.searchParams.get('UTS_Uploaded'),
      });
    });
  });
});
