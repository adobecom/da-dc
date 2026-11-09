/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { waitFor } from '../../helpers/waitfor.js';
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
  let originalLana;

  beforeEach(() => {
    originalLana = window.lana;
    window.lana = { log: sinon.stub() };
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
    window.lana = originalLana;
  });

  it('logs one safe diagnostic and restores the CTA when file encryption fails', async () => {
    const block = makeBlock(['<h1>Image to PDF</h1>']);
    await setup(block);
    sinon.stub(crypto.subtle, 'encrypt').rejects(new DOMException(
      'private-file.jpg token=secret',
      'QuotaExceededError',
    ));
    const input = block.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['image'], 'private-file.jpg', { type: 'image/jpeg' })],
    });

    input.dispatchEvent(new Event('change'));
    await waitFor(() => window.lana.log.called);

    expect(window.lana.log.calledOnce).to.be.true;
    expect(window.lana.log.firstCall.args).to.deep.equal([
      'verb-widget-client-upload: image-to-pdf; Error Code: error_generic, Message: Unable to process the request., Info: file encryption and storage; QuotaExceededError',
      {
        sampleRate: 1,
        tags: 'DC_Milo,Project Unity (DC),verb-widget-client-upload',
        severity: 'error',
      },
    ]);
    expect(block.querySelector('.verb-cta-label').textContent).to.equal('Select a file');
    expect(block.querySelector('.verb-cta-label').closest('button').disabled).to.be.false;
    expect(block.querySelector('.error').classList.contains('hide')).to.be.false;
  });

  it('warns on every close attempt while an image upload is in progress', async () => {
    const unloadListeners = [];
    const addEventListener = window.addEventListener.bind(window);
    sinon.stub(window, 'addEventListener').callsFake((type, listener, options) => {
      if (type === 'beforeunload') unloadListeners.push(listener);
      else addEventListener(type, listener, options);
    });
    const block = makeBlock(['<h1>Image to PDF</h1>']);
    await setup(block);
    sinon.stub(crypto.subtle, 'encrypt').returns(new Promise(() => {}));
    const input = block.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })],
    });
    input.dispatchEvent(new Event('change'));
    await waitFor(() => block.querySelector('.verb-cta').disabled);

    const closeAttempt = () => {
      const event = { preventDefault: sinon.spy(), returnValue: undefined };
      unloadListeners.forEach((listener) => listener(event));
      return event;
    };
    [closeAttempt(), closeAttempt()].forEach((event) => {
      expect(event.preventDefault.calledOnce).to.be.true;
      expect(event.returnValue).to.be.true;
    });
  });

  it('redirects to the image-to-pdf page with the stored file id after a successful upload', async () => {
    const addEventListener = window.addEventListener.bind(window);
    sinon.stub(window, 'addEventListener').callsFake((type, listener, options) => {
      if (type !== 'beforeunload') addEventListener(type, listener, options);
    });
    let destination;
    const onNavigate = (e) => { destination = e.destination.url; e.preventDefault(); };
    window.navigation.addEventListener('navigate', onNavigate);
    try {
      const block = makeBlock(['<h1>Image to PDF</h1>']);
      await setup(block);
      const input = block.querySelector('input[type="file"]');
      Object.defineProperty(input, 'files', {
        configurable: true,
        value: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })],
      });
      input.dispatchEvent(new Event('change'));
      await waitFor(() => destination);
    } finally {
      window.navigation.removeEventListener('navigate', onNavigate);
    }
    const url = new URL(destination);
    expect(url.pathname).to.equal('/acrobat-online/image-to-pdf.html');
    expect(url.searchParams.get('clientConvert')).to.equal('true');
    expect(url.searchParams.get('fileId')).to.match(/^[0-9a-f-]{36}$/);
    expect(url.searchParams.get('UTS_Uploaded')).to.match(/^\d+$/);
    expect(url.searchParams.get('localeCode')).to.equal('en-US');
  });

  it('shows the validation error for an unsupported file type', async () => {
    const block = makeBlock(['<h1>Image to PDF</h1>']);
    await setup(block);
    const input = block.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['gif'], 'anim.gif', { type: 'image/gif' })],
    });
    input.dispatchEvent(new Event('change'));

    expect(block.querySelector('.error').classList.contains('hide')).to.be.false;
    expect(block.querySelector('.verb-errorText').textContent)
      .to.equal('This file is in a format not supported for conversion to PDF.');
    const messages = window.lana.log.getCalls().map((call) => call.args[0]);
    expect(messages.some((message) => message.startsWith(
      'verb-widget-client-upload: image-to-pdf; Error Code: error_unsupported_type',
    ))).to.be.true;
    expect(block.querySelector('.verb-cta').disabled).to.be.false;
  });

  it('initializes the upload UI without a failure log', async () => {
    const block = makeBlock(['<h1>Image to PDF</h1>']);
    await setup(block);

    expect(block.querySelector('input[type="file"]')).to.exist;
    expect(window.lana.log.called).to.be.false;
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
