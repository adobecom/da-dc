/**
 * @jest-environment jsdom
 */
/* eslint-env jest */
/* eslint-disable compat/compat */
import geoPhoneNumber from '../../acrobat/scripts/geo-phoneNumber.js';

describe('Geo Phone placeholder failure logs', () => {
  let originalFetch;
  let originalLana;
  let originalBody;
  let originalInternational;
  let originalNumbers;

  beforeEach(() => {
    originalFetch = window.fetch;
    originalLana = window.lana;
    originalBody = document.body.innerHTML;
    originalNumbers = window.dcpns;
    originalInternational = sessionStorage.getItem('international');
    window.fetch = jest.fn();
    window.lana = { log: jest.fn() };
    sessionStorage.setItem('international', JSON.stringify({ country: 'us' }));
    document.body.innerHTML = '<a class="geo-pn-business" number-type="phone-business" href="tel:000">000</a>';
    window.fetch.mockResolvedValueOnce({ json: async () => ({ country: 'us' }) });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.fetch = originalFetch;
    window.lana = originalLana;
    window.dcpns = originalNumbers;
    document.body.innerHTML = originalBody;
    if (originalInternational === null) sessionStorage.removeItem('international');
    else sessionStorage.setItem('international', originalInternational);
  });

  it('logs an unsuccessful response once without replacing the number', async () => {
    window.fetch.mockResolvedValueOnce({ status: 404 });
    const ready = jest.spyOn(window, 'dispatchEvent');

    await geoPhoneNumber();

    expect(window.lana.log).toHaveBeenCalledTimes(1);
    expect(window.lana.log).toHaveBeenCalledWith(
      'Geo Phone: phone placeholder request failed; HTTP 404',
      { severity: 'error', tags: 'DC_Milo,geo-phone' },
    );
    expect(document.querySelector('a').getAttribute('href')).toBe('tel:000');
    expect(ready).not.toHaveBeenCalled();
  });

  it('updates the number without a failure log after a successful response', async () => {
    window.fetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ data: [{ key: 'phone-business', value: '800\u00a0915\u00a09430' }] }),
    });

    await geoPhoneNumber();

    expect(document.querySelector('a').textContent).toBe('800 915 9430');
    expect(window.lana.log).not.toHaveBeenCalled();
  });
});
