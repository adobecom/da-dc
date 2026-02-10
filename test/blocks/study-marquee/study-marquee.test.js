/* eslint-disable compat/compat */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { getConfig, setConfig } from 'https://main--milo--adobecom.aem.live/libs/utils/utils.js'; // eslint-disable-line import/no-unresolved
import { delay } from '../../helpers/waitfor.js';

const { default: init } = await import(
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

  it('init study-marquee', async () => {
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);
    expect(document.querySelector('.study-marquee .acrobat-icon svg')).to.exist;
    expect(document.querySelector('.study-marquee .info-icon svg')).to.exist;
  });

  it('signed in', async () => {
    window.adobeIMS = {
      isSignedInUser: () => true,
      getAccountType: () => null,
    };
    const conf = getConfig();
    setConfig({ ...conf, locale: { prefix: '' } });
    const block = document.body.querySelector('.study-marquee');
    await init(block);

    expect(block.classList.contains('upsell')).to.be.false;
    expect(block.classList.contains('signed-in')).to.be.true;

    expect(document.querySelector('.study-marquee .acrobat-icon svg')).to.exist;
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

