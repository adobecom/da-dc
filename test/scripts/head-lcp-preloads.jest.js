/**
 * @jest-environment jsdom
 */
/* eslint-disable no-undef, no-new-func */
import fs from 'fs';
import path from 'path';

const head = fs.readFileSync(path.resolve(__dirname, '../../head.html'), 'utf8');
const start = head.indexOf('(() => {', head.indexOf('acrobat/scripts/scripts.js fetches'));
const block = head.slice(start, head.indexOf('\n  })();', start) + '\n  })();'.length);
const SHEET_PATH = '/federal/preloads/c2-preloads-default.json';

const OPTED_IN = { foundation: 'c2', 'preload-c2-resources': 'on' };

function sheetFor(url, meta = OPTED_IN) {
  document.head.innerHTML = Object.entries(meta)
    .map(([name, content]) => `<meta name="${name}" content="${content}">`).join('');
  const loadLink = jest.fn(() => ({}));
  new Function('window', 'loadLink', block)({ location: new URL(url) }, loadLink);
  return loadLink.mock.calls[0]?.[0] ?? null;
}

describe('head.html LCP preloads sheet', () => {
  it.each([
    ['https://www.adobe.com/acrobat.html', `https://www.adobe.com${SHEET_PATH}`],
    ['https://www.stage.adobe.com/acrobat.html', `https://www.stage.adobe.com${SHEET_PATH}`],
    ['https://main--da-dc--adobecom.aem.live/acrobat', `https://main--federal--adobecom.aem.live${SHEET_PATH}`],
    ['https://lcp-head-file-preload--da-dc--adobecom.aem.live/acrobat', `https://main--federal--adobecom.aem.live${SHEET_PATH}`],
    ['https://main--da-dc--adobecom.aem.page/acrobat', `https://main--federal--adobecom.aem.page${SHEET_PATH}`],
    ['http://localhost:3000/acrobat', `https://main--federal--adobecom.aem.page${SHEET_PATH}`],
    ['https://sign.ing/', `https://www.adobe.com${SHEET_PATH}`],
  ])('on %s loads %s', (url, expected) => {
    expect(sheetFor(url)).toBe(expected);
  });

  it.each([
    ['not C2', { foundation: 'c1', 'preload-c2-resources': 'on' }],
    ['not opted in', { foundation: 'c2' }],
    ['opted out', { foundation: 'c2', 'preload-c2-resources': 'off' }],
  ])('skips pages that are %s', (_, meta) => {
    expect(sheetFor('https://www.adobe.com/acrobat.html', meta)).toBeNull();
  });

  it.each([
    ['/federal/preloads/acrobat-studio.json', 'https://www.stage.adobe.com/federal/preloads/acrobat-studio.json'],
    ['https://main--federal--adobecom.aem.live/federal/preloads/acrobat-studio.json', 'https://www.stage.adobe.com/federal/preloads/acrobat-studio.json'],
    ['https://example.com/federal/evil.json', 'https://www.stage.adobe.com/federal/evil.json'],
    ['https://www.adobe.com/acrobat/evil.json', `https://www.stage.adobe.com${SHEET_PATH}`],
    ['not a url', `https://www.stage.adobe.com${SHEET_PATH}`],
  ])('resolves preload-c2-source %s to %s', (source, expected) => {
    expect(sheetFor('https://www.stage.adobe.com/acrobat.html', { ...OPTED_IN, 'preload-c2-source': source }))
      .toBe(expected);
  });
});
