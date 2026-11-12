import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { delay } from '../../helpers/waitfor.js';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order

const { default: init } = await import(
  '../../../acrobat/blocks/verb-redesign-test/verb-redesign-test.js'
);

describe('verb-redesign-test block beforeunload', () => {
  let xhr;
  let unloadListeners;

  beforeEach(async () => {
    sinon.stub(window, 'fetch');
    window.fetch.callsFake((x) => {
      if (x.endsWith('.svg')) {
        return window.fetch.wrappedMethod.call(window, x);
      }
      return Promise.resolve();
    });
    const placeholders = JSON.parse(await readFile({ path: './mocks/placeholders.json' }));
    window.mph = {};
    placeholders.data.forEach((item) => {
      window.mph[item.key] = item.value;
    });
    xhr = sinon.useFakeXMLHttpRequest();
    document.head.innerHTML = await readFile({ path: './mocks/head.html' });
    document.body.innerHTML = await readFile({ path: './mocks/body-word-to-pdf.html' });
    window.adobeIMS = { isSignedInUser: () => false };
    window.lana = { log: sinon.spy() };
    unloadListeners = [];
    sinon.stub(window, 'addEventListener').callsFake(function addListener(type, listener, ...rest) {
      if (type === 'beforeunload') {
        unloadListeners.push(listener);
        return undefined;
      }
      return window.addEventListener.wrappedMethod.call(this, type, listener, ...rest);
    });
  });

  afterEach(() => {
    xhr.restore();
    sinon.restore();
  });

  it('sends tab-closure analytics from the page beforeunload listener only while uploading', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.verb-redesign-test');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };
    const [pageUnloadListener] = unloadListeners;
    expect(pageUnloadListener).to.be.a('function');

    const idleEvent = { preventDefault: sinon.spy(), returnValue: undefined };
    pageUnloadListener(idleEvent);
    expect(window.analytics.sendAnalyticsToSplunk.called).to.be.false;
    expect(idleEvent.preventDefault.called).to.be.false;

    block.dispatchEvent(new CustomEvent('unity:track-analytics', { detail: { event: 'uploading', data: {}, sendToSplunk: false } }));
    window.analytics.verbAnalytics.resetHistory();
    window.analytics.sendAnalyticsToSplunk.resetHistory();

    const uploadingEvent = { preventDefault: sinon.spy(), returnValue: undefined };
    pageUnloadListener(uploadingEvent);

    expect(window.analytics.verbAnalytics.calledWith('job:browser-tab-closure', 'word-to-pdf', sinon.match.has('userAttempts'), false)).to.be.true;
    expect(window.analytics.sendAnalyticsToSplunk.calledOnce).to.be.true;
    const [eventName, verb, payload, endpoint, unloading] = window.analytics
      .sendAnalyticsToSplunk.firstCall.args;
    expect(eventName).to.equal('job:browser-tab-closure');
    expect(verb).to.equal('word-to-pdf');
    expect(payload).to.have.all.keys('userAttempts', 'uploadTime');
    expect(payload.uploadTime).to.match(/^(\d+\.\d|N\/A)$/);
    expect(endpoint).to.be.a('string');
    expect(unloading).to.be.true;
    expect(uploadingEvent.preventDefault.calledOnce).to.be.true;
    expect(uploadingEvent.returnValue).to.be.true;

    const repeatEvent = { preventDefault: sinon.spy(), returnValue: undefined };
    pageUnloadListener(repeatEvent);
    expect(window.analytics.sendAnalyticsToSplunk.calledOnce).to.be.true;
  });
});
