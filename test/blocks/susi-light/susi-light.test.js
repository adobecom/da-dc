/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { setLibs } from '../../../acrobat/scripts/utils.js';

const miloLibs = setLibs('/libs');
const { getConfig, setConfig } = await import(`${miloLibs}/utils/utils.js`);
const { default: init } = await import('../../../acrobat/blocks/susi-light/susi-light.js');

describe('SUSI Light failure logs', () => {
  let originalConfig;
  let originalGlobals;
  let script;
  let block;

  beforeEach(async () => {
    originalConfig = getConfig();
    originalGlobals = { lana: window.lana, adobeid: window.adobeid, feds: window.feds };
    setConfig({ ...originalConfig, locale: { ietf: 'en-US' }, lingo: false });
    window.lana = { log: sinon.stub() };
    window.adobeid = { client_id: 'test', redirect_uri: 'https://www.adobe.com/home' };
    window.feds = undefined;
    script = document.createElement('script');
    script.type = 'application/json';
    script.src = 'https://auth-light.identity-stage.adobe.com/sentry/wrapper.js';
    script.dataset.loaded = 'true';
    document.head.append(script);
    block = document.createElement('div');
    block.innerHTML = '<div><div>https://www.adobe.com/home</div></div>';
    document.body.append(block);
    await init(block);
  });

  afterEach(() => {
    script.remove();
    block.remove();
    setConfig(originalConfig);
    Object.assign(window, originalGlobals);
  });

  it('logs a component error once with safe classification and tags', () => {
    const detail = { error: new TypeError('private-email@example.com token=secret') };
    block.querySelector('susi-sentry-light').dispatchEvent(new CustomEvent('on-error', { detail }));

    expect(window.lana.log.calledOnce).to.be.true;
    expect(window.lana.log.firstCall.args).to.deep.equal([
      'SUSI Light: authentication component reported an error; TypeError',
      { severity: 'error', tags: 'DC_Milo,susi-light' },
    ]);
  });

  it('logs an error without a detail payload', () => {
    block.querySelector('susi-sentry-light').dispatchEvent(new CustomEvent('on-error'));

    expect(window.lana.log.calledOnce).to.be.true;
    expect(window.lana.log.firstCall.args[0]).to.include('UnknownError');
  });

  it('does not log an error during successful initialization', () => {
    expect(block.querySelector('susi-sentry-light')).to.exist;
    expect(window.lana.log.called).to.be.false;
  });
});
