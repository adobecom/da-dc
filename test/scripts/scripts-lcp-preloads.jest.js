/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.adobe.com/acrobat"}
 */
/* eslint-disable no-undef */

const SHEET = 'https://www.adobe.com/federal/preloads/c2-preloads-default.json';

const hints = () => [...document.head.querySelectorAll('link:not(#c2-lcp-preloads)')]
  .map((l) => `${l.rel} ${l.getAttribute('href')} ${l.getAttribute('fetchpriority') || ''}`.trim());

async function loadScripts({ sheetLink = true, response, extraHead = '' } = {}) {
  jest.resetModules();
  document.head.innerHTML = (sheetLink ? `<link id="c2-lcp-preloads" rel="preload" href="${SHEET}">` : '') + extraHead;
  document.body.innerHTML = '<header></header><main></main>';
  const ok = { ok: true, json: async () => ({ data: [] }) };
  global.fetch = jest.fn().mockResolvedValue(response ?? ok);
  window.lana = { log: jest.fn() };
  jest.doMock('/libs/utils/utils.js', () => ({
    __esModule: true,
    loadArea: jest.fn(),
    loadStyle: jest.fn(),
    loadLana: jest.fn(),
    loadScript: jest.fn(),
    setConfig: jest.fn(),
    getConfig: jest.fn(() => ({ locale: { prefix: '' }, miloLibs: '/libs' })),
    getMetadata: jest.fn(),
    createTag: jest.fn(),
    loadIms: jest.fn().mockResolvedValue(),
  }), { virtual: true });
  await import('../../acrobat/scripts/scripts.js');
  await new Promise((resolve) => { setTimeout(resolve, 0); });
}

describe('LCP preloads', () => {
  it('fetches the sheet from head.html and adds only allowed hints', async () => {
    await loadScripts({
      response: {
        ok: true,
        json: async () => ({
          data: [
            { rel: 'modulepreload', href: '{libs}/utils/decorate.js', crossorigin: 'anonymous', priority: 'low' },
            { rel: 'preload', href: '{libs}/c2/styles/styles.css', as: 'style' },
            { rel: 'stylesheet', href: 'https://example.com/evil.css' },
            { rel: 'preload', href: 'https://', as: 'script' },
            { rel: 'modulepreload', href: '{libs}/utils/decorate.js' },
          ],
        }),
      },
    });
    expect(fetch).toHaveBeenCalledWith(SHEET);
    const added = hints();
    expect(added).toContain('modulepreload https://www.adobe.com/libs/utils/decorate.js low');
    expect(added).toContain('preload https://www.adobe.com/libs/c2/styles/styles.css');
    expect(added.filter((h) => h.includes('decorate.js'))).toHaveLength(1);
    expect(added.some((h) => h.includes('evil.css'))).toBe(false);
  });

  it('adds preconnects as bare origins and does not duplicate Milo\'s', async () => {
    await loadScripts({
      extraHead: '<link rel="preconnect" href="https://use.typekit.net" crossorigin="anonymous">',
      response: {
        ok: true,
        json: async () => ({
          data: [
            { rel: 'preconnect', href: 'https://use.typekit.net', crossorigin: 'anonymous' },
            { rel: 'preconnect', href: 'https://p.typekit.net/', crossorigin: 'anonymous' },
          ],
        }),
      },
    });
    const preconnects = [...document.head.querySelectorAll('link[rel="preconnect"]')].map((l) => l.getAttribute('href'));
    expect(preconnects).toEqual(['https://use.typekit.net', 'https://p.typekit.net']);
  });

  it('does not fetch a sheet when head.html did not opt the page in', async () => {
    await loadScripts({ sheetLink: false });
    expect(fetch).not.toHaveBeenCalledWith(SHEET);
  });

  it('logs and adds nothing when the sheet fails', async () => {
    await loadScripts({ response: { ok: false, status: 404 } });
    expect(hints().some((h) => h.includes('decorate.js'))).toBe(false);
    expect(window.lana.log).toHaveBeenCalledWith('LCP preloads failed: HTTP 404', expect.any(Object));
  });
});
