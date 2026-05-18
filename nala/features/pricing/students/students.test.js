import { expect, test } from '@playwright/test';
import PricingStudentsPage from './students.page.js';
import { features } from './students.spec.js';
import { checkPageLinks } from '../../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/acrobat-here-to-help-blade';

let pricing;

test.describe('Acrobat Pricing — Students', () => {
  test.beforeEach(async ({ page }) => {
    pricing = new PricingStudentsPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Pricing Students] ${baseURL}${path}`);

    await test.step('Go to pricing (students)', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify students pricing merch cards', async () => {
      await expect(pricing.pricingPageStudentsMerchCards.first()).toBeVisible();
      await expect(pricing.pricingPageStudentsMerchCards).toHaveCount(2);

      await expect(pricing.pricingPageStudentsMerchCardAcrobatProPrice.first()).toBeVisible();
      await expect(pricing.pricingPageStudentsMerchCardAcrobatProFreeTrial).toBeVisible();
      await expect(pricing.pricingPageStudentsMerchCardAcrobatProFreeTrial).toBeEnabled();
      await expect(pricing.pricingPageStudentsMerchCardAcrobatProFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(pricing.pricingPageStudentsMerchCardAcrobatProBuyNow.last()).toBeVisible();
      await expect(pricing.pricingPageStudentsMerchCardAcrobatProBuyNow.last()).toBeEnabled();
      await expect(pricing.pricingPageStudentsMerchCardAcrobatProBuyNow.last()).toHaveAttribute('href', /commerce/);

      await expect(pricing.pricingPageStudentsMerchCardCreativeCloudPrice.first()).toBeVisible();
      await expect(pricing.pricingPageStudentsMerchCardCreativeCloudFreeTrial).toBeVisible();
      await expect(pricing.pricingPageStudentsMerchCardCreativeCloudFreeTrial).toBeEnabled();
      await expect(pricing.pricingPageStudentsMerchCardCreativeCloudFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(pricing.pricingPageStudentsMerchCardCreativeCloudBuyNow.last()).toBeVisible();
      await expect(pricing.pricingPageStudentsMerchCardCreativeCloudBuyNow.last()).toBeEnabled();
      await expect(pricing.pricingPageStudentsMerchCardCreativeCloudBuyNow.last()).toHaveAttribute('href', /commerce/);
    });

    await test.step('Verify checkout link in editorial card', async () => {
      const link = pricing.editorialCard.locator('a[is*="checkout-link"]');
      await expect(link).toBeVisible();
      await expect(link).toBeEnabled();
    });

    await test.step('Verify table basics', async () => {
      await pricing.comparisonTable.scrollIntoViewIfNeeded();
      await expect(pricing.comparisonTable).toBeVisible();
      await expect(pricing.comparisonTableHeadingRow).toBeVisible();

      const sectionHeadCount = await pricing.comparisonTableSectionHeads.count();
      expect(sectionHeadCount).toBeGreaterThan(0);
    });

    await test.step('Verify legal text block', async () => {
      const legalblock = page.locator('div[class*="legal text-block"]');
      await expect(legalblock).toBeVisible();
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = pricing;
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

    await test.step('Verify Questions about section', async () => {
      const section = pricing.questionsAboutSection(QUESTIONS_ABOUT_DATA_PATH);
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

    await test.step('Verify footer options', async () => {
      await pricing.footer.scrollIntoViewIfNeeded();
      await expect(pricing.fedsFooterOptions).toBeVisible();
      await expect(pricing.fedsFooterMiscLinks).toBeVisible();
      await expect(pricing.fedsRegionPicker.first()).toBeVisible();
      await expect(pricing.fedsSocial.first()).toBeVisible();
      await expect(pricing.fedsSocial).toHaveCount(4);
      await expect(pricing.fedsFooterLegalWrapper).toBeVisible();
      await expect(pricing.fedsFooterPrivacyListItems.first()).toBeVisible();
      await expect(pricing.fedsFooterPrivacyListItems).toHaveCount(6);
    });

    await test.step('Verify visible checkout links are visible and enabled', async () => {
      const checkoutLinks = page.locator('a[is="checkout-link"]');
      const count = await checkoutLinks.count();
      for (let i = 0; i < count; i += 1) {
        const link = checkoutLinks.nth(i);
        if (!(await link.isVisible())) continue;
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
