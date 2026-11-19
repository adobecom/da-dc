/**
 * @jest-environment jsdom
 */
/* eslint-disable no-undef, no-new-func */
import fs from 'fs';
import path from 'path';

const head = fs.readFileSync(path.resolve(__dirname, '../../head.html'), 'utf8');
const start = head.indexOf('(() => {', head.indexOf('Adds the LCP preload hints'));
const block = head.slice(start, head.indexOf('\n  })();', start) + '\n  })();'.length);
const SHEET_PATH = '/federal/preloads/c2-preloads-default.json';
const OPTED_IN = { foundation: 'c2', 'preload-c2-resources': 'on' };
const LIBS = 'https://www.adobe.com/libs';

async function runHead(url, { meta = OPTED_IN, response } = {}) {
  document.head.innerHTML = Object.entries(meta)
    .map(([name, content]) => `<meta name="${name}" content="${content}">`).join('');
  const empty = { ok: true, json: async () => ({ data: [] }) };
  const fetch = jest.fn().mockResolvedValue(response ?? empty);
  const loadLink = jest.fn();
  new Function('window', 'fetch', 'loadLink', 'miloLibs', block)({ location: new URL(url) }, fetch, loadLink, LIBS);
  await new Promise((resolve) => { setTimeout(resolve, 0); });
  return { sheet: fetch.mock.calls[0]?.[0] ?? null, loadLink };
}

describe('head.html LCP preloads', () => {
  it.each([
    ['https://www.adobe.com/acrobat.html', `https://www.adobe.com${SHEET_PATH}`],
    ['https://www.stage.adobe.com/acrobat.html', `https://www.stage.adobe.com${SHEET_PATH}`],
    ['https://main--da-dc--adobecom.aem.live/acrobat', `https://main--federal--adobecom.aem.live${SHEET_PATH}`],
    ['https://lcp-file-head-preloads--da-dc--adobecom.aem.live/acrobat', `https://main--federal--adobecom.aem.live${SHEET_PATH}`],
    ['https://main--da-dc--adobecom.aem.page/acrobat', `https://main--federal--adobecom.aem.page${SHEET_PATH}`],
    ['http://localhost:3000/acrobat', `https://main--federal--adobecom.aem.page${SHEET_PATH}`],
    ['https://sign.ing/', `https://www.adobe.com${SHEET_PATH}`],
  ])('on %s fetches %s', async (url, expected) => {
    expect((await runHead(url)).sheet).toBe(expected);
  });

  it.each([
    ['not C2', { foundation: 'c1', 'preload-c2-resources': 'on' }],
    ['not opted in', { foundation: 'c2' }],
    ['opted out', { foundation: 'c2', 'preload-c2-resources': 'off' }],
  ])('skips pages that are %s', async (_, meta) => {
    expect((await runHead('https://www.adobe.com/acrobat.html', { meta })).sheet).toBeNull();
  });

  it.each([
    ['/federal/preloads/acrobat-studio.json', 'https://www.stage.adobe.com/federal/preloads/acrobat-studio.json'],
    ['https://main--federal--adobecom.aem.live/federal/preloads/acrobat-studio.json', 'https://www.stage.adobe.com/federal/preloads/acrobat-studio.json'],
    ['https://example.com/federal/evil.json', 'https://www.stage.adobe.com/federal/evil.json'],
    ['https://www.adobe.com/acrobat/evil.json', `https://www.stage.adobe.com${SHEET_PATH}`],
    ['not a url', `https://www.stage.adobe.com${SHEET_PATH}`],
  ])('resolves preload-c2-source %s to %s', async (source, expected) => {
    const meta = { ...OPTED_IN, 'preload-c2-source': source };
    expect((await runHead('https://www.stage.adobe.com/acrobat.html', { meta })).sheet).toBe(expected);
  });

  it('adds only allowed hints from the sheet and resolves {libs}', async () => {
    const data = [
      { rel: 'modulepreload', href: '{libs}/utils/decorate.js', crossorigin: 'anonymous', priority: 'low' },
      { rel: 'preload', href: '{libs}/c2/styles/styles.css', as: 'style' },
      { rel: 'stylesheet', href: 'https://example.com/evil.css' },
      { rel: 'preload', href: 'https://', as: 'script' },
      { rel: 'preconnect', href: 'https://use.typekit.net/', crossorigin: 'anonymous' },
    ];
    const { loadLink } = await runHead('https://www.adobe.com/acrobat.html', { response: { ok: true, json: async () => ({ data }) } });
    expect(loadLink.mock.calls).toEqual([
      [`${LIBS}/utils/decorate.js`, { rel: 'modulepreload', as: undefined, crossorigin: 'anonymous', fetchpriority: 'low' }],
      [`${LIBS}/c2/styles/styles.css`, { rel: 'preload', as: 'style', crossorigin: undefined, fetchpriority: undefined }],
      ['https://use.typekit.net', { rel: 'preconnect', as: undefined, crossorigin: 'anonymous', fetchpriority: undefined }],
    ]);
  });

  it.each([
    ['an error response', { ok: false, status: 404 }],
    ['invalid JSON', { ok: true, json: async () => { throw new Error('bad json'); } }],
  ])('adds nothing on %s', async (_, response) => {
    const { loadLink } = await runHead('https://www.adobe.com/acrobat.html', { response });
    expect(loadLink).not.toHaveBeenCalled();
  });
});
