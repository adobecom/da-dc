/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import * as sinon from 'sinon';

const { default: init, sendAnalyticsToSplunk } = await import(
  '../../../acrobat/scripts/alloy/verb-widget.js'
);

describe('Alloy verb-widget', () => {
  let xhr;

  beforeEach(() => {
    sinon.stub(window, 'fetch');
    window.fetch.callsFake((x) => {
      if (x.startsWith('https://splunk.adobe.com/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }
      if (x.startsWith('https://failed.adobe.com/')) {
        throw new Error('Failed to send analytics to Splunk');
      }
      return window.fetch.wrappedMethod.call(window, x);
    });
    xhr = sinon.useFakeXMLHttpRequest();
    // eslint-disable-next-line no-underscore-dangle
    window._satellite = { track: sinon.stub() };
    window.lana = { log: sinon.stub() };
    window.adobeIMS = { getAccessToken: () => null, isSignedInUser: () => false };
    window.alloy_getIdentity = Promise.resolve({ identity: { ECID: 'test-ecid' } });
  });

  afterEach(() => {
    xhr.restore();
    sinon.restore();
  });

  it('initiates alloy verb-widget', () => {
    const eventName = 'verb-widget-show';
    const verb = 'sign-pdf';
    const metaData = 'test comment';
    const documentUnloading = false;

    init(eventName, verb, metaData, documentUnloading);

    // eslint-disable-next-line no-underscore-dangle
    expect(window._satellite.track.calledOnce).to.be.true;
  });

  it('test sendAnalyticsToSplunk', async () => {
    const eventName = 'verb-widget-show';
    const verb = 'sign-pdf';
    const metaData = 'test comment';
    const splunkEndpoint = 'https://splunk.adobe.com/';

    sendAnalyticsToSplunk(eventName, verb, metaData, splunkEndpoint);
    await window.fetch.firstCall.returnValue;
    await Promise.resolve();

    expect(window.fetch.calledOnce).to.be.true;
    expect(window.lana.log.called).to.be.false;
  });

  it('test sendAnalyticsToSplunk failure', () => {
    const eventName = 'verb-widget-show';
    const verb = 'sign-pdf';
    const metaData = 'test comment';
    const splunkEndpoint = 'https://failed.adobe.com/';

    sendAnalyticsToSplunk(eventName, verb, metaData, splunkEndpoint);

    expect(window.fetch.calledOnce).to.be.true;
    expect(window.lana.log.calledOnce).to.be.true;
    expect(window.lana.log.firstCall.args).to.deep.equal([
      'Alloy verb-widget: sign-pdf; eventName: verb-widget-show; Splunk telemetry preparation or dispatch failed; Error',
      { sampleRate: 1, tags: 'DC_Milo,Project Unity (DC),alloy', severity: 'error' },
    ]);
  });

  it('logs an asynchronous request rejection once without raw error details', async () => {
    window.fetch.rejects(new TypeError('private-email@example.com token=secret'));

    sendAnalyticsToSplunk('verb-widget-show', 'sign-pdf', {}, 'https://splunk.adobe.com/');
    await Promise.resolve();

    expect(window.lana.log.calledOnce).to.be.true;
    expect(window.lana.log.firstCall.args).to.deep.equal([
      'Alloy verb-widget: sign-pdf; eventName: verb-widget-show; Splunk telemetry request rejected; TypeError',
      { sampleRate: 1, tags: 'DC_Milo,Project Unity (DC),alloy', severity: 'error' },
    ]);
  });

  it('logs an unsuccessful HTTP response once', async () => {
    window.fetch.resolves(new Response('Unavailable', { status: 503 }));

    sendAnalyticsToSplunk('verb-widget-show', 'image-to-pdf', {}, 'https://splunk.adobe.com/');
    await window.fetch.firstCall.returnValue;

    expect(window.lana.log.calledOnce).to.be.true;
    expect(window.lana.log.firstCall.args).to.deep.equal([
      'Alloy verb-widget: image-to-pdf; eventName: verb-widget-show; Splunk telemetry request failed; HTTP 503',
      { sampleRate: 1, tags: 'DC_Milo,Project Unity (DC),alloy', severity: 'error' },
    ]);
  });

  it('does not fetch or log a failure when the beacon accepts the payload', () => {
    const beacon = sinon.stub(navigator, 'sendBeacon').returns(true);

    sendAnalyticsToSplunk('verb-widget-show', 'sign-pdf', {}, 'https://splunk.adobe.com/', true);

    expect(beacon.calledOnce).to.be.true;
    expect(window.fetch.called).to.be.false;
    expect(window.lana.log.called).to.be.false;
  });

  it('uses fetch without a failure log when the beacon declines the payload', async () => {
    const beacon = sinon.stub(navigator, 'sendBeacon').returns(false);

    sendAnalyticsToSplunk('verb-widget-show', 'sign-pdf', {}, 'https://splunk.adobe.com/', true);
    await window.fetch.firstCall.returnValue;

    expect(beacon.calledOnce).to.be.true;
    expect(window.fetch.calledOnce).to.be.true;
    expect(window.lana.log.called).to.be.false;
  });
});
