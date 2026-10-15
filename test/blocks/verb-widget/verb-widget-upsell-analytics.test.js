/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

const { fireUpsellAnalytics } = await import(
  '../../../acrobat/blocks/verb-widget/verb-widget.js'
);

// Verifies the ticket's "no change in data" guarantee for the upsell path:
// the upsell "shown" events are emitted during init (before the real analytics
// is loaded), so they must be deferred to post-LCP and still reach the real
// analytics pipeline instead of being dropped on the no-op stub.
describe('verb-widget upsell analytics deferral', () => {
  let originalPO;

  beforeEach(() => {
    // Resolve the LCP gate immediately so the deferred events fire without a
    // multi-second wait; the real LCP timing is irrelevant to what we assert.
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
