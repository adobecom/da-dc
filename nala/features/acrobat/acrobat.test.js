import { expect, test } from '@playwright/test';
import AcrobatPage from './acrobat.page.js';
import { features } from './acrobat.spec.js';
import checkPageLinks from '../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/get-acrobat-support';

let acrobat;

test.describe('Acrobat Homepage Full Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    acrobat = new AcrobatPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Acrobat Test] ${baseURL}${path}`);

    await test.step('Go to Acrobat homepage', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await acrobat.gnav.waitFor({ state: 'visible' });
      await expect(acrobat.gnav).toBeVisible();
      await expect(acrobat.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(acrobat.heroMarquee).toBeVisible();
    });

    await test.step('Brief settle for below-the-fold', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Verify carousel', async () => {
      const { carousel, carouselSlides, carouselNext, carouselPrevious, carouselIndicators } = acrobat;
      await page.waitForTimeout(1000);
      await carousel.scrollIntoViewIfNeeded();
      await expect(carousel).toBeVisible();
      // Slides/indicators often hydrate after paint — wait before counting.
      await carouselSlides.first().waitFor({ state: 'attached', timeout: 60000 });

      const slideCount = await carouselSlides.count();
      const indicatorCount = await carouselIndicators.count();

      expect(slideCount).toBeGreaterThan(0);
      expect(indicatorCount).toBe(slideCount);

      for (let i = 0; i < slideCount; i += 1) {
        const slide = carouselSlides.nth(i);
        await expect(slide.locator('h3')).toBeVisible();
        await expect(slide.locator('p.body-m')).toBeVisible();
        await expect(slide.locator('img')).toHaveAttribute('src', expect.stringMatching(/.+/));
      }

      await expect(carouselNext).toBeVisible();
      await expect(carouselNext).toBeEnabled();
      await expect(carouselPrevious).toBeVisible();
      await expect(carouselPrevious).toBeEnabled();

      const initialActiveIndex = await carousel.locator('li.carousel-indicator.active').getAttribute('data-index');

      await carouselNext.click();
      await page.waitForTimeout(300);

      const newActiveIndex = await carousel.locator('li.carousel-indicator.active').getAttribute('data-index');
      expect(newActiveIndex).not.toBe(initialActiveIndex);

      await carouselPrevious.click();
      await page.waitForTimeout(300);

      const revertedIndex = await carousel.locator('li.carousel-indicator.active').getAttribute('data-index');
      expect(revertedIndex).toBe(initialActiveIndex);
    });

    await test.step('Verify three-up section, See all features, presentations brick, four-up', async () => {
      await acrobat.twoUpSection.scrollIntoViewIfNeeded();
      await expect(acrobat.twoUpSection).toBeVisible();

      await expect(acrobat.seeAllFeaturesLink).toBeVisible();
      await expect(acrobat.seeAllFeaturesLink).toBeEnabled();
      await expect(acrobat.seeAllFeaturesLink).toHaveAttribute('href', /\/acrobat\/features/);

      await acrobat.generatePresentationsBrick.scrollIntoViewIfNeeded();
      await expect(acrobat.generatePresentationsBrick).toBeVisible();
      await expect(acrobat.generatePresentationsBrick.locator('.brick-text h3.heading-xl')).toBeVisible();
      await expect(acrobat.generatePresentationsBrick.locator('.brick-text p.body-m')).toBeVisible();
      await expect(acrobat.generatePresentationsBrick.locator('.brick-media img')).toBeVisible();

      await acrobat.fourUpSection.scrollIntoViewIfNeeded();
      await expect(acrobat.fourUpSection).toBeVisible();
    });

    await test.step('Verify merch card plans and compare tabs', async () => {
      const merchCardPlans = page.locator('div[data-path*="/dc-shared/fragments/merch-cards/compare-acrobat-plans"]');
      const tabs = merchCardPlans.locator('button[id^="tab-compare-plans-"]');

      // Scroll the first tab into view, then switch through each tab and verify merch cards render.
      await tabs.first().scrollIntoViewIfNeeded({ timeout: 30000 });
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThan(0);

      for (let i = 0; i < tabCount; i += 1) {
        const tab = tabs.nth(i);
        await expect(tab).toBeVisible();
        await tab.click();
        const visibleCard = merchCardPlans.locator('merch-card').filter({ visible: true }).first();
        await expect(visibleCard).toBeVisible();
      }
    });

    await test.step('Verify Acrobat subscription features', async () => {
      await expect(acrobat.acrobatSubscriptionFeature).toBeVisible();
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = acrobat;
      await expect(faqSection).toBeVisible();

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

    await test.step('Verify Questions about / get Acrobat support section', async () => {
      const section = acrobat.questionsAboutSection(QUESTIONS_ABOUT_DATA_PATH);
      await section.scrollIntoViewIfNeeded();
      const title = section.locator('h2');
      const description = section.locator('p');
      const links = section.locator('a');

      await expect(section).toBeVisible();
      await expect(title).toBeVisible();
      await expect(description.first()).toBeVisible();
      await expect(links.first()).toBeVisible();
      await expect(links.first()).toBeEnabled();
      await expect(links.first()).toHaveAttribute('href', expect.stringContaining('/acrobat/contact'));
      await expect(links.last()).toBeVisible();
      await expect(links.last()).toBeEnabled();
      await expect(links.last()).toHaveAttribute('href', /tel:/);
      await expect(links).toHaveCount(2);
    });

    await test.step('Verify footer', async () => {
      await acrobat.footer.scrollIntoViewIfNeeded();
      await expect(acrobat.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify visible checkout links are visible and enabled', async () => {
      const checkoutLinks = page.locator('a[is="checkout-link"]').filter({ visible: true });
      const count = await checkoutLinks.count();
      for (let i = 0; i < count; i += 1) {
        const link = checkoutLinks.nth(i);
        await link.scrollIntoViewIfNeeded();
        await expect(link).toBeVisible();
        await expect(link).toBeEnabled();
      }
    });

    await test.step('Verify no link leads to 404', async () => {
      await checkPageLinks(page, expect);
    });
  });
});
