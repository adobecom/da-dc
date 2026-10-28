import { expect } from '@playwright/test';

export const RATINGS_URL = /\/v1\/ratings\?/;
export const REVIEWS_URL = /\/v1\/reviews(\?|$)/;
export const COMMENTS_MAX_LENGTH = 500;

const CORS_ALLOW_HEADERS = 'accept, authorization, content-type, x-api-key';

function corsHeaders(route) {
  return {
    'access-control-allow-origin': route.request().headers().origin || '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': CORS_ALLOW_HEADERS,
  };
}

/**
 * Fulfills requests that match `url` with a fake response, so the block never
 * reaches the real ratings service. Returns the list of intercepted requests.
 */
async function fakeRnrApi(page, url, { method, status, body = {} }) {
  const requests = [];
  await page.route(url, async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders(route) });
      return;
    }
    if (request.method() !== method) {
      await route.continue();
      return;
    }
    requests.push(request);
    await route.fulfill({
      status,
      headers: corsHeaders(route),
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  return requests;
}

/** Fakes `POST /v1/reviews`. Use it in every test that selects a star, so no real review is sent. */
export function fakeReviewPost(page, { status = 201 } = {}) {
  const body = status < 400 ? {} : { message: 'Nala fake error' };
  return fakeRnrApi(page, REVIEWS_URL, { method: 'POST', status, body });
}

export function fakeRatingsError(page, { status = 500 } = {}) {
  return fakeRnrApi(page, RATINGS_URL, { method: 'GET', status, body: { message: 'Nala fake error' } });
}

/** Call before `page.goto`. Resolves with the live `GET /v1/ratings` response. */
export function waitForRatingsResponse(page) {
  return page.waitForResponse(
    (res) => RATINGS_URL.test(res.url()) && res.request().method() === 'GET',
    { timeout: 60000 },
  );
}

export function votesFromHistogram(ratingHistogram) {
  return Object.values(ratingHistogram).reduce((total, count) => total + count, 0);
}

/** Display format of the block: one decimal place, no ".0" for whole numbers. */
export function formatAverage(overallRating) {
  return String(Number(Number(overallRating).toFixed(1)));
}

export default class Rnr {
  constructor(page, root = page.locator('div.rnr').first()) {
    this.page = page;
    this.root = root;
    this.container = root.locator('.rnr-container');
    this.title = root.locator('.rnr-title');
    this.form = root.locator('form.rnr-form');
    this.stars = root.locator('input[name="rating"]');
    this.summary = root.locator('.rnr-summary-container');
    this.average = root.locator('.rnr-summary-average');
    this.votes = root.locator('.rnr-summary-votes');
    this.commentsFieldset = root.locator('.rnr-comments-fieldset');
    this.comments = root.locator('textarea.rnr-comments');
    this.counter = root.locator('.rnr-comments-character-counter');
    this.submit = root.locator('.rnr-comments-submit');
    this.thankYou = root.locator('.rnr-thank-you');
  }

  star(value) {
    return this.stars.nth(value - 1);
  }

  async scrollIntoView() {
    await this.root.scrollIntoViewIfNeeded({ timeout: 60000 });
    await expect(this.container).toBeVisible({ timeout: 60000 });
  }

  /**
   * Use before a click or hover. Content above the block loads late and moves the block
   * (up to about 2000 px on mobile Safari), so a click can miss the star or the button.
   * Waits until the block stays in the same place for `quietMs`, then scrolls to it again.
   */
  async waitForStablePosition({ quietMs = 500, maxMs = 10000 } = {}) {
    await this.container.evaluate((el, { quiet, max }) => new Promise((resolve) => {
      const top = () => Math.round(el.getBoundingClientRect().top + window.scrollY);
      const start = performance.now();
      let last = top();
      let since = start;
      const timer = setInterval(() => {
        const now = performance.now();
        const current = top();
        if (current !== last) {
          last = current;
          since = now;
        }
        if (now - since >= quiet || now - start >= max) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    }), { quiet: quietMs, max: maxMs });
    await this.root.scrollIntoViewIfNeeded();
  }

  /** Light check for every verb page. */
  async verifySmoke() {
    await this.scrollIntoView();
    await expect(this.title).not.toBeEmpty();
    await expect(this.stars).toHaveCount(5);
    for (let value = 1; value <= 5; value += 1) {
      await expect(this.star(value)).toBeEnabled();
    }
    await expect(this.summary).toBeVisible();
    // The block shows "5 / 5 - 0 votes" by default and keeps it when the ratings data fails to load.
    await expect(this.votes).toHaveText(/^[1-9]\d*$/, { timeout: 30000 });
  }

  /** Values of the stars that have the given class, for example [1, 2, 3]. */
  async starsWithClass(className) {
    return this.stars.evaluateAll(
      (inputs, cls) => inputs.filter((i) => i.classList.contains(cls)).map((i) => Number(i.value)),
      className,
    );
  }

  /** Values of the stars with aria-checked="true". */
  async checkedStars() {
    return this.stars.evaluateAll(
      (inputs) => inputs.filter((i) => i.getAttribute('aria-checked') === 'true').map((i) => Number(i.value)),
    );
  }

  /**
   * Records the Product JSON-LD that the block adds to <head>. Call before page.goto.
   * Milo's JSON-LD graph manager removes this script later and merges it into one @graph script.
   */
  async trackBlockJsonLd() {
    await this.page.addInitScript(() => {
      window.nalaBlockJsonLd = [];
      new MutationObserver((mutations) => mutations.forEach(({ addedNodes }) => addedNodes.forEach((node) => {
        if (node.type !== 'application/ld+json' || node.parentElement !== document.head) return;
        try {
          const data = JSON.parse(node.textContent);
          if (data?.['@type'] === 'Product' && data.aggregateRating) window.nalaBlockJsonLd.push(data);
        } catch { /* Other scripts can have invalid JSON. */ }
      }))).observe(document, { childList: true, subtree: true });
    });
  }

  /** The Product JSON-LD that the block added to <head>. Needs trackBlockJsonLd(). */
  async readBlockJsonLd() {
    return this.page.evaluate(() => window.nalaBlockJsonLd);
  }

  /** Every entity with rating data in the current page JSON-LD. Rating references by @id are resolved. */
  async readPageRatings() {
    return this.page.evaluate(() => {
      const nodes = [...document.head.querySelectorAll('script[type="application/ld+json"]')].flatMap((script) => {
        try {
          const data = JSON.parse(script.textContent);
          return data['@graph'] || [data];
        } catch { return []; }
      });
      const byId = new Map(nodes.filter((node) => node['@id']).map((node) => [node['@id'], node]));
      return nodes.filter((node) => node.aggregateRating).map((node) => {
        const rating = node.aggregateRating;
        const isReference = Object.keys(rating).length === 1 && rating['@id'];
        return { ...node, aggregateRating: (isReference && byId.get(rating['@id'])) || rating };
      });
    });
  }
}
