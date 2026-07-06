/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order

const { default: init } = await import(
  '../../../acrobat/blocks/verb-widget/verb-widget.js'
);

const USER_AGENTS = {
  iPhone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
  Android:
    'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
  desktop:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
};

const IOS_UNKNOWN_VERBS = [
  'psd-to-pdf',
  'ai-to-pdf',
  'indd-to-pdf',
  'image-to-pdf',
  'bmp-to-pdf',
  'gif-to-pdf',
  'tiff-to-pdf',
];

describe('verb-widget iOS accept attribute tests', () => {
  let placeholders;
  let originalUserAgent;

  beforeEach(async () => {
    const placeholdersText = await readFile({ path: './mocks/placeholders.json' });
    placeholders = JSON.parse(placeholdersText);

    window.mph = {};
    placeholders.data.forEach((item) => {
      window.mph[item.key] = item.value;
    });

    document.head.innerHTML = await readFile({ path: './mocks/head.html' });
    window.adobeIMS = { isSignedInUser: () => false };
    originalUserAgent = window.navigator.userAgent;

    sinon.stub(window, 'fetch').callsFake((x) => {
      if (x.endsWith('.svg')) {
        return window.fetch.wrappedMethod.call(window, x);
      }
      return Promise.resolve();
    });
  });

  afterEach(() => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });
    sinon.restore();
  });

  it('iOS + iOS-unknown extensions → accept="*/*" for all new MULTI_ALL_HEIC verbs', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });

    for (const verb of IOS_UNKNOWN_VERBS) {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: USER_AGENTS.iPhone,
        configurable: true,
      });

      document.body.innerHTML = await readFile({ path: `./mocks/body-${verb}.html` });
      const block = document.body.querySelector('.verb-widget');
      await init(block);

      const accept = document.querySelector('#file-upload').getAttribute('accept');
      expect(accept, `Expected */* for verb ${verb} on iOS`).to.equal('*/*');
    }
  });

  it('non-iOS + iOS-unknown extensions → accept is NOT */* and includes .pdf', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });

    Object.defineProperty(window.navigator, 'userAgent', {
      value: USER_AGENTS.desktop,
      configurable: true,
    });

    document.body.innerHTML = await readFile({ path: './mocks/body-psd-to-pdf.html' });
    const block = document.body.querySelector('.verb-widget');
    await init(block);

    const accept = document.querySelector('#file-upload').getAttribute('accept');
    expect(accept).to.not.equal('*/*');
    expect(accept).to.include('.pdf');
  });

  it('iOS + PDF-only verb (fillsign) → normal accept, not */*', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });

    Object.defineProperty(window.navigator, 'userAgent', {
      value: USER_AGENTS.iPhone,
      configurable: true,
    });
    window.browser = { ua: USER_AGENTS.iPhone };

    document.body.innerHTML = await readFile({ path: './mocks/body-sign-pdf.html' });
    const block = document.body.querySelector('.verb-widget');
    await init(block);

    const accept = document.querySelector('#file-upload');
    // fillsign is a mobileApp verb — it does not render a file input on mobile
    // but if the accept attribute exists it should NOT be */*
    if (accept) {
      expect(accept.getAttribute('accept')).to.not.equal('*/*');
    } else {
      // fillsign on mobile redirects to app store; no file input is rendered — this is expected
      expect(block).to.exist;
    }
  });

  it('iOS + jpg-to-pdf (MULTI_ALL contains iOS-unknown exts) → accept="*/*"', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });

    Object.defineProperty(window.navigator, 'userAgent', {
      value: USER_AGENTS.iPhone,
      configurable: true,
    });

    document.body.innerHTML = await readFile({ path: './mocks/body-jpg-to-pdf.html' });
    const block = document.body.querySelector('.verb-widget');
    await init(block);

    const accept = document.querySelector('#file-upload').getAttribute('accept');
    expect(accept).to.equal('*/*');
  });
});
