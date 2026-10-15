/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

const { fireUpsellAnalytics } = await import(
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
});
