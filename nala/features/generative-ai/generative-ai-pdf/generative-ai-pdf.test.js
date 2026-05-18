import { expect, test } from '@playwright/test';
import MerchCards from '../../../libs/blocks/merch-cards.js';
import GenerativeAiPdfPage from './generative-ai-pdf.page.js';
import { features } from './generative-ai-pdf.spec.js';
import { checkPageLinks } from '../../../utils/link-checker.js';
let gai;

test.describe('Acrobat Generative AI PDF', () => {
  test.beforeEach(async ({ page }) => {
    gai = new GenerativeAiPdfPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Generative AI PDF] ${baseURL}${path}`);
    const merchCards = new MerchCards(page);

    await test.step('Go to Generative AI PDF page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('load');
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await gai.gnav.waitFor({ state: 'visible' });
      await expect(gai.gnav).toBeVisible();
      await expect(gai.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(gai.heroMarquee).toBeVisible();
    });

    await test.step('Verify masonry section(s)', async () => {
      await gai.heroMarquee.scrollIntoViewIfNeeded();
      await gai.masonrySections.first().waitFor({ state: 'attached', timeout: 60000 });
      const masonryCount = await gai.masonrySections.count();
      expect(masonryCount).toBeGreaterThan(0);
      for (let i = 0; i < masonryCount; i += 1) {
        const el = gai.masonrySections.nth(i);
        await el.scrollIntoViewIfNeeded();
        await expect(el).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify three-up section(s)', async () => {
      await gai.masonrySections.last().scrollIntoViewIfNeeded();
      await gai.threeUpSections.first().waitFor({ state: 'attached', timeout: 60000 });
      const threeUpCount = await gai.threeUpSections.count();
      expect(threeUpCount).toBeGreaterThan(0);
      for (let i = 0; i < threeUpCount; i += 1) {
        const el = gai.threeUpSections.nth(i);
        await el.scrollIntoViewIfNeeded();
        await expect(el).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify merch card plans (compare tabs)', async () => {
      await expect(gai.merchCardPlans).toBeVisible();
      await expect(gai.merchCardPlansTitle).toBeVisible();
      await expect(gai.tabCompareIndividuals).toBeVisible();
      await expect(gai.tabCompareIndividuals).toBeEnabled();
      await expect(gai.tabCompareBusiness).toBeVisible();
      await expect(gai.tabCompareBusiness).toBeEnabled();
      await expect(gai.tabCompareStudentsAndTeachers).toBeVisible();
      await expect(gai.tabCompareStudentsAndTeachers).toBeEnabled();

      await gai.tabCompareIndividuals.click();
      await expect(gai.tabCompareIndividuals).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(gai.individualMerchCards.first()).toBeVisible();
      await expect(gai.individualMerchCards).toHaveCount(3);

      await expect(gai.acrobatReaderPrice).toBeVisible();
      await expect(gai.acrobatReaderLink.first()).toBeVisible();
      await expect(gai.acrobatReaderLink.first()).toBeEnabled();

      await expect(gai.acrobatProPrice).toBeVisible();
      await expect(gai.acrobatProFreeTrial).toBeVisible();
      await expect(gai.acrobatProFreeTrial).toBeEnabled();
      await expect(gai.acrobatProFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(gai.acrobatProBuyNow).toBeVisible();
      await expect(gai.acrobatProBuyNow).toBeEnabled();
      await expect(gai.acrobatProBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(gai.acrobatStudioPrice).toBeVisible();
      await expect(gai.acrobatStudioFreeTrial).toBeVisible();
      await expect(gai.acrobatStudioFreeTrial).toBeEnabled();
      await expect(gai.acrobatStudioFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(gai.acrobatStudioBuyNow).toBeVisible();
      await expect(gai.acrobatStudioBuyNow).toBeEnabled();
      await expect(gai.acrobatStudioBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(gai.individualMerchCardsPricingLink).toBeVisible();
      await expect(gai.individualMerchCardsPricingLink).toBeEnabled();
      await expect(gai.individualMerchCardsPricingLink).toHaveCount(1);

      await expect(gai.merchIndividualsComparePlansLink).toBeVisible();
      await expect(gai.merchIndividualsComparePlansLink).toBeEnabled();
      await expect(gai.merchIndividualsComparePlansLink).toHaveAttribute(
        'href',
        /compare-versions|compare-pricing/,
      );

      await gai.tabCompareBusiness.click();
      await expect(gai.tabCompareBusiness).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(gai.businessMerchCards.first()).toBeVisible();
      await expect(gai.businessMerchCards).toHaveCount(2);

      await expect(gai.acrobatProForTeamsPrice).toBeVisible();
      await expect(gai.acrobatProForTeamsFreeTrial).toBeVisible();
      await expect(gai.acrobatProForTeamsFreeTrial).toBeEnabled();
      await expect(gai.acrobatProForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(gai.acrobatProForTeamsBuyNow).toBeVisible();
      await expect(gai.acrobatProForTeamsBuyNow).toBeEnabled();
      await expect(gai.acrobatProForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(gai.acrobatStudioForTeamsPrice).toBeVisible();
      await expect(gai.acrobatStudioForTeamsFreeTrial).toBeVisible();
      await expect(gai.acrobatStudioForTeamsFreeTrial).toBeEnabled();
      await expect(gai.acrobatStudioForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(gai.acrobatStudioForTeamsBuyNow).toBeVisible();
      await expect(gai.acrobatStudioForTeamsBuyNow).toBeEnabled();
      await expect(gai.acrobatStudioForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(gai.businessMerchCardsPricingLink).toBeVisible();
      await expect(gai.businessMerchCardsPricingLink).toBeEnabled();
      await expect(gai.businessMerchCardsPricingLink).toHaveCount(1);

      await expect(gai.merchBusinessViewPlansLink).toBeVisible();
      await expect(gai.merchBusinessViewPlansLink).toBeEnabled();
      await expect(gai.merchBusinessViewPlansLink).toHaveAttribute('href', /pricing\/business/);

      await gai.tabCompareStudentsAndTeachers.click();
      await expect(gai.tabCompareStudentsAndTeachers).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(gai.studentsAndTeachersMerchCards.first()).toBeVisible();
      await expect(gai.studentsAndTeachersMerchCards).toHaveCount(2);

      await expect(gai.acrobatProForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(gai.acrobatProForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(gai.acrobatProForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(gai.acrobatProForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(gai.acrobatProForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(gai.acrobatProForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(gai.acrobatProForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(gai.creativeCloudForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(gai.creativeCloudForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(gai.creativeCloudForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(gai.creativeCloudForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(gai.creativeCloudForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(gai.creativeCloudForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(gai.creativeCloudForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(gai.studentsAndTeachersPricingLink).toBeVisible();
      await expect(gai.studentsAndTeachersPricingLink).toBeEnabled();
      await expect(gai.studentsAndTeachersPricingLink).toHaveCount(1);

      await expect(gai.merchStudentsViewPlansLink).toBeVisible();
      await expect(gai.merchStudentsViewPlansLink).toBeEnabled();
      await expect(gai.merchStudentsViewPlansLink).toHaveAttribute('href', /pricing\/students/);
    });

    await test.step('Verify existing Acrobat customer block', async () => {
      const block = gai.existingCustomerBlade;
      await block.scrollIntoViewIfNeeded();
      await expect(block).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = gai;
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

    await test.step('Verify footer', async () => {
      await gai.footer.scrollIntoViewIfNeeded();
      await expect(gai.footer).toBeVisible({ timeout: 60000 });
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
