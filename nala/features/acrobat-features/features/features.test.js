import { expect, test } from '@playwright/test';
import FeaturesPage from './features.page.js';
import { features } from './features.spec.js';
import { checkPageLinks } from '../../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/get-acrobat-support';

let f;

test.describe('Acrobat Features', () => {
  test.beforeEach(async ({ page }) => {
    f = new FeaturesPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Acrobat Features] ${baseURL}${path}`);

    await test.step('Go to Acrobat features page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await f.gnav.waitFor({ state: 'visible' });
      await expect(f.gnav).toBeVisible();
      await expect(f.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(f.heroMarqueeSection).toBeVisible();
    });

    await test.step('Brief settle for below-the-fold', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Verify feature tabs and panel content changes', async () => {
      const tabsContainer = f.tabsFeaturesSection;
      await tabsContainer.scrollIntoViewIfNeeded();
      await expect(tabsContainer).toBeVisible();

      const tabButtons = tabsContainer.locator('button[role="tab"]');
      await expect(tabButtons).toHaveCount(5);

      const tabCount = await tabButtons.count();
      let previousPanelHeading = null;

      for (let i = 0; i < tabCount; i += 1) {
        const tab = tabButtons.nth(i);
        await expect(tab).toBeVisible();
        await expect(tab).toBeEnabled();

        await tab.click();
        await expect(tab).toHaveAttribute('aria-selected', 'true');

        const panelId = await tab.getAttribute('aria-controls');
        const panel = tabsContainer.locator(`#${panelId}`);
        await expect(panel).toBeVisible();

        const heading = panel.locator('h2, h3, h4').first();
        await expect(heading).toBeVisible({ timeout: 60000 });
        const headingText = (await heading.textContent())?.trim() ?? '';
        expect(headingText.length).toBeGreaterThan(0);
        if (previousPanelHeading !== null) {
          expect(headingText).not.toBe(previousPanelHeading);
        }
        previousPanelHeading = headingText;

        await expect(panel.locator('img, h2, h3, h4, p, a, li').first()).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify merch card plans (compare tabs)', async () => {
      const merchTabSettle = { timeout: 60000 };

      const waitAfterMerchCompareTab = async (tab, cardsContainer, cards) => {
        await expect(tab).toHaveAttribute('aria-selected', 'true', merchTabSettle);
        await cardsContainer.waitFor({ state: 'visible', ...merchTabSettle });
        await cards.first().waitFor({ state: 'visible', ...merchTabSettle });
        await page.waitForTimeout(400);
      };

      await f.merchCardPlans.scrollIntoViewIfNeeded();
      await expect(f.merchCardPlans).toBeVisible();
      await expect(f.merchCardPlansTitle).toBeVisible();
      await expect(f.tabCompareIndividuals).toBeVisible();
      await expect(f.tabCompareIndividuals).toBeEnabled();
      await expect(f.tabCompareBusiness).toBeVisible();
      await expect(f.tabCompareBusiness).toBeEnabled();
      await expect(f.tabCompareStudentsAndTeachers).toBeVisible();
      await expect(f.tabCompareStudentsAndTeachers).toBeEnabled();

      await f.tabCompareIndividuals.click();
      await waitAfterMerchCompareTab(
        f.tabCompareIndividuals,
        f.individualMerchCardsContainer,
        f.individualMerchCards,
      );

      await expect(f.individualMerchCards.first()).toBeVisible();
      await expect(f.individualMerchCards).toHaveCount(3);

      await expect(f.acrobatReaderPrice).toBeVisible();
      await expect(f.acrobatReaderLink.first()).toBeVisible();
      await expect(f.acrobatReaderLink.first()).toBeEnabled();

      await expect(f.acrobatProPrice).toBeVisible();
      await expect(f.acrobatProFreeTrial).toBeVisible();
      await expect(f.acrobatProFreeTrial).toBeEnabled();
      await expect(f.acrobatProFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(f.acrobatProBuyNow).toBeVisible();
      await expect(f.acrobatProBuyNow).toBeEnabled();
      await expect(f.acrobatProBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(f.acrobatStudioPrice).toBeVisible();
      await expect(f.acrobatStudioFreeTrial).toBeVisible();
      await expect(f.acrobatStudioFreeTrial).toBeEnabled();
      await expect(f.acrobatStudioFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(f.acrobatStudioBuyNow).toBeVisible();
      await expect(f.acrobatStudioBuyNow).toBeEnabled();
      await expect(f.acrobatStudioBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(f.individualMerchCardsPricingLink).toBeVisible();
      await expect(f.individualMerchCardsPricingLink).toBeEnabled();
      await expect(f.individualMerchCardsPricingLink).toHaveCount(1);

      await expect(f.merchIndividualsComparePlansLink).toBeVisible();
      await expect(f.merchIndividualsComparePlansLink).toBeEnabled();
      await expect(f.merchIndividualsComparePlansLink).toHaveAttribute(
        'href',
        /compare-versions/,
      );

      await f.tabCompareBusiness.click();
      await waitAfterMerchCompareTab(
        f.tabCompareBusiness,
        f.businessMerchCardsContainer,
        f.businessMerchCards,
      );

      await expect(f.businessMerchCards.first()).toBeVisible();
      await expect(f.businessMerchCards).toHaveCount(2);

      await expect(f.acrobatProForTeamsPrice).toBeVisible();
      await expect(f.acrobatProForTeamsFreeTrial).toBeVisible();
      await expect(f.acrobatProForTeamsFreeTrial).toBeEnabled();
      await expect(f.acrobatProForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(f.acrobatProForTeamsBuyNow).toBeVisible();
      await expect(f.acrobatProForTeamsBuyNow).toBeEnabled();
      await expect(f.acrobatProForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(f.acrobatStudioForTeamsPrice).toBeVisible();
      await expect(f.acrobatStudioForTeamsFreeTrial).toBeVisible();
      await expect(f.acrobatStudioForTeamsFreeTrial).toBeEnabled();
      await expect(f.acrobatStudioForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(f.acrobatStudioForTeamsBuyNow).toBeVisible();
      await expect(f.acrobatStudioForTeamsBuyNow).toBeEnabled();
      await expect(f.acrobatStudioForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(f.businessMerchCardsPricingLink).toBeVisible();
      await expect(f.businessMerchCardsPricingLink).toBeEnabled();
      await expect(f.businessMerchCardsPricingLink).toHaveCount(1);

      await expect(f.merchBusinessViewPlansLink).toBeVisible();
      await expect(f.merchBusinessViewPlansLink).toBeEnabled();
      await expect(f.merchBusinessViewPlansLink).toHaveAttribute('href', /pricing\/business/);

      await f.tabCompareStudentsAndTeachers.click();
      await waitAfterMerchCompareTab(
        f.tabCompareStudentsAndTeachers,
        f.studentsAndTeachersContainer,
        f.studentsAndTeachersMerchCards,
      );

      await expect(f.studentsAndTeachersMerchCards.first()).toBeVisible();
      await expect(f.studentsAndTeachersMerchCards).toHaveCount(2);

      await expect(f.acrobatProForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(f.acrobatProForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(f.acrobatProForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(f.acrobatProForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(f.acrobatProForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(f.acrobatProForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(f.acrobatProForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(f.creativeCloudForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(f.creativeCloudForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(f.creativeCloudForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(f.creativeCloudForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(f.creativeCloudForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(f.creativeCloudForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(f.creativeCloudForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(f.studentsAndTeachersPricingLink).toBeVisible();
      await expect(f.studentsAndTeachersPricingLink).toBeEnabled();
      await expect(f.studentsAndTeachersPricingLink).toHaveCount(1);

      await expect(f.merchStudentsViewPlansLink).toBeVisible();
      await expect(f.merchStudentsViewPlansLink).toBeEnabled();
      await expect(f.merchStudentsViewPlansLink).toHaveAttribute('href', /pricing\/students/);
    });

    await test.step('Verify Questions about / get Acrobat support section', async () => {
      const section = f.questionsAboutSection(QUESTIONS_ABOUT_DATA_PATH);
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
      await f.footer.scrollIntoViewIfNeeded();
      await expect(f.footer).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify visible checkout links are visible and enabled', async () => {
      const checkoutLinks = page.locator('a[is="checkout-link"]');
      const count = await checkoutLinks.count();
      for (let i = 0; i < count; i += 1) {
        const link = checkoutLinks.nth(i);
        // Hidden inactive tabs / panels: skip — scrollIntoViewIfNeeded times out when not visible.
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
