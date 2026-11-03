/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order
import { delay } from '../../helpers/waitfor.js';

const { default: init, initResumeFork, RESUME_FORK_MODAL_ID } = await import(
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

  it('opens the resume fork modal when Unity asks the block', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-marquee');
    await init(block);
    const onModalOpen = sinon.spy();
    window.addEventListener('modal:open', onModalOpen);
    block.dispatchEvent(new CustomEvent('unity:show-resume-fork'));
    window.removeEventListener('modal:open', onModalOpen);
    expect(onModalOpen.calledOnce).to.be.true;
    expect(onModalOpen.firstCall.args[0].detail).to.deep.equal({ hash: `#${RESUME_FORK_MODAL_ID}` });
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

describe('verb-marquee resume fork', () => {
  let element;
  let responses;
  let modalOpens;
  const onModalOpen = (e) => modalOpens.push(e.detail);
  const select = (detail) => window.dispatchEvent(new CustomEvent('resume-upload-fork:select', { detail }));
  const closeModal = (id) => window.dispatchEvent(new CustomEvent('milo:modal:closed', { detail: { id } }));

  beforeEach(() => {
    element = document.createElement('div');
    const received = [];
    responses = received;
    modalOpens = [];
    element.addEventListener('unity:resume-fork-response', (e) => received.push(e.detail));
    window.addEventListener('modal:open', onModalOpen);
    initResumeFork(element);
  });

  afterEach(() => {
    window.removeEventListener('modal:open', onModalOpen);
  });

  it('opens the fork modal when Unity asks for it', () => {
    element.dispatchEvent(new CustomEvent('unity:show-resume-fork'));
    expect(modalOpens).to.deep.equal([{ hash: `#${RESUME_FORK_MODAL_ID}` }]);
  });

  it('forwards continue-fork with the chosen product to Unity', () => {
    element.dispatchEvent(new CustomEvent('unity:show-resume-fork'));
    select({ action: 'continue-fork', choice: 'refine' });
    expect(responses).to.deep.equal([{ action: 'continue-fork', choice: 'refine' }]);
  });

  it('forwards cancel-fork to Unity', () => {
    element.dispatchEvent(new CustomEvent('unity:show-resume-fork'));
    select({ action: 'cancel-fork' });
    expect(responses).to.deep.equal([{ action: 'cancel-fork' }]);
  });

  it('treats closing the fork modal without a choice as cancel-fork', () => {
    element.dispatchEvent(new CustomEvent('unity:show-resume-fork'));
    closeModal('some-other-modal');
    expect(responses).to.deep.equal([]);
    closeModal(RESUME_FORK_MODAL_ID);
    expect(responses).to.deep.equal([{ action: 'cancel-fork' }]);
  });

  it('sends only one response per request', () => {
    element.dispatchEvent(new CustomEvent('unity:show-resume-fork'));
    select({ action: 'continue-fork', choice: 'sharpen' });
    closeModal(RESUME_FORK_MODAL_ID);
    select({ action: 'cancel-fork' });
    expect(responses).to.deep.equal([{ action: 'continue-fork', choice: 'sharpen' }]);
  });

  it('ignores fork events when Unity has not asked', () => {
    select({ action: 'continue-fork', choice: 'sharpen' });
    closeModal(RESUME_FORK_MODAL_ID);
    expect(responses).to.deep.equal([]);
  });
});
