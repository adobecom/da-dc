/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { waitFor } from '../../helpers/waitfor.js';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order

const { default: init } = await import(
  '../../../acrobat/blocks/verb-widget-client-upload/verb-widget-client-upload.js'
);

const VERB = 'image-to-pdf';
const HERO_URL = `/acrobat/blocks/verb-widget/icons/${VERB}.svg`;
const ALT = 'Image to PDF illustration';

function makeBlock() {
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.style.display = 'none';
  const block = document.createElement('div');
  block.className = `verb-widget-client-upload ${VERB}`;
  block.innerHTML = '<div><div><h1>Image to PDF</h1></div></div>';
  section.append(block);
  main.append(section);
  document.body.append(main);
  return block;
}

function deferred() {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
}

function addSnapshot() {
  const snapshot = document.createElement('div');
  snapshot.id = 'prerender_verb-widget';
  snapshot.innerHTML = '<div class="verb-image"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" class="icon-verb-image" data-hero="snapshot"></svg></div>';
  document.body.prepend(snapshot);
  return snapshot;
}

describe('verb-widget-client-upload hero image', () => {
  let xhr;
  let heroResponse;

  before(async () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/acrobat/blocks/verb-widget-client-upload/verb-widget-client-upload.css';
    await new Promise((resolve) => {
      link.onload = resolve;
      document.head.append(link);
    });
  });

  beforeEach(() => {
    heroResponse = undefined;
    sinon.stub(window, 'fetch').callsFake((url) => (
      url === HERO_URL ? heroResponse : Promise.resolve(new Response(''))
    ));
    xhr = sinon.useFakeXMLHttpRequest();
    window.lana = { log: sinon.stub() };
    window.adobeIMS = { isSignedInUser: () => false };
    window.mph = {
      'verb-widget-cta': 'Select a file',
      [`verb-widget-${VERB}-alt`]: ALT,
    };
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '', ietf: 'en-US' } });
  });

  afterEach(() => {
    xhr.restore();
    sinon.restore();
    document.body.innerHTML = '';
  });

  it('appends and reveals the widget while the hero SVG is still loading', async () => {
    heroResponse = new Promise(() => {});
    const block = makeBlock();

    await init(block);

    expect(window.fetch.calledWith(HERO_URL)).to.be.true;
    expect(block.querySelector('#drop-zone')).to.exist;
    expect(block.querySelector('.verb-cta')).to.exist;
    expect(block.querySelector('.verb-footer')).to.exist;
    expect(block.classList.contains('ready')).to.be.true;
    expect(block.parentElement.style.display).to.equal('block');

    const verbImage = block.querySelector('.verb-image');
    expect(verbImage.classList.contains('generated')).to.be.true;
    expect(verbImage.childElementCount).to.equal(0);
    const { width, height } = verbImage.getBoundingClientRect();
    expect(width).to.be.above(0);
    expect(height).to.be.closeTo(width, 0.5);
  });

  it('logs to Lana and leaves the hero box empty when the hero SVG fails to load', async () => {
    heroResponse = Promise.resolve(new Response('', { status: 404, statusText: 'Not Found' }));
    const block = makeBlock();

    await init(block);
    await waitFor(() => window.lana.log.calledWithMatch(`Icon not found: ${VERB}`));

    expect(block.querySelector('#drop-zone')).to.exist;
    expect(block.querySelector('.verb-image.generated').childElementCount).to.equal(0);
  });

  it('fills an authored icon synchronously without using the snapshot or fetching the hero SVG', async () => {
    addSnapshot();
    const block = makeBlock();
    const authoredIcon = document.createElement('img');
    authoredIcon.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22/%3E';
    authoredIcon.alt = 'Authored icon';
    block.querySelector(':scope > div > div').append(authoredIcon);

    await init(block);

    const verbImage = block.querySelector('.verb-image');
    expect(verbImage.classList.contains('generated')).to.be.false;
    expect(verbImage.childElementCount).to.equal(1);
    expect(verbImage.firstElementChild).to.equal(authoredIcon);
    expect(authoredIcon.classList.contains('icon-verb-image')).to.be.true;
    expect(authoredIcon.getAttribute('alt')).to.equal(ALT);
    expect(window.fetch.calledWith(HERO_URL)).to.be.false;
  });

  it('shows the prerender snapshot hero right away, then swaps in the fetched SVG', async () => {
    const hero = deferred();
    heroResponse = hero.promise;
    const snapshot = addSnapshot();
    const snapshotSvg = snapshot.querySelector('svg');
    const block = makeBlock();

    await init(block);

    const verbImage = block.querySelector('.verb-image');
    expect(verbImage.classList.contains('generated')).to.be.true;
    expect(verbImage.childElementCount).to.equal(1);
    const snapshotCopy = verbImage.firstElementChild;
    expect(snapshotCopy).to.not.equal(snapshotSvg);
    expect(snapshotCopy.getAttribute('data-hero')).to.equal('snapshot');
    expect(snapshotCopy.classList.contains('icon-verb-image')).to.be.true;
    expect(snapshotCopy.getAttribute('alt')).to.equal(ALT);
    const { height } = verbImage.getBoundingClientRect();

    hero.resolve(new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" data-hero="fetched"></svg>'));
    await waitFor(() => verbImage.querySelector('[data-hero="fetched"]'));

    expect(verbImage.childElementCount).to.equal(1);
    const fetchedSvg = verbImage.firstElementChild;
    expect(fetchedSvg.getAttribute('data-hero')).to.equal('fetched');
    expect(fetchedSvg.classList.contains('icon-verb-image')).to.be.true;
    expect(fetchedSvg.getAttribute('alt')).to.equal(ALT);
    expect(verbImage.getBoundingClientRect().height).to.be.closeTo(height, 0.5);
  });
});
