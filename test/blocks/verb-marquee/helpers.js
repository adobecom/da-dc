/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order

export const createAnalytics = () => {
  const analytics = {};
  ['verbAnalytics', 'reviewAnalytics', 'sendAnalyticsToSplunk'].forEach((method) => {
    const spy = sinon.spy();
    Object.defineProperty(analytics, method, {
      get: () => spy,
      set: () => {},
      enumerable: true,
      configurable: true,
    });
  });
  return analytics;
};

export const eventNames = (spy) => spy.getCalls().map((call) => call.args[0]);

export const lanaMessages = () => window.lana.log.getCalls().map((call) => call.args[0]);

export const splunkArgs = () => window.analytics.sendAnalyticsToSplunk.firstCall.args;

export const fakeUnloadEvent = () => ({ preventDefault: sinon.spy(), returnValue: undefined });

export const stubCookie = (value = '') => {
  const writes = [];
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get: () => value,
    set: (v) => { writes.push(v); },
  });
  return writes;
};

export const restoreCookie = () => {
  delete document.cookie;
};

export async function setupPage() {
  const ctx = { beforeUnloadListeners: [] };
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
  ctx.xhr = sinon.useFakeXMLHttpRequest();
  document.body.innerHTML = await readFile({ path: './mocks/body-word-to-pdf.html' });
  ctx.block = document.body.querySelector('.verb-marquee');
  window.adobeIMS = { isSignedInUser: () => false };
  window.lana = { log: sinon.stub() };
  window.analytics = createAnalytics();
  const originalAdd = window.addEventListener;
  sinon.stub(window, 'addEventListener').callsFake((type, listener, options) => {
    if (type === 'beforeunload') {
      ctx.beforeUnloadListeners.push(listener);
      return undefined;
    }
    return originalAdd.call(window, type, listener, options);
  });
  setConfig({ ...getConfig(), locale: { prefix: '' } });
  ctx.trackAnalytics = (detail) => {
    ctx.block.dispatchEvent(new CustomEvent('unity:track-analytics', { detail }));
  };
  return ctx;
}

export function teardownPage(ctx) {
  restoreCookie();
  ctx.xhr.restore();
  sinon.restore();
}
