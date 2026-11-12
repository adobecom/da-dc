/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { delay } from '../../helpers/waitfor.js';
import {
  FILE_PICKER_EVENTS,
  SOLO_PICKER_EVENTS,
  FILES_DROPPED_EVENTS,
} from '../../../acrobat/scripts/verbWidgetUtils.js';
import { hostRedDirLink } from '../../../acrobat/scripts/verbMarqueeUtils.js';
import {
  eventNames,
  lanaMessages,
  splunkArgs,
  fakeUnloadEvent,
  stubCookie,
  setupPage,
  teardownPage,
} from './helpers.js';

const { default: init } = await import(
  '../../../acrobat/blocks/verb-marquee/verb-marquee.js'
);

describe('verb-marquee block events', () => {
  let ctx;
  let block;

  beforeEach(async () => {
    ctx = await setupPage();
    ({ block } = ctx);
  });

  afterEach(() => {
    teardownPage(ctx);
  });

  it('sets the redirect cookie on beforeunload when no file is in progress', async () => {
    await init(block);
    const [, redirectCookieListener] = ctx.beforeUnloadListeners;
    const cookieWrites = stubCookie();

    redirectCookieListener(fakeUnloadEvent());

    expect(cookieWrites.some((c) => c.startsWith('UTS_Redirect='))).to.be.true;
  });

  it('toggles the dragging class on dragover, dragleave and drop', async () => {
    await init(block);
    const dropzone = block.querySelector('.verb-marquee-dropzone');

    block.dispatchEvent(new DragEvent('dragover', { cancelable: true }));
    expect(dropzone.classList.contains('dragging')).to.be.true;
    expect(block.classList.contains('dragging-block')).to.be.true;

    block.dispatchEvent(new DragEvent('dragleave', { cancelable: true, relatedTarget: document.body }));
    expect(dropzone.classList.contains('dragging')).to.be.false;
    expect(block.classList.contains('dragging-block')).to.be.false;

    block.dispatchEvent(new DragEvent('dragover', { cancelable: true }));
    expect(dropzone.classList.contains('dragging')).to.be.true;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(['test'], 'test.docx'));
    block.dispatchEvent(new DragEvent('drop', { cancelable: true, dataTransfer }));
    expect(dropzone.classList.contains('dragging')).to.be.false;
    expect(block.classList.contains('dragging-block')).to.be.false;
  });

  it('sends file picker analytics when the file input is clicked', async () => {
    await init(block);
    const fileInput = block.querySelector('#file-upload');
    fileInput.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    fileInput.click();

    expect(eventNames(window.analytics.verbAnalytics)).to.deep.equal(FILE_PICKER_EVENTS);
    window.analytics.verbAnalytics.getCalls().forEach((call) => {
      expect(call.args[1]).to.equal('word-to-pdf');
    });
  });

  it('sends solo picker analytics when the solo upload label is clicked', async () => {
    const soloWrapper = document.createElement('div');
    soloWrapper.innerHTML = '<a href="#upload">Upload</a>';
    document.body.append(soloWrapper);
    await init(block);

    const label = soloWrapper.querySelector('label.verb-marquee-cta-solo');
    expect(label).to.exist;
    expect(soloWrapper.querySelector('a[href*="#upload"]')).to.not.exist;
    const fileInput = block.querySelector('#file-upload');
    fileInput.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    label.addEventListener('click', (e) => e.stopPropagation());

    label.click();

    expect(eventNames(window.analytics.verbAnalytics)).to.deep.equal(SOLO_PICKER_EVENTS);
  });

  it('tracks dropped files from the unity drop event', async () => {
    await init(block);
    const dropzone = block.querySelector('.verb-marquee-dropzone');
    dropzone.classList.add('dragging');

    ctx.trackAnalytics({ event: 'drop', data: { type: 'docx' } });

    expect(eventNames(window.analytics.verbAnalytics)).to.deep.equal(FILES_DROPPED_EVENTS);
    expect(eventNames(window.analytics.sendAnalyticsToSplunk)).to.deep.equal(FILES_DROPPED_EVENTS);
    const [, verb, metadata, documentUnloading] = window.analytics.verbAnalytics.firstCall.args;
    expect(verb).to.equal('word-to-pdf');
    expect(metadata.type).to.equal('docx');
    expect(documentUnloading).to.be.true;
    expect(splunkArgs()[3]).to.include('unity-stage.adobe.io');
    expect(dropzone.classList.contains('dragging')).to.be.false;
  });

  it('sends chunk uploaded analytics to splunk', async () => {
    await init(block);

    ctx.trackAnalytics({ event: 'chunk_uploaded', data: { chunk: 1 } });

    expect(window.analytics.sendAnalyticsToSplunk.calledOnce).to.be.true;
    const [eventName, verb, metadata, endpoint] = splunkArgs();
    expect(eventName).to.equal('job:chunk-uploaded');
    expect(verb).to.equal('word-to-pdf');
    expect(metadata.chunk).to.equal(1);
    expect(endpoint).to.include('unity-stage.adobe.io');
  });

  it('does not send chunk uploaded analytics when splunk is disabled', async () => {
    await init(block);

    ctx.trackAnalytics({ event: 'chunk_uploaded', data: { chunk: 1 }, sendToSplunk: false });

    expect(window.analytics.sendAnalyticsToSplunk.called).to.be.false;
  });

  it('does not set the redirect cookie on beforeunload after a file is chosen', async () => {
    await init(block);
    const [, redirectCookieListener] = ctx.beforeUnloadListeners;
    ctx.trackAnalytics({ event: 'change', data: {} });
    const cookieWrites = stubCookie();

    redirectCookieListener(fakeUnloadEvent());

    expect(cookieWrites.some((c) => c.startsWith('UTS_Redirect='))).to.be.false;
  });

  it('sends tab closure analytics on beforeunload after a file is chosen', async () => {
    await init(block);
    const initialListeners = ctx.beforeUnloadListeners.length;

    ctx.trackAnalytics({ event: 'change', data: { type: 'docx' } });

    expect(window.analytics.verbAnalytics.calledWith('choose-file:open', 'word-to-pdf')).to.be.true;
    expect(ctx.beforeUnloadListeners.length).to.equal(initialListeners + 1);
    window.analytics.verbAnalytics.resetHistory();
    window.analytics.sendAnalyticsToSplunk.resetHistory();

    const event = fakeUnloadEvent();
    ctx.beforeUnloadListeners[ctx.beforeUnloadListeners.length - 1](event);

    expect(window.analytics.verbAnalytics.calledWith('job:browser-tab-closure', 'word-to-pdf')).to.be.true;
    const [eventName, verb, metadata, , unloading] = splunkArgs();
    expect(eventName).to.equal('job:browser-tab-closure');
    expect(verb).to.equal('word-to-pdf');
    expect(metadata.workflowStep).to.equal('preuploading');
    expect(metadata.type).to.equal('docx');
    expect(unloading).to.be.true;
    expect(event.preventDefault.called).to.be.false;
  });

  it('dispatches redirect ready after a 3 second timeout for verbs with a redirect timeout', async () => {
    block.classList.replace('word-to-pdf', 'summarize-pdf');
    await init(block);
    const redirectReady = sinon.spy();
    window.addEventListener('DCUnity:RedirectReady', redirectReady);
    const clock = sinon.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    ctx.trackAnalytics({ event: 'uploaded', data: { type: 'pdf' } });

    expect(window.analytics.verbAnalytics.calledWith('job:uploaded', 'summarize-pdf')).to.be.true;
    expect(redirectReady.called).to.be.false;
    clock.tick(3000);
    expect(redirectReady.calledOnce).to.be.true;
    const warnCall = window.lana.log.getCalls()
      .find((call) => call.args[0].includes('3 second timeout dispatched event'));
    expect(warnCall).to.exist;
    expect(warnCall.args[1].severity).to.equal('warning');
    window.removeEventListener('DCUnity:RedirectReady', redirectReady);
  });

  it('logs an error and removes the injected verb-widget when its init fails', async () => {
    stubCookie('s_ta_cr_p_c=1');
    const originalGetItem = Storage.prototype.getItem;
    let attemptsReads = 0;
    sinon.stub(Storage.prototype, 'getItem').callsFake(function getItem(key) {
      if (key === 'word-to-pdf_attempts') {
        attemptsReads += 1;
        if (attemptsReads > 1) throw new Error('storage unavailable');
      }
      return originalGetItem.call(this, key);
    });

    await init(block);

    expect(lanaMessages().some((msg) => msg.includes('verb-widget init from verb-marquee failed'))).to.be.true;
    expect(block.querySelector('[data-dc-injected-from-marquee]')).to.not.exist;
    expect(block.querySelector('#file-upload')).to.not.exist;
  });

  it('redirects signed-in users to the host redirect link', async () => {
    window.adobeIMS = { isSignedInUser: () => true, getAccountType: () => 'type1' };
    let destination = null;
    const onNavigate = (e) => {
      destination = e.destination.url;
      e.preventDefault();
    };
    window.navigation.addEventListener('navigate', onNavigate);
    try {
      await init(block);
      await delay(0);
    } finally {
      window.navigation.removeEventListener('navigate', onNavigate);
      window.adobeIMS = { isSignedInUser: () => false };
    }

    expect(destination).to.equal(hostRedDirLink('word-to-pdf'));
  });
});
