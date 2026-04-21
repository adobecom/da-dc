import { expect, test } from '@playwright/test';
import FreeTrialPage from './free-trial.page.js';
import { features } from './free-trial.spec.js';

let freeTrialPage;

test.describe('Acrobat Free Trial Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    freeTrialPage = new FreeTrialPage(page);
  });

  test(`${features[0].name}, ${features[0].tags}`, async ({ page }) => {
    const { path } = features[0];
    console.info(`[Free Trial Test] Navigating to: ${path}`);
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    await freeTrialPage.verifyGnavSmoke();

    const acrobatProWithAiPrice = freeTrialPage.getPrice('-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ,bKwlW94xSVU_ykn4WHDjS1eiZrXopDo8VD7UhGAKYBI');
    await expect(acrobatProWithAiPrice).toBeVisible();

    const acrobatProFreeTrial = freeTrialPage.getCheckoutLink('-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ');

    await expect(acrobatProFreeTrial.first()).toBeVisible();
    await expect(acrobatProFreeTrial.first()).toBeEnabled();

    await expect(acrobatProFreeTrial.nth(1)).toBeVisible();
    await expect(acrobatProFreeTrial.nth(1)).toBeEnabled();

    const acrobatProBuyNowLink = freeTrialPage.getCheckoutLink('vQmS1H18A6_kPd0tYBgKnp-TQIF0GbT6p8SH8rWcLMs');
    await acrobatProBuyNowLink.scrollIntoViewIfNeeded();
    await expect(acrobatProBuyNowLink).toBeVisible();
    await expect(acrobatProBuyNowLink).toBeEnabled();

    await freeTrialPage.verifyFooter();
    await freeTrialPage.verifyAllCheckoutLinks();
  });
});
