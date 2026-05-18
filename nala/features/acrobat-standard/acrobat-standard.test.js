import { expect, test } from '@playwright/test';
import AcrobatStandardPage from './acrobat-standard.page.js';
import { features } from './acrobat-standard.spec.js';
import { checkPageLinks } from '../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/get-acrobat-support';

let acrobatStandard;

test.describe('Acrobat Standard Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    acrobatStandard = new AcrobatStandardPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Acrobat Standard Test] ${baseURL}${path}`);

    await test.step('Go to Acrobat Standard page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await acrobatStandard.gnav.waitFor({ state: 'visible' });
      await expect(acrobatStandard.gnav).toBeVisible();
      await expect(acrobatStandard.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(acrobatStandard.heroMarquee).toBeVisible();
    });

    await test.step('Verify four-up feature row (Standard)', async () => {
      const fourUp = acrobatStandard.fourUpSection;
      await fourUp.scrollIntoViewIfNeeded();
      await expect(fourUp).toBeVisible();
    });

    await test.step('Verify See all features modal trigger', async () => {
      const trigger = acrobatStandard.seeAllFeaturesModalTrigger;
      await trigger.scrollIntoViewIfNeeded();
      await expect(trigger).toBeVisible();
      await expect(trigger).toBeEnabled();
      await expect(trigger).toHaveAttribute(
        'data-modal-path',
        /\/dc-shared\/fragments\/modals\/acrobat\/acrobat-standard\/see-all-features/,
      );
    });

    await test.step('Verify Launch demo CTA', async () => {
      await expect(acrobatStandard.launchDemoLink).toBeVisible();
      await expect(acrobatStandard.launchDemoLink).toBeEnabled();
      await expect(acrobatStandard.launchDemoLink).toHaveAttribute('href', /EditOrganizeDiscover/);
    });

    await test.step('Verify merch card plans (compare tabs)', async () => {
      await expect(acrobatStandard.merchCardPlans).toBeVisible();
      await expect(acrobatStandard.merchCardPlansTitle).toBeVisible();
      await expect(acrobatStandard.tabCompareIndividuals).toBeVisible();
      await expect(acrobatStandard.tabCompareIndividuals).toBeEnabled();
      await expect(acrobatStandard.tabCompareBusiness).toBeVisible();
      await expect(acrobatStandard.tabCompareBusiness).toBeEnabled();
      await expect(acrobatStandard.tabCompareStudentsAndTeachers).toBeVisible();
      await expect(acrobatStandard.tabCompareStudentsAndTeachers).toBeEnabled();

      await acrobatStandard.tabCompareIndividuals.click();
      await expect(acrobatStandard.tabCompareIndividuals).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(acrobatStandard.individualStandardMerchCards.first()).toBeVisible();
      await expect(acrobatStandard.individualStandardMerchCards).toHaveCount(3);

      await expect(acrobatStandard.acrobatStandardPrice.first()).toBeVisible();
      await expect(acrobatStandard.acrobatStandardBuyNow).toBeVisible();
      await expect(acrobatStandard.acrobatStandardBuyNow).toBeEnabled();
      await expect(acrobatStandard.acrobatStandardBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatStandard.acrobatProStandardPrice.first()).toBeVisible();
      await expect(acrobatStandard.acrobatProStandardFreeTrial).toBeVisible();
      await expect(acrobatStandard.acrobatProStandardFreeTrial).toBeEnabled();
      await expect(acrobatStandard.acrobatProStandardFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(acrobatStandard.acrobatProStandardBuyNow).toBeVisible();
      await expect(acrobatStandard.acrobatProStandardBuyNow).toBeEnabled();
      await expect(acrobatStandard.acrobatProStandardBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatStandard.acrobatStudioStandardPrice.first()).toBeVisible();
      await expect(acrobatStandard.acrobatStudioStandardFreeTrial).toBeVisible();
      await expect(acrobatStandard.acrobatStudioStandardFreeTrial).toBeEnabled();
      await expect(acrobatStandard.acrobatStudioStandardFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(acrobatStandard.acrobatStudioStandardBuyNow).toBeVisible();
      await expect(acrobatStandard.acrobatStudioStandardBuyNow).toBeEnabled();
      await expect(acrobatStandard.acrobatStudioStandardBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatStandard.individualStandardMerchCardsPricingLink).toBeVisible();
      await expect(acrobatStandard.individualStandardMerchCardsPricingLink).toBeEnabled();

      await acrobatStandard.tabCompareBusiness.click();
      await expect(acrobatStandard.tabCompareBusiness).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(acrobatStandard.businessStandardMerchCards.first()).toBeVisible();
      await expect(acrobatStandard.businessStandardMerchCards).toHaveCount(3);

      await expect(acrobatStandard.acrobatStandardForTeamsPrice.first()).toBeVisible();
      await expect(acrobatStandard.acrobatStandardForTeamsBuyNow).toBeVisible();
      await expect(acrobatStandard.acrobatStandardForTeamsBuyNow).toBeEnabled();
      await expect(acrobatStandard.acrobatStandardForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatStandard.acrobatProForTeamsStandardPrice.first()).toBeVisible();
      await expect(acrobatStandard.acrobatProForTeamsStandardFreeTrial).toBeVisible();
      await expect(acrobatStandard.acrobatProForTeamsStandardFreeTrial).toBeEnabled();
      await expect(acrobatStandard.acrobatProForTeamsStandardFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(acrobatStandard.acrobatProForTeamsStandardBuyNow).toBeVisible();
      await expect(acrobatStandard.acrobatProForTeamsStandardBuyNow).toBeEnabled();
      await expect(acrobatStandard.acrobatProForTeamsStandardBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatStandard.acrobatStudioForTeamsStandardPrice.first()).toBeVisible();
      await expect(acrobatStandard.acrobatStudioForTeamsStandardFreeTrial).toBeVisible();
      await expect(acrobatStandard.acrobatStudioForTeamsStandardFreeTrial).toBeEnabled();
      await expect(acrobatStandard.acrobatStudioForTeamsStandardFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(acrobatStandard.acrobatStudioForTeamsStandardBuyNow).toBeVisible();
      await expect(acrobatStandard.acrobatStudioForTeamsStandardBuyNow).toBeEnabled();
      await expect(acrobatStandard.acrobatStudioForTeamsStandardBuyNow).toHaveAttribute('href', /ot=BASE/);

      await acrobatStandard.tabCompareStudentsAndTeachers.click();
      await expect(acrobatStandard.tabCompareStudentsAndTeachers).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(acrobatStandard.studentsAndTeachersMerchCards.first()).toBeVisible();
      await expect(acrobatStandard.studentsAndTeachersMerchCards).toHaveCount(2);

      await expect(acrobatStandard.acrobatProForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(acrobatStandard.acrobatProForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(acrobatStandard.acrobatProForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(acrobatStandard.acrobatProForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(acrobatStandard.acrobatProForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(acrobatStandard.acrobatProForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(acrobatStandard.acrobatProForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatStandard.creativeCloudForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(acrobatStandard.creativeCloudForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(acrobatStandard.creativeCloudForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(acrobatStandard.creativeCloudForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(acrobatStandard.creativeCloudForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(acrobatStandard.creativeCloudForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(acrobatStandard.creativeCloudForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatStandard.studentsAndTeachersPricingLink).toBeVisible();
      await expect(acrobatStandard.studentsAndTeachersPricingLink).toBeEnabled();
      await expect(acrobatStandard.studentsAndTeachersPricingLink).toHaveCount(1);
    });

    await test.step('Verify Acrobat Pro / Standard icon block fragment', async () => {
      const iconBlock = acrobatStandard.acrobatProStandardIconBlock;
      await iconBlock.scrollIntoViewIfNeeded();
      await expect(iconBlock).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = acrobatStandard;
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
      const section = acrobatStandard.questionsAboutSection(QUESTIONS_ABOUT_DATA_PATH);
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
      await acrobatStandard.footer.scrollIntoViewIfNeeded();
      await expect(acrobatStandard.footer).toBeVisible({ timeout: 60000 });
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
