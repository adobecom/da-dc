/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.adobe.com/acrobat/plans.html"}
 */
/* eslint-disable no-undef */
/* eslint-disable compat/compat */

const mockLoadIms = jest.fn().mockResolvedValue();

jest.mock('/libs/utils/utils.js', () => ({
  __esModule: true,
  loadArea: jest.fn(),
  loadStyle: jest.fn(),
  loadLana: jest.fn(),
  loadScript: jest.fn(),
  setConfig: jest.fn(),
  getConfig: jest.fn(() => ({})),
  getMetadata: jest.fn(),
  createTag: jest.fn(),
  loadIms: mockLoadIms,
}), { virtual: true });

describe('IMS loading', () => {
  it('loads IMS and dispatches IMS:Ready when a consumer is present', async () => {
    document.body.innerHTML = '<header></header><main><div class="verb-widget"></div></main>';
    const ready = new Promise((resolve) => {
      window.addEventListener('IMS:Ready', () => resolve(true), { once: true });
    });

    await import('../../acrobat/scripts/scripts.js');

    await expect(ready).resolves.toBe(true);
    expect(mockLoadIms).toHaveBeenCalled();
  });
});
