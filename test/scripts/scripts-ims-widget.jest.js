/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.adobe.com/acrobat/online/compress-pdf.html"}
 */
/* eslint-disable no-undef */
/* eslint-disable compat/compat */

// The fast-track path strips the block's class and sets an id, so the IMS check
// must still match. Separate file: scripts.js self-invokes loadPage() on import.
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

jest.mock('../../acrobat/blocks/dc-converter-widget/dc-converter-widget.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('IMS loading for fast-tracked widgets', () => {
  it('loads IMS after dc-converter-widget swaps its class for an id', async () => {
    document.body.innerHTML = '<header></header><main><div class="dc-converter-widget"><div><div>compress-pdf</div></div></div></main>';
    const ready = new Promise((resolve) => {
      window.addEventListener('IMS:Ready', () => resolve(true), { once: true });
    });

    await import('../../acrobat/scripts/scripts.js');

    await expect(ready).resolves.toBe(true);
    expect(document.querySelector('#dc-converter-widget')).not.toBeNull();
    expect(document.querySelector('.dc-converter-widget')).toBeNull();
    expect(mockLoadIms).toHaveBeenCalled();
  });
});
