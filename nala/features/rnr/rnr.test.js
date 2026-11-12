import { expect, test } from '@playwright/test';
import { features } from './rnr.spec.js';
import Rnr, {
  COMMENTS_MAX_LENGTH,
  REVIEWS_URL,
  fakeRatingsError,
  fakeReviewPost,
  formatAverage,
  votesFromHistogram,
  waitForRatingsResponse,
} from '../../libs/blocks/rnr.js';
import { runAccessibilityTest } from '../../libs/accessibility.js';

const [en, fr] = features;
const miloLibs = process.env.MILO_LIBS || '';
const COMMENT = 'Nala test comment 20';
const ACTIVE = 'is-active';

function pageUrl(baseURL, path) {
  return `${baseURL}${path}${miloLibs}`;
}

/** Collects uncaught page errors that come from the RnR block only. Other scripts on the page are ignored. */
function collectRnrErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => {
    if (/rnr/i.test(`${error.stack || ''} ${error.message}`)) errors.push(error.message);
  });
  return errors;
}

function waitForReviewPost(page) {
  return page.waitForRequest((req) => REVIEWS_URL.test(req.url()) && req.method() === 'POST');
}

async function submitReview(page, rnr, rating) {
  await rnr.waitForStablePosition();
  await rnr.star(rating).click();
  await expect(rnr.commentsFieldset).toBeVisible();
  await rnr.comments.fill(COMMENT);
  const reviewPost = waitForReviewPost(page);
  await rnr.submit.click();
  return reviewPost;
}

async function verifyReviewRequest(request, { verb, locale, rating }) {
  expect(request.postDataJSON()).toEqual({
    assetType: 'ADOBE_COM',
    assetId: verb,
    rating,
    text: COMMENT,
    authorName: 'Anonymous',
    assetMetadata: { locale },
  });
  const headers = await request.allHeaders();
  expect(headers['x-api-key']).toBe('dc-general');
  expect(headers.authorization).toBeTruthy();
}

async function verifyThankYou(rnr) {
  await expect(rnr.thankYou).toBeVisible();
  await expect(rnr.thankYou).not.toBeEmpty();
  await expect(rnr.thankYou).toHaveAttribute('role', 'alert');
  await expect(rnr.form).toHaveCount(0);
  await expect(rnr.summary).toHaveCount(0);
}

