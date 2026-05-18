import { expect, test } from '@playwright/test';
import ModifyPdfsPage from './modify-pdfs.page.js';
import { features } from './modify-pdfs.spec.js';
import { checkPageLinks } from '../../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/get-acrobat-support';

let modifyPdfsPage;

test.describe('Acrobat Features — Modify PDFs', () => {
  test.beforeEach(async ({ page }) => {
    modifyPdfsPage = new ModifyPdfsPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Acrobat Features — Modify PDFs] ${baseURL}${path}`);

    await test.step('Go to Modify PDFs feature page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await modifyPdfsPage.gnav.waitFor({ state: 'visible' });
      await expect(modifyPdfsPage.gnav).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(modifyPdfsPage.heroMarquee).toBeVisible();
    });

    await test.step('Verify media + con-block promos (4)', async () => {
      await expect(modifyPdfsPage.mediaConBlocks).toHaveCount(5);
      for (let i = 0; i < 4; i += 1) {
        const block = modifyPdfsPage.mediaConBlocks.nth(i);
        await block.scrollIntoViewIfNeeded();
        await expect(block).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Verify aside Reader + Chrome extension links', async () => {
      const count = await modifyPdfsPage.asideBlocks.count();
      expect(count).toEqual(2);
      const strip = modifyPdfsPage.asideBlocks.first();
      await strip.scrollIntoViewIfNeeded();
      await expect(strip).toBeVisible({ timeout: 60000 });
      const links = strip.locator('a');
      await expect(links).toHaveCount(2);
      await expect(links.nth(0)).toBeVisible();
      await expect(links.nth(0)).toBeEnabled();
      await expect(links.nth(0)).toHaveAttribute('href', /acrobat-reader/);
      await expect(links.nth(1)).toBeVisible();
      await expect(links.nth(1)).toBeEnabled();
      await expect(links.nth(1)).toHaveAttribute('href', /chrome\.google/);
      await expect(modifyPdfsPage.asideBlocks.last()).toBeVisible();
    });

    await test.step('Verify editorial cards (3)', async () => {
      await expect(modifyPdfsPage.editorialCards).toHaveCount(3);
      for (let i = 0; i < 3; i += 1) {
        const card = modifyPdfsPage.editorialCards.nth(i);
        await card.scrollIntoViewIfNeeded();
        await expect(card).toBeVisible({ timeout: 60000 });
        const cta = card.locator('a').first();
        await expect(cta).toBeVisible();
        await expect(cta).toBeEnabled();
      }
    });

    await test.step('Verify merch card plans (compare tabs)', async () => {
      const m = modifyPdfsPage.merchCards;

      await expect(m.merchCardPlans).toBeVisible();
      await expect(m.merchCardPlansTitle).toBeVisible();
      await expect(m.tabCompareIndividuals).toBeVisible();
      await expect(m.tabCompareIndividuals).toBeEnabled();
      await expect(m.tabCompareBusiness).toBeVisible();
      await expect(m.tabCompareBusiness).toBeEnabled();
      await expect(m.tabCompareStudentsAndTeachers).toBeVisible();
      await expect(m.tabCompareStudentsAndTeachers).toBeEnabled();

      await m.tabCompareIndividuals.click();
      await expect(m.tabCompareIndividuals).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(m.individualMerchCards.first()).toBeVisible();
      await expect(m.individualMerchCards).toHaveCount(3);

      await expect(m.acrobatReaderPrice).toBeVisible();
      await expect(m.acrobatReaderLink.first()).toBeVisible();
      await expect(m.acrobatReaderLink.first()).toBeEnabled();

      await expect(m.acrobatProPrice).toBeVisible();
      await expect(m.acrobatProFreeTrial).toBeVisible();
      await expect(m.acrobatProFreeTrial).toBeEnabled();
      await expect(m.acrobatProFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(m.acrobatProBuyNow).toBeVisible();
      await expect(m.acrobatProBuyNow).toBeEnabled();
      await expect(m.acrobatProBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(m.acrobatStudioPrice).toBeVisible();
      await expect(m.acrobatStudioFreeTrial).toBeVisible();
      await expect(m.acrobatStudioFreeTrial).toBeEnabled();
      await expect(m.acrobatStudioFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(m.acrobatStudioBuyNow).toBeVisible();
      await expect(m.acrobatStudioBuyNow).toBeEnabled();
      await expect(m.acrobatStudioBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(m.individualMerchCardsPricingLink).toBeVisible();
      await expect(m.individualMerchCardsPricingLink).toBeEnabled();
      await expect(m.individualMerchCardsPricingLink).toHaveCount(1);

      await expect(modifyPdfsPage.merchIndividualsComparePlansLink).toBeVisible();
      await expect(modifyPdfsPage.merchIndividualsComparePlansLink).toBeEnabled();
      await expect(modifyPdfsPage.merchIndividualsComparePlansLink).toHaveAttribute(
        'href',
        /compare-versions|compare-pricing/,
      );

      await m.tabCompareBusiness.click();
      await expect(m.tabCompareBusiness).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(m.businessMerchCards.first()).toBeVisible();
      await expect(m.businessMerchCards).toHaveCount(2);

      await expect(m.acrobatProForTeamsPrice).toBeVisible();
      await expect(m.acrobatProForTeamsFreeTrial).toBeVisible();
      await expect(m.acrobatProForTeamsFreeTrial).toBeEnabled();
      await expect(m.acrobatProForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(m.acrobatProForTeamsBuyNow).toBeVisible();
      await expect(m.acrobatProForTeamsBuyNow).toBeEnabled();
      await expect(m.acrobatProForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(m.acrobatStudioForTeamsPrice).toBeVisible();
      await expect(m.acrobatStudioForTeamsFreeTrial).toBeVisible();
      await expect(m.acrobatStudioForTeamsFreeTrial).toBeEnabled();
      await expect(m.acrobatStudioForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(m.acrobatStudioForTeamsBuyNow).toBeVisible();
      await expect(m.acrobatStudioForTeamsBuyNow).toBeEnabled();
      await expect(m.acrobatStudioForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(m.businessMerchCardsPricingLink).toBeVisible();
      await expect(m.businessMerchCardsPricingLink).toBeEnabled();
      await expect(m.businessMerchCardsPricingLink).toHaveCount(1);

      await expect(modifyPdfsPage.merchBusinessViewPlansLink).toBeVisible();
      await expect(modifyPdfsPage.merchBusinessViewPlansLink).toBeEnabled();
      await expect(modifyPdfsPage.merchBusinessViewPlansLink).toHaveAttribute('href', /pricing\/business/);

      await m.tabCompareStudentsAndTeachers.click();
      await expect(m.tabCompareStudentsAndTeachers).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(m.studentsAndTeachersMerchCards.first()).toBeVisible();
      await expect(m.studentsAndTeachersMerchCards).toHaveCount(2);

      await expect(m.acrobatProForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(m.acrobatProForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(m.acrobatProForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(m.acrobatProForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(m.acrobatProForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(m.acrobatProForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(m.acrobatProForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(m.creativeCloudForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(m.creativeCloudForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(m.creativeCloudForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(m.creativeCloudForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(m.creativeCloudForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(m.creativeCloudForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(m.creativeCloudForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(m.studentsAndTeachersPricingLink).toBeVisible();
      await expect(m.studentsAndTeachersPricingLink).toBeEnabled();
      await expect(m.studentsAndTeachersPricingLink).toHaveCount(1);

      await expect(modifyPdfsPage.merchStudentsViewPlansLink).toBeVisible();
      await expect(modifyPdfsPage.merchStudentsViewPlansLink).toBeEnabled();
      await expect(modifyPdfsPage.merchStudentsViewPlansLink).toHaveAttribute('href', /pricing\/students/);
    });

    await test.step('Verify four-up section', async () => {
      const fourUp = modifyPdfsPage.fourUpSection.first();
      await fourUp.waitFor({ state: 'attached', timeout: 60000 });
      await fourUp.scrollIntoViewIfNeeded();
      await expect(fourUp).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify Questions about / get Acrobat support section', async () => {
      const section = modifyPdfsPage.page.locator(`div[data-path*="${QUESTIONS_ABOUT_DATA_PATH}"]`);
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
      await modifyPdfsPage.footer.scrollIntoViewIfNeeded();
      await expect(modifyPdfsPage.footer).toBeVisible({ timeout: 60000 });
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
