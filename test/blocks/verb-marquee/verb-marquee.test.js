import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js';
import { delay } from '../../helpers/waitfor.js';

const { default: init } = await import(
  '../../../acrobat/blocks/verb-marquee/verb-marquee.js'
);

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

  describe('authored dc-block-row-* overrides', () => {
    const row = (key, value) => `<div><div>${key}</div><div>${value}</div></div>`;
    const setup = async (rows, viewport) => {
      const conf = getConfig();
      setConfig({ ...conf, locale: { prefix: '' } });
      if (viewport) sinon.stub(window, 'innerWidth').value(viewport);
      document.body.innerHTML = `<main><div><div class="verb-marquee word-to-pdf">${rows}<div><div><h1>Word to PDF</h1></div></div></div></div></main>`;
      const block = document.body.querySelector('.verb-marquee');
      await init(block);
      return block;
    };
    const text = (block, sel) => block.querySelector(sel)?.textContent.trim();

    it('uses authored values over placeholders and removes override rows', async () => {
      const block = await setup([
        row('dc-block-row-copy', 'Authored copy'),
        row('dc-block-row-sub-copy', 'Authored sub'),
        row('dc-block-row-sub-copy-2', 'Authored sub 2'),
        row('dc-block-row-upload-cta', 'Authored CTA'),
        row('dc-block-row-dragndrop-text', 'Authored drag'),
        row('dc-block-row-file-limit', 'Authored limit'),
        row('dc-block-row-tool-tip', 'Authored tip'),
        row('dc-block-row-legal-text', 'Authored <a href="https://example.com">legal</a>'),
      ].join(''), 1400);
      expect(text(block, '.verb-marquee-copy')).to.equal('Authored copy');
      const subs = [...block.querySelectorAll('.verb-marquee-copy-sub-label')].map((e) => e.textContent);
      expect(subs).to.deep.equal(['Authored sub', 'Authored sub 2']);
      expect(text(block, '.verb-marquee-cta-label')).to.equal('Authored CTA');
      expect(text(block, '.verb-marquee-drag')).to.equal('Authored drag');
      expect(text(block, '.verb-marquee-file-limit')).to.equal('Authored limit');
      expect(block.querySelector('.info-icon').dataset.tooltip).to.equal('Authored tip');
      expect(block.querySelector('.verb-marquee-legal a').getAttribute('href')).to.equal('https://example.com');
      expect(block.textContent).to.not.include('dc-block-row-');
      expect(block.querySelector('.foreground h1, .verb-marquee-heading').textContent).to.equal('Word to PDF');
    });

    it('falls back to placeholders when no override rows are authored', async () => {
      const block = await setup('');
      expect(text(block, '.verb-marquee-cta-label')).to.equal('Select a file');
      expect(text(block, '.verb-marquee-drag')).to.equal('or drag and drop a file');
      expect(text(block, '.verb-marquee-file-limit')).to.equal('PDF or Word, up to 100 MB');
      expect(block.querySelector('.info-icon').dataset.tooltip).to.equal('Your files are secure with us.');
      expect(block.querySelector('.verb-marquee-legal a.verb-marquee-legal-url')).to.exist;
    });

    it('works with no placeholders loaded', async () => {
      window.mph = {};
      const block = await setup([
        row('dc-block-row-copy', 'Only authored'),
        row('dc-block-row-upload-cta', 'Go'),
      ].join(''), 1400);
      expect(text(block, '.verb-marquee-copy')).to.equal('Only authored');
      expect(text(block, '.verb-marquee-cta-label')).to.equal('Go');
    });

    it('prefers mobile-copy on narrow viewports and ignores blank overrides', async () => {
      const block = await setup([
        row('dc-block-row-copy', 'Desktop copy'),
        row('dc-block-row-mobile-copy', 'Mobile copy'),
        row('dc-block-row-file-limit', '   '),
      ].join(''), 800);
      expect(text(block, '.verb-marquee-copy')).to.equal('Mobile copy');
      expect(text(block, '.verb-marquee-file-limit')).to.equal('PDF or Word, up to 100 MB');
    });
  });
});