test.describe('Ratings and Reviews (RnR) block test suite', () => {
  test(`${en.name} live ratings data,${en.tags}`, async ({ page, baseURL }) => {
    const rnr = new Rnr(page);
    const { data } = en;
    let ratings;

    await test.step('Go to the test page and wait for the ratings data', async () => {
      await rnr.trackBlockJsonLd();
      const ratingsResponse = waitForRatingsResponse(page);
      await page.goto(pageUrl(baseURL, en.path), { waitUntil: 'domcontentloaded' });
      const response = await ratingsResponse;
      expect(response.status()).toBe(200);
      expect(new URL(response.url()).searchParams.get('assetId')).toBe(data.verb);
      ratings = await response.json();
    });

    await test.step('Verify the block renders with live data', async () => {
      await rnr.verifySmoke();
    });

    await test.step('Verify the summary matches the ratings data', async () => {
      await expect(rnr.average).toHaveText(formatAverage(ratings.overallRating));
      await expect(rnr.votes).toHaveText(String(votesFromHistogram(ratings.ratingHistogram)));
    });

    await test.step('Verify the star labels', async () => {
      for (let value = 1; value <= 5; value += 1) {
        await expect(rnr.star(value)).toHaveAttribute('aria-label', new RegExp(`^\\S.*\\s${value}\\s\\S+$`));
        await expect(rnr.star(value)).toHaveAttribute('aria-checked', 'false');
      }
    });

    await test.step('Verify the SEO rating data (JSON-LD)', async () => {
      const { productName, entityUrl } = await page.evaluate(() => {
        const canonical = document.head.querySelector('link[rel="canonical"]')?.href;
        const url = new URL(canonical || window.location.href);
        return {
          productName: document.head.querySelector('meta[name="product-name"]')?.content || null,
          entityUrl: `${url.origin}${url.pathname}`,
        };
      });
      const votes = votesFromHistogram(ratings.ratingHistogram);
      const entries = await rnr.readBlockJsonLd();

      if (!productName || votes === 0) {
        test.info().annotations.push({ type: 'JSON-LD', description: 'No product-name metadata or 0 votes: the block adds no rating data.' });
        expect(entries).toHaveLength(0);
        return;
      }

      expect(entries).toHaveLength(1);
      expect(entries[0].name).toBe(productName);
      expect(entries[0].aggregateRating).toEqual({
        '@id': `${entityUrl}#aggregaterating`,
        '@type': 'AggregateRating',
        ratingValue: String(ratings.overallRating),
        ratingCount: String(votes),
        bestRating: '5',
        worstRating: '1',
      });

      // Milo's JSON-LD graph manager merges the block data with the page data. Search engines read the result.
      await expect.poll(() => rnr.readPageRatings(), { message: 'The page has 1 rating with the live data' }).toEqual([
        expect.objectContaining({
          name: productName,
          aggregateRating: expect.objectContaining({
            ratingValue: String(ratings.overallRating),
            ratingCount: String(votes),
            bestRating: '5',
            worstRating: '1',
          }),
        }),
      ]);
    });

    await test.step('Verify the block fits in the viewport', async () => {
      const box = await rnr.container.boundingBox();
      const { width } = page.viewportSize();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    });

    await test.step('Verify accessibility of the block', async () => {
      await runAccessibilityTest({ page, testScope: rnr.root });
    });
  });

  test(`${en.name} star hover and comments,${en.tags}`, async ({ page, baseURL, isMobile }) => {
    const rnr = new Rnr(page);
    const reviewRequests = await fakeReviewPost(page);

    await test.step('Go to the test page', async () => {
      await page.goto(pageUrl(baseURL, en.path), { waitUntil: 'domcontentloaded' });
      await rnr.scrollIntoView();
      await rnr.waitForStablePosition();
    });

    if (!isMobile) {
      await test.step('Verify the stars fill on hover and reset after', async () => {
        await rnr.star(4).hover();
        await expect(rnr.star(4)).toHaveClass(/is-hovering/);
        await expect.poll(() => rnr.starsWithClass(ACTIVE)).toEqual([1, 2, 3, 4]);

        await rnr.title.hover();
        await expect.poll(() => rnr.starsWithClass('is-hovering')).toEqual([]);
        await expect.poll(() => rnr.starsWithClass(ACTIVE)).toEqual([]);
      });
    }

    await test.step('Select a star and verify the comments box', async () => {
      await expect(rnr.commentsFieldset).toHaveCount(0);
      await rnr.star(3).click();
      await expect(rnr.commentsFieldset).toBeVisible();
      expect(await rnr.checkedStars()).toEqual([3]);
      await expect.poll(() => rnr.starsWithClass(ACTIVE)).toEqual([1, 2, 3]);
      await expect(rnr.comments).toHaveAttribute('maxlength', String(COMMENTS_MAX_LENGTH));
      await expect(rnr.counter).toHaveText(`${COMMENTS_MAX_LENGTH} / ${COMMENTS_MAX_LENGTH}`);
      await expect(rnr.submit).toBeDisabled();
    });

    await test.step('Verify the character counter and the submit button', async () => {
      await rnr.comments.fill(COMMENT);
      await expect(rnr.counter).toHaveText(`${COMMENTS_MAX_LENGTH - COMMENT.length} / ${COMMENTS_MAX_LENGTH}`);
      await expect(rnr.submit).toBeEnabled();

      await rnr.comments.fill('');
      await expect(rnr.counter).toHaveText(`${COMMENTS_MAX_LENGTH} / ${COMMENTS_MAX_LENGTH}`);
      await expect(rnr.submit).toBeDisabled();
    });

    await test.step('Verify no review is sent before submit', async () => {
      expect(reviewRequests).toHaveLength(0);
    });
  });

  test(`${en.name} submit and locked state,${en.tags}`, async ({ page, baseURL }) => {
    const rnr = new Rnr(page);
    const { data } = en;
    const reviewRequests = await fakeReviewPost(page);

    await test.step('Go to the test page', async () => {
      await page.goto(pageUrl(baseURL, en.path), { waitUntil: 'domcontentloaded' });
      await rnr.scrollIntoView();
    });

    await test.step('Submit a 3-star review and verify the request', async () => {
      const request = await submitReview(page, rnr, 3);
      await verifyReviewRequest(request, { verb: data.verb, locale: data.locale, rating: 3 });
      expect(reviewRequests).toHaveLength(1);
    });

    await test.step('Verify the thank-you message replaces the form', async () => {
      await verifyThankYou(rnr);
    });

    await test.step('Reload and verify the rating is locked', async () => {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await rnr.scrollIntoView();
      await expect(rnr.stars).toHaveCount(5);
      for (let value = 1; value <= 5; value += 1) {
        await expect(rnr.star(value)).toBeDisabled();
      }
      expect(await rnr.checkedStars()).toEqual([1, 2, 3]);
      expect(await rnr.starsWithClass(ACTIVE)).toEqual([1, 2, 3]);
      await expect(rnr.title).toHaveCount(0);
    });

    await test.step('Verify the lock applies only to this verb', async () => {
      await page.goto(pageUrl(baseURL, data.otherVerbPath), { waitUntil: 'domcontentloaded' });
      await rnr.verifySmoke();
      expect(await rnr.checkedStars()).toEqual([]);
      expect(reviewRequests).toHaveLength(1);
    });
  });

  test(`${en.name} keyboard,${en.tags}`, async ({ page, baseURL, isMobile }) => {
    test.skip(isMobile, 'Keyboard navigation applies to desktop only');
    const rnr = new Rnr(page);
    await fakeReviewPost(page);

    await test.step('Go to the test page', async () => {
      await page.goto(pageUrl(baseURL, en.path), { waitUntil: 'domcontentloaded' });
      await rnr.scrollIntoView();
    });

    await test.step('Move between stars with the arrow keys', async () => {
      await rnr.star(1).focus();
      await expect(rnr.star(1)).toHaveClass(/has-keyboard-focus/);

      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await expect(rnr.star(3)).toBeFocused();
      await expect(rnr.star(3)).toHaveClass(/has-keyboard-focus/);
      await expect.poll(() => rnr.starsWithClass(ACTIVE)).toEqual([1, 2, 3]);

      await page.keyboard.press('ArrowLeft');
      await expect(rnr.star(2)).toBeFocused();
      await page.keyboard.press('ArrowRight');
      await expect(rnr.star(3)).toBeFocused();
    });

    await test.step('Escape removes the focus style', async () => {
      await page.keyboard.press('Escape');
      await expect(rnr.star(3)).not.toHaveClass(/has-keyboard-focus/);
    });

    await test.step('Enter selects the star and opens the comments box', async () => {
      await page.keyboard.press('Enter');
      await expect(rnr.star(3)).toHaveAttribute('aria-checked', 'true');
      await expect(rnr.commentsFieldset).toBeVisible();
    });
  });

  test(`${fr.name} localized labels and review locale,${fr.tags}`, async ({ page, baseURL }) => {
    const rnr = new Rnr(page);
    const { data } = fr;
    await fakeReviewPost(page);

    await test.step('Go to the French page and wait for the ratings data', async () => {
      const ratingsResponse = waitForRatingsResponse(page);
      await page.goto(pageUrl(baseURL, fr.path), { waitUntil: 'domcontentloaded' });
      const response = await ratingsResponse;
      expect(response.status()).toBe(200);
      expect(new URL(response.url()).searchParams.get('assetId')).toBe(data.verb);
    });

    await test.step('Verify the block shows French labels', async () => {
      await rnr.verifySmoke();
      await expect(rnr.title).not.toHaveText(data.englishTitle);
    });

    await test.step('Submit a review and verify the French locale', async () => {
      const request = await submitReview(page, rnr, 3);
      await verifyReviewRequest(request, { verb: data.verb, locale: data.locale, rating: 3 });
      await verifyThankYou(rnr);
    });
  });

  test(`${en.name} ratings service error,${en.tags} @rnr-negative`, async ({ page, baseURL }) => {
    const rnr = new Rnr(page);
    const rnrErrors = collectRnrErrors(page);
    const ratingsRequests = await fakeRatingsError(page);
    await fakeReviewPost(page);

    await test.step('Go to the test page with a failed ratings call', async () => {
      await rnr.trackBlockJsonLd();
      await page.goto(pageUrl(baseURL, en.path), { waitUntil: 'domcontentloaded' });
      await rnr.scrollIntoView();
      expect(ratingsRequests.length).toBeGreaterThan(0);
    });

    await test.step('Verify the block stays usable', async () => {
      await expect(rnr.stars).toHaveCount(5);
      await expect(rnr.star(3)).toBeEnabled();
      await expect(rnr.summary).toBeVisible();
      test.info().annotations.push({ type: 'Current summary on error', description: await rnr.summary.innerText() });
      await rnr.waitForStablePosition();
      await rnr.star(3).click();
      await expect(rnr.commentsFieldset).toBeVisible();
    });

    await test.step('Verify no SEO rating data and no block errors', async () => {
      expect(await rnr.readBlockJsonLd()).toHaveLength(0);
      expect(rnrErrors).toEqual([]);
    });
  });

  test(`${en.name} submit service error,${en.tags} @rnr-negative`, async ({ page, baseURL }) => {
    const rnr = new Rnr(page);
    const rnrErrors = collectRnrErrors(page);
    const reviewRequests = await fakeReviewPost(page, { status: 500 });

    await test.step('Go to the test page', async () => {
      await page.goto(pageUrl(baseURL, en.path), { waitUntil: 'domcontentloaded' });
      await rnr.scrollIntoView();
    });

    await test.step('Submit a review that fails and verify the thank-you message', async () => {
      await submitReview(page, rnr, 3);
      await verifyThankYou(rnr);
      expect(reviewRequests).toHaveLength(1);
      expect(rnrErrors).toEqual([]);
    });
  });
});
