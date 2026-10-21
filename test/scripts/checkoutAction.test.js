import * as sinon from 'sinon';
import { expect } from '@esm-bundle/chai';
import resolveCheckoutAction from '../../acrobat/scripts/checkoutAction.js';

const offers = [{ productArrangement: { productFamily: 'ACROBAT' } }];
const upgradeAction = { text: 'Upgrade now', className: 'upgrade' };

const run = (getCheckoutAction, options, el) => resolveCheckoutAction(
  getCheckoutAction,
  offers,
  options,
  // eslint-disable-next-line compat/compat
  new Promise(() => {}),
  el,
);

const actionWhenSignedIn = (action) => sinon.stub().callsFake(
  async (o, options, imsSignedInPromise) => ((await imsSignedInPromise) ? action : undefined),
);

function createCta() {
  const el = document.createElement('a');
  el.textContent = 'Buy now';
  el.requestUpdate = sinon.stub().callsFake(() => { el.textContent = 'Upgrade now'; });
  el.onceSettled = sinon.stub().resolves();
  document.body.append(el);
  return el;
}

describe('checkoutAction', () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    window.lana = { log: sinon.stub() };
  });

  afterEach(() => {
    clock.restore();
    delete window.adobeIMS;
    delete window.lana;
    document.body.innerHTML = '';
  });

  it('passes the IMS sign-in state through when IMS is ready', async () => {
    window.adobeIMS = { initialized: true, isSignedInUser: () => true };
    const getCheckoutAction = actionWhenSignedIn(upgradeAction);
    const el = createCta();
    expect(await run(getCheckoutAction, { upgrade: true }, el)).to.equal(upgradeAction);
    await clock.tickAsync(30000);
    expect(getCheckoutAction.calledOnce).to.be.true;
    expect(el.requestUpdate.called).to.be.false;
  });

  it('renders signed out without waiting while IMS is loading', async () => {
    window.adobeIMS = { initialized: false, isSignedInUser: () => true };
    const getCheckoutAction = actionWhenSignedIn(upgradeAction);
    expect(await run(getCheckoutAction, {}, createCta())).to.be.undefined;
    window.adobeIMS.initialized = true;
    await clock.tickAsync(30000);
    expect(getCheckoutAction.calledOnce).to.be.true;
  });

  [{ upgrade: true }, { entitlement: true }].forEach((flag) => {
    it(`swaps a ${Object.keys(flag)[0]} CTA once IMS signs the user in`, async () => {
      window.adobeIMS = { initialized: false, isSignedInUser: () => true };
      const getCheckoutAction = actionWhenSignedIn(upgradeAction);
      const el = createCta();
      expect(await run(getCheckoutAction, { ...flag, modal: 'twp' }, el)).to.be.undefined;
      expect(el.requestUpdate.called).to.be.false;
      window.adobeIMS.initialized = true;
      await clock.tickAsync(250);
      expect(getCheckoutAction.secondCall.args[1]).to.deep.equal({ ...flag, modal: undefined });
      expect(el.requestUpdate.calledOnceWith(true)).to.be.true;
      expect(el.textContent).to.equal('Upgrade now');
    });
  });

  it('does not swap when the user is signed out', async () => {
    window.adobeIMS = { initialized: false, isSignedInUser: () => false };
    const getCheckoutAction = actionWhenSignedIn(upgradeAction);
    const el = createCta();
    await run(getCheckoutAction, { upgrade: true }, el);
    window.adobeIMS.initialized = true;
    await clock.tickAsync(250);
    expect(getCheckoutAction.calledOnce).to.be.true;
    expect(el.requestUpdate.called).to.be.false;
  });

  it('does not re-render when no upgrade applies', async () => {
    window.adobeIMS = { initialized: false, isSignedInUser: () => true };
    const getCheckoutAction = actionWhenSignedIn(undefined);
    const el = createCta();
    await run(getCheckoutAction, { upgrade: true }, el);
    window.adobeIMS.initialized = true;
    await clock.tickAsync(250);
    expect(getCheckoutAction.calledTwice).to.be.true;
    expect(el.requestUpdate.called).to.be.false;
  });

  it('skips a CTA removed before the swap', async () => {
    window.adobeIMS = { initialized: false, isSignedInUser: () => true };
    const el = createCta();
    await run(actionWhenSignedIn(upgradeAction), { upgrade: true }, el);
    el.remove();
    window.adobeIMS.initialized = true;
    await clock.tickAsync(250);
    expect(el.requestUpdate.called).to.be.false;
  });

  it('gives up when IMS never initializes', async () => {
    const getCheckoutAction = actionWhenSignedIn(upgradeAction);
    const el = createCta();
    await run(getCheckoutAction, { upgrade: true }, el);
    await clock.tickAsync(30000);
    expect(clock.countTimers()).to.equal(0);
    window.adobeIMS = { initialized: true, isSignedInUser: () => true };
    await clock.tickAsync(250);
    expect(getCheckoutAction.calledOnce).to.be.true;
    expect(el.requestUpdate.called).to.be.false;
  });

  it('updates the aria-label and text-based daa-ll after the swap', async () => {
    window.adobeIMS = { initialized: false, isSignedInUser: () => true };
    const el = createCta();
    el.setAttribute('aria-label', 'Buy now - Acrobat Studio - Individual');
    el.setAttribute('daa-ll', 'buy-now--acrobat-studio--card');
    await run(actionWhenSignedIn(upgradeAction), { upgrade: true }, el);
    window.adobeIMS.initialized = true;
    await clock.tickAsync(250);
    expect(el.getAttribute('aria-label')).to.equal('Upgrade now - Acrobat Studio - Individual');
    expect(el.getAttribute('daa-ll')).to.equal('upgrade-now--acrobat-studio--card');
  });

  it('keeps an analytics-id based daa-ll after the swap', async () => {
    window.adobeIMS = { initialized: false, isSignedInUser: () => true };
    const el = createCta();
    el.setAttribute('daa-ll', 'buy-now-2--acrobat-studio--card');
    await run(actionWhenSignedIn(upgradeAction), { upgrade: true }, el);
    window.adobeIMS.initialized = true;
    await clock.tickAsync(250);
    expect(el.getAttribute('daa-ll')).to.equal('buy-now-2--acrobat-studio--card');
  });

  it('logs when the swap fails', async () => {
    window.adobeIMS = { initialized: false, isSignedInUser: () => true };
    const el = createCta();
    el.onceSettled = sinon.stub().rejects(new Error('render failed'));
    await run(actionWhenSignedIn(upgradeAction), { upgrade: true }, el);
    window.adobeIMS.initialized = true;
    await clock.tickAsync(250);
    expect(window.lana.log.calledOnceWith('Failed to swap checkout CTA: render failed')).to.be.true;
  });
});
