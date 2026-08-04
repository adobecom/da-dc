/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

const { default: init } = await import(
  '../../../acrobat/blocks/verb-widget/verb-widget.js'
);
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js';

// Verbs wired for early prefetch and the URL fragments each should produce.
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

    // Drain any `once` prefetch listeners left on `document` by a previous test
    // (e.g. an unused dragover handler), then reset the module's window state so
    // each test starts with no pending listeners and a clean slate.
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

      // No prefetch until the user interacts.
      expect(getPrefetchLinks()).to.have.lengthOf(0);

      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const links = getPrefetchLinks();
      expect(links).to.have.lengthOf(1);
      const { href } = links[0];
      expect(href).to.include(pathFragment);
      expect(href).to.include(`x_api_client_location=${clientLocation}`);
      expect(href).to.include('x_api_client_id=unity');
      expect(href).to.include('user=frictionless_return_user');
      // Shared dummy asset used to warm the destination app.
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
});
