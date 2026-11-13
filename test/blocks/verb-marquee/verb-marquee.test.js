import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js';
import { delay } from '../../helpers/waitfor.js';

const {
  default: init,
  initResumeFork,
  flagResumeFork,
  RESUME_FORK_MODAL_ID,
} = await import(
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

  it('opens the resume fork modal when Unity asks the block', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-marquee');
    await init(block);
    const { default: decorateFork } = await import('../../../acrobat/blocks/resume-upload-fork/resume-upload-fork.js');
    const forkHtml = await readFile({ path: '../resume-upload-fork/mocks/default.html' });
    const fork = new DOMParser().parseFromString(forkHtml, 'text/html').querySelector('.resume-upload-fork');
    document.body.append(fork);
    await decorateFork(fork);
    const onModalOpen = sinon.spy();
    const onResponse = sinon.spy();
    const verbAnalytics = sinon.stub(window.analytics, 'verbAnalytics');
    const splunk = sinon.stub(window.analytics, 'sendAnalyticsToSplunk');
    window.addEventListener('modal:open', onModalOpen);
    block.addEventListener('unity:resume-fork-response', onResponse);
    block.dispatchEvent(new CustomEvent('unity:show-resume-fork'));
    window.removeEventListener('modal:open', onModalOpen);
    expect(onModalOpen.calledOnce).to.be.true;
    expect(onModalOpen.firstCall.args[0].detail).to.deep.equal({ hash: `#${RESUME_FORK_MODAL_ID}` });
    window.dispatchEvent(new CustomEvent('milo:modal:loaded', { detail: { id: RESUME_FORK_MODAL_ID } }));
    fork.querySelectorAll('[role="radio"]')[1].click();
    fork.querySelector('[data-action="continue-fork"]').click();
    window.dispatchEvent(new CustomEvent('milo:modal:closed', { detail: { id: RESUME_FORK_MODAL_ID } }));
    expect(onResponse.calledOnce).to.be.true;
    expect(onResponse.firstCall.args[0].detail).to.deep.equal({
      action: 'continue-fork',
      choice: 'refresh',
    });
    const expectedEvents = ['fork-modal:shown', 'fork-modal:continue-refresh'];
    expect(verbAnalytics.getCalls().map((call) => call.args[0])).to.deep.equal(expectedEvents);
    expect(splunk.getCalls().map((call) => call.args[0])).to.deep.equal(expectedEvents);
    expect(verbAnalytics.firstCall.args[1]).to.equal('word-to-pdf');
    expect(verbAnalytics.firstCall.args[2]).to.have.keys('userAttempts', 'noOfFiles');
    expect(splunk.firstCall.args[2]).to.deep.equal(verbAnalytics.firstCall.args[2]);
    expect(splunk.firstCall.args[3]).to.equal('https://unity-stage.adobe.io/api/v1/log');
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

describe('verb-marquee resume fork', () => {
  let element;
  let responses;
  let modalOpens;
  let tracked;
  let cleanup;
  const onModalOpen = (e) => modalOpens.push(e.detail);
  const select = (detail) => window.dispatchEvent(new CustomEvent('resume-upload-fork:select', { detail }));
  const closeModal = (id) => window.dispatchEvent(new CustomEvent('milo:modal:closed', { detail: { id } }));
  const loadModal = (id) => window.dispatchEvent(new CustomEvent('milo:modal:loaded', { detail: { id } }));
  const showFork = () => element.dispatchEvent(new CustomEvent('unity:show-resume-fork'));

  beforeEach(() => {
    element = document.createElement('div');
    const received = [];
    responses = received;
    modalOpens = [];
    tracked = [];
    element.addEventListener('unity:resume-fork-response', (e) => received.push(e.detail));
    window.addEventListener('modal:open', onModalOpen);
    cleanup = initResumeFork(element, (name) => tracked.push(name));
  });

  afterEach(() => {
    cleanup();
    window.removeEventListener('modal:open', onModalOpen);
  });

  it('opens the fork modal when Unity asks for it', () => {
    element.dispatchEvent(new CustomEvent('unity:show-resume-fork'));
    expect(modalOpens).to.deep.equal([{ hash: `#${RESUME_FORK_MODAL_ID}` }]);
  });

  it('forwards continue-fork with the chosen product to Unity', () => {
    element.dispatchEvent(new CustomEvent('unity:show-resume-fork'));
    select({ action: 'continue-fork', choice: 'refresh' });
    expect(responses).to.deep.equal([{ action: 'continue-fork', choice: 'refresh' }]);
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

  it('stops listening after cleanup', () => {
    cleanup();
    element.dispatchEvent(new CustomEvent('unity:show-resume-fork'));
    select({ action: 'continue-fork', choice: 'sharpen' });
    expect(modalOpens).to.deep.equal([]);
    expect(responses).to.deep.equal([]);
  });

  describe('analytics', () => {
    it('tracks the modal being shown only for a requested fork modal', () => {
      loadModal(RESUME_FORK_MODAL_ID);
      showFork();
      loadModal('some-other-modal');
      loadModal(RESUME_FORK_MODAL_ID);
      expect(tracked).to.deep.equal(['fork-modal:shown']);
    });

    ['sharpen', 'refresh'].forEach((choice) => {
      it(`tracks continue on ${choice}`, () => {
        showFork();
        select({ action: 'continue-fork', choice });
        closeModal(RESUME_FORK_MODAL_ID);
        expect(tracked).to.deep.equal([`fork-modal:continue-${choice}`]);
      });
    });

    it('tracks Cancel as a bounce', () => {
      showFork();
      select({ action: 'cancel-fork', dismiss: 'cancel' });
      closeModal(RESUME_FORK_MODAL_ID);
      expect(tracked).to.deep.equal(['fork-modal:bounce:cancel']);
    });

    it('tracks the exit method of a bounce without passing it to Unity', () => {
      showFork();
      select({ action: 'cancel-fork', dismiss: 'escape' });
      expect(tracked).to.deep.equal(['fork-modal:bounce:escape']);
      expect(responses).to.deep.equal([{ action: 'cancel-fork' }]);
    });

    it('tracks closing the modal with no exit method as a bounce', () => {
      showFork();
      closeModal(RESUME_FORK_MODAL_ID);
      expect(tracked).to.deep.equal(['fork-modal:bounce:other']);
    });

    it('tracks nothing when Unity has not asked', () => {
      select({ action: 'continue-fork', choice: 'sharpen' });
      closeModal(RESUME_FORK_MODAL_ID);
      expect(tracked).to.deep.equal([]);
    });
  });
});

describe('verb-marquee flagResumeFork', () => {
  let element;
  let meta;
  let originalIms;
  const resolvedIms = () => Promise.resolve();

  const setSignedIn = (signedIn) => {
    window.adobeIMS = { isSignedInUser: () => signedIn };
  };

  beforeEach(() => {
    element = document.createElement('div');
    originalIms = window.adobeIMS;
    meta = document.createElement('meta');
    meta.name = `-${RESUME_FORK_MODAL_ID}`;
    meta.content = '/acrobat/fragments/resume-fork';
    document.head.append(meta);
  });

  afterEach(() => {
    meta.remove();
    window.adobeIMS = originalIms;
  });

  it('flags logged-out users when the fork metadata is set', async () => {
    setSignedIn(false);
    await flagResumeFork(element, resolvedIms);
    expect(element.dataset.showResumeFork).to.equal('true');
  });

  it('does not flag signed-in users', async () => {
    setSignedIn(true);
    await flagResumeFork(element, resolvedIms);
    expect(element.hasAttribute('data-show-resume-fork')).to.be.false;
  });

  it('does not flag pages without the fork metadata', async () => {
    meta.remove();
    setSignedIn(false);
    let imsRequested = false;
    await flagResumeFork(element, () => {
      imsRequested = true;
      return Promise.resolve();
    });
    expect(element.hasAttribute('data-show-resume-fork')).to.be.false;
    expect(imsRequested).to.be.false;
  });

  it('does not flag when IMS fails to load', async () => {
    setSignedIn(false);
    await flagResumeFork(element, () => Promise.reject(new Error('IMS timeout')));
    expect(element.hasAttribute('data-show-resume-fork')).to.be.false;
  });
});
