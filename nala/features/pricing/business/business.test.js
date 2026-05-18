import { expect, test } from '@playwright/test';
import PricingBusinessPage from './business.page.js';
import { features } from './business.spec.js';
import { checkPageLinks } from '../../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/acrobat-here-to-help-blade';

let pricing;

test.describe('Acrobat Pricing — Business', () => {
  test.beforeEach(async ({ page }) => {
    pricing = new PricingBusinessPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Pricing Business] ${baseURL}${path}`);

    await test.step('Go to pricing (business)', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify business pricing merch cards', async () => {
      await expect(pricing.pricingPageBusinessMerchCards.first()).toBeVisible();
      await expect(pricing.pricingPageBusinessMerchCards).toHaveCount(3);

      await expect(pricing.pricingPageBusinessMerchCardAcrobatStandardForTeamsPrice).toBeVisible();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatStandardForTeamsBuyNow).toBeVisible();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatStandardForTeamsBuyNow).toBeEnabled();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatStandardForTeamsBuyNow).toHaveAttribute(
        'href',
        /ot=BASE/,
      );

      await expect(pricing.pricingPageBusinessMerchCardAcrobatProForTeamsPrice).toBeVisible();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatProForTeamsFreeTrial).toBeVisible();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatProForTeamsFreeTrial).toBeEnabled();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatProForTeamsFreeTrial).toHaveAttribute(
        'href',
        /ot=TRIAL/,
      );
      await expect(pricing.pricingPageBusinessMerchCardAcrobatProForTeamsBuyNow).toBeVisible();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatProForTeamsBuyNow).toBeEnabled();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatProForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(pricing.pricingPageBusinessMerchCardAcrobatStudioForTeamsPrice).toBeVisible();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatStudioForTeamsFreeTrial).toBeVisible();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatStudioForTeamsFreeTrial).toBeEnabled();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatStudioForTeamsFreeTrial).toHaveAttribute(
        'href',
        /ot=TRIAL/,
      );
      await expect(pricing.pricingPageBusinessMerchCardAcrobatStudioForTeamsBuyNow).toBeVisible();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatStudioForTeamsBuyNow).toBeEnabled();
      await expect(pricing.pricingPageBusinessMerchCardAcrobatStudioForTeamsBuyNow).toHaveAttribute(
        'href',
        /ot=BASE/,
      );
    });

    await test.step('Verify business comparison table (sticky)', async () => {
      const table = pricing.businessComparisonTable;
      await table.scrollIntoViewIfNeeded();
      await expect(table).toBeVisible();

      const headingRow = table.locator('div.row-heading');
      await expect(headingRow).toBeVisible();

      const colHeadings = headingRow.locator('div[role="columnheader"]');
      await expect(colHeadings).toHaveCount(3);

      const headingLinks = headingRow.locator('a');
      const headingLinkCount = await headingLinks.count();
      for (let i = 0; i < headingLinkCount; i += 1) {
        await expect(headingLinks.nth(i)).toBeVisible();
        await expect(headingLinks.nth(i)).toBeEnabled();
      }

      const headingButtons = headingRow.locator('button');
      const headingButtonCount = await headingButtons.count();
      for (let i = 0; i < headingButtonCount; i += 1) {
        await expect(headingButtons.nth(i)).toBeVisible();
        await expect(headingButtons.nth(i)).toBeEnabled();
      }

      const featureRows = table.locator('div.section-row');
      const rowCount = await featureRows.count();
      expect(rowCount).toBeGreaterThan(0);

      const checkmarks = table.locator('span.icon-checkmark');
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

    await test.step('Verify Contact Sales link in editorial card', async () => {
      await expect(pricing.contactSalesEditorialCard).toBeVisible();
      await pricing.contactSalesLink.scrollIntoViewIfNeeded();
      await expect(pricing.contactSalesLink).toBeVisible();
      await expect(pricing.contactSalesLink).toBeEnabled();
      await expect(pricing.contactSalesLink).toHaveAttribute('href', expect.stringContaining('acrobat/contact'));
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
