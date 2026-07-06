import path from 'path';
import { expect, test } from '@playwright/test';
import { features } from './mind-map.spec.js';
import MindMapPage from './mind-map.page.js';
import checkPageLinks from '../../utils/link-checker.js';

const pdfFilePath = path.resolve(__dirname, '../../assets/1-PDF-split-pdf.pdf');

let mindMap;

const unityLibs = process.env.UNITY_LIBS || '';

test.describe('Unity Mind map test suite', () => {
  test.beforeEach(async ({ page }) => {
    mindMap = new MindMapPage(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}${unityLibs}`);
    const { data } = features[0];

    await test.step('Go to Mind map test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await mindMap.gnav.waitFor({ state: 'visible' });
      await expect(mindMap.gnav).toBeVisible();
      await expect(mindMap.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify Mind map widget content/specs', async () => {
      await expect(mindMap.widget).toBeVisible();
      await expect(mindMap.dropZone).toBeVisible();
      await expect(mindMap.studyMarqueeMedia).toBeVisible();
      await expect(mindMap.acrobatIcon).toBeVisible();
      const actualText = await mindMap.verbHeader.textContent();
      expect(actualText.trim()).toBe(data.verbHeading);
      await expect(mindMap.verbTitle).toContainText(data.verbTitle);
      await expect(mindMap.verbCopy).toContainText(data.verbCopy);
      await expect(mindMap.ctaButton).toBeVisible();
      await expect(mindMap.ctaButton).toBeEnabled();
    });

    await test.step('Verify how-to section', async () => {
      await mindMap.howToHeading.scrollIntoViewIfNeeded();
      await expect(mindMap.howToHeading).toBeVisible({ timeout: 60000 });
    });

    await test.step(`Verify three-up sections (${data.sectionCounts.threeUp})`, async () => {
      const { threeUpSections } = mindMap;
      const { threeUp } = data.sectionCounts;

      await expect(threeUpSections).toHaveCount(threeUp);

      for (let i = 0; i < threeUp; i += 1) {
        const section = threeUpSections.nth(i);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step(`Verify two-up sections (${data.sectionCounts.twoUp})`, async () => {
      const { twoUpSections } = mindMap;
      const { twoUp } = data.sectionCounts;

      await expect(twoUpSections).toHaveCount(twoUp);

      for (let i = 0; i < twoUp; i += 1) {
        const section = twoUpSections.nth(i);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify Student Spaces carousel', async () => {
      const { carousels, studentSpacesHeading } = mindMap;

      await studentSpacesHeading.scrollIntoViewIfNeeded();
      await expect(studentSpacesHeading).toBeVisible({ timeout: 60000 });
      await expect(carousels).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = mindMap;
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

    await test.step('Verify footer', async () => {
      await mindMap.footer.scrollIntoViewIfNeeded();
      await expect(mindMap.footer).toBeVisible({ timeout: 60000 });
    });

    // await test.step('Verify no link leads to 404', async () => {
    //   await checkPageLinks(page, expect);
    // });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        mindMap.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);

      await page.waitForURL(/acrobat\.adobe/, {
        timeout: 60000,
      });

      const currentUrl = page.url();
      console.log(`[Post-upload URL]: ${currentUrl}`);
      const urlObj = new URL(currentUrl);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('mindmap-maker');
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
