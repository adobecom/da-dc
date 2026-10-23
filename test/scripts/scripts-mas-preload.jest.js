/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.adobe.com/acrobat/online/compress-pdf"}
 */
/* eslint-disable no-undef */
/* eslint-disable compat/compat */

const MAS_LINK = (hash) => `<a href="https://mas.adobe.com/studio.html#${hash}">card</a>`;

function getPreloads() {
  return [...document.head.querySelectorAll('link[rel="preload"][href*="/mas/io/fragment"]')]
    .map((link) => new URL(link.getAttribute('href')));
}

async function waitForPreloads(count) {
  for (let i = 0; i < 50 && getPreloads().length < count; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => { setTimeout(resolve, 10); });
  }
  return getPreloads();
}

async function loadScripts({ prefix = '', geoDetection, market, links, marketError } = {}) {
  jest.resetModules();
  document.head.innerHTML = geoDetection ? `<meta name="mas-geo-detection" content="${geoDetection}">` : '';
  document.body.innerHTML = `<header></header><main><div>${links ?? MAS_LINK('fragment=abc')}</div></main>`;
  const getValidatedMarket = marketError
    ? jest.fn().mockRejectedValue(new Error('boom'))
    : jest.fn().mockResolvedValue(market);
  jest.doMock('/libs/utils/utils.js', () => ({
    __esModule: true,
    loadArea: jest.fn(),
    loadStyle: jest.fn(),
    loadLana: jest.fn(),
    loadScript: jest.fn(),
    setConfig: jest.fn(),
    getConfig: jest.fn(() => ({ locale: { prefix }, miloLibs: '/libs' })),
    getMetadata: jest.fn((name) => (name === 'mas-geo-detection' ? geoDetection : undefined)),
    createTag: jest.fn(),
    loadIms: jest.fn().mockResolvedValue(),
  }), { virtual: true });
  jest.doMock('/libs/utils/market.js', () => ({
    __esModule: true,
    getValidatedMarket,
  }), { virtual: true });
  await import('../../acrobat/scripts/scripts.js');
  return { getValidatedMarket };
}

describe('M@S fragment preload', () => {
  it('uses the page locale and ignores the market when geo detection is off', async () => {
    const { getValidatedMarket } = await loadScripts({ market: 'au' });
    const [url] = await waitForPreloads(1);
    expect(url.origin + url.pathname).toBe('https://www.adobe.com/mas/io/fragment');
    expect(url.searchParams.get('id')).toBe('abc');
    expect(url.searchParams.get('api_key')).toBe('wcms-commerce-ims-ro-user-milo');
    expect(url.searchParams.get('locale')).toBe('en_US');
    expect(url.searchParams.has('country')).toBe(false);
    expect(getValidatedMarket).not.toHaveBeenCalled();
  });

  it('uses the validated market as country on another market page', async () => {
    await loadScripts({ geoDetection: 'on', market: 'fr' });
    const [url] = await waitForPreloads(1);
    expect(url.searchParams.get('locale')).toBe('en_US');
    expect(url.searchParams.get('country')).toBe('FR');
  });

  it('applies the market locale override on a page from another market', async () => {
    await loadScripts({ geoDetection: 'true', market: 'au' });
    const [url] = await waitForPreloads(1);
    expect(url.searchParams.get('locale')).toBe('en_GB');
    expect(url.searchParams.get('country')).toBe('AU');
  });

  it('does not stamp a country when the override already resolves the market', async () => {
    await loadScripts({ geoDetection: 'on', market: 'gb' });
    const [url] = await waitForPreloads(1);
    expect(url.searchParams.get('locale')).toBe('en_GB');
    expect(url.searchParams.has('country')).toBe(false);
  });

  it.each([
    ['/au', 'au', 'en_AU'],
    ['/in_en', 'in', 'en_IN'],
    ['/uk', 'gb', 'en_GB'],
  ])('keeps the native locale on %s for a %s visitor', async (prefix, market, locale) => {
    await loadScripts({ prefix, geoDetection: 'on', market });
    const [url] = await waitForPreloads(1);
    expect(url.searchParams.get('locale')).toBe(locale);
    expect(url.searchParams.has('country')).toBe(false);
  });

  it('falls back to the page country when the market lookup fails', async () => {
    await loadScripts({ prefix: '/fr', geoDetection: 'on', marketError: true });
    const [url] = await waitForPreloads(1);
    expect(url.searchParams.get('locale')).toBe('fr_FR');
    expect(url.searchParams.has('country')).toBe(false);
  });

  it('forwards the mask param and dedupes the market lookup across links', async () => {
    const links = [
      MAS_LINK('fragment=one&mask=m1'),
      MAS_LINK('query=two'),
      MAS_LINK('fragment=three'),
    ].join('');
    const { getValidatedMarket } = await loadScripts({ geoDetection: 'on', market: 'de', links });
    const urls = await waitForPreloads(3);
    expect(urls.map((u) => u.searchParams.get('id'))).toEqual(['one', 'two', 'three']);
    expect(urls[0].searchParams.get('mask')).toBe('m1');
    expect(urls[1].searchParams.has('mask')).toBe(false);
    urls.forEach((u) => expect(u.searchParams.get('country')).toBe('DE'));
    expect(getValidatedMarket).toHaveBeenCalledTimes(1);
  });

  it.each([
    [undefined, 0],
    ['on', 1],
  ])('preloads market.js when geo detection is %s', async (geoDetection, count) => {
    await loadScripts({ geoDetection, market: 'fr' });
    await waitForPreloads(1);
    expect(document.head.querySelectorAll('link[rel="modulepreload"][href="/libs/utils/market.js"]')).toHaveLength(count);
  });
});
