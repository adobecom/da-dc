/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order

const { default: init } = await import(
  '../../../acrobat/blocks/verb-widget/verb-widget.js'
);

describe('verb-widget authored icon', () => {
  let xhr;
  let placeholders;

  beforeEach(async () => {
    sinon.stub(window, 'fetch');
    window.fetch.callsFake((x) => {
      if (x.endsWith('.svg')) {
        return window.fetch.wrappedMethod.call(window, x);
      }
      return Promise.resolve();
    });
    const placeholdersText = await readFile({ path: './mocks/placeholders.json' });
    placeholders = JSON.parse(placeholdersText);
    window.mph = {};
    placeholders.data.forEach((item) => {
      window.mph[item.key] = item.value;
    });
    xhr = sinon.useFakeXMLHttpRequest();
    document.head.innerHTML = await readFile({ path: './mocks/head.html' });
    document.body.innerHTML = await readFile({ path: './mocks/body-authored-icon.html' });
    window.adobeIMS = { isSignedInUser: () => false };
  });

  afterEach(() => {
    xhr.restore();
    sinon.restore();
  });

  it('uses the authored image and never treats the image row as copy', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-widget');
    await init(block);

    // The authored .svg link is rendered as the verb image (not the coded svg).
    const authoredImg = document.querySelector('.verb-widget .verb-image img.icon-verb-image');
    expect(authoredImg).to.exist;
    expect(authoredImg.getAttribute('src')).to.contain('custom-compress.svg');

    // The image row must not leak into the copy — even though it sits in row 2,
    // the rendered copy is the authored copy text, not the image link/URL.
    const copy = document.querySelector('.verb-widget .verb-copy');
    expect(copy).to.exist;
    expect(copy.textContent).to.contain('Authored desktop copy');
    expect(copy.textContent).to.not.contain('.svg');
  });
});
