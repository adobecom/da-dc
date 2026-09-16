/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved, import/order

const { default: init } = await import(
  '../../../acrobat/blocks/verb-widget-client-upload/verb-widget-client-upload.js'
);

const VERB = 'image-to-pdf';

function makeBlock(rows) {
  const el = document.createElement('div');
  el.className = `verb-widget-client-upload ${VERB}`;
  rows.forEach((content) => {
    const row = document.createElement('div');
    const cell = document.createElement('div');
    cell.innerHTML = content;
    row.appendChild(cell);
    el.appendChild(row);
  });
  return el;
}

async function setup(block) {
  document.body.appendChild(block);
  const conf = getConfig();
  setConfig({ ...conf, locale: { prefix: '', ietf: 'en-US' } });
  await init(block);
}

describe('verb-widget-client-upload init', () => {
  let xhr;

  beforeEach(() => {
    sinon.stub(window, 'fetch');
    window.fetch.callsFake((url) => {
      if (typeof url === 'string' && url.endsWith('.svg')) {
        return window.fetch.wrappedMethod.call(window, url);
      }
      return Promise.resolve(new Response(''));
    });
    xhr = sinon.useFakeXMLHttpRequest();
    window.adobeIMS = { isSignedInUser: () => false };
    window.mph = {
      [`verb-widget-${VERB}-description`]: 'Placeholder desktop copy',
      [`verb-widget-${VERB}-mobile-description`]: 'Placeholder mobile copy',
      'verb-widget-cta': 'Select a file',
      'verb-widget-legal': 'Legal text',
      'verb-widget-legal-2': 'Legal text 2',
      'verb-widget-tool-tip': 'Tooltip',
    };
  });

  afterEach(() => {
    xhr.restore();
    sinon.restore();
    document.body.innerHTML = '';
  });

  describe('authored copy', () => {
    it('falls back to placeholders when only a heading row exists', async () => {
      const block = makeBlock(['<h1>Image to PDF</h1>']);
      await setup(block);

      const copy = block.querySelector('.verb-copy');
      expect(copy).to.exist;
      expect(copy.textContent).to.equal('Placeholder desktop copy');
    });

    it('uses authored desktop copy from the 2nd DOM row in a non-mobile environment', async () => {
      const block = makeBlock([
        '<h1>Image to PDF</h1>',
        'Authored desktop copy',
        'Authored mobile copy',
      ]);
      await setup(block);

      // init renders only one copy element — desktop or mobile based on UA
      const copy = block.querySelector('.verb-copy');
      expect(copy).to.exist;
      expect(copy.textContent).to.equal('Authored desktop copy');
    });

    it('does not use placeholder text when authored copy rows are present', async () => {
      const block = makeBlock([
        '<h1>Image to PDF</h1>',
        'Authored desktop copy',
        'Authored mobile copy',
      ]);
      await setup(block);

      const copy = block.querySelector('.verb-copy');
      expect(copy.textContent).to.not.equal('Placeholder desktop copy');
      expect(copy.textContent).to.not.equal('Placeholder mobile copy');
    });
  });

  describe('authored icon', () => {
    it('uses an authored <img> as the verb image', async () => {
      const block = makeBlock([
        '<h1>Image to PDF</h1>',
        '<img src="/test-icon.png" alt="custom icon" />',
      ]);
      await setup(block);

      const verbImg = block.querySelector('.verb-image .icon-verb-image');
      expect(verbImg).to.exist;
      expect(verbImg.tagName).to.equal('IMG');
      expect(verbImg.getAttribute('src')).to.equal('/test-icon.png');
    });

    it('uses an authored SVG link as the verb image', async () => {
      const block = makeBlock([
        '<h1>Image to PDF</h1>',
        '<a href="/acrobat/blocks/verb-widget/icons/custom-icon.svg">icon</a>',
      ]);
      await setup(block);

      const verbImg = block.querySelector('.verb-image .icon-verb-image');
      expect(verbImg).to.exist;
      expect(verbImg.tagName).to.equal('IMG');
      expect(verbImg.getAttribute('src')).to.include('custom-icon.svg');
    });

    it('falls back to built-in SVG icon when no authored icon is present', async () => {
      const block = makeBlock(['<h1>Image to PDF</h1>']);
      await setup(block);

      const verbImage = block.querySelector('.verb-image');
      expect(verbImage).to.exist;
      // built-in loads an SVG element (not an IMG tag)
      expect(verbImage.querySelector('svg, img')).to.exist;
    });
  });
});
