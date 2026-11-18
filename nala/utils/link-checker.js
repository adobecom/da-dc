/* eslint-disable no-console */

const shouldSkip = (href, pageOrigin, currentPathname) => {
  try {
    const u = new URL(href);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return true;
    if (u.origin !== pageOrigin) return false;
    const p = u.pathname.replace(/\.html$/, '');
    return p === '/' || p === '' || p === currentPathname;
  } catch {
    return true;
  }
};

const LOCALE_PREFIX = /^\/[a-z]{2}(-[a-z]{2})?(?=\/)/i;

const withoutLocalePrefix = (pathname) => pathname.replace(LOCALE_PREFIX, '');

const AEM_HOST = /\.aem\.(live|page)$/;

async function requestStatus(page, url) {
  const opts = { maxRedirects: 10, timeout: 30000 };
  // HEAD first (fast); uses browser cookies/session via page.request
  let res = await page.request.fetch(url, { method: 'HEAD', ...opts });
  let status = res.status();
  // Some locale/CDN paths 404 or 405 on HEAD but work on GET
  if (status === 404 || status === 405) {
    res = await page.request.get(url, opts);
    status = res.status();
  }
  return status;
}

async function fetchStatus(page, url) {
  try {
    let status = await requestStatus(page, url);
    if (status !== 404) return status;

    // /in/express/... → /express/... — locale prefix breaks cross-product paths
    const u = new URL(url);
    const unlocalized = withoutLocalePrefix(u.pathname);
    if (unlocalized !== u.pathname) {
      u.pathname = unlocalized || '/';
      status = await requestStatus(page, u.href);
    }

    // AEM hosts serve only da-dc pages, and only without ".html".
    // www.adobe.com also serves ".html" links and the other Adobe sites (e.g. /education).
    const { hostname, pathname, search } = new URL(url);
    if (status === 404 && AEM_HOST.test(hostname)) {
      // A failed fallback request must not hide the 404 we already have.
      const fallback = (href) => requestStatus(page, href).catch(() => 404);
      if (pathname.endsWith('.html')) {
        const sameHost = new URL(url);
        sameHost.pathname = pathname.replace(/\.html$/, '');
        status = await fallback(sameHost.href);
      }
      if (status === 404) status = await fallback(`https://www.adobe.com${pathname}${search}`);
    }
    return status;
  } catch {
    return null;
  }
}

async function waitForPageReady(page) {
  await page.waitForLoadState('load', { timeout: 60000 });
  // Gnav + breadcrumbs (matches your other verb tests)
  await page.locator('header').waitFor({ state: 'visible', timeout: 60000 });
  // Gnav block finished loading
  await page.locator('header[data-block-status="loaded"]').first()
    .waitFor({ state: 'attached', timeout: 60000 });
  // Footer = bottom-of-page lazy content is in DOM
  await page.locator('footer.global-footer').scrollIntoViewIfNeeded();
  await page.locator('footer.global-footer').waitFor({ state: 'visible', timeout: 60000 });
  // Wait until link count stops changing (handles late hydration)
  await page.waitForFunction(() => {
    const count = () => document.querySelectorAll('a[href]').length;
    return new Promise((resolve) => {
      let last = count();
      let stableMs = 0;
      const tick = () => {
        const current = count();
        if (current === last) {
          stableMs += 200;
          if (stableMs >= 1000) {
            resolve(true);
            return;
          }
        } else {
          last = current;
          stableMs = 0;
        }
        setTimeout(tick, 200);
      };
      tick();
    });
  }, { timeout: 60000 });
}

const isStageOrProd = (host) => (
  host === 'www.adobe.com'
  || host === 'www.stage.adobe.com'
  || host.startsWith('stage--')
);

async function checkPageLinks(page, expect) {
  const host = new URL(page.url()).hostname;
  if (!isStageOrProd(host)) {
    console.log(`[link-checker] skipped on ${host} (stage/prod only)`);
    return;
  }
  await waitForPageReady(page);
  const pageOrigin = new URL(page.url()).origin;
  const currentPathname = new URL(page.url()).pathname;
  const base = page.url();
  // One atomic snapshot — includes gnav, main, footer
  const rawHrefs = await page.locator('a[href]').evaluateAll((anchors, pageBase) => (
    anchors.map((a) => {
      const raw = a.getAttribute('href');
      if (!raw) return '';
      try { return new URL(raw, pageBase).href; } catch { return ''; }
    })
  ), base);
  const seen = new Set();
  const hrefs = rawHrefs.filter((href) => {
    if (!href || shouldSkip(href, pageOrigin, currentPathname) || seen.has(href)) return false;
    seen.add(href);
    return true;
  });
  await Promise.all(hrefs.map(async (href) => {
    const status = await fetchStatus(page, href);
    if (status !== null) expect(status, href).not.toBe(404);
  }));
}

export default checkPageLinks;
