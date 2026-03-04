import { expect, test } from '@playwright/test';
import AiPdfPage from './ai-pdf.page.js';
import { features } from './ai-pdf.spec.js';

let aiPdfPage;

test.describe('Acrobat Generative AI PDF Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    aiPdfPage = new AiPdfPage(page);
  });

  features.forEach((feature) => {
    test(`${feature.name}, ${feature.tags}`, async ({ page }) => {
      console.info(`[AI PDF Test] Navigating to: ${feature.path}`);
      await page.goto(feature.path, { waitUntil: 'domcontentloaded' });

      await expect(aiPdfPage.heroTitle).toBeVisible();
      await expect(aiPdfPage.gnav).toBeVisible();
      await expect(aiPdfPage.footer.first()).toBeVisible();
    });
  });
});
