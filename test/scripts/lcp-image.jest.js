/**
 * @jest-environment jsdom
 */
/* eslint-env jest */
/* eslint-disable compat/compat, global-require */

jest.mock('https://main--milo--adobecom.aem.live/libs/utils/utils.js', () => ({
  loadArea: jest.fn(() => new Promise(() => {})),
  loadIms: jest.fn(() => new Promise(() => {})),
  loadLana: jest.fn(),
  setConfig: jest.fn(),
  getConfig: jest.fn(() => ({})),
  getMetadata: jest.fn(),
}), { virtual: true });

const MOBILE = 375;
const TABLET = 800;
const DESKTOP = 1300;

const pic = (id) => `<picture><img loading="lazy" src="./media_${id}.png" data-id="${id}"></picture>`;
const row = (...cells) => `<div>${cells.map((cell) => `<div>${cell}</div>`).join('')}</div>`;
const page = (className, ...rows) => `<main><div><div class="${className}">${rows.join('')}</div></div></main>`;
const h1 = '<h1>Heading</h1>';

function loadScripts(html, width) {
  document.body.innerHTML = html;
  window.matchMedia = (query) => ({ matches: width >= Number(/(\d+)px/.exec(query)[1]) });
  jest.isolateModules(() => require('../../acrobat/scripts/scripts.js'));
}

const prioritized = () => [...document.querySelectorAll('img[fetchpriority="high"][loading="eager"]')]
  .map((img) => img.dataset.id);

describe('loadLCPImage', () => {
  it('prioritizes the media next to the heading, not a logo in the copy cell', () => {
    const html = page('marquee', row('#F5F5F5'), row(`${pic('logo')}${h1}`, pic('media')));
    [MOBILE, TABLET, DESKTOP].forEach((width) => {
      loadScripts(html, width);
      expect(prioritized()).toEqual(['media']);
    });
  });

  it('prioritizes only the background image shown at the current viewport', () => {
    const html = page('marquee', row(pic('bg-mobile'), pic('bg-tablet'), pic('bg-desktop')), row(h1));
    loadScripts(html, MOBILE);
    expect(prioritized()).toEqual(['bg-mobile']);
    expect(document.querySelector('[data-id="bg-desktop"]').getAttribute('loading')).toBe('lazy');
    loadScripts(html, TABLET);
    expect(prioritized()).toEqual(['bg-tablet']);
    loadScripts(html, DESKTOP);
    expect(prioritized()).toEqual(['bg-desktop']);
    loadScripts(page('hero-marquee', row(pic('bg')), row(h1)), DESKTOP);
    expect(prioritized()).toEqual(['bg']);
  });

  it('skips hero-marquee media hidden by the media-hidden options', () => {
    const html = page(
      'hero-marquee media-cover media-hidden-mobile media-hidden-tablet',
      row(pic('bg-mobile'), pic('bg-tablet'), ''),
      row('con-block-row-bgcolor', '#F8F8F8'),
      row(h1, pic('media')),
      row('con-block-row-text (l-button)', '<a href="https://www.adobe.com/">Buy now</a>'),
    );
    loadScripts(html, MOBILE);
    expect(prioritized()).toEqual(['bg-mobile']);
    loadScripts(html, TABLET);
    expect(prioritized()).toEqual(['bg-tablet']);
    loadScripts(html, DESKTOP);
    expect(prioritized()).toEqual(['media']);
  });

  it('only prioritizes frictionless marquee media on desktop, where it sits beside the text', () => {
    const verbMarquee = page(
      'verb-marquee resume-builder',
      row(pic('bg-mobile'), pic('bg-tablet'), pic('bg-desktop')),
      row(h1, pic('media')),
    );
    loadScripts(verbMarquee, TABLET);
    expect(prioritized()).toEqual(['bg-tablet']);
    loadScripts(verbMarquee, DESKTOP);
    expect(prioritized()).toEqual(['bg-desktop', 'media']);

    const unityMarquee = page('unity-marquee', row(h1, pic('media')), row('dc-block-row-title', 'Adobe Acrobat'));
    loadScripts(unityMarquee, TABLET);
    expect(prioritized()).toEqual([]);
    loadScripts(unityMarquee, DESKTOP);
    expect(prioritized()).toEqual(['media']);
  });

  it('ignores the prerender snapshot that sits outside main', () => {
    const snapshot = `<div id="prerender_verb-widget"><div class="study-marquee">${row(h1, pic('snapshot'))}</div></div>`;
    loadScripts(`${snapshot}${page('study-marquee', row('#F0F0F0'), row(h1, pic('media')))}`, DESKTOP);
    expect(prioritized()).toEqual(['media']);
  });
});
