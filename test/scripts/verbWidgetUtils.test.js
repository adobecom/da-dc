/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order

const {
  DC_ENV,
  FILE_PICKER_EVENTS,
  SOLO_PICKER_EVENTS,
  bindFilePicker,
  bindUnityEvents,
  buildEarlyPrefetchUrl,
  createErrorToast,
  createFileInput,
  createFooter,
  createLogger,
  createSvgElement,
  createUploadSession,
  createVerbImage,
  createWidgetFrame,
  fireUpsellAnalytics,
  formatErrorLog,
  getAcceptValue,
  getAuthoredVerbIcon,
  getCookie,
  getCtaLabel,
  getSplunkEndpoint,
  getStoreType,
  getVerbKey,
  handleSignedInUser,
  handleUpSell,
  incrementVerbKey,
  initiatePrefetch,
  isLimitExhausted,
  onDocumentReady,
  parseAuthoredContent,
  prefetchInIframe,
  prefetchNextPage,
  prefetchTarget,
  redDirLink,
  registerAnalyticsLoader,
  renderVerbWidget,
  revealWidget,
  setDraggingClass,
  setUser,
  setupEarlyPrefetch,
  startPageServices,
  trackAnalyticsEvent,
  uploadedTime,
} = await import('../../acrobat/scripts/verbWidgetUtils.js');

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1';
const originalUserAgent = navigator.userAgent;
const setUserAgent = (ua) => {
  Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true });
};

const clearCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

const makeBlock = (rows) => {
  const element = document.createElement('div');
  element.className = 'verb-widget compress-pdf';
  element.innerHTML = rows.map((row) => `<div>${row}</div>`).join('');
  return element;
};

