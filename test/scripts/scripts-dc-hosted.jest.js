/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.adobe.com/acrobat/online/compress-pdf"}
 */
/* eslint-disable compat/compat */
/* eslint-disable no-undef */
/* eslint-disable global-require */

const LANA_OPTIONS = { sampleRate: 1, tags: 'DC_Milo,Frictionless', severity: 'error' };

const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

describe('scripts.js DC Hosted readiness', () => {
  let onReady;
  let setIntervalSpy;

  const loadScripts = async () => {
    require('../../acrobat/scripts/scripts.js');
    await flush();
    await flush();
  };

  const addLauncher = () => {
    document.body.insertAdjacentHTML('beforeend', '<script id="adobe_dc_sdk_launcher"></script>');
    return document.getElementById('adobe_dc_sdk_launcher');
  };

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('/libs/utils/utils.js', () => ({
      loadArea: jest.fn(() => Promise.resolve()),
      setConfig: jest.fn(),
      getConfig: jest.fn(() => ({})),
      loadLana: jest.fn(),
      getMetadata: jest.fn(),
      loadIms: jest.fn(() => new Promise(() => {})),
    }));
    document.head.innerHTML = '';
    document.body.innerHTML = '<header></header><main><div></div></main>';
    delete window.dc_hosted;
    window.lana = { log: jest.fn() };
    onReady = jest.fn();
    window.addEventListener('DC_Hosted:Ready', onReady);
    setIntervalSpy = jest.spyOn(window, 'setInterval');
  });

  afterEach(() => {
    window.removeEventListener('DC_Hosted:Ready', onReady);
    jest.restoreAllMocks();
  });

  it('does not poll or dispatch on pages without the DC Hosted launcher', async () => {
    await loadScripts();

    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(onReady).not.toHaveBeenCalled();
    expect(window.lana.log).not.toHaveBeenCalled();
  });

  it('dispatches DC_Hosted:Ready right away when window.dc_hosted is already set', async () => {
    window.dc_hosted = {};
    addLauncher();

    await loadScripts();

    expect(onReady).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('dispatches DC_Hosted:Ready once, when the launcher finishes loading', async () => {
    const launcher = addLauncher();
    await loadScripts();
    expect(onReady).not.toHaveBeenCalled();

    window.dc_hosted = {};
    launcher.dispatchEvent(new Event('load'));
    expect(onReady).toHaveBeenCalledTimes(1);

    launcher.dispatchEvent(new Event('load'));
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('logs to Lana instead of waiting when the launcher loads without window.dc_hosted', async () => {
    const launcher = addLauncher();
    await loadScripts();

    launcher.dispatchEvent(new Event('load'));

    expect(onReady).not.toHaveBeenCalled();
    expect(window.lana.log).toHaveBeenCalledWith(
      'DC Hosted launcher loaded without setting window.dc_hosted',
      LANA_OPTIONS,
    );
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });
});
