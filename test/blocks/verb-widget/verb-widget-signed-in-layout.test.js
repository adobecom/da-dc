/* eslint-disable compat/compat */
import { readFile, setViewport } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order

const { default: init } = await import(
  '../../../acrobat/blocks/verb-widget/verb-widget.js'
);

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

const stylesheetsLoaded = () => Promise.all(
  [...document.head.querySelectorAll('link[rel="stylesheet"]')].map((link) => (
    link.sheet ? Promise.resolve() : new Promise((resolve) => {
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', resolve, { once: true });
    })
  )),
);

const measure = (block) => ({
  height: block.getBoundingClientRect().height,
  minHeight: getComputedStyle(block).minHeight,
});

describe('verb-widget signed-in layout', () => {
  let block;
  let xhr;

  before(async () => {
    sinon.stub(window, 'fetch').callsFake((url) => (
      url.endsWith('.svg') ? window.fetch.wrappedMethod.call(window, url) : Promise.resolve()
    ));
    xhr = sinon.useFakeXMLHttpRequest();
    const placeholders = JSON.parse(await readFile({ path: './mocks/placeholders.json' }));
    window.mph = {};
    placeholders.data.forEach(({ key, value }) => {
      window.mph[key] = value;
    });
    document.head.innerHTML = await readFile({ path: './mocks/head.html' });
    document.body.innerHTML = await readFile({ path: './mocks/body-sign-pdf.html' });
    await stylesheetsLoaded();
    window.adobeIMS = { isSignedInUser: () => false };
    setConfig({ ...getConfig(), locale: { prefix: '' } });
    block = document.body.querySelector('.verb-widget');
    await init(block);
  });

  after(() => {
    xhr.restore();
    sinon.restore();
  });

  afterEach(() => {
    block.classList.remove('signed-in', 'upsell');
    block.querySelector(':scope > .verb-upsell-active')?.remove();
  });

  VIEWPORTS.forEach(({ width, height }) => {
    it(`keeps its size and hides the legal footer when .signed-in is added at ${width}x${height}`, async () => {
      await setViewport({ width, height });
      const footer = block.querySelector('.verb-footer');
      const anonymous = measure(block);
      expect(getComputedStyle(footer).visibility).to.equal('visible');

      block.classList.add('signed-in');

      expect(measure(block)).to.deep.equal(anonymous);
      expect(getComputedStyle(footer).visibility).to.equal('hidden');
    });
  });

  it('keeps its size when a late IMS:Ready signs the user in', async () => {
    await setViewport({ width: 1024, height: 768 });
    const anonymous = measure(block);
    window.adobeIMS = { isSignedInUser: () => true, getAccountType: () => 'type1' };

    window.dispatchEvent(new CustomEvent('IMS:Ready'));

    expect(block.classList.contains('signed-in')).to.be.true;
    expect(measure(block)).to.deep.equal(anonymous);
  });

  it('keeps the 560px reservation when .signed-in replaces the upsell panel', async () => {
    await setViewport({ width: 1024, height: 768 });
    const upsell = document.createElement('div');
    upsell.className = 'verb-wrapper verb-upsell-active';
    block.append(upsell);
    block.classList.add('upsell');

    block.classList.remove('upsell');
    block.classList.add('signed-in');

    expect(getComputedStyle(block).minHeight).to.equal('560px');
  });
});
