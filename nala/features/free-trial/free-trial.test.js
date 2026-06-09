import { expect, test } from '@playwright/test';
import FreeTrialPage from './free-trial.page.js';
import { features } from './free-trial.spec.js';
import checkPageLinks from '../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/get-acrobat-support';

let freeTrial;

test.describe('Acrobat Free Trial Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    freeTrial = new FreeTrialPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Free Trial Test] ${baseURL}${path}`);

    await test.step('Go to free trial download page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await freeTrial.gnav.waitFor({ state: 'visible' });
      await expect(freeTrial.gnav).toBeVisible();
      await expect(freeTrial.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(freeTrial.heroMarquee).toBeVisible();
    });

    await test.step('Verify edit text and images blade', async () => {
      const blade = freeTrial.editTextAndImagesBlade;
      await blade.scrollIntoViewIfNeeded();
      await expect(blade).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify split-image block', async () => {
      const block = freeTrial.splitImageBlock;
      await block.scrollIntoViewIfNeeded();
      await expect(block).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify four-up section', async () => {
      const fourUp = freeTrial.fourUpSection;
      await fourUp.scrollIntoViewIfNeeded();
      await expect(fourUp).toBeVisible({ timeout: 60000 });
    });

    // await test.step('Verify PCWorld Best 2025 blade', async () => {
    //   const blade = freeTrial.pcworldBestBlade;
    //   await blade.scrollIntoViewIfNeeded();
    //   await expect(blade).toBeVisible({ timeout: 60000 });
    // });

    await test.step('Verify discover small business video blade', async () => {
      const blade = freeTrial.discoverSmallBusinessVideoBlade;
      await blade.scrollIntoViewIfNeeded();
      await expect(blade).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = freeTrial;
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
      const section = freeTrial.questionsAboutSection(QUESTIONS_ABOUT_DATA_PATH);
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
      await freeTrial.footer.scrollIntoViewIfNeeded();
      await expect(freeTrial.footer).toBeVisible({ timeout: 60000 });
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

    // TODO: Add this check back
    // await test.step('Verify no link leads to 404', async () => {
    //   await checkPageLinks(page, expect);
    // });
  });
});
