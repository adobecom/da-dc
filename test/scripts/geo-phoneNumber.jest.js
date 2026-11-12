/**
 * @jest-environment jsdom
 */
/* eslint-env jest */
/* eslint-disable compat/compat */
import geoPhoneNumber from '../../acrobat/scripts/geo-phoneNumber.js';

// Mocking fetch API
window.fetch = jest.fn((url) => {
  const response = {
    status: 200,
    json: () => {
      if (url.includes('dc-shared/placeholders.json')) {
        return Promise.resolve({ data: [{ key: 'phone-business', value: '800\u00A0915\u00A09430' }] });
      }
      return Promise.resolve({ country: 'us' });
    },
  };
  return Promise.resolve(response);
});

// Mocking sessionStorage
global.sessionStorage = { getItem: jest.fn(() => JSON.stringify({ country: 'us' })) };

// Mocking window.location
delete window.location;
window.location = { search: '?akamaiLocale=de' };

// Mocking document.querySelector and document.querySelectorAll
// document.querySelector = jest.fn();
// document.querySelectorAll = jest.fn();
document.body.innerHTML = '<header><main><p class="geo-pn3" number-type="phone-enterprise"><a href="tel:800-915-9430" number-type="phone-enterprise">800-915-9430</a></p></main></header>';

describe('geoPhoneNumber', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should skip geo2 when a saved region choice decides the country', async () => {
    await geoPhoneNumber();
    expect(fetch).not.toHaveBeenCalledWith('https://geo2.adobe.com/json/', expect.anything());
  });

  it('should get the correct locale', async () => {
    await geoPhoneNumber();
  });

  it('should update phone numbers correctly', async () => {
    await geoPhoneNumber(document.body.innerHTML);
    expect(document.querySelector('.geo-pn3').innerHTML).toBe('<a href="tel:800-915-9430" number-type="phone-enterprise">800-915-9430</a>');
  });

  it('should dispatch a custom event when phone numbers are ready', async () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    await geoPhoneNumber();
    expect(dispatchEventSpy).toHaveBeenCalled();
    expect(dispatchEventSpy.mock.calls[0][0] instanceof CustomEvent).toBe(true);
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe('DCNumbers:Ready');
  });

  it('should remove special characters for empty space', async () => {
    document.body.innerHTML = '<header><main><p class="geo-pn3"><a class="geo-pn" number-type="phone-business" href="tel:%20%7B%7Bphone-business-geo%7D%7D">{{phone-business}}</a></p></main></header>';
    await geoPhoneNumber();
    const phoneLink = document.querySelector('.geo-pn3 a');
    expect(phoneLink.textContent).toEqual('800 915 9430');
    expect(phoneLink.href).toEqual('tel:800 915 9430');
  });
});

