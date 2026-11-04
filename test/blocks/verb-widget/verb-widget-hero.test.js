/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { waitFor } from '../../helpers/waitfor.js';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order

const { default: init } = await import(
  '../../../acrobat/blocks/verb-widget/verb-widget.js'
);

const VERB = 'tiff-to-pdf';
const HERO_URL = `/acrobat/blocks/verb-widget/icons/${VERB}.svg`;

function makeBlock() {
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.style.display = 'none';
  const block = document.createElement('div');
  block.className = `verb-widget ${VERB}`;
  block.innerHTML = '<div><div><h1>TIFF to PDF</h1></div></div>';
  section.append(block);
  main.append(section);
  document.body.append(main);
  return block;
}

describe('verb-widget hero image', () => {
  before(async () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/acrobat/blocks/verb-widget/verb-widget.css';
    await new Promise((resolve) => {
      link.onload = resolve;
      document.head.append(link);
    });
    window.mph = {};
    setConfig({ ...getConfig(), locale: { prefix: '' } });
  });

  beforeEach(() => {
    sinon.stub(window, 'fetch').callsFake(async () => new Response(''));
  });

  afterEach(() => {
    sinon.restore();
    document.body.innerHTML = '';
  });

  it('appends and reveals the widget while the hero SVG is still loading', async () => {
    window.fetch.withArgs(HERO_URL).returns(new Promise(() => {}));
    const block = makeBlock();

    await init(block);

    expect(window.fetch.calledWith(HERO_URL)).to.be.true;
    expect(block.querySelector('#drop-zone')).to.exist;
    expect(block.parentElement.style.display).to.equal('block');
    const verbImage = block.querySelector('.verb-image');
    expect(verbImage.classList.contains('generated')).to.be.true;
    expect(verbImage.childElementCount).to.equal(0);
    const { width, height } = verbImage.getBoundingClientRect();
    expect(width).to.be.above(0);
    expect(height).to.be.closeTo(width, 0.5);
  });

  it('shows the prerender snapshot hero right away, then swaps in the fetched SVG', async () => {
    let resolveHero;
    window.fetch.withArgs(HERO_URL).returns(new Promise((resolve) => { resolveHero = resolve; }));
    const snapshot = document.createElement('div');
    snapshot.id = 'prerender_verb-widget';
    snapshot.innerHTML = '<div class="verb-image"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" class="icon-verb-image" data-hero="snapshot"></svg></div>';
    document.body.prepend(snapshot);
    const snapshotSvg = snapshot.querySelector('svg');
    const block = makeBlock();

    await init(block);

    const verbImage = block.querySelector('.verb-image');
    expect(verbImage.childElementCount).to.equal(1);
    expect(verbImage.firstElementChild).to.not.equal(snapshotSvg);
    expect(verbImage.firstElementChild.getAttribute('data-hero')).to.equal('snapshot');
    const { height } = verbImage.getBoundingClientRect();

    resolveHero(new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" data-hero="fetched"></svg>'));
    await waitFor(() => verbImage.querySelector('[data-hero="fetched"]'));

    expect(verbImage.childElementCount).to.equal(1);
    expect(verbImage.getBoundingClientRect().height).to.be.closeTo(height, 0.5);
  });
});
