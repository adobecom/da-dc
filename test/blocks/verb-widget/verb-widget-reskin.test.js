/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved
import { delay } from '../../helpers/waitfor.js';

const { default: init } = await import(
  '../../../acrobat/blocks/verb-widget/verb-widget.js'
);

const row = (label, value) => `<div><div>${label}</div><div>${value}</div></div>`;

const buildBlock = (verb, rows = [], unityClasses = 'workflow-acrobat') => `
  <main><div>
    <div class="verb-widget ${verb}">
      <div><div><h1>Chat with your PDF</h1></div></div>
      ${rows.join('')}
      <div><div>{{verb-widget-legal}}</div></div>
    </div>
    <div class="unity ${unityClasses}"></div>
  </div></main>`;

describe('verb-widget reskin overrides (dc-block-row-*)', () => {
  let xhr;

  beforeEach(async () => {
    sinon.stub(window, 'fetch');
    window.fetch.callsFake((x) => {
      if (x.endsWith('.svg')) {
        return window.fetch.wrappedMethod.call(window, x);
      }
      return Promise.resolve();
    });
    const placeholders = JSON.parse(await readFile({ path: './mocks/placeholders.json' }));
    window.mph = {};
    placeholders.data.forEach((item) => {
      window.mph[item.key] = item.value;
    });
    xhr = sinon.useFakeXMLHttpRequest();
    document.head.innerHTML = await readFile({ path: './mocks/head.html' });
    window.adobeIMS = { isSignedInUser: () => false };
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
  });

  afterEach(() => {
    xhr.restore();
    sinon.restore();
  });

  const render = async (verb, rows, unityClasses) => {
    document.body.innerHTML = buildBlock(verb, rows, unityClasses);
    const block = document.body.querySelector('.verb-widget');
    await init(block);
    await delay(100);
    return block;
  };

  it('legacy page (no labeled rows) keeps placeholder sub copy and demo CTA', async () => {
    const block = await render('chat-pdf');
    expect(block.querySelector('.verb-sub-copy').textContent)
      .to.equal(window.mph['verb-widget-chat-pdf-sub-description']);
    const demo = block.querySelector('.demo-cta');
    expect(demo.textContent).to.equal(window.mph['verb-widget-cta-demo']);
    expect(demo.getAttribute('href')).to.include('x_api_client_location=chat_pdf&try-ai-demo=true');
  });

  it('uses authored sub copy and demo CTA text and link', async () => {
    const block = await render('chat-pdf', [
      row('dc-block-row-sub-copy', 'Authored sub copy'),
      row('dc-block-row-demo-cta', '<a href="https://example.com/demo.pdf">Authored demo</a>'),
    ]);
    expect(block.querySelector('.verb-sub-copy').textContent).to.equal('Authored sub copy');
    const demo = block.querySelector('.demo-cta');
    expect(demo.textContent).to.equal('Authored demo');
    const href = new URL(demo.getAttribute('href'));
    expect(href.origin + href.pathname).to.equal('https://example.com/demo.pdf');
  });

  const demoParams = (block) => new URL(block.querySelector('.demo-cta').getAttribute('href')).searchParams;

  it('adds default analytics params to an authored link when they are missing', async () => {
    const block = await render('chat-pdf', [
      row('dc-block-row-demo-cta', '<a href="https://example.com/demo.pdf?foo=bar">Demo</a>'),
    ]);
    const params = demoParams(block);
    expect(params.get('foo')).to.equal('bar');
    expect(params.get('x_api_client_id')).to.equal('ChatPDFTryDemoFile');
    expect(params.get('x_api_client_location')).to.equal('chat_pdf');
  });

  it('uses the verb default location for pdf-ai when no referrer is set', async () => {
    const block = await render('pdf-ai', [
      row('dc-block-row-demo-cta', '<a href="https://example.com/demo.pdf">Demo</a>'),
    ]);
    expect(demoParams(block).get('x_api_client_location')).to.equal('chat_pdf_pdf_ai');
  });

  it('uses the unity referrer as x_api_client_location for an authored link', async () => {
    const block = await render('chat-pdf', [
      row('dc-block-row-demo-cta', '<a href="https://example.com/demo.pdf">Demo</a>'),
    ], 'workflow-acrobat referrer-ai-chat-reskin');
    expect(demoParams(block).get('x_api_client_location')).to.equal('ai-chat-reskin');
  });

  it('uses the unity referrer as x_api_client_location for the default link', async () => {
    const block = await render('chat-pdf', [], 'workflow-acrobat referrer-ai-chat-reskin');
    const params = demoParams(block);
    expect(params.get('x_api_client_location')).to.equal('ai-chat-reskin');
    expect(params.get('x_api_client_id')).to.equal('ChatPDFTryDemoFile');
    expect(params.get('try-ai-demo')).to.equal('true');
  });

  it('shows the authored demo CTA when the demo placeholder is missing', async () => {
    delete window.mph['verb-widget-cta-demo'];
    const block = await render('chat-pdf', [row('dc-block-row-demo-cta', 'Authored demo')]);
    const demo = block.querySelector('.demo-cta');
    expect(demo).to.exist;
    expect(demo.textContent).to.equal('Authored demo');
    expect(demoParams(block).get('x_api_client_location')).to.equal('chat_pdf');
  });

  it('hides the demo CTA when the placeholder is missing and nothing is authored', async () => {
    delete window.mph['verb-widget-cta-demo'];
    const block = await render('chat-pdf');
    expect(block.querySelector('.demo-cta') === null, 'demo CTA should not render').to.be.true;
  });

  it('keeps analytics params that the author put in the link', async () => {
    const block = await render('chat-pdf', [
      row('dc-block-row-demo-cta', '<a href="https://example.com/demo.pdf?x_api_client_id=custom_id&x_api_client_location=custom_loc">Demo</a>'),
    ], 'workflow-acrobat referrer-ai-chat-reskin');
    const params = demoParams(block);
    expect(params.get('x_api_client_id')).to.equal('custom_id');
    expect(params.get('x_api_client_location')).to.equal('custom_loc');
  });

  it('plain-text demo CTA changes only the text and keeps the default link', async () => {
    const block = await render('pdf-ai', [row('dc-block-row-demo-cta', 'Plain demo text')]);
    const demo = block.querySelector('.demo-cta');
    expect(demo.textContent).to.equal('Plain demo text');
    expect(demo.getAttribute('href')).to.include('x_api_client_location=chat_pdf_pdf_ai');
  });

  it('blank labeled rows fall back to placeholders', async () => {
    const block = await render('chat-pdf', [
      row('dc-block-row-sub-copy', ''),
      row('dc-block-row-demo-cta', ''),
    ]);
    expect(block.querySelector('.verb-sub-copy').textContent)
      .to.equal(window.mph['verb-widget-chat-pdf-sub-description']);
    expect(block.querySelector('.demo-cta').textContent).to.equal(window.mph['verb-widget-cta-demo']);
  });

  it('labeled rows do not count as positional desktop/mobile copy rows', async () => {
    const block = await render('chat-pdf', [
      row('dc-block-row-sub-copy', 'Authored sub copy'),
      row('dc-block-row-demo-cta', 'Authored demo'),
    ]);
    const copy = block.querySelector('.verb-copy');
    expect(copy.textContent).to.include(window.mph['verb-widget-chat-pdf-description']);
    expect(block.querySelector('.verb-heading').textContent).to.equal('Chat with your PDF');
    expect(block.textContent).to.not.include('dc-block-row-');
  });

  describe('with desktop copy, mobile copy and an authored SVG icon', () => {
    const single = (html) => `<div><div>${html}</div></div>`;
    const svgHref = '/acrobat/blocks/verb-widget/icons/compress-pdf.svg';
    const fullRows = [
      row('dc-block-row-sub-copy', 'Authored sub copy'),
      row('dc-block-row-demo-cta', '<a href="https://acrobat.adobe.com/link/demo.pdf">Authored demo</a>'),
      single('Desktop copy'),
      single('Mobile copy'),
      single(`<a href="${svgHref}">compress-pdf.svg</a>`),
    ];
    let originalUserAgent;

    beforeEach(() => {
      originalUserAgent = window.navigator.userAgent;
    });

    afterEach(() => {
      Object.defineProperty(window.navigator, 'userAgent', { value: originalUserAgent, configurable: true });
    });

    it('applies all overrides together on desktop', async () => {
      const block = await render('chat-pdf', fullRows, 'workflow-acrobat referrer-ai-chat-reskin');
      expect(block.querySelector('.verb-copy').textContent).to.include('Desktop copy');
      expect(block.textContent.includes('Mobile copy')).to.be.false;
      expect(block.querySelector('.verb-image img')?.getAttribute('src')).to.equal(svgHref);
      expect(block.querySelector('.verb-sub-copy').textContent).to.equal('Authored sub copy');
      const demo = block.querySelector('.demo-cta');
      expect(demo.textContent).to.equal('Authored demo');
      const params = new URL(demo.href).searchParams;
      expect(params.get('x_api_client_id')).to.equal('ChatPDFTryDemoFile');
      expect(params.get('x_api_client_location')).to.equal('ai-chat-reskin');
      expect(block.textContent.includes('dc-block-row-')).to.be.false;
    });

    it('uses the mobile copy and authored SVG icon on mobile', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
        configurable: true,
      });
      const block = await render('chat-pdf', fullRows);
      expect(block.textContent.includes('Mobile copy')).to.be.true;
      expect(block.textContent.includes('Desktop copy')).to.be.false;
      expect(block.querySelector('.verb-image img')?.getAttribute('src')).to.equal(svgHref);
      expect(block.textContent.includes('dc-block-row-')).to.be.false;
    });
  });

  it('keeps the demo CTA analytics label fixed', async () => {
    const block = await render('chat-pdf', [row('dc-block-row-demo-cta', 'Authored demo')]);
    const verbAnalytics = sinon.stub(window.analytics, 'verbAnalytics');
    const demo = block.querySelector('.demo-cta');
    demo.addEventListener('click', (e) => e.preventDefault(), { once: true });
    demo.click();
    expect(verbAnalytics.calledWith('Try with a demo file', 'chat-pdf')).to.be.true;
  });
});