describe('verbWidgetUtils', () => {
  let logger;

  beforeEach(() => {
    window.lana = { log: sinon.stub() };
    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };
    window.mph = {
      'verb-widget-legal': 'Legal text',
      'verb-widget-legal-2': 'By using this service, you agree to the Terms of Use and Privacy Policy.',
      'verb-widget-legal-2-ai': 'AI legal with Terms of Use, Privacy Policy, and GenAI Guidelines',
      'verb-widget-terms-of-use': 'Terms of Use',
      'verb-widget-privacy-policy': 'Privacy Policy',
      'verb-widget-genai-guidelines': 'GenAI Guidelines',
      'verb-widget-tool-tip': 'Tooltip',
      'verb-widget-cta': 'Select a file',
      'verb-widget-cta-multifile-only': 'Select files',
      'verb-widget-compress-pdf-description': 'Desktop placeholder',
    };
    logger = createLogger('test-block');
    setConfig({ ...getConfig(), locale: { prefix: '' } });
  });

  afterEach(() => {
    sinon.restore();
    setUserAgent(originalUserAgent);
    document.body.innerHTML = '';
    delete window.prefetchTargetUrl;
    delete window.prefetchTargetLoaded;
  });

  describe('logging', () => {
    it('tags lana logs with the block name', () => {
      logger.error('boom');
      logger.warn('careful');
      const tags = 'DC_Milo,Project Unity (DC),test-block';
      expect(window.lana.log.firstCall.args).to.deep.equal(['boom', { sampleRate: 1, tags, severity: 'error' }]);
      expect(window.lana.log.secondCall.args[1]).to.deep.equal({ sampleRate: 1, tags, severity: 'warning' });
    });

    it('formats error logs with only the fields that are present', () => {
      expect(formatErrorLog('verb-widget', 'compress-pdf', { code: 'error_generic', status: 500, message: 'Oops' }))
        .to.equal('verb-widget: compress-pdf; Error Code: error_generic, Status: 500, Message: Oops');
      expect(formatErrorLog('client', 'image-to-pdf', { code: 'error_generic', info: 'diag', accountType: 'type1' }))
        .to.equal('client: image-to-pdf; Error Code: error_generic, Info: diag, Account Type: type1');
    });
  });

  describe('redDirLink', () => {
    it('uses the mapped redirect suffix with the env suffix off prod', () => {
      expect(redDirLink('compress-pdf')).to.equal('https://www.adobe.com/go/acrobat-compress-dev');
    });

    it('falls back to the dashless verb name for unmapped verbs', () => {
      expect(redDirLink('pdf-to-word')).to.equal('https://www.adobe.com/go/acrobat-pdftoword-dev');
    });
  });

  describe('verb attempts and user storage', () => {
    afterEach(() => {
      localStorage.removeItem('vwu-test_attempts');
      localStorage.removeItem('unity.user');
    });

    it('tracks attempt counts', () => {
      expect(getVerbKey('vwu-test_attempts')).to.equal('1st');
      expect(incrementVerbKey('vwu-test_attempts')).to.equal(1);
      expect(getVerbKey('vwu-test_attempts')).to.equal('2nd');
      incrementVerbKey('vwu-test_attempts');
      expect(getVerbKey('vwu-test_attempts')).to.equal('2+');
    });

    it('marks the unity user', () => {
      setUser();
      expect(localStorage.getItem('unity.user')).to.equal('true');
    });
  });

  describe('cookies', () => {
    afterEach(() => {
      ['vwu_test', 'UTS_Uploading', 'UTS_Uploaded', 's_ta_ex_p_c'].forEach(clearCookie);
    });

    it('reads cookies by exact name', () => {
      document.cookie = 'vwu_test=abc';
      expect(getCookie('vwu_test')).to.equal('abc');
      expect(getCookie('missing_cookie')).to.be.null;
    });

    it('computes upload time from the UTS cookies', () => {
      expect(uploadedTime()).to.equal('N/A');
      document.cookie = 'UTS_Uploading=1000';
      document.cookie = 'UTS_Uploaded=3500';
      expect(uploadedTime()).to.equal('2.5');
    });

    it('detects an exhausted conversion limit for the current env', () => {
      expect(DC_ENV).to.equal('stage');
      expect(isLimitExhausted('pdf-to-word')).to.be.false;
      document.cookie = 's_ta_ex_p_c=1';
      expect(isLimitExhausted('pdf-to-word')).to.be.true;
      expect(isLimitExhausted('combine-pdf')).to.be.false;
    });
  });

  describe('analytics', () => {
    it('only sends to splunk when requested', () => {
      trackAnalyticsEvent('compress-pdf', 'job:uploading', { a: 1 }, false, false);
      expect(window.analytics.verbAnalytics.calledWith('job:uploading', 'compress-pdf', { a: 1 }, false)).to.be.true;
      expect(window.analytics.sendAnalyticsToSplunk.called).to.be.false;

      trackAnalyticsEvent('compress-pdf', 'job:uploaded', {});
      expect(window.analytics.sendAnalyticsToSplunk.calledOnce).to.be.true;
    });

    it('registers one analytics loader per block and keeps existing analytics', () => {
      const addEventListener = sinon.spy(window, 'addEventListener');
      const existing = window.analytics;
      registerAnalyticsLoader(createLogger('loader-a'));
      registerAnalyticsLoader(createLogger('loader-a'));
      registerAnalyticsLoader(createLogger('loader-b'));
      expect(addEventListener.withArgs('analyticsLoad').callCount).to.equal(2);
      expect(window.analytics).to.equal(existing);
    });

    it('does not report a failed analytics load when analyticsLoad fires twice', async function twiceLoaded() {
      this.timeout(15000);
      const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
      const fire = () => window.dispatchEvent(new CustomEvent('analyticsLoad', { detail: { verb: 'compress-pdf', userAttempts: '1st' } }));
      window.analytics = { verbAnalytics() {}, reviewAnalytics() {}, sendAnalyticsToSplunk() {} };
      const stub = window.analytics.verbAnalytics;
      registerAnalyticsLoader(createLogger('loader-twice'));
      fire();
      while (window.analytics.verbAnalytics === stub) await wait(100);
      fire();
      await wait(4000);
      const messages = window.lana.log.getCalls().map((call) => call.args[0]);
      expect(messages.filter((message) => message.includes('failed to initialize'))).to.deep.equal([]);
    });

    it('picks the splunk endpoint for an explicit env', () => {
      expect(getSplunkEndpoint('prod')).to.equal('https://unity.adobe.io/api/v1/log');
      expect(getSplunkEndpoint('stage')).to.equal('https://unity-stage.adobe.io/api/v1/log');
    });
  });

  describe('prefetch', () => {
    const prefetchLinks = () => [...document.head.querySelectorAll('link[rel="prefetch"]')];
    afterEach(() => prefetchLinks().forEach((link) => link.remove()));

    it('adds prefetch link and hidden iframe', () => {
      prefetchNextPage('https://example.com/next');
      const link = prefetchLinks().find((l) => l.href === 'https://example.com/next');
      expect(link.getAttribute('as')).to.equal('document');

      prefetchInIframe('about:blank');
      expect(document.body.querySelector('iframe[src="about:blank"]').style.display).to.equal('none');
    });

    it('only prefetches the first target and loads its iframe once', () => {
      prefetchTarget();
      expect(document.body.querySelector('iframe')).to.be.null;

      initiatePrefetch('about:blank#first');
      initiatePrefetch('about:blank#second');
      expect(window.prefetchTargetUrl).to.equal('about:blank#first');
      expect(prefetchLinks()).to.have.lengthOf(1);

      prefetchTarget();
      prefetchTarget();
      expect(document.body.querySelectorAll('iframe')).to.have.lengthOf(1);
    });

    it('prefetches the early url on the first interaction only', () => {
      setupEarlyPrefetch('about:blank#early');
      expect(window.prefetchTargetUrl).to.be.null;
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(window.prefetchTargetUrl).to.equal('about:blank#early');
      expect(document.body.querySelectorAll('iframe')).to.have.lengthOf(1);
    });

    it('skips early prefetch without a url', () => {
      setupEarlyPrefetch(null);
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(prefetchLinks()).to.have.lengthOf(0);
    });
  });

  describe('authored content', () => {
    it('reads heading, copy rows and labeled cells', () => {
      const element = makeBlock([
        '<div><h1>Heading</h1></div>',
        '<div>dc-block-row-sub-copy</div><div>Sub copy</div>',
        '<div>Desktop</div>',
        '<div>Mobile</div>',
      ]);
      const content = parseAuthoredContent(element, 'compress-pdf');
      expect(content.heading).to.equal('Heading');
      expect(content.copy).to.equal('Desktop');
      expect(content.mobileCopy).to.equal('Mobile');
      expect(content.cellText('sub-copy')).to.equal('Sub copy');
      expect(content.cell('missing')).to.be.null;
      expect(element.children).to.have.lengthOf(0);
    });

    it('falls back to placeholders and reuses desktop copy on mobile', () => {
      const content = parseAuthoredContent(makeBlock(['<div><h1>Heading</h1></div>']), 'compress-pdf');
      expect(content.copy).to.equal('Desktop placeholder');
      expect(content.mobileCopy).to.equal('Desktop placeholder');
    });

    it('reads an authored image or svg link', () => {
      const withImg = document.createElement('div');
      withImg.innerHTML = '<img src="/a.png" alt="A">';
      expect(getAuthoredVerbIcon(withImg).getAttribute('src')).to.equal('/a.png');

      const withLink = document.createElement('div');
      withLink.innerHTML = '<a href="/icons/b.svg">b</a>';
      const icon = getAuthoredVerbIcon(withLink);
      expect(icon.tagName).to.equal('IMG');
      expect(icon.getAttribute('src')).to.equal('/icons/b.svg');
      expect(icon.getAttribute('alt')).to.equal('');

      expect(getAuthoredVerbIcon(document.createElement('div'))).to.be.null;
    });

    it('picks the CTA label for the upload type', () => {
      expect(getCtaLabel('combine-pdf', { uploadType: 'multifile-only' })).to.equal('Select files');
      expect(getCtaLabel('compress-pdf', {})).to.equal('Select a file');
      window.mph = {};
      expect(getCtaLabel('compress-pdf', {})).to.equal('Select a file');
    });

    it('widens accepted files on iOS for unknown extensions', async () => {
      expect(getAcceptValue(['.pdf', '.psd'])).to.equal('.pdf,.psd');
      setUserAgent(IPHONE_UA);
      expect(getAcceptValue(['.pdf', '.psd'])).to.equal('*/*');
      expect(getAcceptValue(['.jpg', '.png'])).to.equal('.jpg,.png');
      const input = await createFileInput({ acceptedFiles: ['.pdf'], multipleFiles: true });
      expect(input.getAttribute('accept')).to.equal('.pdf');
      expect(input.hasAttribute('multiple')).to.be.true;
    });
  });

  describe('icons', () => {
    it('caches icons per icon set', async () => {
      const custom = { WIDGET_ICON: '<svg id="custom"></svg>' };
      expect((await createSvgElement('WIDGET_ICON', logger, custom)).id).to.equal('custom');
      expect((await createSvgElement('WIDGET_ICON')).id).to.not.equal('custom');
    });

    it('builds the early prefetch url for configured verbs only', () => {
      expect(buildEarlyPrefetchUrl('word-to-pdf')).to.include('stage.acrobat.adobe.com/us/en/word-to-pdf/av?x_api_client_id=unity');
      expect(buildEarlyPrefetchUrl('compress-pdf')).to.be.null;
    });

    it('returns independent clones of inline icons', async () => {
      const first = await createSvgElement('WIDGET_ICON');
      const second = await createSvgElement('WIDGET_ICON');
      expect(first.tagName).to.equal('svg');
      expect(first).to.not.equal(second);
    });

    it('logs once with the block logger and returns null for a missing icon', async () => {
      sinon.stub(window, 'fetch').resolves({ ok: false });
      expect(await createSvgElement('does-not-exist', logger)).to.be.null;
      expect(window.lana.log.calledOnce).to.be.true;
      expect(window.lana.log.firstCall.args[1]).to.equal(logger.options);
    });

    it('keeps authored alt text and falls back to the verb name', async () => {
      const img = document.createElement('img');
      img.setAttribute('alt', 'Authored');
      const authored = await createVerbImage('compress-pdf', img);
      expect(authored.querySelector('img').getAttribute('alt')).to.equal('Authored');

      const fallback = await createVerbImage('compress-pdf', document.createElement('img'));
      expect(fallback.querySelector('img').getAttribute('alt')).to.equal('compress-pdf');
      expect(fallback.querySelector('img').classList.contains('icon-verb-image')).to.be.true;
    });
  });

  describe('layout builders', () => {
    it('builds the widget frame', async () => {
      const { widget, widgetLeft, widgetRight } = await createWidgetFrame();
      expect(widget.id).to.equal('drop-zone');
      expect(widget.querySelector('.verb-container > .verb-row > .verb-col')).to.equal(widgetLeft);
      expect(widgetRight.classList.contains('right')).to.be.true;
    });

    it('builds the footer without genAI links by default', async () => {
      const footer = await createFooter({});
      expect(footer.querySelector('.security-icon svg')).to.exist;
      expect(footer.querySelector('.info-icon').getAttribute('data-tooltip')).to.equal('Tooltip');
      const links = [...footer.querySelectorAll('.verb-legal-url')].map((a) => a.textContent);
      expect(links).to.deep.equal(['Terms of Use', 'Privacy Policy']);
    });

    it('builds the footer with genAI legal copy and link', async () => {
      const footer = await createFooter({ genAI: true });
      const legalTwo = footer.querySelector('.verb-legal-two');
      expect(legalTwo.textContent).to.equal('AI legal with Terms of Use, Privacy Policy, and GenAI Guidelines');
      expect(legalTwo.querySelector('a[href*="gen-ai-user-guidelines"]')).to.exist;
    });

    it('renders an empty footer for mobile-app verbs on phones', async () => {
      setUserAgent(IPHONE_UA);
      const footer = await createFooter({ mobileApp: true });
      expect(footer.className).to.equal('verb-footer');
      expect(footer.children).to.have.lengthOf(0);
    });

    it('handles missing tooltip and legal placeholders', async () => {
      window.mph = {};
      const footer = await createFooter({});
      const infoIcon = footer.querySelector('.info-icon');
      expect(infoIcon.getAttribute('aria-label')).to.equal('Files security information');
      expect(infoIcon.getAttribute('data-tooltip')).to.equal('');
      expect(footer.textContent).to.not.include('undefined');
    });

    it('renders the default layout and accepts custom actions', async () => {
      const element = makeBlock(['<div><h1>Heading</h1></div>']);
      document.body.append(element);
      const ui = await renderVerbWidget(element, { verb: 'compress-pdf', limits: { acceptedFiles: ['.pdf'] } });
      const left = element.querySelector('.verb-col:not(.right)');
      expect([...left.children].map((el) => el.className)).to.deep.equal(['verb-header', 'verb-heading', 'verb-copy', 'verb-cta', 'hide', 'error hide']);
      expect(element.querySelector('.verb-footer')).to.equal(ui.footer);

      const custom = makeBlock(['<div><h1>Heading</h1></div>']);
      const extra = document.createElement('a');
      await renderVerbWidget(custom, { verb: 'compress-pdf', limits: { acceptedFiles: ['.pdf'] }, getActions: () => [extra] });
      expect(custom.querySelector('.verb-col').contains(extra)).to.be.true;
      expect(custom.querySelector('.verb-cta')).to.be.null;
    });

    it('toggles the dragging class', () => {
      const widget = document.createElement('div');
      setDraggingClass(widget, true);
      expect(widget.classList.contains('dragging')).to.be.true;
      setDraggingClass(widget, false);
      expect(widget.classList.contains('dragging')).to.be.false;
    });
  });

  describe('error toast', () => {
    it('shows, announces and hides errors', async () => {
      const widget = document.createElement('div');
      widget.classList.add('dragging');
      const { errorState, showError, hideError } = await createErrorToast(widget);
      document.body.append(widget, errorState);

      showError('Something went wrong');
      expect(errorState.classList.contains('hide')).to.be.false;
      expect(errorState.querySelector('.verb-errorText').textContent).to.equal('Something went wrong');
      expect(widget.classList.contains('dragging')).to.be.false;

      hideError();
      expect(errorState.classList.contains('hide')).to.be.true;
      expect(errorState.querySelector('.verb-errorText').textContent).to.equal('');
    });

    it('closes from the keyboard and on outside click', async () => {
      const widget = document.createElement('div');
      const { errorState, showError } = await createErrorToast(widget);
      document.body.append(widget, errorState);

      showError('Keyboard');
      errorState.querySelector('.verb-errorBtn').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(errorState.classList.contains('hide')).to.be.true;

      showError('Outside');
      await new Promise((resolve) => { setTimeout(resolve, 0); });
      document.body.click();
      expect(errorState.classList.contains('hide')).to.be.true;
    });
  });

  describe('upload session', () => {
    let unloadListeners;
    let session;
    const unload = () => {
      const event = { preventDefault: sinon.spy(), returnValue: undefined };
      unloadListeners.forEach((listener) => listener(event));
      return event;
    };
    const eventNames = () => window.analytics.verbAnalytics.getCalls().map((call) => call.args[0]);

    beforeEach(() => {
      unloadListeners = [];
      const addEventListener = window.addEventListener.bind(window);
      sinon.stub(window, 'addEventListener').callsFake((type, listener, options) => {
        if (type === 'beforeunload') unloadListeners.push(listener);
        else addEventListener(type, listener, options);
      });
      const widget = document.createElement('div');
      session = createUploadSession({
        verb: 'compress-pdf',
        limits: { multipleFiles: true },
        userAttempts: '1st',
        widget,
        showError: sinon.spy(),
        logger,
      });
    });

    afterEach(() => localStorage.removeItem('compress-pdf_attempts'));

    it('tracks the upload lifecycle with file counts and attempts', () => {
      session.setFileCount(2);
      session.track('change', { size: 1 });
      session.track('uploading', { size: 1 });
      const uploadedAt = session.track('uploaded', { size: 1 });
      session.track('unknown-event', {});

      expect(eventNames()).to.deep.equal(['choose-file:open', 'job:uploading', 'job:multi-file-uploading', 'job:uploaded', 'job:multi-file-uploaded']);
      expect(window.analytics.verbAnalytics.firstCall.args[2]).to.deep.equal({ size: 1, userAttempts: '1st', noOfFiles: 2 });
      expect(uploadedAt).to.be.a('number');
      expect(localStorage.getItem('compress-pdf_attempts')).to.equal('1');
    });

    it('reports a tab closure once and prompts only while uploading', () => {
      session.track('change', {});
      const beforeUpload = unload();
      expect(eventNames()).to.include('job:browser-tab-closure');
      expect(beforeUpload.preventDefault.called).to.be.false;

      const uploading = createUploadSession({
        verb: 'v', limits: {}, userAttempts: '1st', widget: document.createElement('div'), showError() {}, logger,
      });
      uploading.track('change', {});
      uploading.track('uploading', {});
      const duringUpload = unloadListeners.slice(-1)[0];
      const event = { preventDefault: sinon.spy(), returnValue: undefined };
      duringUpload(event);
      expect(event.preventDefault.calledOnce).to.be.true;
      expect(event.returnValue).to.be.true;
    });

    it('warns on every close attempt while uploading but reports the closure once', () => {
      session.track('uploading', {});
      const attempts = [unload(), unload(), unload()];
      attempts.forEach((event) => {
        expect(event.preventDefault.calledOnce).to.be.true;
        expect(event.returnValue).to.be.true;
      });
      expect(eventNames().filter((name) => name === 'job:browser-tab-closure')).to.have.lengthOf(1);
    });

    it('stops warning once the upload fails', () => {
      session.track('uploading', {});
      unload();
      session.reportError({ code: 'error_generic', message: 'Oops' });
      expect(unload().preventDefault.called).to.be.false;
    });

    it('skips tab closure tracking after the upload finishes', () => {
      session.track('uploading', {});
      session.track('uploaded', {});
      const event = unload();
      expect(eventNames()).to.not.include('job:browser-tab-closure');
      expect(event.preventDefault.called).to.be.false;
    });

    it('cancels only once per selection', () => {
      session.track('cancel', {});
      session.track('cancel', {});
      expect(eventNames().filter((name) => name === 'job:cancel')).to.have.lengthOf(1);
    });

    it('prefetches the redirect target from redirectUrl events', () => {
      session.track('uploading', {});
      session.track('redirectUrl', { redirectUrl: 'about:blank#target' });
      expect(window.prefetchTargetUrl).to.equal('about:blank#target');
      expect(document.body.querySelector('iframe[src="about:blank#target"]')).to.exist;
      document.head.querySelectorAll('link[rel="prefetch"]').forEach((link) => link.remove());
    });

    it('reports errors to the toast, lana and analytics', () => {
      session.reportError({ code: 'error_generic', message: 'Oops', info: 'diag', metaData: { a: 1 } });
      expect(session.state.exitFlag).to.be.true;
      expect(window.lana.log.firstCall.args[0]).to.equal('test-block: compress-pdf; Error Code: error_generic, Message: Oops, Info: diag');
      expect(window.analytics.verbAnalytics.calledWith('error', 'compress-pdf', { errorInfo: 'diag' })).to.be.true;
      expect(window.analytics.sendAnalyticsToSplunk.firstCall.args.slice(0, 3)).to.deep.equal(['error_generic', 'compress-pdf', { a: 1, errorData: undefined }]);
    });

    it('skips analytics for cookie errors and requires a code', () => {
      session.reportError({ message: 'no code' });
      session.reportError({ code: 'x_cookie_not_set', message: 'Cookie' });
      expect(window.lana.log.calledOnce).to.be.true;
      expect(window.analytics.verbAnalytics.called).to.be.false;
    });

    it('tracks the redirect and navigates', () => {
      const onNavigate = (e) => e.preventDefault();
      window.navigation.addEventListener('navigate', onNavigate);
      session.redirect('https://example.com/target', { size: 1 });
      window.navigation.removeEventListener('navigate', onNavigate);
      expect(window.analytics.verbAnalytics.firstCall.args[2]).to.deep.equal({ size: 1, redirectUrl: 'https://example.com/target', userAttempts: '1st', noOfFiles: null });
    });

    it('maps unity events onto the session', () => {
      const element = document.createElement('div');
      const onReady = sinon.spy();
      window.addEventListener('DCUnity:RedirectReady', onReady);
      bindUnityEvents(element, session);
      element.dispatchEvent(new CustomEvent('unity:track-analytics', { detail: { event: 'uploaded', data: {}, sendToSplunk: false } }));
      element.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_empty_file', message: 'Empty' } }));
      window.removeEventListener('DCUnity:RedirectReady', onReady);
      expect(onReady.calledOnce).to.be.true;
      expect(eventNames()).to.include('job:uploaded');
      expect(eventNames()).to.include('error:EmptyFile');
    });
  });

  describe('file picker', () => {
    it('opens the picker only when the input is on the page and forwards files', async () => {
      const element = makeBlock(['<div><h1>Heading</h1></div>']);
      document.body.append(element);
      const ui = await renderVerbWidget(element, { verb: 'compress-pdf', limits: { acceptedFiles: ['.pdf'] } });
      const session = createUploadSession({
        verb: 'compress-pdf', limits: {}, userAttempts: '1st', widget: ui.widget, showError() {}, logger,
      });
      const onFiles = sinon.spy();
      bindFilePicker(ui, session, onFiles);
      ui.fileInput.addEventListener('click', (e) => e.preventDefault());

      ui.widget.querySelector('.verb-heading').click();
      const pickerEvents = window.analytics.verbAnalytics.getCalls().map((c) => c.args[0]);
      expect(pickerEvents).to.deep.equal(FILE_PICKER_EVENTS);

      window.analytics.verbAnalytics.resetHistory();
      ui.errorState.click();
      expect(window.analytics.verbAnalytics.called).to.be.false;

      ui.widget.dispatchEvent(new Event('dragover'));
      expect(ui.widget.classList.contains('dragging')).to.be.true;
      const drop = new Event('drop');
      Object.defineProperty(drop, 'dataTransfer', { value: { files: [new File(['x'], 'a.pdf')] } });
      ui.widget.dispatchEvent(drop);
      expect(ui.widget.classList.contains('dragging')).to.be.false;
      expect(onFiles.calledOnceWith(sinon.match.any, 'drop')).to.be.true;
      expect(session.state.noOfFiles).to.equal(1);

      ui.fileInput.remove();
      ui.widget.querySelector('.verb-heading').click();
      expect(window.analytics.verbAnalytics.called).to.be.false;
    });
  });

  describe('page helpers', () => {
    it('does not show the upsell to signed-in users', async () => {
      window.adobeIMS = { isSignedInUser: () => true };
      const element = document.createElement('div');
      await handleUpSell('compress-pdf', element, '1st');
      expect(element.classList.contains('upsell')).to.be.false;
      delete window.adobeIMS;
    });

    it('marks signed-in users and widens accepted files before redirecting', () => {
      const onNavigate = sinon.spy((e) => e.preventDefault());
      window.navigation.addEventListener('navigate', onNavigate);
      window.adobeIMS = { isSignedInUser: () => true };
      const element = document.createElement('div');
      element.classList.add('upsell');
      const fileInput = document.createElement('input');
      handleSignedInUser({
        element,
        verb: 'split-pdf',
        limits: { acceptedFiles: ['.pdf'], signedInAcceptedFiles: ['.doc'] },
        fileInput,
      });
      window.navigation.removeEventListener('navigate', onNavigate);
      delete window.adobeIMS;
      expect(element.classList.contains('signed-in')).to.be.true;
      expect(element.classList.contains('upsell')).to.be.false;
      expect(fileInput.accept).to.equal('.pdf,.doc');
      expect(onNavigate.firstCall.args[0].destination.url).to.include('/go/acrobat-split-dev');
    });

    it('reveals the widget and removes the prerender', async () => {
      const section = document.createElement('div');
      section.style.display = 'none';
      const element = document.createElement('div');
      const prerender = document.createElement('div');
      prerender.id = 'prerender_verb-widget';
      section.append(element);
      document.body.append(section, prerender);
      revealWidget(element);
      expect(element.classList.contains('ready')).to.be.true;
      expect(section.style.display).to.equal('block');
      const nextFrame = () => new Promise((resolve) => { requestAnimationFrame(resolve); });
      await nextFrame();
      await nextFrame();
      await new Promise((resolve) => { setTimeout(resolve, 0); });
      expect(document.getElementById('prerender_verb-widget')).to.be.null;
    });

    it('runs callbacks immediately once the document is ready', () => {
      const callback = sinon.spy();
      onDocumentReady(callback);
      expect(callback.calledOnce).to.be.true;
    });

    it('waits for DOMContentLoaded while the document is loading', () => {
      const callback = sinon.spy();
      Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true });
      try {
        onDocumentReady(callback);
        expect(callback.called).to.be.false;
        document.dispatchEvent(new Event('DOMContentLoaded'));
        expect(callback.calledOnce).to.be.true;
      } finally {
        delete document.readyState;
      }
    });

    it('detects the app store for the device', () => {
      const original = window.browser;
      const storeFor = (ua) => {
        window.browser = { ua };
        return getStoreType();
      };
      try {
        expect(storeFor('Mozilla/5.0 (Linux; Android 13; Pixel)')).to.equal('google');
        expect(storeFor(IPHONE_UA)).to.equal('apple');
        expect(storeFor('Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)')).to.equal('apple');
        expect(storeFor('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).to.equal('desktop');
        const iPadOS = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
        setUserAgent(iPadOS);
        document.ontouchend = null;
        expect(storeFor(iPadOS)).to.equal('apple');
      } finally {
        delete document.ontouchend;
        window.browser = original;
      }
    });

    it('fires upsell analytics when the LCP observer is unavailable', async () => {
      const originalObserver = window.PerformanceObserver;
      window.PerformanceObserver = class {
        constructor() { throw new Error('unsupported'); }
      };
      window.adobeIMS = { isSignedInUser: () => false, getAccessToken: () => null };
      window.alloy_getIdentity = Promise.resolve({ identity: { ECID: 'test-ecid' } });
      // eslint-disable-next-line no-underscore-dangle
      window._satellite = { track: sinon.spy() };
      try {
        await fireUpsellAnalytics('compress-pdf', '1st', logger);
      } finally {
        window.PerformanceObserver = originalObserver;
      }
      // eslint-disable-next-line no-underscore-dangle
      const calls = window._satellite.track.getCalls();
      const names = calls.map((c) => c.args[1]?.data?.web?.webInteraction?.name);
      expect(names).to.include('acrobat:verb-compress-pdf:upsell:shown');
      expect(window.lana.log.called).to.be.false;
    });

    it('logs a missing icon when the icon request fails', async () => {
      sinon.stub(window, 'fetch').rejects(new TypeError('Failed to fetch'));
      expect(await createSvgElement('unreachable-icon', logger)).to.be.null;
      expect(window.lana.log.firstCall.args[0]).to.include('Icon not found: unreachable-icon');
    });
  });

  describe('session events', () => {
    const makeSession = (limits = {}) => createUploadSession({
      verb: 'compress-pdf',
      limits,
      userAttempts: '1st',
      widget: document.createElement('div'),
      showError() {},
      logger,
    });

    beforeEach(() => {
      const addEventListener = window.addEventListener.bind(window);
      sinon.stub(window, 'addEventListener').callsFake((type, listener, options) => {
        if (type !== 'beforeunload') addEventListener(type, listener, options);
      });
    });

    it('closes the error toast from its close button', async () => {
      const widget = document.createElement('div');
      const { errorState, showError } = await createErrorToast(widget);
      document.body.append(widget, errorState);
      showError('Click to close');
      errorState.querySelector('.verb-errorBtn').click();
      expect(errorState.classList.contains('hide')).to.be.true;
    });

    it('sends chunk uploads to splunk only when allowed', () => {
      const session = makeSession();
      session.track('chunk_uploaded', { chunkNumber: 1 }, false);
      expect(window.analytics.sendAnalyticsToSplunk.called).to.be.false;
      session.track('chunk_uploaded', { chunkNumber: 2 });
      const [eventName, , metadata] = window.analytics.sendAnalyticsToSplunk.firstCall.args;
      expect(eventName).to.equal('job:chunk-uploaded');
      expect(metadata).to.include({ chunkNumber: 2 });
    });

    it('waits three seconds before redirect ready for verbs with a redirect timeout', () => {
      const clock = sinon.useFakeTimers({ toFake: ['setTimeout'] });
      const element = document.createElement('div');
      const onReady = sinon.spy();
      window.addEventListener('DCUnity:RedirectReady', onReady);
      try {
        bindUnityEvents(element, makeSession({ noRedirectTimeout: false }));
        const detail = { event: 'uploaded', data: {} };
        element.dispatchEvent(new CustomEvent('unity:track-analytics', { detail }));
        expect(onReady.called).to.be.false;
        clock.tick(3000);
        expect(onReady.calledOnce).to.be.true;
        expect(window.lana.log.firstCall.args[1].severity).to.equal('warning');
      } finally {
        window.removeEventListener('DCUnity:RedirectReady', onReady);
        clock.restore();
      }
    });

    it('turns #upload links into file picker labels with their own analytics', async () => {
      const element = makeBlock(['<div><h1>Heading</h1></div>']);
      element.dataset.dcInjectedFromMarquee = 'true';
      const section = document.createElement('div');
      section.innerHTML = '<div><a href="https://example.com/#upload">Upload</a></div>';
      document.body.append(element, section);
      const ui = await renderVerbWidget(element, { verb: 'compress-pdf', limits: { acceptedFiles: ['.pdf'] } });
      ui.fileInput.addEventListener('click', (e) => e.preventDefault());
      const session = makeSession();
      bindFilePicker(ui, session);
      startPageServices(element, session);

      const label = section.querySelector('label.verb-cta-solo');
      expect(label).to.exist;
      expect(label.getAttribute('for')).to.equal('file-upload');
      expect(section.querySelector('a[href*="#upload"]')).to.be.null;

      label.click();
      if (session.state.soloClicked) ui.fileInput.click();
      const names = window.analytics.verbAnalytics.getCalls().map((c) => c.args[0]);
      expect(names).to.deep.equal(SOLO_PICKER_EVENTS);
      expect(session.state.soloClicked).to.be.false;
    });
  });
});
