/* eslint-disable compat/compat */
/* eslint-disable no-underscore-dangle */
import { expect } from '@esm-bundle/chai';
import * as sinon from 'sinon';

const { default: init } = await import('../../acrobat/scripts/frictionless.js');

const RNR_FORM = `
  <div class="rnr-container">
    <form class="rnr-form">
      <fieldset class="rnr-rating-fieldset">
        <input type="radio" name="rating" value="1">
        <input type="radio" name="rating" value="2">
        <input type="radio" name="rating" value="3">
        <input type="radio" name="rating" value="4">
        <input type="radio" name="rating" value="5">
      </fieldset>
      <fieldset class="rnr-comments-fieldset">
        <textarea name="comments">Works great</textarea>
      </fieldset>
    </form>
  </div>`;

const MILO_REVIEW_FORM = `
  <div class="hlx-ReviewWrapper">
    <form class="hlx-Review">
      <fieldset class="hlx-Review-ratingFields">
        <input name="rating" type="radio" class="tooltip" value="1">
        <input name="rating" type="radio" class="tooltip" value="2">
        <input name="rating" type="radio" class="tooltip" value="3">
        <input name="rating" type="radio" class="tooltip" value="4">
        <input name="rating" type="radio" class="tooltip" value="5">
      </fieldset>
    </form>
  </div>`;

const nextMicrotask = () => Promise.resolve();

const lastInteraction = () => {
  const [, event] = window._satellite.track.lastCall.args;
  return event.data._adobe_corpnew.digitalData.primaryEvent.eventInfo.interaction;
};

describe('frictionless review form readiness', () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    window._satellite = { track: sinon.spy() };
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
    document.body.innerHTML = '';
  });

  it('wires the rnr form once it renders after init, without timers', async () => {
    document.body.innerHTML = '<div class="rnr"></div>';
    init('pdf-to-ppt');
    expect(window._satellite.track.callCount).to.equal(1);
    expect(clock.countTimers()).to.equal(0);

    document.querySelector('.rnr').innerHTML = RNR_FORM;
    await nextMicrotask();

    const form = document.querySelector('.rnr-form');
    form.querySelector('input[value="4"]').checked = true;
    form.dispatchEvent(new Event('submit'));
    expect(window._satellite.track.callCount).to.equal(2);
    expect(lastInteraction()).to.include({
      rating: '4',
      comment: 'Works great',
      verb: 'dc/production/pdf-to-ppt',
    });

    form.querySelectorAll('.rnr-rating-fieldset input')[4].click();
    expect(lastInteraction().rating).to.equal('5');
    expect(clock.countTimers()).to.equal(0);
  });

  it('wires the rnr form immediately when it has already rendered', () => {
    document.body.innerHTML = `<div class="rnr">${RNR_FORM}</div>`;
    const observe = sinon.spy(MutationObserver.prototype, 'observe');
    init('pdf-to-ppt');

    document.querySelectorAll('.rnr-rating-fieldset input')[3].click();
    expect(lastInteraction().rating).to.equal('4');
    expect(observe.called).to.be.false;
    expect(clock.countTimers()).to.equal(0);
  });

  it('only watches the review block, without timers, while the form never renders', async () => {
    document.body.innerHTML = '<div class="rnr"></div><div class="elsewhere"></div>';
    const rnrBlock = document.querySelector('.rnr');
    const observe = sinon.spy(MutationObserver.prototype, 'observe');
    init('pdf-to-ppt');

    expect(observe.calledOnce).to.be.true;
    expect(observe.firstCall.args[0]).to.equal(rnrBlock);
    expect(observe.firstCall.args[1]).to.deep.equal({ childList: true, subtree: true });

    const blockQuery = sinon.spy(rnrBlock, 'querySelector');
    document.querySelector('.elsewhere').innerHTML = RNR_FORM;
    await nextMicrotask();
    expect(blockQuery.called).to.be.false;

    rnrBlock.append(document.createElement('div'));
    await nextMicrotask();
    expect(blockQuery.calledOnce).to.be.true;

    clock.tick(60000);
    expect(clock.countTimers()).to.equal(0);
    expect(window._satellite.track.callCount).to.equal(1);
  });

  it('disconnects the observer once the form is found', async () => {
    document.body.innerHTML = '<div class="rnr"></div>';
    const rnrBlock = document.querySelector('.rnr');
    const disconnect = sinon.spy(MutationObserver.prototype, 'disconnect');
    init('pdf-to-ppt');

    rnrBlock.innerHTML = RNR_FORM;
    await nextMicrotask();
    expect(disconnect.calledOnce).to.be.true;

    const blockQuery = sinon.spy(rnrBlock, 'querySelector');
    rnrBlock.append(document.createElement('div'));
    await nextMicrotask();
    expect(blockQuery.called).to.be.false;
  });

  it('wires the Milo review form once it renders after init', async () => {
    document.body.innerHTML = '<div class="review"></div>';
    init('pdf-to-ppt');

    document.querySelector('.review').innerHTML = MILO_REVIEW_FORM;
    await nextMicrotask();

    const tooltips = document.querySelectorAll('.hlx-Review .tooltip');
    tooltips[3].click();
    expect(lastInteraction().rating).to.equal('4');
    tooltips[4].click();
    expect(lastInteraction().rating).to.equal('5');
    expect(clock.countTimers()).to.equal(0);
  });

  it('wires the Milo and rnr forms independently when both blocks are present', async () => {
    document.body.innerHTML = '<div class="review"></div><div class="rnr"></div>';
    init('pdf-to-ppt');

    document.querySelector('.review').innerHTML = MILO_REVIEW_FORM;
    await nextMicrotask();
    document.querySelector('.rnr').innerHTML = RNR_FORM;
    await nextMicrotask();

    document.querySelectorAll('.hlx-Review .tooltip')[3].click();
    expect(lastInteraction().rating).to.equal('4');
    document.querySelectorAll('.rnr-rating-fieldset input')[4].click();
    expect(lastInteraction().rating).to.equal('5');
  });

  it('does not track or observe anything on pages without a review block', () => {
    document.body.innerHTML = '<div class="other"></div>';
    const observe = sinon.spy(MutationObserver.prototype, 'observe');
    init('pdf-to-ppt');

    expect(window._satellite.track.called).to.be.false;
    expect(observe.called).to.be.false;
    expect(clock.countTimers()).to.equal(0);
  });
});