describe('geoPhoneNumber - locale resolution and link repair', () => {
  const locales = {
    '': { ietf: 'en-US' },
    de: { ietf: 'de-DE' },
    fr: { ietf: 'fr-FR' },
    uk: { ietf: 'en-GB' },
    be_fr: { ietf: 'fr-BE' },
    be_en: { ietf: 'en-BE' },
    lu_de: { ietf: 'de-LU' },
    lu_en: { ietf: 'en-LU' },
    ch_de: { ietf: 'de-CH' },
    ch_fr: { ietf: 'fr-CH' },
    ch_it: { ietf: 'it-CH' },
    ca: { ietf: 'en-CA' },
    ca_fr: { ietf: 'fr-CA' },
  };
  const sheets = {
    '/de/dc-shared/placeholders.json': '0800 752 2580',
    '/uk/dc-shared/placeholders.json': '0800 0280148',
    '/be_fr/dc-shared/placeholders.json': null,
    '/be_en/dc-shared/placeholders.json': '0800 80982',
    '/lu_de/dc-shared/placeholders.json': '0800 752 2580',
    '/lu_en/dc-shared/placeholders.json': '800 27340',
    '/ch_de/dc-shared/placeholders.json': '0800 000890',
    '/ch_fr/dc-shared/placeholders.json': null,
    '/ch_it/dc-shared/placeholders.json': '+44 203 4672 707',
    '/ca/dc-shared/placeholders.json': '800-915-9430',
    '/ca_fr/dc-shared/placeholders.json': '800-915-9431',
  };
  const brokenLink = '<a class="geo-pn1 geo-pn" number-type="phone-business" href="tel:phone business geo">0800 752 2580</a>';
  let originalFetch;
  let originalLocation;

  const mockFetch = (geo = {}, routes = sheets) => jest.fn(async (url) => {
    if (url === 'https://geo2.adobe.com/json/') return { status: 200, json: async () => geo };
    if (!(url in routes)) return { status: 404, json: async () => ({}) };
    const value = routes[url];
    const data = [{ key: 'phone-enterprise', value: '800-685-4192' }];
    if (value) data.push({ key: 'phone-business', value });
    return { status: 200, json: async () => ({ data }) };
  });
  const sheetUrls = () => window.fetch.mock.calls.map(([u]) => u).filter((u) => !u.startsWith('https://geo2'));
  const setLocation = (pathname, search = '') => {
    delete window.location;
    window.location = { pathname, search };
  };
  const link = () => document.querySelector('a');

  beforeAll(() => {
    originalFetch = window.fetch;
    originalLocation = window.location;
  });

  afterAll(() => {
    window.fetch = originalFetch;
    delete window.location;
    window.location = originalLocation;
  });

  afterEach(() => jest.useRealTimers());

  beforeEach(() => {
    window.sessionStorage.clear();
    window.lana = { log: jest.fn() };
    document.body.innerHTML = brokenLink;
    window.fetch = mockFetch();
  });

  it('reads a plain-string region picker value without throwing', async () => {
    window.sessionStorage.setItem('international', 'de');
    setLocation('/de/acrobat/acrobat-standard.html');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/de/dc-shared/placeholders.json']);
    expect(link().getAttribute('href')).toBe('tel:0800 752 2580');
  });

  it('still reads the legacy JSON region value', async () => {
    window.sessionStorage.setItem('international', JSON.stringify({ country: 'DE' }));
    setLocation('/fr/acrobat.html');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/de/dc-shared/placeholders.json']);
  });

  it('uses the language site the visitor picked', async () => {
    window.sessionStorage.setItem('international', 'ch_it');
    setLocation('/de/acrobat.html');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/ch_it/dc-shared/placeholders.json']);
  });

  it('maps GB visitors to the uk folder', async () => {
    setLocation('/uk/acrobat.html', '?akamaiLocale=gb');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/uk/dc-shared/placeholders.json']);
    expect(link().textContent).toBe('0800 0280148');
  });

  it('skips a matching language site that has no number for the link', async () => {
    setLocation('/fr/acrobat.html', '?akamaiLocale=ch');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/ch_fr/dc-shared/placeholders.json', '/ch_de/dc-shared/placeholders.json']);
    expect(link().textContent).toBe('0800 000890');
  });

  it('falls through to the next site of the country when the first lacks a number', async () => {
    setLocation('/de/acrobat.html', '?akamaiLocale=be');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/be_fr/dc-shared/placeholders.json', '/be_en/dc-shared/placeholders.json']);
    expect(link().textContent).toBe('0800 80982');
  });

  it('pins LU to lu_en even on a German page', async () => {
    setLocation('/de/acrobat.html', '?akamaiLocale=lu');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/lu_en/dc-shared/placeholders.json']);
    expect(link().textContent).toBe('800 27340');
  });

  it('falls back to the page market for countries with no site', async () => {
    setLocation('/de/acrobat.html', '?akamaiLocale=zz');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/de/dc-shared/placeholders.json']);
    expect(window.lana.log).not.toHaveBeenCalled();
  });

  it('ignores locale values that are not real site folders', async () => {
    setLocation('/de/acrobat.html', '?akamaiLocale=constructor');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/de/dc-shared/placeholders.json']);
  });

  it('uses the detected country when geo2 is the only source', async () => {
    window.fetch = mockFetch({ country: 'GB' });
    setLocation('/de/acrobat.html');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/uk/dc-shared/placeholders.json']);
  });

  it('does not call geo2 when akamaiLocale decides the country', async () => {
    setLocation('/de/acrobat.html', '?akamaiLocale=ch');
    await geoPhoneNumber(locales);
    expect(window.fetch.mock.calls.some(([u]) => u.startsWith('https://geo2'))).toBe(false);
  });

  it('tries the exact saved locale before the country site', async () => {
    window.sessionStorage.setItem('international', 'ca_fr');
    setLocation('/acrobat.html');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/ca_fr/dc-shared/placeholders.json']);
    expect(link().textContent).toBe('800-915-9431');
  });

  it('keeps LU pinned to lu_en when lu_de was saved', async () => {
    window.sessionStorage.setItem('international', 'lu_de');
    setLocation('/de/acrobat.html');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/lu_en/dc-shared/placeholders.json']);
  });

  it('never requests an unsafe prefix when no locale list is passed', async () => {
    setLocation('/de/acrobat.html', '?akamaiLocale=//evil.com');
    await geoPhoneNumber();
    expect(sheetUrls().some((u) => u.includes('evil'))).toBe(false);
  });

  it('moves on to the next site when a sheet returns bad JSON', async () => {
    const routes = mockFetch();
    window.fetch = jest.fn(async (url) => (url === '/ch_fr/dc-shared/placeholders.json'
      ? { status: 200, json: async () => { throw new SyntaxError('bad json'); } }
      : routes(url)));
    setLocation('/fr/acrobat.html', '?akamaiLocale=ch');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/ch_fr/dc-shared/placeholders.json', '/ch_de/dc-shared/placeholders.json']);
    expect(link().textContent).toBe('0800 000890');
  });

  it('repairs the link from the visible number when no sheet loads', async () => {
    window.fetch = mockFetch({}, {});
    setLocation('/de/acrobat.html', '?akamaiLocale=zz');
    await geoPhoneNumber(locales);
    expect(link().getAttribute('href')).toBe('tel:08007522580');
    expect(window.lana.log).toHaveBeenCalledWith(expect.stringContaining('HTTP 404'), expect.any(Object));
  });

  it('repairs the link when every request errors', async () => {
    window.fetch = jest.fn(async () => { throw new Error('offline'); });
    setLocation('/de/acrobat.html');
    await geoPhoneNumber(locales);
    expect(link().getAttribute('href')).toBe('tel:08007522580');
    expect(window.lana.log).toHaveBeenCalledWith(expect.stringContaining('HTTP error'), expect.any(Object));
  });

  it('only repairs placeholder links and strips stray plus signs', async () => {
    window.fetch = mockFetch({}, {});
    document.body.innerHTML = '<a class="a" href="tel:support">Call 24/7, 1-800 555 0100</a>'
      + '<a class="b" href="tel:phone business geo">+1 800+555 0100</a>'
      + '<a class="c" href="tel:phone business geo">Open 9-5, 365 days</a>';
    setLocation('/de/acrobat.html', '?akamaiLocale=zz');
    await geoPhoneNumber(locales);
    expect(document.querySelector('.a').getAttribute('href')).toBe('tel:support');
    expect(document.querySelector('.b').getAttribute('href')).toBe('tel:+18005550100');
    expect(document.querySelector('.c').getAttribute('href')).toBe('tel:phone business geo');
  });

  it('leaves links alone when they already dial or show no number', async () => {
    window.fetch = mockFetch({}, {});
    document.body.innerHTML = '<a href="tel:+18005551234">Call</a><a class="b" href="tel:phone business geo">phone business</a>';
    setLocation('/de/acrobat.html');
    await geoPhoneNumber(locales);
    expect(document.querySelector('a').getAttribute('href')).toBe('tel:+18005551234');
    expect(document.querySelector('.b').getAttribute('href')).toBe('tel:phone business geo');
  });

  it('updates fragment links once numbers are ready', async () => {
    document.body.innerHTML = '<div class="fragment"><a href="tel:phone business geo">0800 752 2580</a></div>';
    setLocation('/de/acrobat.html', '?akamaiLocale=ch');
    await geoPhoneNumber(locales);
    expect(sheetUrls()).toEqual(['/ch_de/dc-shared/placeholders.json']);
    expect(link().getAttribute('href')).toBe('tel: 0800 000890');
  });

  it('keeps links dialable and stops waiting when geo2 hangs', async () => {
    jest.useFakeTimers();
    const routes = mockFetch();
    let geoSignal;
    window.fetch = jest.fn((url, opts) => {
      if (!url.startsWith('https://geo2')) return routes(url);
      geoSignal = opts.signal;
      return new Promise((resolve, reject) => {
        opts.signal.addEventListener('abort', () => reject(new Error('aborted')));
      });
    });
    setLocation('/de/acrobat.html');
    const done = geoPhoneNumber(locales);
    expect(link().getAttribute('href')).toBe('tel:08007522580');
    expect(sheetUrls()).toEqual([]);
    await jest.advanceTimersByTimeAsync(3000);
    await done;
    expect(geoSignal.aborted).toBe(true);
    expect(sheetUrls()).toEqual(['/de/dc-shared/placeholders.json']);
    expect(link().getAttribute('href')).toBe('tel:0800 752 2580');
  });
});
