import { expect, test } from '@playwright/test';
import AcrobatProPage from './acrobat-pro.page.js';
import { features } from './acrobat-pro.spec.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/get-acrobat-support';

let acrobatPro;

test.describe('Acrobat Pro Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    acrobatPro = new AcrobatProPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Acrobat Pro Test] ${baseURL}${path}`);

    await test.step('Go to Acrobat Pro page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await acrobatPro.gnav.waitFor({ state: 'visible' });
      await expect(acrobatPro.gnav).toBeVisible();
      await expect(acrobatPro.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(acrobatPro.heroMarquee).toBeVisible();
    });

    await test.step('Verify Launch demo CTA', async () => {
      await expect(acrobatPro.editOrganizeDiscoverLink).toBeVisible();
      await expect(acrobatPro.editOrganizeDiscoverLink).toBeEnabled();
      await expect(acrobatPro.editOrganizeDiscoverLink).toHaveAttribute('href', /EditOrganizeDiscover/);
    });

    await test.step('Verify first three-up section', async () => {
      const firstThreeUp = acrobatPro.firstThreeUpSection;
      await firstThreeUp.scrollIntoViewIfNeeded();
      await expect(firstThreeUp).toBeVisible();
    });

    await test.step('Verify merch card plans (compare tabs)', async () => {
      await expect(acrobatPro.merchCardPlans).toBeVisible();
      await expect(acrobatPro.merchCardPlansTitle).toBeVisible();
      await expect(acrobatPro.tabCompareIndividuals).toBeVisible();
      await expect(acrobatPro.tabCompareIndividuals).toBeEnabled();
      await expect(acrobatPro.tabCompareBusiness).toBeVisible();
      await expect(acrobatPro.tabCompareBusiness).toBeEnabled();
      await expect(acrobatPro.tabCompareStudentsAndTeachers).toBeVisible();
      await expect(acrobatPro.tabCompareStudentsAndTeachers).toBeEnabled();

      await acrobatPro.tabCompareIndividuals.click();
      await expect(acrobatPro.tabCompareIndividuals).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(acrobatPro.individualMerchCards.first()).toBeVisible();
      await expect(acrobatPro.individualMerchCards).toHaveCount(3);

      await expect(acrobatPro.acrobatReaderPrice).toBeVisible();
      await expect(acrobatPro.acrobatReaderLink.first()).toBeVisible();
      await expect(acrobatPro.acrobatReaderLink.first()).toBeEnabled();

      await expect(acrobatPro.acrobatProPrice).toBeVisible();
      await expect(acrobatPro.acrobatProFreeTrial).toBeVisible();
      await expect(acrobatPro.acrobatProFreeTrial).toBeEnabled();
      await expect(acrobatPro.acrobatProFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(acrobatPro.acrobatProBuyNow).toBeVisible();
      await expect(acrobatPro.acrobatProBuyNow).toBeEnabled();
      await expect(acrobatPro.acrobatProBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatPro.acrobatStudioPrice).toBeVisible();
      await expect(acrobatPro.acrobatStudioFreeTrial).toBeVisible();
      await expect(acrobatPro.acrobatStudioFreeTrial).toBeEnabled();
      await expect(acrobatPro.acrobatStudioFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(acrobatPro.acrobatStudioBuyNow).toBeVisible();
      await expect(acrobatPro.acrobatStudioBuyNow).toBeEnabled();
      await expect(acrobatPro.acrobatStudioBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatPro.individualMerchCardsPricingLink).toBeVisible();
      await expect(acrobatPro.individualMerchCardsPricingLink).toBeEnabled();
      await expect(acrobatPro.individualMerchCardsPricingLink).toHaveCount(1);

      await expect(acrobatPro.merchIndividualsComparePlansLink).toBeVisible();
      await expect(acrobatPro.merchIndividualsComparePlansLink).toBeEnabled();
      await expect(acrobatPro.merchIndividualsComparePlansLink).toHaveAttribute(
        'href',
        /compare-versions|compare-pricing/,
      );

      await acrobatPro.tabCompareBusiness.click();
      await expect(acrobatPro.tabCompareBusiness).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(acrobatPro.businessMerchCards.first()).toBeVisible();
      await expect(acrobatPro.businessMerchCards).toHaveCount(2);

      await expect(acrobatPro.acrobatProForTeamsPrice).toBeVisible();
      await expect(acrobatPro.acrobatProForTeamsFreeTrial).toBeVisible();
      await expect(acrobatPro.acrobatProForTeamsFreeTrial).toBeEnabled();
      await expect(acrobatPro.acrobatProForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(acrobatPro.acrobatProForTeamsBuyNow).toBeVisible();
      await expect(acrobatPro.acrobatProForTeamsBuyNow).toBeEnabled();
      await expect(acrobatPro.acrobatProForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatPro.acrobatStudioForTeamsPrice).toBeVisible();
      await expect(acrobatPro.acrobatStudioForTeamsFreeTrial).toBeVisible();
      await expect(acrobatPro.acrobatStudioForTeamsFreeTrial).toBeEnabled();
      await expect(acrobatPro.acrobatStudioForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(acrobatPro.acrobatStudioForTeamsBuyNow).toBeVisible();
      await expect(acrobatPro.acrobatStudioForTeamsBuyNow).toBeEnabled();
      await expect(acrobatPro.acrobatStudioForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatPro.businessMerchCardsPricingLink).toBeVisible();
      await expect(acrobatPro.businessMerchCardsPricingLink).toBeEnabled();
      await expect(acrobatPro.businessMerchCardsPricingLink).toHaveCount(1);

      await expect(acrobatPro.merchBusinessViewPlansLink).toBeVisible();
      await expect(acrobatPro.merchBusinessViewPlansLink).toBeEnabled();
      await expect(acrobatPro.merchBusinessViewPlansLink).toHaveAttribute('href', /pricing\/business/);

      await acrobatPro.tabCompareStudentsAndTeachers.click();
      await expect(acrobatPro.tabCompareStudentsAndTeachers).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(acrobatPro.studentsAndTeachersMerchCards.first()).toBeVisible();
      await expect(acrobatPro.studentsAndTeachersMerchCards).toHaveCount(2);

      await expect(acrobatPro.acrobatProForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(acrobatPro.acrobatProForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(acrobatPro.acrobatProForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(acrobatPro.acrobatProForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(acrobatPro.acrobatProForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(acrobatPro.acrobatProForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(acrobatPro.acrobatProForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatPro.creativeCloudForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(acrobatPro.creativeCloudForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(acrobatPro.creativeCloudForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(acrobatPro.creativeCloudForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(acrobatPro.creativeCloudForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(acrobatPro.creativeCloudForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(acrobatPro.creativeCloudForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(acrobatPro.studentsAndTeachersPricingLink).toBeVisible();
      await expect(acrobatPro.studentsAndTeachersPricingLink).toBeEnabled();
      await expect(acrobatPro.studentsAndTeachersPricingLink).toHaveCount(1);

      await expect(acrobatPro.merchStudentsViewPlansLink).toBeVisible();
      await expect(acrobatPro.merchStudentsViewPlansLink).toBeEnabled();
      await expect(acrobatPro.merchStudentsViewPlansLink).toHaveAttribute('href', /pricing\/students/);
    });

    await test.step('Verify Acrobat Pro standard icon block fragment', async () => {
      const iconBlock = acrobatPro.acrobatProStandardIconBlock;
      await iconBlock.scrollIntoViewIfNeeded();
      await expect(iconBlock).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = acrobatPro;
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
      const section = acrobatPro.questionsAboutSection(QUESTIONS_ABOUT_DATA_PATH);
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
      await acrobatPro.footer.scrollIntoViewIfNeeded();
      await expect(acrobatPro.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify visible checkout links are visible and enabled', async () => {
      const checkoutLinks = page.locator('a[is="checkout-link"]');
      const count = await checkoutLinks.count();
      for (let i = 0; i < count; i += 1) {
        const link = checkoutLinks.nth(i);
        // Hidden inactive tabs / collapsed panels: skip — scrollIntoViewIfNeeded times out when not visible.
        if (!(await link.isVisible())) continue;
        await link.scrollIntoViewIfNeeded();
        await expect(link).toBeVisible();
        await expect(link).toBeEnabled();
      }
    });
  });
});
