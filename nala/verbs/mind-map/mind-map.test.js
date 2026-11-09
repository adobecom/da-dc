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

    await test.step('Go to Mind map test page', async () => {
      await page.goto(`${baseURL}${features[0].path}${unityLibs}`);
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('Verify global nav (smoke)', async () => {
      await expect(mindMap.gnav).toBeVisible();
    });

    await test.step('Verify widget content and specs', async () => {
      await expect(mindMap.widget).toBeVisible();
      await expect(mindMap.dropZone).toBeVisible();
      await expect(mindMap.acrobatIcon).toBeVisible();
      await expect(mindMap.verbHeader).toBeVisible();
      await expect(mindMap.verbTitle).toBeVisible();
      await expect(mindMap.verbCopy).toBeVisible();
      await expect(mindMap.studyMarqueeMedia).toBeVisible();
      await expect(mindMap.ctaButton).toBeVisible();
      await expect(mindMap.ctaButton).toBeEnabled();
    });

    await test.step('Verify editorial cards', async () => {
      const cards = mindMap.editorialCards;
      expect(await cards.count(), 'page should render editorial cards').toBeGreaterThan(0);
      for (let i = 0; i < await cards.count(); i += 1) {
        const card = cards.nth(i);
        await card.scrollIntoViewIfNeeded();
        await expect(card).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify carousels', async () => {
      const { carousels } = mindMap;
      expect(await carousels.count(), 'page should render at least one carousel').toBeGreaterThan(0);
      for (let i = 0; i < await carousels.count(); i += 1) {
        const carousel = carousels.nth(i);
        await carousel.scrollIntoViewIfNeeded();
        await expect(carousel).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify FAQ accordion opens and closes each item', async () => {
      const { faqSection, faqAccordionTriggers } = mindMap;
      await faqSection.scrollIntoViewIfNeeded();
      await expect(faqSection).toBeVisible({ timeout: 60000 });

      const buttonCount = await faqAccordionTriggers.count();
      expect(buttonCount, 'FAQ should have at least one item').toBeGreaterThan(0);

      for (let i = 0; i < buttonCount; i += 1) {
        const button = faqAccordionTriggers.nth(i);
        const ariaControls = await button.getAttribute('aria-controls');
        const contentPanel = page.locator(`[id="${ariaControls}"]`);

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

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });

    await test.step('Upload a sample PDF file', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        mindMap.dropZone.click(),
      ]);
      await fileChooser.setFiles(pdfFilePath);
      await expect(page).toHaveURL(/acrobat\.adobe/, { timeout: 60000 });

      const urlObj = new URL(page.url());
      console.log(`[Post-upload URL]: ${page.url()}`);
      expect(urlObj.searchParams.get('x_api_client_id')).toBe('unity');
      expect(urlObj.searchParams.get('x_api_client_location')).toBe('mindmap-maker');
    });
  });
});
