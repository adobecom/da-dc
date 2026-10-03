/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved

const { default: init } = await import(
  '../../../acrobat/blocks/verb-widget/verb-widget.js'
);

const PREFETCH_VERBS = [
  { verb: 'word-to-pdf', pathFragment: '/word-to-pdf/av?', clientLocation: 'word-to-pdf' },
  { verb: 'excel-to-pdf', pathFragment: '/excel-to-pdf?', clientLocation: 'excel-to-pdf' },
  { verb: 'ppt-to-pdf', pathFragment: '/ppt-to-pdf?', clientLocation: 'ppt-to-pdf' },
];

const getPrefetchLinks = () => [...document.head.querySelectorAll('link[rel="prefetch"]')];

describe('verb-widget early prefetch', () => {
  beforeEach(async () => {
    const placeholdersText = await readFile({ path: './mocks/placeholders.json' });
    const placeholders = JSON.parse(placeholdersText);
    window.mph = {};
    placeholders.data.forEach((item) => { window.mph[item.key] = item.value; });

    document.head.innerHTML = await readFile({ path: './mocks/head.html' });
    window.adobeIMS = { isSignedInUser: () => false };

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.dispatchEvent(new DragEvent('dragover', { bubbles: true }));
    window.prefetchTargetUrl = null;
    window.prefetchTargetLoaded = false;
    getPrefetchLinks().forEach((link) => link.remove());

    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
  });

  afterEach(() => {
    sinon.restore();
    getPrefetchLinks().forEach((link) => link.remove());
  });

  PREFETCH_VERBS.forEach(({ verb, pathFragment, clientLocation }) => {
    it(`prefetches the destination page on first interaction for ${verb}`, async () => {
      document.body.innerHTML = await readFile({ path: `./mocks/body-${verb}.html` });
      const block = document.body.querySelector('.verb-widget');
      await init(block);

      expect(getPrefetchLinks()).to.have.lengthOf(0);

      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const links = getPrefetchLinks();
      expect(links).to.have.lengthOf(1);
      const { href } = links[0];
      expect(href).to.include(pathFragment);
      expect(href).to.include(`x_api_client_location=${clientLocation}`);
      expect(href).to.include('x_api_client_id=unity');
      expect(href).to.include('user=frictionless_return_user');
      expect(href).to.include('assets=urn%3Aaaid%3Asc%3AUS%3A1111111');
    });
  });

  it('also prefetches on dragover for word-to-pdf', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body-word-to-pdf.html' });
    const block = document.body.querySelector('.verb-widget');
    await init(block);

    document.dispatchEvent(new DragEvent('dragover', { bubbles: true }));

    expect(getPrefetchLinks()).to.have.lengthOf(1);
  });

  it('does not prefetch for a verb without early-prefetch config', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body-compress-pdf.html' });
    const block = document.body.querySelector('.verb-widget');
    await init(block);

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(getPrefetchLinks()).to.have.lengthOf(0);
  });

  describe('target iframe prefetch', () => {
    const REDIRECT_URL = 'about:blank#redirect';
    const getIframes = () => [...document.body.querySelectorAll('iframe')];
    const track = (block, event, data = {}) => {
      block.dispatchEvent(new CustomEvent('unity:track-analytics', { detail: { event, data, sendToSplunk: false } }));
    };

    beforeEach(() => {
      window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };
      // The uploading event's beforeunload handler blocks WTR from closing the page
      const addListener = window.addEventListener.bind(window);
      sinon.stub(window, 'addEventListener').callsFake((type, ...args) => {
        if (type !== 'beforeunload') addListener(type, ...args);
      });
    });

    it('does not load an iframe with a null src when uploading starts before redirectUrl', async () => {
      document.body.innerHTML = await readFile({ path: './mocks/body-pdf-to-word.html' });
      const block = document.body.querySelector('.verb-widget');
      await init(block);

      track(block, 'uploading');

      expect(getIframes()).to.have.lengthOf(0);
      expect(window.prefetchTargetLoaded).to.not.equal(true);
    });

    it('loads the target iframe once redirectUrl arrives after uploading', async () => {
      document.body.innerHTML = await readFile({ path: './mocks/body-pdf-to-word.html' });
      const block = document.body.querySelector('.verb-widget');
      await init(block);

      track(block, 'uploading');
      track(block, 'redirectUrl', { redirectUrl: REDIRECT_URL });

      const iframes = getIframes();
      expect(iframes).to.have.lengthOf(1);
      expect(iframes[0].getAttribute('src')).to.equal(REDIRECT_URL);
    });

    it('loads the target iframe when redirectUrl arrives before uploading (chunked upload order)', async () => {
      document.body.innerHTML = await readFile({ path: './mocks/body-pdf-to-word.html' });
      const block = document.body.querySelector('.verb-widget');
      await init(block);

      track(block, 'redirectUrl', { redirectUrl: REDIRECT_URL });
      track(block, 'uploading');

      const iframes = getIframes();
      expect(iframes).to.have.lengthOf(1);
      expect(iframes[0].getAttribute('src')).to.equal(REDIRECT_URL);
    });
  });
});
