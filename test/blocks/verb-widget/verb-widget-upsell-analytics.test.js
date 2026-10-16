/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved

const { default: init, fireUpsellAnalytics } = await import(
  '../../../acrobat/blocks/verb-widget/verb-widget.js'
);

describe('verb-widget upsell analytics deferral', () => {
  let originalPO;

  beforeEach(() => {
    originalPO = window.PerformanceObserver;
    window.PerformanceObserver = class {
      constructor(cb) { this.cb = cb; }

      observe() { this.cb({ getEntries: () => [{ startTime: 0 }] }); }

      // eslint-disable-next-line class-methods-use-this
      disconnect() {}
    };
    window.adobeIMS = { isSignedInUser: () => false, getAccessToken: () => null };
    window.alloy_getIdentity = Promise.resolve({ identity: { ECID: 'test-ecid' } });
    // eslint-disable-next-line no-underscore-dangle
    window._satellite = { track: sinon.spy() };
  });

  afterEach(() => {
    window.PerformanceObserver = originalPO;
    sinon.restore();
  });

  it('fires both upsell events through the real analytics after LCP', async () => {
    await fireUpsellAnalytics('compress-pdf', 2);

    const names = window._satellite.track // eslint-disable-line no-underscore-dangle
      .getCalls()
      .map((c) => c.args[1]?.data?.web?.webInteraction?.name);
    expect(names).to.include('acrobat:verb-compress-pdf:upsell:shown');
    expect(names).to.include('acrobat:verb-compress-pdf:upsell-wall:shown');
  });

  it('init delivers both upsell events to _satellite.track when analytics is the no-op stub', async () => {
    const placeholders = JSON.parse(await readFile({ path: './mocks/placeholders.json' }));
    window.mph = {};
    placeholders.data.forEach((item) => { window.mph[item.key] = item.value; });
    document.head.innerHTML = await readFile({ path: './mocks/head.html' });
    document.body.innerHTML = await readFile({ path: './mocks/body-compress-pdf.html' });
    window.adobeid = { client_id: 'acrobatmilo' };
    setConfig({ ...getConfig(), locale: { prefix: '' }, codeRoot: '/acrobat' });
    window.analytics = {
      verbAnalytics: () => {},
      reviewAnalytics: () => {},
      sendAnalyticsToSplunk: () => {},
    };
    document.cookie = 's_ta_cm_p_ops=1';

    try {
      await init(document.body.querySelector('.verb-widget'));
      const getNames = () => window._satellite.track // eslint-disable-line no-underscore-dangle
        .getCalls()
        .map((c) => c.args[1]?.data?.web?.webInteraction?.name);
      const deadline = Date.now() + 5000;
      while (!getNames().includes('acrobat:verb-compress-pdf:upsell-wall:shown') && Date.now() < deadline) {
        await new Promise((r) => { setTimeout(r, 50); });
      }
      expect(getNames()).to.include('acrobat:verb-compress-pdf:upsell:shown');
      expect(getNames()).to.include('acrobat:verb-compress-pdf:upsell-wall:shown');
    } finally {
      document.cookie = 's_ta_cm_p_ops=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  });
});
