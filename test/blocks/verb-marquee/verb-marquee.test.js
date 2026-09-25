/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order
import { delay } from '../../helpers/waitfor.js';

const { default: init } = await import(
  '../../../acrobat/blocks/verb-marquee/verb-marquee.js'
);

const DESKTOP_QUERY = '(min-width: 1200px)';
const stubDesktopQuery = (matches) => sinon.stub(window, 'matchMedia').callsFake((query) => (
  query === DESKTOP_QUERY
    ? { matches, media: query }
    : window.matchMedia.wrappedMethod.call(window, query)));

const setCopyPlaceholders = () => {
  Object.assign(window.mph, {
    'verb-marquee-word-to-pdf-copy': 'Desktop copy.',
    'verb-marquee-word-to-pdf-mobile-copy': 'Mobile copy.',
    'verb-marquee-word-to-pdf-sub-copy': 'Desktop sub-copy.',
    'verb-marquee-word-to-pdf-mobile-sub-copy': 'Mobile sub-copy.',
    'verb-marquee-word-to-pdf-sub-copy-2': 'Desktop sub-copy 2.',
  });
};

describe('verb-marquee block', () => {
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
    document.body.innerHTML = await readFile({ path: './mocks/body-word-to-pdf.html' });
    window.adobeIMS = { isSignedInUser: () => false };
    window.lana = { log: sinon.spy() };
  });

  afterEach(() => {
    xhr.restore();
    sinon.restore();
  });

  it('init verb-marquee', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-marquee');
    await init(block);
    expect(document.querySelector('.verb-marquee .acrobat-icon svg')).to.exist;
    expect(document.querySelector('.verb-marquee .verb-marquee-cta')).to.exist;
    expect(document.querySelector('.verb-marquee .verb-marquee-dropzone')).to.exist;
  });

  it('uses mobile copy placeholders below the 1200px breakpoint, falling back to desktop keys', async () => {
    stubDesktopQuery(false);
    setCopyPlaceholders();
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-marquee');
    await init(block);
    expect(window.matchMedia.calledWith(DESKTOP_QUERY)).to.be.true;
    expect(block.querySelector('.verb-marquee-copy').textContent).to.equal('Mobile copy.');
    const subCopies = [...block.querySelectorAll('.verb-marquee-copy-sub-label')].map((el) => el.textContent);
    expect(subCopies).to.deep.equal(['Mobile sub-copy.', 'Desktop sub-copy 2.']);
  });

  it('uses desktop copy placeholders at and above the 1200px breakpoint', async () => {
    stubDesktopQuery(true);
    setCopyPlaceholders();
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-marquee');
    await init(block);
    expect(window.matchMedia.calledWith(DESKTOP_QUERY)).to.be.true;
    expect(block.querySelector('.verb-marquee-copy').textContent).to.equal('Desktop copy.');
    const subCopies = [...block.querySelectorAll('.verb-marquee-copy-sub-label')].map((el) => el.textContent);
    expect(subCopies).to.deep.equal(['Desktop sub-copy.', 'Desktop sub-copy 2.']);
  });

  it('show error toast', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-marquee');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', {
      detail: {
        code: 'error_only_accept_one_file',
        info: 'Test error info',
        metaData: 'metadata',
        errorData: 'errorData',
        sendToSplunk: true,
        message: 'Test error message',
      },
    }));

    expect(window.analytics.verbAnalytics.called).to.be.true;
    expect(window.analytics.sendAnalyticsToSplunk.called).to.be.true;
    expect(window.lana.log.called).to.be.true;
  });

  it('error toast does not auto-close after 5 seconds', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-marquee');
    await init(block);
    await delay(100);

    const clock = sinon.useFakeTimers();
    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Test error', sendToSplunk: false } }));

    const errorState = block.querySelector('.error');
    expect(errorState.classList.contains('hide')).to.be.false;

    clock.tick(6000);
    expect(errorState.classList.contains('hide')).to.be.false;
  });

  it('error toast closes when clicking outside the toast', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-marquee');
    await init(block);
    await delay(100);

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Test error', sendToSplunk: false } }));

    const errorState = block.querySelector('.error');
    expect(errorState.classList.contains('hide')).to.be.false;

    await delay(50);
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(errorState.classList.contains('hide')).to.be.true;
  });

  it('error toast does not close on click inside toast', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-marquee');
    await init(block);
    await delay(100);

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Test error', sendToSplunk: false } }));

    const errorState = block.querySelector('.error');
    expect(errorState.classList.contains('hide')).to.be.false;

    errorState.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(errorState.classList.contains('hide')).to.be.false;
  });

  it('error close button closes toast on Enter key', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-marquee');
    await init(block);
    await delay(100);

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Test error', sendToSplunk: false } }));

    const errorState = block.querySelector('.error');
    const errorCloseBtn = block.querySelector('.verb-marquee-errorBtn');
    expect(errorState.classList.contains('hide')).to.be.false;

    errorCloseBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(errorState.classList.contains('hide')).to.be.true;
  });

  it('error close button closes toast on Space key', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-marquee');
    await init(block);
    await delay(100);

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Test error', sendToSplunk: false } }));

    const errorState = block.querySelector('.error');
    const errorCloseBtn = block.querySelector('.verb-marquee-errorBtn');
    expect(errorState.classList.contains('hide')).to.be.false;

    errorCloseBtn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(errorState.classList.contains('hide')).to.be.true;
  });

  it('error close button hides error toast', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-marquee');
    await init(block);
    await delay(100);

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Test error', sendToSplunk: false } }));

    const errorState = block.querySelector('.error');
    const errorCloseBtn = block.querySelector('.verb-marquee-errorBtn');
    expect(errorState.classList.contains('hide')).to.be.false;

    errorCloseBtn.click();
    expect(errorState.classList.contains('hide')).to.be.true;
  });
});
