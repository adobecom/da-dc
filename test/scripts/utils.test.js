/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { setLibs, loadPlaceholders, getLanaErrorName } from '../../acrobat/scripts/utils.js';

const miloLibs = setLibs('/libs');
const { getConfig, setConfig, updateConfig } = await import(`${miloLibs}/utils/utils.js`);

describe('Test utils.js', () => {
  it('tests setLibs with hlx domain', () => {
    const libs = setLibs('/lib', new URL('https://stage--dc--adobecom.aem.live?milolibs=test'));
    expect(libs).to.equal('https://test--milo--adobecom.aem.live/libs');
  });

  describe('Placeholder failure logs', () => {
    let originalConfig;
    let originalLana;
    let originalPlaceholders;

    beforeEach(() => {
      originalConfig = getConfig();
      setConfig({ contentRoot: '/dc-shared' });
      originalLana = window.lana;
      originalPlaceholders = window.mph;
      window.lana = { log: sinon.stub() };
      window.mph = {};
      sinon.stub(window, 'fetch');
    });

    afterEach(() => {
      sinon.restore();
      updateConfig(originalConfig);
      window.lana = originalLana;
      window.mph = originalPlaceholders;
    });

    it('logs an unsuccessful HTTP response once', async () => {
      window.fetch.resolves(new Response('Unavailable', { status: 503 }));

      await loadPlaceholders('verb-widget');

      expect(window.lana.log.calledOnce).to.be.true;
      expect(window.lana.log.firstCall.args).to.deep.equal([
        'Utils: placeholder request failed; HTTP 503',
        { severity: 'error', tags: 'DC_Milo,utils,placeholders' },
      ]);
      expect(window.mph).to.deep.equal({});
    });

    it('logs a rejected request without raw error details', async () => {
      window.fetch.rejects(new TypeError('private-email@example.com token=secret'));

      await loadPlaceholders('verb-widget');

      expect(window.lana.log.calledOnce).to.be.true;
      expect(window.lana.log.firstCall.args).to.deep.equal([
        'Utils: placeholder load failed; TypeError',
        { severity: 'error', tags: 'DC_Milo,utils,placeholders' },
      ]);
    });

    it('loads valid placeholders without a failure log', async () => {
      const data = [{ key: 'verb-widget-cta', value: 'Select\u00a0a file' }];
      window.fetch.resolves(new Response(JSON.stringify({ data })));

      await loadPlaceholders('verb-widget');

      expect(window.mph['verb-widget-cta']).to.equal('Select a file');
      expect(window.lana.log.called).to.be.false;
    });
  });

  describe('Safe LANA error classification', () => {
    it('retains a known error name without its message', () => {
      expect(getLanaErrorName(new TypeError('private-email@example.com'))).to.equal('TypeError');
    });

    it('does not log arbitrary error names or string payloads', () => {
      expect(getLanaErrorName({ name: 'private-email@example.com' })).to.equal('UnknownError');
      expect(getLanaErrorName('token=secret')).to.equal('UnknownError');
      expect(getLanaErrorName(undefined)).to.equal('UnknownError');
    });
  });

  it('tests setLibs with aem domain', () => {
    const libs = setLibs('/lib', new URL('https://stage--dc--adobecom.aem.live?milolibs=test'));
    expect(libs).to.equal('https://test--milo--adobecom.aem.live/libs');
  });
});
