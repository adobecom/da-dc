/* eslint-env jest */
const { setImmediate: flushAsyncWork } = require('timers/promises');

const mockExecAsync = jest.fn();

jest.mock('child_process', () => {
  const { promisify } = jest.requireActual('util');
  const exec = jest.fn();
  exec[promisify.custom] = mockExecAsync;
  return { exec };
});

const GIST_ID = '0123456789abcdef0123456789abcdef';
const URLS = [
  'https://www.adobe.com/acrobat/online/pdf-ai.html',
  'https://www.adobe.com/fr/acrobat/online/delete-pdf-pages.html',
];

function mockGistResponse({ ok = true, status = 200 } = {}) {
  global.fetch = jest.fn(async () => ({
    ok,
    status,
    json: async () => ({ files: { 'urls.txt': { content: `${URLS.join('\n')}\n` } } }),
  }));
}

async function runGist() {
  process.argv = ['node', 'prerender-gist.js', GIST_ID, 'staging', 'prod', 'frictionless'];
  await jest.isolateModulesAsync(async () => {
    await import('../../../tools/prerender/prerender-gist.js');
  });
  await flushAsyncWork();
}

describe('prerender-gist.js', () => {
  const originalFetch = global.fetch;
  let logSpy;
  let errorSpy;
  let exitSpy;

  beforeEach(() => {
    process.exitCode = 0;
    mockExecAsync.mockReset();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    process.exitCode = 0;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('runs desktop and mobile prerenders for every gist URL', async () => {
    mockGistResponse();
    mockExecAsync.mockResolvedValue({ stdout: 'EdgeKV write response: ok', stderr: '' });
    await runGist();

    expect(mockExecAsync).toHaveBeenCalledTimes(4);
    URLS.forEach((url) => ['desktop', 'mobile'].forEach((layout) => {
      expect(mockExecAsync).toHaveBeenCalledWith(expect.stringContaining(`"${url}" --layout ${layout} --network staging --namespace prod --group frictionless --edgekv`));
    }));
    expect(logSpy).toHaveBeenCalledWith('Finished processing all URLs: 4 succeeded, 0 failed');
    expect(process.exitCode).toBe(0);
  });

  it('fails the run and lists every prerender that failed', async () => {
    mockGistResponse();
    mockExecAsync.mockImplementation(async (command) => {
      if (command.includes('/fr/')) throw new Error('Command failed');
      return { stdout: 'EdgeKV write response: ok', stderr: '' };
    });
    await runGist();

    expect(logSpy).toHaveBeenCalledWith('Finished processing all URLs: 2 succeeded, 2 failed');
    expect(errorSpy).toHaveBeenCalledWith(`Failed prerenders:\n${URLS[1]} (desktop)\n${URLS[1]} (mobile)`);
    expect(process.exitCode).toBe(1);
  });

  it('exits with an error when the gist cannot be fetched', async () => {
    mockGistResponse({ ok: false, status: 404 });
    await runGist();

    expect(errorSpy).toHaveBeenCalledWith('Error:', `Failed to fetch gist ${GIST_ID}: HTTP 404`);
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(mockExecAsync).not.toHaveBeenCalled();
  });
});
