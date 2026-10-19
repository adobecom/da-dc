/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.adobe.com/acrobat/plans.html"}
 */
/* eslint-disable no-undef */
/* eslint-disable compat/compat */

const mockLoadArea = jest.fn();
const mockGetCheckoutAction = jest.fn().mockResolvedValue(undefined);

jest.mock('/libs/utils/utils.js', () => ({
  __esModule: true,
  loadArea: mockLoadArea,
  loadStyle: jest.fn(),
  loadLana: jest.fn(),
  loadScript: jest.fn(),
  setConfig: jest.fn(),
  getConfig: jest.fn(() => ({})),
  getMetadata: jest.fn(),
  createTag: jest.fn(),
  loadIms: jest.fn().mockResolvedValue(),
}), { virtual: true });

jest.mock('/libs/blocks/merch/merch.js', () => ({
  __esModule: true,
  getCheckoutAction: mockGetCheckoutAction,
}));

describe('M@S checkout action', () => {
  it('registers a checkout action that does not wait for IMS', async () => {
    document.body.innerHTML = '<header></header><main><div></div></main>';

    await import('../../acrobat/scripts/scripts.js');

    // loadPage() is fire-and-forget on import, so wait for it to reach loadArea.
    for (let i = 0; i < 50 && !mockLoadArea.mock.calls.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    }

    const service = { registerCheckoutAction: jest.fn() };
    document.head.dispatchEvent(new CustomEvent('wcms:commerce:ready', { bubbles: true, detail: service }));
    expect(service.registerCheckoutAction).toHaveBeenCalledTimes(1);

    const [checkoutAction] = service.registerCheckoutAction.mock.calls[0];
    const offers = [{}];
    const el = document.createElement('a');
    await checkoutAction(offers, {}, new Promise(() => {}), el);

    expect(mockGetCheckoutAction).toHaveBeenCalledWith(offers, {}, expect.any(Promise), el);
    await expect(mockGetCheckoutAction.mock.calls[0][2]).resolves.toBe(false);
  });
});
