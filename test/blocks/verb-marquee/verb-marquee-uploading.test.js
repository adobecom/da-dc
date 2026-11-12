import { expect } from '@esm-bundle/chai';
import { ICONS as SHARED_ICONS } from '../../../acrobat/scripts/verbWidgetUtils.js';
import {
  splunkArgs,
  fakeUnloadEvent,
  lanaMessages,
  setupPage,
  teardownPage,
} from './helpers.js';

const infoIcon = SHARED_ICONS.INFO_ICON;
delete SHARED_ICONS.INFO_ICON;
const { default: init } = await import(
  '../../../acrobat/blocks/verb-marquee/verb-marquee.js'
);
SHARED_ICONS.INFO_ICON = infoIcon;

describe('verb-marquee block uploading', () => {
  let ctx;
  let block;

  beforeEach(async () => {
    ctx = await setupPage();
    ({ block } = ctx);
  });

  afterEach(() => {
    teardownPage(ctx);
  });

  it('logs an error when an icon is not found', async () => {
    await init(block);

    expect(lanaMessages().some((msg) => msg.includes('Icon not found: INFO_ICON'))).to.be.true;
    expect(block.querySelector('.info-icon')).to.exist;
    expect(block.querySelector('.info-icon svg')).to.not.exist;
  });

  it('sends tab closure analytics and prevents unload while uploading', async () => {
    await init(block);
    const [tabClosureListener] = ctx.beforeUnloadListeners;

    ctx.trackAnalytics({ event: 'uploading', data: { type: 'docx' } });
    expect(window.analytics.verbAnalytics.calledWith('job:uploading', 'word-to-pdf')).to.be.true;
    window.analytics.verbAnalytics.resetHistory();
    window.analytics.sendAnalyticsToSplunk.resetHistory();

    const event = fakeUnloadEvent();
    tabClosureListener(event);

    expect(window.analytics.verbAnalytics.calledWith('job:browser-tab-closure', 'word-to-pdf')).to.be.true;
    const [eventName, verb, metadata, , unloading] = splunkArgs();
    expect(eventName).to.equal('job:browser-tab-closure');
    expect(verb).to.equal('word-to-pdf');
    expect(metadata).to.have.property('uploadTime');
    expect(unloading).to.be.true;
    expect(event.preventDefault.calledOnce).to.be.true;
    expect(event.returnValue).to.be.true;

    window.analytics.sendAnalyticsToSplunk.resetHistory();
    tabClosureListener(fakeUnloadEvent());
    expect(window.analytics.sendAnalyticsToSplunk.called).to.be.false;
  });
});
