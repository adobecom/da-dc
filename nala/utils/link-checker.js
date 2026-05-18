/* eslint-disable import/no-extraneous-dependencies, no-console */

import axios from 'axios';

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

const fetchStatus = async (url) => {
  const opts = { maxRedirects: 10, timeout: 30_000 };
  try {
    const res = await axios.head(url, opts);
    return res.status;
  } catch (e) {
    if (e.response) {
      if (e.response.status === 405) {
        try {
          const res = await axios.get(url, opts);
          return res.status;
        } catch (e2) {
          return e2.response?.status ?? null;
        }
      }
      return e.response.status;
    }
    return null;
  }
};

export async function checkPageLinks(page, expect) {
  await page.waitForLoadState('load', { timeout: 60000 });
  const pageOrigin = new URL(page.url()).origin;
  const currentPathname = new URL(page.url()).pathname;

  const links = page.locator('a[href]');
  const count = await links.count();

  const seen = new Set();
  const hrefs = [];
  const base = page.url();
  for (let i = 0; i < count; i += 1) {
    const href = await links.nth(i).evaluate((a, b) => {
      const raw = a.getAttribute('href');
      if (!raw) return '';
      try { return new URL(raw, b).href; } catch { return ''; }
    }, base);
    if (!href || shouldSkip(href, pageOrigin, currentPathname) || seen.has(href)) continue;
    seen.add(href);
    hrefs.push(href);
  }

  await Promise.all(hrefs.map(async (href) => {
    const status = await fetchStatus(href);
    if (status !== null) expect(status, href).not.toBe(404);
  }));
}