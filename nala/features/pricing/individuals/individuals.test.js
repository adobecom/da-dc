import { expect, test } from '@playwright/test';
import PricingIndividualsPage from './individuals.page.js';
import { features } from './individuals.spec.js';
import { checkPageLinks } from '../../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/acrobat-here-to-help-blade';

let pricing;

test.describe('Acrobat Pricing — Individuals', () => {
  test.beforeEach(async ({ page }) => {
    pricing = new PricingIndividualsPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Pricing Individuals] ${baseURL}${path}`);

    await test.step('Go to pricing (individuals)', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify pricing individuals merch cards', async () => {
      await expect(pricing.pricingPageIndividualsMerchCards.first()).toBeVisible();
      await expect(pricing.pricingPageIndividualsMerchCards).toHaveCount(3);

      await expect(pricing.pricingPageIndividualsMerchCardAcrobatStandardPrice).toBeVisible();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatStandardBuyNow).toBeVisible();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatStandardBuyNow).toBeEnabled();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatStandardBuyNow).toHaveCount(1);

      await expect(pricing.pricingPageIndividualsMerchCardAcrobatProPrice).toBeVisible();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatProFreeTrial).toBeVisible();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatProFreeTrial).toBeEnabled();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatProBuyNow).toBeVisible();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatProBuyNow).toBeEnabled();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatProBuyNow).toHaveCount(1);

      await expect(pricing.pricingPageIndividualsMerchCardAcrobatStudioPrice).toBeVisible();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatStudioFreeTrial).toBeVisible();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatStudioFreeTrial).toBeEnabled();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatStudioBuyNow).toBeVisible();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatStudioBuyNow).toBeEnabled();
      await expect(pricing.pricingPageIndividualsMerchCardAcrobatStudioBuyNow).toHaveCount(1);
    });

    await test.step('Verify comparison table', async () => {
      await pricing.comparisonTable.scrollIntoViewIfNeeded();
      await expect(pricing.comparisonTable).toBeVisible();
      await expect(pricing.comparisonTableHeadingRow).toBeVisible();

      const sectionHeadCount = await pricing.comparisonTableSectionHeads.count();
      expect(sectionHeadCount).toBeGreaterThan(0);

      const visibleSectionHead = pricing.comparisonTableSectionHeads.first();
      await expect(visibleSectionHead).toBeVisible();
      const expandButton = visibleSectionHead.locator('span.icon.expand');
      await expect(expandButton).toHaveAttribute('aria-expanded', 'true');

      const visibleFeatureRows = pricing.comparisonTable.locator('div.section-row:not(.hidden)');
      const visibleRowCount = await visibleFeatureRows.count();
      expect(visibleRowCount).toBeGreaterThan(0);

      const firstVisibleRow = visibleFeatureRows.first();
      const featureTitle = firstVisibleRow.locator('.table-title-text');
      await expect(featureTitle).toBeVisible();

      const checkmarks = firstVisibleRow.locator('span.icon-checkmark');
      const checkmarkCount = await checkmarks.count();
      expect(checkmarkCount).toBeGreaterThan(0);
    });

    await test.step('Verify comparison table section toggle', async () => {
      const visibleSectionHead = pricing.comparisonTableSectionHeads.first();
      const expandButton = visibleSectionHead.locator('span.icon.expand');

      await expect(expandButton.first()).toHaveAttribute('aria-expanded', 'true');

      await expandButton.first().click();
      await expect(expandButton.first()).toHaveAttribute('aria-expanded', 'false');

      await expandButton.first().click();
      await expect(expandButton.first()).toHaveAttribute('aria-expanded', 'true');
    });

    await test.step('Verify comparison table compare link', async () => {
      await expect(pricing.comparisonTableCompareLink).toBeVisible();
      await expect(pricing.comparisonTableCompareLink).toBeEnabled();
      await expect(pricing.comparisonTableCompareLink).toHaveAttribute('href', /compare-versions/);
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
