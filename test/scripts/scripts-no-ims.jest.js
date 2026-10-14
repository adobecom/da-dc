/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.adobe.com/acrobat/plans.html"}
 */
/* eslint-disable no-undef */
/* eslint-disable compat/compat */

// Separate file: scripts.js self-invokes loadPage() once per module registry,
// so each DOM scenario needs its own.
const mockLoadIms = jest.fn().mockResolvedValue();
const mockSetConfig = jest.fn();

jest.mock('/libs/utils/utils.js', () => ({
  __esModule: true,
  loadArea: jest.fn(),
  loadStyle: jest.fn(),
  loadLana: jest.fn(),
  loadScript: jest.fn(),
  setConfig: mockSetConfig,
  getConfig: jest.fn(() => ({})),
  getMetadata: jest.fn(),
  createTag: jest.fn(),
  loadIms: mockLoadIms,
}), { virtual: true });

describe('IMS loading', () => {
  it('skips IMS when the page has no consumer', async () => {
    document.body.innerHTML = '<header></header><main><div class="marquee"></div></main>';

    await import('../../acrobat/scripts/scripts.js');

    // loadPage() is fire-and-forget on import, so wait for it to reach setConfig.
    for (let i = 0; i < 50 && !mockSetConfig.mock.calls.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    }

    expect(mockSetConfig).toHaveBeenCalled();
    expect(mockLoadIms).not.toHaveBeenCalled();
  });
});
