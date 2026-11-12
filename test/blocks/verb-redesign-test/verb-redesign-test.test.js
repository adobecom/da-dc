/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { delay } from '../../helpers/waitfor.js';
import { SOLO_PICKER_EVENTS } from '../../../acrobat/scripts/verbWidgetUtils.js';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order

const { default: init, LIMITS } = await import(
  '../../../acrobat/blocks/verb-redesign-test/verb-redesign-test.js'
);

const dispatchTrack = (block, event, detail = {}) => {
  block.dispatchEvent(new CustomEvent('unity:track-analytics', { detail: { event, data: {}, sendToSplunk: true, ...detail } }));
};

describe('verb-redesign-test block', () => {
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
    document.body.innerHTML = await readFile({ path: './mocks/body-word-to-pdf.html' });
    window.adobeIMS = { isSignedInUser: () => false };
    window.lana = { log: sinon.spy() };
  });

  afterEach(() => {
    xhr.restore();
    sinon.restore();
  });

  it('exports LIMITS for jpg-to-pdf and word-to-pdf', () => {
    expect(LIMITS).to.have.property('jpg-to-pdf');
    expect(LIMITS).to.have.property('word-to-pdf');
    ['jpg-to-pdf', 'word-to-pdf'].forEach((verb) => {
      expect(LIMITS[verb].acceptedFiles).to.be.an('array');
      expect(LIMITS[verb].acceptedFiles).to.include('.pdf');
      expect(LIMITS[verb].maxFileSize).to.equal(104857600);
      expect(LIMITS[verb].multipleFiles).to.be.true;
      expect(LIMITS[verb].noRedirectTimeout).to.be.true;
    });
  });

  it('init word-to-pdf block renders header, dropzone and file input', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);

    expect(block.classList.contains('con-block')).to.be.true;
    expect(document.querySelector('.verb-redesign-test .vm2-heading')).to.exist;
    expect(document.querySelector('.verb-redesign-test .vm2-dropzone')).to.exist;
    const fileInput = document.querySelector('.verb-redesign-test #file-upload');
    expect(fileInput).to.exist;
    expect(fileInput.getAttribute('accept').split(',')).to.include('.pdf');
    // Placeholders drive benefits, legal links and tooltip.
    expect(document.querySelector('.verb-redesign-test .vm2-benefits')).to.exist;
    expect(document.querySelector('.verb-redesign-test .vm2-legal-url')).to.exist;
    expect(document.querySelector('.verb-redesign-test .info-icon svg')).to.exist;
  });

  it('init challenger1 variant lays out text columns', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body-jpg-to-pdf-challenger1.html' });
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);

    expect(block.classList.contains('challenger1')).to.be.true;
    expect(document.querySelector('.verb-redesign-test .vm2-text-col')).to.exist;
    expect(document.querySelector('.verb-redesign-test .vm2-text-top')).to.exist;
    expect(document.querySelector('.verb-redesign-test .vm2-text-bottom')).to.exist;
  });

  it('handles unity:track-analytics events without throwing', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };

    dispatchTrack(block, 'change');
    dispatchTrack(block, 'drop');
    dispatchTrack(block, 'cancel');
    dispatchTrack(block, 'uploading', { sendToSplunk: false });
    dispatchTrack(block, 'uploaded');
    dispatchTrack(block, 'chunk_uploaded');
    dispatchTrack(block, 'redirectUrl', { data: { redirectUrl: 'https://example.com/next' } });

    expect(window.analytics.verbAnalytics.called).to.be.true;
    expect(window.analytics.sendAnalyticsToSplunk.called).to.be.true;
    expect(window.analytics.verbAnalytics.calledWith('job:uploaded')).to.be.true;

    expect(() => dispatchTrack(block, 'unknown')).to.not.throw();
    // Missing event is ignored.
    expect(() => block.dispatchEvent(new CustomEvent('unity:track-analytics', { detail: {} }))).to.not.throw();
  });

  it('dispatches redirect immediately on uploaded when noRedirectTimeout is truthy', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };
    const redirectSpy = sinon.spy();
    window.addEventListener('DCUnity:RedirectReady', redirectSpy);

    dispatchTrack(block, 'uploaded');

    window.removeEventListener('DCUnity:RedirectReady', redirectSpy);
    expect(redirectSpy.called).to.be.true;
  });

  it('delays redirect and logs a warning on uploaded when noRedirectTimeout is false', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };
    const original = LIMITS['word-to-pdf'].noRedirectTimeout;
    LIMITS['word-to-pdf'].noRedirectTimeout = false;
    const clock = sinon.useFakeTimers();
    const redirectSpy = sinon.spy();
    window.addEventListener('DCUnity:RedirectReady', redirectSpy);

    try {
      dispatchTrack(block, 'uploaded');
      expect(redirectSpy.called).to.be.false;
      clock.tick(3000);
      expect(redirectSpy.called).to.be.true;
      expect(window.lana.log.calledWith(sinon.match(/3 second timeout dispatched event/))).to.be.true;
    } finally {
      clock.restore();
      window.removeEventListener('DCUnity:RedirectReady', redirectSpy);
      if (original === undefined) delete LIMITS['word-to-pdf'].noRedirectTimeout;
      else LIMITS['word-to-pdf'].noRedirectTimeout = original;
    }
  });

  it('shows an error toast and maps the error to analytics', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', {
      detail: {
        code: 'error_unsupported_type',
        info: 'Test error info',
        metaData: 'metadata',
        errorData: 'errorData',
        sendToSplunk: true,
        message: 'This file type is not supported.',
      },
    }));

    const errorState = block.querySelector('.error');
    expect(errorState.classList.contains('hide')).to.be.false;
    expect(block.querySelector('.vm2-error-text').textContent).to.equal('This file type is not supported.');
    expect(window.analytics.verbAnalytics.calledWith('error:UnsupportedFile')).to.be.true;
    expect(window.analytics.sendAnalyticsToSplunk.called).to.be.true;
    expect(window.lana.log.called).to.be.true;
  });

  it('ignores an error toast with no code and returns early on cookie_not_set', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: {} }));
    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'cookie_not_set', message: 'ignored' } }));

    expect(window.analytics.verbAnalytics.called).to.be.false;
  });

  it('closes the error toast when the close button is clicked', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };
    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Test error', sendToSplunk: false } }));

    const errorState = block.querySelector('.error');
    expect(errorState.classList.contains('hide')).to.be.false;
    block.querySelector('.vm2-error-btn').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(errorState.classList.contains('hide')).to.be.true;
  });

  it('opens the file picker when the cta is clicked', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);

    const fileInput = block.querySelector('#file-upload');
    const clickSpy = sinon.spy(fileInput, 'click');
    block.querySelector('.vm2-cta').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clickSpy.called).to.be.true;
  });

  it('tracks a drop of files onto the block', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);

    const dataTransfer = new DataTransfer();
    const dropEvent = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer });
    expect(() => block.dispatchEvent(dropEvent)).to.not.throw();
    expect(block.classList.contains('dragging-block')).to.be.false;
  });

  it('handles a signed-in user without an account type', async () => {
    window.adobeIMS = {
      isSignedInUser: () => true,
      getAccountType: () => '',
    };
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);
    expect(document.querySelector('.verb-redesign-test .vm2-heading')).to.exist;
  });

  it('toggles the dragging class on dragover and dragleave', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);

    const dropzone = block.querySelector('.vm2-dropzone');
    block.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }));
    expect(dropzone.classList.contains('dragging')).to.be.true;
    expect(block.classList.contains('dragging-block')).to.be.true;

    block.dispatchEvent(new DragEvent('dragleave', { bubbles: true, cancelable: true, relatedTarget: dropzone }));
    expect(dropzone.classList.contains('dragging')).to.be.true;

    block.dispatchEvent(new DragEvent('dragleave', { bubbles: true, cancelable: true, relatedTarget: null }));
    expect(dropzone.classList.contains('dragging')).to.be.false;
    expect(block.classList.contains('dragging-block')).to.be.false;
  });

  it('fires solo picker analytics when the solo upload label is clicked', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    const soloWrapper = document.createElement('div');
    soloWrapper.innerHTML = '<a href="#upload">Upload</a>';
    document.body.append(soloWrapper);
    await init(block);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };
    const fileInput = block.querySelector('#file-upload');
    fileInput.addEventListener('click', (e) => e.preventDefault());
    const label = soloWrapper.querySelector('label.vm2-cta-solo');
    expect(label).to.exist;
    expect(soloWrapper.querySelector('a[href*="#upload"]')).to.not.exist;

    label.click();

    expect(window.analytics.verbAnalytics.callCount).to.equal(SOLO_PICKER_EVENTS.length);
    SOLO_PICKER_EVENTS.forEach((evt) => {
      expect(window.analytics.verbAnalytics.calledWith(evt, 'word-to-pdf', sinon.match.has('userAttempts'))).to.be.true;
    });
  });

  it('logs to lana and removes the injected verb-widget when its init fails', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    block.classList.replace('word-to-pdf', 'unknown-to-pdf');
    document.cookie = 's_ta_cr_p_c=1; path=/';
    try {
      await init(block);
    } finally {
      document.cookie = 's_ta_cr_p_c=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    expect(window.lana.log.calledWith(
      sinon.match(/verb-widget init from verb-redesign-test failed/),
      sinon.match({ tags: sinon.match(/verb-redesign-test/), severity: 'error' }),
    )).to.be.true;
    expect(block.querySelector('.verb-widget')).to.not.exist;
    expect(block.querySelector('#file-upload')).to.not.exist;
  });

  it('sends tab-closure analytics from the registered upload listener on beforeunload', async () => {
    const unloadListeners = [];
    sinon.stub(window, 'addEventListener').callsFake(function addListener(type, listener, ...rest) {
      if (type === 'beforeunload') {
        unloadListeners.push(listener);
        return undefined;
      }
      return window.addEventListener.wrappedMethod.call(this, type, listener, ...rest);
    });
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };
    const initListenerCount = unloadListeners.length;
    dispatchTrack(block, 'uploading', { sendToSplunk: false });
    expect(unloadListeners.length).to.equal(initListenerCount + 1);
    window.analytics.verbAnalytics.resetHistory();
    window.analytics.sendAnalyticsToSplunk.resetHistory();

    const fakeEvent = { preventDefault: sinon.spy(), returnValue: undefined };
    unloadListeners[unloadListeners.length - 1](fakeEvent);

    expect(window.analytics.verbAnalytics.calledWith('job:browser-tab-closure', 'word-to-pdf')).to.be.true;
    expect(window.analytics.sendAnalyticsToSplunk.calledWith(
      'job:browser-tab-closure',
      'word-to-pdf',
      sinon.match({ workflowStep: 'uploading', uploadTime: sinon.match.string }),
      sinon.match.string,
      true,
    )).to.be.true;
    expect(fakeEvent.preventDefault.calledOnce).to.be.true;
    expect(fakeEvent.returnValue).to.be.true;
  });
});
