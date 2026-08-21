/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved
import { delay } from '../../helpers/waitfor.js';

const { default: init, LIMITS } = await import(
  '../../../acrobat/blocks/study-marquee/study-marquee.js'
);

describe('study-marquee block', () => {
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

  it('exports LIMITS for quiz-maker, flashcard-maker, and mindmap-maker', () => {
    expect(LIMITS).to.have.property('quiz-maker');
    expect(LIMITS).to.have.property('flashcard-maker');
    expect(LIMITS).to.have.property('mindmap-maker');
    expect(LIMITS['quiz-maker'].acceptedFiles).to.be.an('array');
    expect(LIMITS['quiz-maker'].maxFileSize).to.equal(104857600);
    expect(LIMITS['flashcard-maker'].multipleFiles).to.be.true;
    expect(LIMITS['mindmap-maker'].acceptedFiles).to.be.an('array');
    expect(LIMITS['mindmap-maker'].maxFileSize).to.equal(104857600);
    expect(LIMITS['mindmap-maker'].multipleFiles).to.be.true;
    expect(LIMITS['mindmap-maker'].genAI).to.be.true;
  });

  it('exports LIMITS for gen-presentation-v2 and interactive-report as single-file study verbs', () => {
    expect(LIMITS).to.have.property('gen-presentation-v2');
    expect(LIMITS).to.have.property('interactive-report');
    ['gen-presentation-v2', 'interactive-report'].forEach((verb) => {
      expect(LIMITS[verb].acceptedFiles).to.be.an('array');
      expect(LIMITS[verb].acceptedFiles).to.deep.equal(LIMITS['flashcard-maker'].acceptedFiles);
      expect(LIMITS[verb].maxFileSize).to.equal(104857600);
      expect(LIMITS[verb].maxNumFiles).to.equal(1);
      expect(LIMITS[verb].multipleFiles).to.not.be.ok;
      expect(LIMITS[verb].genAI).to.be.true;
    });
  });

  it('exports LIMITS for stylize as a single-file PDF-only verb', () => {
    expect(LIMITS).to.have.property('stylize');
    expect(LIMITS.stylize.acceptedFiles).to.deep.equal(['.pdf']);
    expect(LIMITS.stylize.maxFileSize).to.equal(104857600);
    expect(LIMITS.stylize.maxNumFiles).to.equal(1);
    expect(LIMITS.stylize.multipleFiles).to.not.be.ok;
    expect(LIMITS.stylize.genAI).to.be.true;
  });

  it('init gen-presentation-v2 block', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body-gen-presentation-v2.html' });
    const block = document.body.querySelector('.study-marquee');
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    await init(block);
    expect(block.classList.contains('gen-presentation-v2')).to.be.true;
    expect(document.querySelector('.study-marquee .study-marquee-dropzone')).to.exist;
  });

  it('init interactive-report block', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body-interactive-report.html' });
    const block = document.body.querySelector('.study-marquee');
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    await init(block);
    expect(block.classList.contains('interactive-report')).to.be.true;
    expect(document.querySelector('.study-marquee .study-marquee-dropzone')).to.exist;
  });

  it('init stylize block', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body-stylize.html' });
    const block = document.body.querySelector('.study-marquee');
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    await init(block);
    expect(block.classList.contains('stylize')).to.be.true;
    expect(document.querySelector('.study-marquee .study-marquee-dropzone')).to.exist;
    expect(document.querySelector('.study-marquee #file-upload').getAttribute('accept')).to.equal('.pdf');
  });

  it('init study-marquee', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    expect(document.querySelector('.study-marquee .acrobat-icon svg')).to.exist;
    expect(document.querySelector('.study-marquee .info-icon svg')).to.exist;
  });

  it('init flashcard-maker block', async () => {
    const block = document.body.querySelector('.study-marquee');
    block.classList.remove('quiz-maker');
    block.classList.add('flashcard-maker');
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    await init(block);
    expect(block.classList.contains('flashcard-maker')).to.be.true;
    expect(document.querySelector('.study-marquee .study-marquee-dropzone')).to.exist;
  });

  it('init mindmap-maker block', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body-mindmap-maker.html' });
    const block = document.body.querySelector('.study-marquee');
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    await init(block);
    expect(block.classList.contains('mindmap-maker')).to.be.true;
    expect(document.querySelector('.study-marquee .study-marquee-dropzone')).to.exist;
  });

  it('show error toast', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);

    window.analytics = {
      verbAnalytics: sinon.spy(),
      sendAnalyticsToSplunk: sinon.spy(),
    };

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', {
      detail: {
        code: 'error_only_accept_one_file',
        info: 'Test error info',
        metaData: 'metadata',
        errorData: 'errorData',
        sendToSplunk: true,
        message: 'Test error message',
      },
    }));

    expect(window.analytics.verbAnalytics.called).to.be.true;
    expect(window.analytics.sendAnalyticsToSplunk.called).to.be.true;

    expect(window.lana.log.called).to.be.true;
  });

  it('maps password-protected validation errors (single and multi) to analytics', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };

    ['validation_error_password_protected', 'validation_error_password_protected_multi'].forEach((code) => {
      block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code, message: 'This file is password protected.', sendToSplunk: true } }));
    });

    expect(window.analytics.verbAnalytics.calledWith('error:password_protected')).to.be.true;
    expect(window.analytics.sendAnalyticsToSplunk.calledWith('error_password_protected')).to.be.true;
  });

  it('maps acroform-not-supported validation errors (single and multi) to analytics', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body-stylize.html' });
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };

    ['validation_error_acroform_not_supported', 'validation_error_acroform_not_supported_multi'].forEach((code) => {
      block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code, message: 'Forms are not supported.', sendToSplunk: true } }));
    });

    expect(window.analytics.verbAnalytics.calledWith('error:acroform_not_supported')).to.be.true;
    expect(window.analytics.sendAnalyticsToSplunk.calledWith('error_acroform_not_supported')).to.be.true;
  });

  it('displays the error toast message for the new validation error codes', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);
    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };
    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'validation_error_password_protected', message: 'This file is password protected.', sendToSplunk: false } }));
    const errorState = block.querySelector('.error');
    expect(errorState.classList.contains('hide')).to.be.false;
    expect(block.querySelector('.study-marquee-error-text').textContent).to.equal('This file is password protected.');
  });

  it('error close button hides error state', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Error', sendToSplunk: false } }));
    await delay(50);

    const errorCloseBtn = block.querySelector('.study-marquee-errorBtn');
    const errorState = block.querySelector('.error');
    expect(errorState.classList.contains('hide')).to.be.false;
    errorCloseBtn.click();
    expect(errorState.classList.contains('hide')).to.be.true;
  });

  it('error toast does not auto-close after 5 seconds', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };

    const clock = sinon.useFakeTimers();
    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Test error', sendToSplunk: false } }));

    const errorState = block.querySelector('.error');
    expect(errorState.classList.contains('hide')).to.be.false;

    clock.tick(6000);
    expect(errorState.classList.contains('hide')).to.be.false;
  });

  it('error toast closes when clicking outside the toast', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Test error', sendToSplunk: false } }));

    const errorState = block.querySelector('.error');
    expect(errorState.classList.contains('hide')).to.be.false;

    await delay(50);
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(errorState.classList.contains('hide')).to.be.true;
  });

  it('error toast does not close on click inside toast', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Test error', sendToSplunk: false } }));

    const errorState = block.querySelector('.error');
    expect(errorState.classList.contains('hide')).to.be.false;

    errorState.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(errorState.classList.contains('hide')).to.be.false;
  });

  it('error close button closes toast on Enter key', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Test error', sendToSplunk: false } }));

    const errorState = block.querySelector('.error');
    const errorCloseBtn = block.querySelector('.study-marquee-errorBtn');
    expect(errorState.classList.contains('hide')).to.be.false;

    errorCloseBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(errorState.classList.contains('hide')).to.be.true;
  });

  it('error close button closes toast on Space key', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_generic', message: 'Test error', sendToSplunk: false } }));

    const errorState = block.querySelector('.error');
    const errorCloseBtn = block.querySelector('.study-marquee-errorBtn');
    expect(errorState.classList.contains('hide')).to.be.false;

    errorCloseBtn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(errorState.classList.contains('hide')).to.be.true;
  });

  it('cookie_not_set error does not send to Splunk', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);

    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };

    block.dispatchEvent(new CustomEvent('unity:show-error-toast', { detail: { code: 'error_cookie_not_set', message: 'Cookie not set', sendToSplunk: true } }));

    expect(window.analytics.sendAnalyticsToSplunk.called).to.be.false;
  });

  it('track analytics', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);

    window.analytics = {
      verbAnalytics: sinon.spy(),
      sendAnalyticsToSplunk: sinon.spy(),
    };

    block.dispatchEvent(new CustomEvent('unity:track-analytics', {
      detail: {
        event: 'change',
        data: {},
        sendToSplunk: true,
      },
    }));

    block.dispatchEvent(new CustomEvent('unity:track-analytics', {
      detail: {
        event: 'drop',
        data: {},
        sendToSplunk: false,
      },
    }));

    block.dispatchEvent(new CustomEvent('unity:track-analytics', {
      detail: {
        event: 'cancel',
        data: {},
        sendToSplunk: false,
      },
    }));

    block.dispatchEvent(new CustomEvent('unity:track-analytics', {
      detail: {
        event: 'uploading',
        data: {},
        sendToSplunk: false,
      },
    }));

    block.dispatchEvent(new CustomEvent('unity:track-analytics', {
      detail: {
        event: 'uploaded',
        data: {},
        sendToSplunk: false,
      },
    }));

    block.dispatchEvent(new CustomEvent('unity:track-analytics', {
      detail: {
        event: 'redirectUrl',
        data: {},
        sendToSplunk: false,
      },
    }));

    block.dispatchEvent(new CustomEvent('unity:track-analytics', {
      detail: {
        event: 'chunk_uploaded',
        data: {},
        sendToSplunk: false,
      },
    }));

    expect(window.analytics.verbAnalytics.called).to.be.true;
    expect(window.analytics.sendAnalyticsToSplunk.called).to.be.true;

    const verbAnalyticsCalls = window.analytics.verbAnalytics.getCalls();
    expect(verbAnalyticsCalls.length).to.be.greaterThan(0);

    expect(() => {
      block.dispatchEvent(new CustomEvent('unity:track-analytics', { detail: { event: 'unknown', data: {} } }));
    }).to.not.throw();
  });

  it('dropzone click triggers file input', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);
    const fileInput = block.querySelector('#file-upload');
    const dropzone = block.querySelector('.study-marquee-dropzone');
    const clickSpy = sinon.spy(fileInput, 'click');
    const dragText = dropzone.querySelector('.study-marquee-drag');
    dragText.click();
    expect(clickSpy.called).to.be.true;
  });

  it('dragleave removes dragging-block class', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);
    block.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: new DataTransfer() }));
    expect(block.classList.contains('dragging-block')).to.be.true;
    block.dispatchEvent(new DragEvent('dragleave', { bubbles: true, relatedTarget: null }));
    expect(block.classList.contains('dragging-block')).to.be.false;
  });

  it('file input cancel fires analytics', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);
    window.analytics = { verbAnalytics: sinon.spy(), sendAnalyticsToSplunk: sinon.spy() };
    const fileInput = block.querySelector('#file-upload');
    fileInput.dispatchEvent(new Event('cancel', { bubbles: true }));
    expect(window.analytics.verbAnalytics.calledWith('choose-file:close')).to.be.true;
  });

  it('legal footer contains Terms of Use and Privacy Policy links', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);
    const legalEl = block.querySelector('.study-marquee-legal');
    expect(legalEl).to.exist;
    const links = legalEl.querySelectorAll('a.study-marquee-legal-url');
    const hrefs = Array.from(links).map((a) => a.getAttribute('href'));
    expect(hrefs.some((h) => h && h.includes('terms'))).to.be.true;
    expect(hrefs.some((h) => h && h.includes('privacy'))).to.be.true;
  });

  it('avalon: appends extra legal text inline as a continuation of the main legal paragraph', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    block.classList.add('avalon');
    await init(block);
    await delay(100);
    const footer = block.querySelector('.study-marquee-footer');
    const baseLegal = footer.querySelector('.study-marquee-legal:not(.study-marquee-legal-extra)');
    const extraLegal = footer.querySelector('.study-marquee-legal-extra');
    expect(extraLegal).to.exist;
    expect(extraLegal.textContent).to.contain('at least 13 years old');
    // extra legal is an inline continuation within the main legal paragraph (not a separate block)
    expect(extraLegal.tagName.toLowerCase()).to.equal('span');
    expect(baseLegal.contains(extraLegal)).to.be.true;
  });

  it('avalon: cover media is a direct child of the block (hero-marquee media-cover)', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    block.classList.add('avalon');
    await init(block);
    await delay(100);
    const media = block.querySelector('.study-marquee-media');
    expect(media).to.exist;
    expect(media.parentElement).to.equal(block);
    expect(block.querySelector('.study-marquee-col-right .study-marquee-media')).to.not.exist;
  });

  it('base variation keeps media inside the right column', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);
    expect(block.querySelector('.study-marquee-col-right .study-marquee-media')).to.exist;
  });

  it('base variation does not render the avalon extra legal text', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);
    expect(block.querySelector('.study-marquee-legal-extra')).to.not.exist;
  });

  it('CTA text: verb-specific placeholder overrides the default', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    window.mph['study-marquee-quiz-maker-upload-cta'] = 'Make my quiz';
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);
    const label = block.querySelector('.study-marquee-cta-label');
    expect(label.textContent).to.equal('Make my quiz');
    delete window.mph['study-marquee-quiz-maker-upload-cta'];
  });

  it('CTA text: falls back to the uploadType key when no verb-specific text', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);
    const label = block.querySelector('.study-marquee-cta-label');
    expect(label.textContent).to.equal(window.mph['verb-widget-cta-multifile-only']);
  });

  it('resolves the verb when the avalon token precedes the verb class', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    window.mph['study-marquee-quiz-maker-upload-cta'] = 'Quiz specific CTA';
    const block = document.body.querySelector('.study-marquee');
    // author order: study-marquee avalon quiz-maker (avalon becomes classList[1])
    block.classList.remove('quiz-maker');
    block.classList.add('avalon');
    block.classList.add('quiz-maker');
    await init(block);
    await delay(100);
    // VERB must still resolve to quiz-maker (classList[2]), proven by the verb-specific CTA
    const label = block.querySelector('.study-marquee-cta-label');
    expect(label.textContent).to.equal('Quiz specific CTA');
    delete window.mph['study-marquee-quiz-maker-upload-cta'];
  });

  it('avalon: verb-specific extra legal key overrides the generic', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    window.mph['study-marquee-quiz-maker-legal-extra'] = 'Verb-specific legal line';
    const block = document.body.querySelector('.study-marquee');
    block.classList.add('avalon');
    await init(block);
    await delay(100);
    const extra = block.querySelector('.study-marquee-legal-extra');
    expect(extra).to.exist;
    expect(extra.textContent).to.contain('Verb-specific legal line');
    delete window.mph['study-marquee-quiz-maker-legal-extra'];
  });

  it('avalon: no extra legal element when no placeholder is authored', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const saved = window.mph['study-marquee-legal-extra'];
    delete window.mph['study-marquee-legal-extra'];
    const block = document.body.querySelector('.study-marquee');
    block.classList.add('avalon');
    await init(block);
    await delay(100);
    expect(block.querySelector('.study-marquee-legal-extra')).to.not.exist;
    window.mph['study-marquee-legal-extra'] = saved;
  });

  it('upload button exists', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);
    const button = block.querySelector('button');
    expect(button).to.exist;
    expect(button.classList.contains('study-marquee-cta')).to.be.true;
  });

  it('upload button changed', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    const button = block.querySelector('input');
    await delay(100);
    const changeEvent = new Event('change');
    Object.defineProperty(changeEvent, 'target', {
      writable: false,
      value: { files: [new File(['hello'], 'hello.pdf', { type: 'application/pdf' })] },
    });

    expect(() => {
      button.dispatchEvent(changeEvent);
    }).to.not.throw();

    expect(button).to.exist;
    expect(button.tagName.toLowerCase()).to.equal('input');
  });

  it('drop zone dragover', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);

    expect(block.classList.contains('dragging')).to.be.false;
    const eventOver = new Event('dragover');
    Object.defineProperty(eventOver, 'target', {
      writable: false,
      value: { files: [new File(['hello'], 'hello.pdf', { type: 'application/pdf' })] },
    });
    block.dispatchEvent(eventOver);

    const eventLeave = new Event('dragleave');
    block.dispatchEvent(eventLeave);

    expect(block.classList.contains('dragging')).to.be.false;
  });

  it('drop zone drop', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);

    const event = new Event('drop');
    const mockFiles = [
      new File(['hello'], 'hello.pdf', { type: 'application/pdf' }),
      new File(['world'], 'world.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(event, 'dataTransfer', {
      writable: false,
      value: { files: mockFiles },
    });

    expect(() => {
      block.dispatchEvent(event);
    }).to.not.throw();

    expect(block).to.exist;
    expect(block.classList.contains('study-marquee')).to.be.true;
  });

  it('before unload', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);

    const input = block.querySelector('input');
    const changeEvent = new Event('change');
    Object.defineProperty(changeEvent, 'target', { writable: false, value: { files: [new File(['hello'], 'hello.pdf', { type: 'application/pdf' })] } });
    input.dispatchEvent(changeEvent);
    await delay(100);

    const event = new Event('beforeunload');
    Object.defineProperty(event, 'returnValue', {
      value: '',
      writable: true,
    });
    window.dispatchEvent(event);
  });

  it('page show', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    await delay(100);
    const normalEvent = new Event('pageshow');
    Object.defineProperty(normalEvent, 'persisted', {
      value: false,
      writable: false,
    });
  });
});
