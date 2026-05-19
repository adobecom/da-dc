import { expect, test } from '@playwright/test';
import ExportPdfPage from './export-pdf.page.js';
import { features } from './export-pdf.spec.js';
import checkPageLinks from '../../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/get-acrobat-support';

let exportPdfPage;

test.describe('Acrobat Features — Export PDF', () => {
  test.beforeEach(async ({ page }) => {
    exportPdfPage = new ExportPdfPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[Acrobat Features — Export PDF] ${baseURL}${path}`);

    await test.step('Go to Export PDF feature page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke)', async () => {
      await exportPdfPage.gnav.waitFor({ state: 'visible' });
      await expect(exportPdfPage.gnav).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(exportPdfPage.heroMarquee).toBeVisible();
    });

    await test.step('Verify media + con-block promos outside hero (2)', async () => {
      const blocks = exportPdfPage.mediaConBlocksOutsideHero;
      await expect(blocks).toHaveCount(2);
      for (let i = 0; i < 2; i += 1) {
        const block = blocks.nth(i);
        await block.scrollIntoViewIfNeeded();
        await expect(block).toBeVisible({ timeout: 60000 });
        await expect(block).not.toHaveClass(/hero-marquee/);
      }
    });

    await test.step('Verify aside Reader + Chrome extension links', async () => {
      const count = await exportPdfPage.asideBlocks.count();
      expect(count).toEqual(2);
      const strip = exportPdfPage.asideBlocks.first();
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
      await expect(exportPdfPage.asideBlocks.last()).toBeVisible();
    });

    await test.step('Verify editorial cards (4)', async () => {
      await expect(exportPdfPage.editorialCards).toHaveCount(4);
      for (let i = 0; i < 4; i += 1) {
        const card = exportPdfPage.editorialCards.nth(i);
        await card.scrollIntoViewIfNeeded();
        await expect(card).toBeVisible({ timeout: 60000 });
        const cta = card.locator('a').first();
        await expect(cta).toBeVisible();
        await expect(cta).toBeEnabled();
      }
    });

    await test.step('Verify merch card plans (compare tabs)', async () => {
      const m = exportPdfPage.merchCards;

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

      await expect(exportPdfPage.merchIndividualsComparePlansLink).toBeVisible();
      await expect(exportPdfPage.merchIndividualsComparePlansLink).toBeEnabled();
      await expect(exportPdfPage.merchIndividualsComparePlansLink).toHaveAttribute(
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

      await expect(exportPdfPage.merchBusinessViewPlansLink).toBeVisible();
      await expect(exportPdfPage.merchBusinessViewPlansLink).toBeEnabled();
      await expect(exportPdfPage.merchBusinessViewPlansLink).toHaveAttribute('href', /pricing\/business/);

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

      await expect(exportPdfPage.merchStudentsViewPlansLink).toBeVisible();
      await expect(exportPdfPage.merchStudentsViewPlansLink).toBeEnabled();
      await expect(exportPdfPage.merchStudentsViewPlansLink).toHaveAttribute('href', /pricing\/students/);
    });

    await test.step('Verify four-up section', async () => {
      const fourUp = exportPdfPage.fourUpSection.first();
      await fourUp.waitFor({ state: 'attached', timeout: 60000 });
      await fourUp.scrollIntoViewIfNeeded();
      await expect(fourUp).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify Questions about / get Acrobat support section', async () => {
      const section = exportPdfPage.page.locator(`div[data-path*="${QUESTIONS_ABOUT_DATA_PATH}"]`);
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
      await exportPdfPage.footer.scrollIntoViewIfNeeded();
      await expect(exportPdfPage.footer).toBeVisible({ timeout: 60000 });
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
  });
});
