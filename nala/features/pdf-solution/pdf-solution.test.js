import { expect, test } from '@playwright/test';
import PdfSolutionPage from './pdf-solution.page.js';
import { features } from './pdf-solution.spec.js';
import checkPageLinks from '../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/acrobat-here-to-help-blade';

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} baseURL
 * @param {string} path
 */
async function runCompletePdfSolutionSmoke(page, baseURL, path) {
  const pdf = new PdfSolutionPage(page);

  await test.step('Go to Complete PDF Solution page', async () => {
    await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
  });

  await test.step('Verify global nav without breadcrumbs', async () => {
    await pdf.gnav.waitFor({ state: 'visible' });
    await expect(pdf.gnav).toBeVisible();
    await expect(pdf.gnavBreadcrumbs).not.toBeVisible();
  });

  // TODO: Add this check back
  // await test.step('Verify mq-complete-pdf-solution blade', async () => {
  //   const blade = pdf.mqCompletePdfSolutionBlade;
  //   await blade.scrollIntoViewIfNeeded();
  //   await expect(blade).toBeVisible({ timeout: 60000 });
  // });

  await test.step('Verify aside1-desktop blade', async () => {
    const blade = pdf.aside1DesktopBlade;
    await blade.scrollIntoViewIfNeeded();
    await expect(blade).toBeVisible({ timeout: 60000 });
  });

  await test.step('Verify aside blocks (daa-lh)', async () => {
    const blocks = pdf.asideBlocks;
    await blocks.first().waitFor({ state: 'attached', timeout: 60000 });
    const count = await blocks.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toEqual(4);
    for (let i = 0; i < count; i += 1) {
      const block = blocks.nth(i);
      await block.scrollIntoViewIfNeeded();
      await expect(block).toBeVisible({ timeout: 60000 });
    }
  });

  await test.step('Verify three-up section', async () => {
    const threeUp = pdf.threeUpSection;
    await threeUp.scrollIntoViewIfNeeded();
    await expect(threeUp).toBeVisible({ timeout: 60000 });
  });

  await test.step('Verify Acrobat features link', async () => {
    const link = pdf.featuresLink.first();
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();
    await expect(link).toBeEnabled();
    await expect(link).toHaveAttribute('href', /acrobat\/features/);
  });

  await test.step('Verify plans & pricing merch cards (tabs)', async () => {
    await expect(pdf.plansAndPricingSection).toBeVisible();
    await expect(pdf.plansAndPricingTabs).toBeVisible();
    await expect(pdf.plansAndPricingTabButtons).toHaveCount(3);

    await expect(pdf.plansAndPricingTabIndividuals).toBeVisible();
    await expect(pdf.plansAndPricingTabIndividuals).toBeEnabled();
    await expect(pdf.plansAndPricingTabBusiness).toBeVisible();
    await expect(pdf.plansAndPricingTabBusiness).toBeEnabled();
    await expect(pdf.plansAndPricingTabStudents).toBeVisible();
    await expect(pdf.plansAndPricingTabStudents).toBeEnabled();

    await pdf.plansAndPricingTabIndividuals.click();
    await expect(pdf.plansAndPricingTabIndividuals).toHaveAttribute('aria-selected', 'true');
    await expect(pdf.plansAndPricingPanelIndividuals).not.toHaveAttribute('hidden');

    await expect(pdf.plansIndividualsMerchCards).toHaveCount(3);
    await expect(pdf.plansIndividualsReaderCard).toBeVisible();
    await expect(pdf.plansIndividualsReaderDownload).toBeVisible();
    await expect(pdf.plansIndividualsReaderDownload).toBeEnabled();
    await expect(pdf.plansIndividualsProCard).toBeVisible();
    await expect(pdf.plansIndividualsProPrice.first()).toBeVisible();
    await expect(pdf.plansIndividualsProFreeTrial).toBeVisible();
    await expect(pdf.plansIndividualsProFreeTrial).toBeEnabled();
    await expect(pdf.plansIndividualsProBuyNow).toBeVisible();
    await expect(pdf.plansIndividualsProBuyNow).toBeEnabled();
    await expect(pdf.plansIndividualsStudioCard).toBeVisible();
    await expect(pdf.plansIndividualsStudioPrice.first()).toBeVisible();
    await expect(pdf.plansIndividualsStudioFreeTrial).toBeVisible();
    await expect(pdf.plansIndividualsStudioFreeTrial).toBeEnabled();
    await expect(pdf.plansIndividualsStudioBuyNow).toBeVisible();
    await expect(pdf.plansIndividualsStudioBuyNow).toBeEnabled();

    await pdf.plansAndPricingTabBusiness.click();
    await expect(pdf.plansAndPricingTabBusiness).toHaveAttribute('aria-selected', 'true');
    await expect(pdf.plansAndPricingPanelBusiness).not.toHaveAttribute('hidden');

    await expect(pdf.plansBusinessMerchCards).toHaveCount(2);
    await expect(pdf.plansBusinessProCard).toBeVisible();
    await expect(pdf.plansBusinessProPrice.first()).toBeVisible();
    await expect(pdf.plansBusinessProFreeTrial).toBeVisible();
    await expect(pdf.plansBusinessProFreeTrial).toBeEnabled();
    await expect(pdf.plansBusinessProBuyNow).toBeVisible();
    await expect(pdf.plansBusinessProBuyNow).toBeEnabled();
    await expect(pdf.plansBusinessStudioCard).toBeVisible();
    await expect(pdf.plansBusinessStudioPrice.first()).toBeVisible();
    await expect(pdf.plansBusinessStudioFreeTrial).toBeVisible();
    await expect(pdf.plansBusinessStudioFreeTrial).toBeEnabled();
    await expect(pdf.plansBusinessStudioBuyNow).toBeVisible();
    await expect(pdf.plansBusinessStudioBuyNow).toBeEnabled();

    await pdf.plansAndPricingTabStudents.click();
    await expect(pdf.plansAndPricingTabStudents).toHaveAttribute('aria-selected', 'true');
    await expect(pdf.plansAndPricingPanelStudents).not.toHaveAttribute('hidden');

    await expect(pdf.plansStudentsMerchCards).toHaveCount(2);
    await expect(pdf.plansStudentsProCard).toBeVisible();
    await expect(pdf.plansStudentsProPrice.first()).toBeVisible();
    await expect(pdf.plansStudentsProFreeTrial).toBeVisible();
    await expect(pdf.plansStudentsProFreeTrial).toBeEnabled();
    await expect(pdf.plansStudentsProBuyNow).toBeVisible();
    await expect(pdf.plansStudentsProBuyNow).toBeEnabled();
    await expect(pdf.plansStudentsCCCard).toBeVisible();
    await expect(pdf.plansStudentsCCPrice.first()).toBeVisible();
    await expect(pdf.plansStudentsCCFreeTrial).toBeVisible();
    await expect(pdf.plansStudentsCCFreeTrial).toBeEnabled();
    await expect(pdf.plansStudentsCCBuyNow).toBeVisible();
    await expect(pdf.plansStudentsCCBuyNow).toBeEnabled();

    await pdf.plansAndPricingTabIndividuals.click();
    await expect(pdf.plansAndPricingTabIndividuals).toHaveAttribute('aria-selected', 'true');
  });

  // await test.step('Verify PCWorld Best 2025 blade', async () => {
  //   const blade = pdf.pcworldBestBlade;
  //   await pdf.plansAndPricingSection.scrollIntoViewIfNeeded();
  //   await blade.first().waitFor({ state: 'attached', timeout: 60000 });
  //   await blade.scrollIntoViewIfNeeded();
  //   await expect(blade).toBeVisible({ timeout: 60000 });
  // });

  await test.step('Verify four-up section', async () => {
    const fourUp = pdf.fourUpSection;
    await fourUp.first().waitFor({ state: 'attached', timeout: 60000 });
    await fourUp.scrollIntoViewIfNeeded();
    await expect(fourUp).toBeVisible({ timeout: 60000 });
  });

  await test.step('Verify discover small business video blade', async () => {
    const blade = pdf.discoverSmallBusinessVideoBlade;
    await pdf.fourUpSection.scrollIntoViewIfNeeded();
    await blade.first().waitFor({ state: 'attached', timeout: 60000 });
    await blade.scrollIntoViewIfNeeded();
    await expect(blade).toBeVisible({ timeout: 60000 });
  });

  await test.step('Verify FAQ accordion', async () => {
    const { faqSection, faqAccordionTriggers } = pdf;
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
    const section = pdf.questionsAboutSection(QUESTIONS_ABOUT_DATA_PATH);
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
    await pdf.footer.scrollIntoViewIfNeeded();
    await expect(pdf.fedsFooterOptions).toBeVisible();
    await expect(pdf.fedsFooterMiscLinks).toBeVisible();
    await expect(pdf.fedsRegionPicker.first()).toBeVisible();
    await expect(pdf.fedsSocial.first()).toBeVisible();
    await expect(pdf.fedsSocial).toHaveCount(4);
    await expect(pdf.fedsFooterLegalWrapper).toBeVisible();
    await expect(pdf.fedsFooterPrivacyListItems.first()).toBeVisible();
    await expect(pdf.fedsFooterPrivacyListItems).toHaveCount(6);
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
}

test.describe('Complete PDF Solution Smoke Tests', () => {
  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[PDF Solution Test] ${baseURL}${path}`);
    await runCompletePdfSolutionSmoke(page, baseURL, path);
  });

  test(`${features[1].name}, ${features[1].tags}`, async ({ page, baseURL }) => {
    const { path } = features[1];
    console.info(`[PDF Solution Test] ${baseURL}${path}`);
    await runCompletePdfSolutionSmoke(page, baseURL, path);
  });
});
