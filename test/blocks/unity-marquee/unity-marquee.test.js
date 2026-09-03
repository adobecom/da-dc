/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved

const { default: init } = await import(
  '../../../acrobat/blocks/unity-marquee/unity-marquee.js'
);

describe('unity-marquee block', () => {
  let xhr;
  let placeholders;

  beforeEach(async () => {
    sinon.stub(window, 'fetch');
    window.fetch.callsFake((x) => {
      if (x.endsWith('.svg')) {
        return window.fetch.wrappedMethod.call(window, x);
      }
      return Promise.resolve();
    });
    const placeholdersText = await readFile({ path: './mocks/placeholders.json' });
    placeholders = JSON.parse(placeholdersText);

    window.mph = {};
    placeholders.data.forEach((item) => {
      window.mph[item.key] = item.value;
    });
    xhr = sinon.useFakeXMLHttpRequest();
    document.head.innerHTML = await readFile({ path: './mocks/head.html' });
    document.body.innerHTML = await readFile({ path: './mocks/body-quiz-maker.html' });
    window.adobeIMS = { isSignedInUser: () => false };
    window.lana = { log: sinon.spy() };
  });

  afterEach(() => {
    xhr.restore();
    sinon.restore();
  });

  it('init renders block structure with acrobat icon and info icon', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    expect(document.querySelector('.unity-marquee .acrobat-icon svg')).to.exist;
    expect(document.querySelector('.unity-marquee .info-icon svg')).to.exist;
    expect(document.querySelector('.unity-marquee .unity-marquee-container')).to.exist;
    expect(document.querySelector('.unity-marquee .unity-marquee-row')).to.exist;
    expect(document.querySelector('.unity-marquee .unity-marquee-col-left')).to.exist;
  });

  it('renders heading text from authored h1', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    const heading = document.querySelector('.unity-marquee .unity-marquee-heading');
    expect(heading).to.exist;
    expect(heading.textContent.trim()).to.equal('Quiz maker');
  });

  it('renders copy text from placeholders when no authored copy', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    const copy = document.querySelector('.unity-marquee .unity-marquee-copy');
    expect(copy).to.exist;
  });

  it('legal footer links include Terms of Use and Privacy Policy', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    const legalEl = block.querySelector('.unity-marquee-legal');
    expect(legalEl).to.exist;
    const links = legalEl.querySelectorAll('a.unity-marquee-legal-url');
    const hrefs = Array.from(links).map((a) => a.getAttribute('href'));
    expect(hrefs.some((h) => h && h.includes('terms'))).to.be.true;
    expect(hrefs.some((h) => h && h.includes('privacy'))).to.be.true;
  });

  it('legal links open in a new tab', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    const links = block.querySelectorAll('.unity-marquee-legal a.unity-marquee-legal-url');
    links.forEach((a) => {
      expect(a.getAttribute('target')).to.equal('_blank');
    });
  });

  it('renders at least two legal links (Terms of Use, Privacy Policy)', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    const legalEl = block.querySelector('.unity-marquee-legal');
    const links = legalEl.querySelectorAll('a.unity-marquee-legal-url');
    expect(links.length).to.be.greaterThanOrEqual(2);
  });

  it('info icon has tooltip aria-label from placeholder', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    const infoIcon = block.querySelector('.info-icon');
    expect(infoIcon).to.exist;
    expect(infoIcon.getAttribute('aria-label')).to.equal('Your files are secure with us.');
  });

  it('wraps foreground media in unity-marquee-media div', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    expect(block.querySelector('.unity-marquee-media')).to.exist;
    expect(block.querySelector('.unity-marquee-media picture')).to.exist;
  });

  it('uses authored desktop-copy when no mobile-copy row is authored', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body-authored.html' });
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    const copy = block.querySelector('.unity-marquee-copy:not(.unity-marquee-copy-sub)');
    expect(copy.textContent.trim()).to.equal('Authored desktop copy text.');
  });

  it('uses authored legal HTML when provided', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body-authored.html' });
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    const legalEl = block.querySelector('.unity-marquee-legal');
    expect(legalEl.querySelector('a[href="https://example.com/terms"]')).to.exist;
  });

  it('authored tooltip sets aria-label on info icon', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body-authored.html' });
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    const infoIcon = block.querySelector('.info-icon');
    expect(infoIcon.getAttribute('aria-label')).to.equal('Authored tooltip text.');
  });

  it('does not render sub-copy element when authoredSubCopy is empty', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    expect(block.querySelector('.unity-marquee-copy-sub')).to.not.exist;
  });

  it('makes parent visible after init', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    expect(block.parentNode.style.display).to.equal('block');
  });

  it('does not redirect anonymous user', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    const originalHref = window.location.href;
    await init(block);
    expect(window.location.href).to.equal(originalHref);
  });

  it('dispatches analyticsLoad event on DOMContentLoaded', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    const analyticsEvents = [];
    window.addEventListener('analyticsLoad', (e) => analyticsEvents.push(e));
    await init(block);
    expect(analyticsEvents.length).to.be.greaterThan(0);
    expect(analyticsEvents[0].detail.verb).to.equal('quiz-maker');
  });

  it('renders default title "Adobe Acrobat" when no dc-block-row-title is authored', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    const title = block.querySelector('.unity-marquee-title');
    expect(title).to.exist;
    expect(title.textContent.trim()).to.equal('Adobe Acrobat');
  });

  it('uses authored dc-block-row-title when provided', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body-authored.html' });
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    const title = block.querySelector('.unity-marquee-title');
    expect(title.textContent.trim()).to.equal('Authored Title Text');
  });

  it('pageshow with persisted=false does not throw', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.unity-marquee');
    await init(block);
    const event = new Event('pageshow');
    Object.defineProperty(event, 'persisted', { value: false, writable: false });
    expect(() => window.dispatchEvent(event)).to.not.throw();
  });
});
