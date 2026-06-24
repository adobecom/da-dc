import { expect, test } from '@playwright/test';
import PdfReaderPage from './pdf-reader.page.js';
import { features } from './pdf-reader.spec.js';
import checkPageLinks from '../../utils/link-checker.js';

const QUESTIONS_ABOUT_DATA_PATH = '/dc-shared/fragments/acrobat/get-acrobat-support';

let pdfReader;

test.describe('Acrobat PDF Reader Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    pdfReader = new PdfReaderPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    console.info(`[PDF Reader Test] ${baseURL}${path}`);

    await test.step('Go to PDF Reader page', async () => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify global nav (smoke) and breadcrumbs', async () => {
      await pdfReader.gnav.waitFor({ state: 'visible' });
      await expect(pdfReader.gnav).toBeVisible();
      await expect(pdfReader.gnavBreadcrumbs).toBeVisible();
    });

    await test.step('Verify hero marquee', async () => {
      await expect(pdfReader.heroMarquee).toBeVisible();
    });

    await test.step('Verify Reader download link in hero (get.adobe.com)', async () => {
      const link = pdfReader.heroReaderDownloadLink.first();
      await expect(link).toBeVisible();
      await expect(link).toBeEnabled();
      await expect(link).toHaveAttribute('href', /get\.adobe\.com/);
    });

    await test.step('Verify first three-up section', async () => {
      const threeUp = pdfReader.firstThreeUpSection;
      await threeUp.scrollIntoViewIfNeeded();
      await expect(threeUp).toBeVisible();
    });

    await test.step('Verify split-image block', async () => {
      const block = pdfReader.splitImageBlock;
      await block.scrollIntoViewIfNeeded();
      await expect(block).toBeVisible({ timeout: 60000 });
    });

    // -------------------------------------------------------------------------
    // Skipped: “Download now” / install block — not part of this smoke (see product / scope).
    // -------------------------------------------------------------------------

    await test.step('Verify merch card plans (compare tabs)', async () => {
      await expect(pdfReader.merchCardPlans).toBeVisible();
      await expect(pdfReader.merchCardPlansTitle).toBeVisible();
      await expect(pdfReader.tabCompareIndividuals).toBeVisible();
      await expect(pdfReader.tabCompareIndividuals).toBeEnabled();
      await expect(pdfReader.tabCompareBusiness).toBeVisible();
      await expect(pdfReader.tabCompareBusiness).toBeEnabled();
      await expect(pdfReader.tabCompareStudentsAndTeachers).toBeVisible();
      await expect(pdfReader.tabCompareStudentsAndTeachers).toBeEnabled();

      await pdfReader.tabCompareIndividuals.click();
      await expect(pdfReader.tabCompareIndividuals).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(pdfReader.individualMerchCards.first()).toBeVisible();
      await expect(pdfReader.individualMerchCards).toHaveCount(3);

      await expect(pdfReader.acrobatReaderPrice).toBeVisible();
      await expect(pdfReader.acrobatReaderLink.first()).toBeVisible();
      await expect(pdfReader.acrobatReaderLink.first()).toBeEnabled();

      await expect(pdfReader.acrobatProPrice).toBeVisible();
      await expect(pdfReader.acrobatProFreeTrial).toBeVisible();
      await expect(pdfReader.acrobatProFreeTrial).toBeEnabled();
      await expect(pdfReader.acrobatProFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(pdfReader.acrobatProBuyNow).toBeVisible();
      await expect(pdfReader.acrobatProBuyNow).toBeEnabled();
      await expect(pdfReader.acrobatProBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(pdfReader.acrobatStudioPrice).toBeVisible();
      await expect(pdfReader.acrobatStudioFreeTrial).toBeVisible();
      await expect(pdfReader.acrobatStudioFreeTrial).toBeEnabled();
      await expect(pdfReader.acrobatStudioFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(pdfReader.acrobatStudioBuyNow).toBeVisible();
      await expect(pdfReader.acrobatStudioBuyNow).toBeEnabled();
      await expect(pdfReader.acrobatStudioBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(pdfReader.individualMerchCardsPricingLink).toBeVisible();
      await expect(pdfReader.individualMerchCardsPricingLink).toBeEnabled();
      await expect(pdfReader.individualMerchCardsPricingLink).toHaveCount(1);

      await expect(pdfReader.merchIndividualsComparePlansLink).toBeVisible();
      await expect(pdfReader.merchIndividualsComparePlansLink).toBeEnabled();
      await expect(pdfReader.merchIndividualsComparePlansLink).toHaveAttribute(
        'href',
        /compare-versions|compare-pricing/,
      );

      await pdfReader.tabCompareBusiness.click();
      await expect(pdfReader.tabCompareBusiness).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(pdfReader.businessMerchCards.first()).toBeVisible();
      await expect(pdfReader.businessMerchCards).toHaveCount(2);

      await expect(pdfReader.acrobatProForTeamsPrice).toBeVisible();
      await expect(pdfReader.acrobatProForTeamsFreeTrial).toBeVisible();
      await expect(pdfReader.acrobatProForTeamsFreeTrial).toBeEnabled();
      await expect(pdfReader.acrobatProForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(pdfReader.acrobatProForTeamsBuyNow).toBeVisible();
      await expect(pdfReader.acrobatProForTeamsBuyNow).toBeEnabled();
      await expect(pdfReader.acrobatProForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(pdfReader.acrobatStudioForTeamsPrice).toBeVisible();
      await expect(pdfReader.acrobatStudioForTeamsFreeTrial).toBeVisible();
      await expect(pdfReader.acrobatStudioForTeamsFreeTrial).toBeEnabled();
      await expect(pdfReader.acrobatStudioForTeamsFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(pdfReader.acrobatStudioForTeamsBuyNow).toBeVisible();
      await expect(pdfReader.acrobatStudioForTeamsBuyNow).toBeEnabled();
      await expect(pdfReader.acrobatStudioForTeamsBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(pdfReader.businessMerchCardsPricingLink).toBeVisible();
      await expect(pdfReader.businessMerchCardsPricingLink).toBeEnabled();
      await expect(pdfReader.businessMerchCardsPricingLink).toHaveCount(1);

      await expect(pdfReader.merchBusinessViewPlansLink).toBeVisible();
      await expect(pdfReader.merchBusinessViewPlansLink).toBeEnabled();
      await expect(pdfReader.merchBusinessViewPlansLink).toHaveAttribute('href', /pricing\/business/);

      await pdfReader.tabCompareStudentsAndTeachers.click();
      await expect(pdfReader.tabCompareStudentsAndTeachers).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(400);

      await expect(pdfReader.studentsAndTeachersMerchCards.first()).toBeVisible();
      await expect(pdfReader.studentsAndTeachersMerchCards).toHaveCount(2);

      await expect(pdfReader.acrobatProForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(pdfReader.acrobatProForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(pdfReader.acrobatProForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(pdfReader.acrobatProForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(pdfReader.acrobatProForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(pdfReader.acrobatProForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(pdfReader.acrobatProForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(pdfReader.creativeCloudForStudentsAndTeachersPrice.first()).toBeVisible();
      await expect(pdfReader.creativeCloudForStudentsAndTeachersFreeTrial).toBeVisible();
      await expect(pdfReader.creativeCloudForStudentsAndTeachersFreeTrial).toBeEnabled();
      await expect(pdfReader.creativeCloudForStudentsAndTeachersFreeTrial).toHaveAttribute('href', /ot=TRIAL/);
      await expect(pdfReader.creativeCloudForStudentsAndTeachersBuyNow).toBeVisible();
      await expect(pdfReader.creativeCloudForStudentsAndTeachersBuyNow).toBeEnabled();
      await expect(pdfReader.creativeCloudForStudentsAndTeachersBuyNow).toHaveAttribute('href', /ot=BASE/);

      await expect(pdfReader.studentsAndTeachersPricingLink).toBeVisible();
      await expect(pdfReader.studentsAndTeachersPricingLink).toBeEnabled();
      await expect(pdfReader.studentsAndTeachersPricingLink).toHaveCount(1);

      await expect(pdfReader.merchStudentsViewPlansLink).toBeVisible();
      await expect(pdfReader.merchStudentsViewPlansLink).toBeEnabled();
      await expect(pdfReader.merchStudentsViewPlansLink).toHaveAttribute('href', /pricing\/students/);
    });

    await test.step('Verify FAQ accordion', async () => {
      const { faqSection, faqAccordionTriggers } = pdfReader;
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

    await test.step('Verify system requirements and volume distribution links', async () => {
      const sysReq = pdfReader.systemRequirementsLink.first();
      await sysReq.scrollIntoViewIfNeeded();
      await expect(sysReq).toBeVisible();
      await expect(sysReq).toBeEnabled();
      await expect(sysReq).toHaveAttribute('href', /system-requirements/);

      const volDist = pdfReader.volumeDistributionLink.first();
      await volDist.scrollIntoViewIfNeeded();
      await expect(volDist).toBeVisible();
      await expect(volDist).toBeEnabled();
      await expect(volDist).toHaveAttribute('href', /volume-distribution/);
    });

    await test.step('Verify Questions about / get Acrobat support section', async () => {
      const section = pdfReader.questionsAboutSection(QUESTIONS_ABOUT_DATA_PATH);
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
      await pdfReader.footer.scrollIntoViewIfNeeded();
      await expect(pdfReader.footer).toBeVisible({ timeout: 60000 });
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
