/* eslint-env jest */
const { setImmediate: flushAsyncWork } = require('timers/promises');

const mockWriteFile = jest.fn(async () => {});
const mockAuth = jest.fn();
let mockSendError = null;
let mockBrowser;

jest.mock('playwright', () => ({ chromium: { launch: jest.fn(async () => mockBrowser) } }));

jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return { ...actual, promises: { ...actual.promises, writeFile: mockWriteFile } };
});

jest.mock('akamai-edgegrid', () => jest.fn().mockImplementation(() => ({
  auth: mockAuth,
  send: (callback) => callback(mockSendError, {}, 'Item was upserted'),
})));

const SECTION = 'div[daa-lh="s1"]';

function createPage({ selectorError, readyError } = {}) {
  const element = {
    innerHTML: jest.fn(async () => '<div class="verb-widget">Delete PDF pages</div>'),
    evaluate: jest.fn(async () => ({ top: '126px', height: '800px' })),
  };
  return {
    goto: jest.fn(async () => {}),
    waitForLoadState: jest.fn(async () => {}),
    waitForSelector: jest.fn(async () => {
      if (selectorError) throw selectorError;
    }),
    waitForFunction: jest.fn(async () => {
      if (readyError) throw readyError;
    }),
    evaluate: jest.fn(async () => {}),
    locator: jest.fn(() => element),
  };
}

function fakeDocument(options = {}) {
  const { header = 'c2', lang = 'en-US' } = options;
  const { jpWordWrapDisabled = false, keepAllApplied = false } = options;
  const headers = {
    c1: { classList: { contains: (name) => name === 'ready' }, querySelector: () => null },
    c2: { classList: { contains: () => false }, querySelector: (sel) => (sel === ':scope > nav' ? {} : null) },
    loading: { classList: { contains: () => false }, querySelector: () => null },
  };
  const elements = {
    header: header ? headers[header] : null,
    'meta[name="jpwordwrap:disabled"]': jpWordWrapDisabled ? { content: 'true' } : null,
    'div[daa-lh="s1"] [style*="keep-all"]': keepAllApplied ? {} : null,
  };
  return { documentElement: { lang }, querySelector: (sel) => elements[sel] || null };
}

async function runPrerender(page, args) {
  mockBrowser = {
    newContext: jest.fn(async () => ({ newPage: async () => page })),
    close: jest.fn(async () => {}),
  };
  process.argv = ['node', 'prerender.js', ...args];
  await jest.isolateModulesAsync(async () => {
    await import('../../../tools/prerender/prerender.js');
  });
  await flushAsyncWork();
}

describe('prerender.js', () => {
  const url = 'https://www.adobe.com/fr/acrobat/online/delete-pdf-pages.html';
  let errorSpy;

  beforeEach(() => {
    process.exitCode = 0;
    mockSendError = null;
    mockWriteFile.mockClear();
    mockAuth.mockClear();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.exitCode = 0;
    jest.restoreAllMocks();
  });

  it('waits for the first section to be built and visible instead of network idle', async () => {
    const page = createPage();
    await runPrerender(page, [url, '--layout', 'mobile']);

    expect(page.waitForSelector).toHaveBeenCalledWith(SECTION, { state: 'visible', timeout: 60000 });
    expect(page.waitForFunction)
      .toHaveBeenCalledWith(expect.any(Function), null, { timeout: 60000 });
    expect(page.evaluate).toHaveBeenCalledTimes(1);
    expect(page.waitForLoadState).not.toHaveBeenCalled();
    expect(page.locator).toHaveBeenCalledWith(SECTION);
    expect(mockWriteFile).toHaveBeenCalledWith(expect.stringMatching(/delete-pdf-pages-mobile\.html$/), expect.any(String), 'utf8');
    expect(mockWriteFile).toHaveBeenCalledWith(expect.stringMatching(/delete-pdf-pages-mobile\.json$/), expect.stringContaining('"top": "126px"'), 'utf8');
    expect(mockBrowser.close).toHaveBeenCalled();
    expect(process.exitCode).toBe(0);
  });

  describe('page readiness check', () => {
    let isReady;
    const realDocument = global.document;

    beforeAll(async () => {
      const page = createPage();
      jest.spyOn(console, 'log').mockImplementation(() => {});
      await runPrerender(page, [url, '--layout', 'mobile']);
      [[isReady]] = page.waitForFunction.mock.calls;
    });

    afterEach(() => {
      global.document = realDocument;
    });

    const check = (doc) => {
      global.document = doc;
      return isReady();
    };

    it('waits until the global navigation has rendered', () => {
      expect(check(fakeDocument({ header: 'loading' }))).toBe(false);
      expect(check(fakeDocument({ header: 'c2' }))).toBe(true);
      expect(check(fakeDocument({ header: 'c1' }))).toBe(true);
      expect(check(fakeDocument({ header: null }))).toBe(true);
    });

    it('waits for Japanese word wrapping on ja-JP pages', () => {
      expect(check(fakeDocument({ lang: 'ja-JP' }))).toBe(false);
      expect(check(fakeDocument({ lang: 'ja-JP', keepAllApplied: true }))).toBe(true);
      expect(check(fakeDocument({ lang: 'ja-JP', jpWordWrapDisabled: true }))).toBe(true);
      expect(check(fakeDocument({ lang: 'fr-FR' }))).toBe(true);
    });
  });

  it('sets a failing exit code when the page never finishes building', async () => {
    const page = createPage({ selectorError: new Error('page.waitForSelector: Timeout 60000ms exceeded.') });
    await runPrerender(page, [url, '--layout', 'mobile']);

    expect(errorSpy).toHaveBeenCalledWith('An error occurred:', expect.any(Error));
    expect(mockWriteFile).not.toHaveBeenCalled();
    expect(mockBrowser.close).toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('sets a failing exit code when the navigation never renders', async () => {
    const page = createPage({ readyError: new Error('page.waitForFunction: Timeout 60000ms exceeded.') });
    await runPrerender(page, [url, '--layout', 'mobile']);

    expect(errorSpy).toHaveBeenCalledWith('An error occurred:', expect.any(Error));
    expect(page.evaluate).not.toHaveBeenCalled();
    expect(mockWriteFile).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('writes the prerender to the locale EdgeKV group', async () => {
    const page = createPage();
    await runPrerender(page, [url, '--layout', 'mobile', '--network', 'staging', '--namespace', 'prod', '--edgekv']);

    expect(mockAuth).toHaveBeenCalledWith(expect.objectContaining({
      path: '/edgekv/v1/networks/staging/namespaces/prod/groups/frictionless_fr/items/delete-pdf-pages_mobile',
      method: 'PUT',
    }));
    expect(process.exitCode).toBe(0);
  });

  it('sets a failing exit code when the EdgeKV write fails', async () => {
    mockSendError = new Error('EdgeKV unavailable');
    const page = createPage();
    await runPrerender(page, [url, '--layout', 'desktop', '--edgekv']);

    expect(errorSpy).toHaveBeenCalledWith('EdgeKV write failed:', mockSendError);
    expect(process.exitCode).toBe(1);
  });
});
