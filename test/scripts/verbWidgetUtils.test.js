/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order

const {
  DC_ENV,
  FILE_PICKER_EVENTS,
  createErrorToast,
  createFooter,
  createSvgElement,
  createVerbImage,
  createWidgetFrame,
  getAuthoredVerbIcon,
  getCookie,
  getVerbKey,
  handleUpSell,
  incrementVerbKey,
  isLimitExhausted,
  onDocumentReady,
  prefetchInIframe,
  prefetchNextPage,
  redDirLink,
  registerAnalyticsLoader,
  setUser,
  trackAnalyticsEvent,
  uploadedTime,
} = await import('../../acrobat/scripts/verbWidgetUtils.js');

const clearCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

describe('verbWidgetUtils', () => {
  beforeEach(() => {
    window.lana = { log: sinon.stub() };
    window.mph = {
      'verb-widget-legal': 'Legal text',
      'verb-widget-legal-2': 'By using this service, you agree to the Terms of Use and Privacy Policy.',
      'verb-widget-legal-2-ai': 'AI legal with Terms of Use, Privacy Policy, and GenAI Guidelines',
      'verb-widget-terms-of-use': 'Terms of Use',
      'verb-widget-privacy-policy': 'Privacy Policy',
      'verb-widget-genai-guidelines': 'GenAI Guidelines',
      'verb-widget-tool-tip': 'Tooltip',
    };
    setConfig({ ...getConfig(), locale: { prefix: '' } });
  });

  afterEach(() => {
    sinon.restore();
    document.body.innerHTML = '';
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
      window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };
      trackAnalyticsEvent('compress-pdf', 'job:uploading', { a: 1 }, false, false);
      expect(window.analytics.verbAnalytics.calledWith('job:uploading', 'compress-pdf', { a: 1 }, false)).to.be.true;
      expect(window.analytics.sendAnalyticsToSplunk.called).to.be.false;

      trackAnalyticsEvent('compress-pdf', 'job:uploaded', {});
      expect(window.analytics.sendAnalyticsToSplunk.calledOnce).to.be.true;
    });

    it('registers the analytics loader only once', () => {
      registerAnalyticsLoader('test-block');
      const stubs = window.analytics;
      expect(stubs.verbAnalytics).to.be.a('function');
      const replacement = { verbAnalytics() {}, reviewAnalytics() {}, sendAnalyticsToSplunk() {} };
      window.analytics = replacement;
      registerAnalyticsLoader('test-block');
      expect(window.analytics).to.equal(replacement);
    });

    it('exposes the file picker analytics events in order', () => {
      expect(FILE_PICKER_EVENTS[0]).to.equal('filepicker:shown');
      expect(FILE_PICKER_EVENTS).to.have.lengthOf(5);
    });
  });

  describe('icons', () => {
    it('returns independent clones of inline icons', async () => {
      const first = await createSvgElement('WIDGET_ICON');
      const second = await createSvgElement('WIDGET_ICON');
      expect(first.tagName).to.equal('svg');
      expect(first).to.not.equal(second);
    });

    it('logs once and returns null for a missing icon', async () => {
      sinon.stub(window, 'fetch').resolves({ ok: false });
      const options = { tags: 'custom' };
      expect(await createSvgElement('does-not-exist', options)).to.be.null;
      expect(window.lana.log.calledOnce).to.be.true;
      expect(window.lana.log.firstCall.args[1]).to.equal(options);
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

    it('keeps authored alt text and falls back to the verb name', async () => {
      const img = document.createElement('img');
      img.setAttribute('alt', 'Authored');
      const authored = await createVerbImage('compress-pdf', img);
      expect(authored.querySelector('img').getAttribute('alt')).to.equal('Authored');

      const blank = document.createElement('img');
      const fallback = await createVerbImage('compress-pdf', blank);
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
      const footer = await createFooter();
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

    it('handles missing tooltip and legal placeholders', async () => {
      window.mph = {};
      const footer = await createFooter();
      const infoIcon = footer.querySelector('.info-icon');
      expect(infoIcon.getAttribute('aria-label')).to.equal('Files security information');
      expect(infoIcon.getAttribute('data-tooltip')).to.equal('');
      expect(footer.textContent).to.not.include('undefined');
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
      expect(errorState.classList.contains('verb-error')).to.be.true;
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
      const closeButton = errorState.querySelector('.verb-errorBtn');

      showError('Keyboard');
      closeButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(errorState.classList.contains('hide')).to.be.true;

      showError('Outside');
      await new Promise((resolve) => { setTimeout(resolve, 0); });
      document.body.click();
      expect(errorState.classList.contains('hide')).to.be.true;
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

    it('runs callbacks immediately once the document is ready', () => {
      const callback = sinon.spy();
      onDocumentReady(callback);
      expect(callback.calledOnce).to.be.true;
    });

    it('adds prefetch link and hidden iframe', () => {
      prefetchNextPage('https://example.com/next');
      const link = document.head.querySelector('link[rel="prefetch"][href="https://example.com/next"]');
      expect(link).to.exist;
      expect(link.getAttribute('as')).to.equal('document');
      link.remove();

      prefetchInIframe('about:blank');
      const iframe = document.body.querySelector('iframe[src="about:blank"]');
      expect(iframe.style.display).to.equal('none');
    });
  });
});
